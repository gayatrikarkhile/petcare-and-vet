/* =========================================================
   PAWSYNC — DYNAMIC NUTRITION PAGE
   =========================================================
   BACKEND APIs:

   GET  /api/pets
   GET  /api/nutrition/schedule/:petId
   GET  /api/nutrition/today/:petId
   POST /api/nutrition/generate-schedule/:petId
   POST /api/nutrition/complete/:petId
   POST /api/nutrition/water/:petId

   IMPORTANT:
   - Uses the real MongoDB pet _id.
   - Uses India time (Asia/Kolkata).
   - Automatically tries Gemini generation when a
     nutrition profile exists but no schedule exists.
   - Uses the exact button IDs from nutrition.html.
========================================================= */

const API_BASE = "/api";

let pets = [];
let selectedPetId = null;
let selectedPet = null;
let fullSchedule = null;
let todayPlan = null;


/* =========================================================
   AUTHENTICATION
========================================================= */

function getAuthHeaders() {

    const headers = {
        "Content-Type": "application/json"
    };

    const token =
        localStorage.getItem("pawsyncToken");

    if (token) {

        headers.Authorization =
            token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`;

    }

    return headers;
}


/* =========================================================
   API HELPER
========================================================= */

async function apiFetch(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                ...options,

                credentials:
                    "include",

                headers: {
                    ...getAuthHeaders(),
                    ...(options.headers || {})
                }
            }
        );


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    let data = {};


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        try {

            data =
                await response.json();

        } catch (error) {

            console.error(
                "Invalid JSON response:",
                error
            );

            throw new Error(
                "Server returned invalid JSON."
            );

        }

    } else {

        const text =
            await response.text();


        console.error(
            "NON-JSON API RESPONSE:",
            text.substring(
                0,
                500
            )
        );


        const error =
            new Error(
                `Request failed with status ${response.status}`
            );


        error.status =
            response.status;


        error.data =
            {};


        throw error;

    }


    if (
        !response.ok
    ) {

        const error =
            new Error(
                data.message ||
                `Request failed with status ${response.status}`
            );


        error.status =
            response.status;


        error.data =
            data;


        throw error;

    }


    return data;
}


/* =========================================================
   SMALL DOM HELPERS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.textContent =
            value ?? "";

    }

}


function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value == null
            ? ""
            : String(value);


    return div.innerHTML;

}


/* =========================================================
   INDIA DATE HELPERS
========================================================= */

function getISTDateString(
    value = new Date()
) {

    const date =
        value instanceof Date
            ? value
            : new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:
                "Asia/Kolkata",

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit"
        }
    ).format(date);

}


function getTodayIST() {

    return getISTDateString(
        new Date()
    );

}


function formatDateIST(
    value
) {

    const date =
        value instanceof Date
            ? value
            : new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            timeZone:
                "Asia/Kolkata",

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    ).format(date);

}


/* =========================================================
   WATER TARGET FORMATTER
========================================================= */

function formatWaterTarget(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "Water requirement not available";

    }


    /*
       Gemini may return:

       "1.5 L/day"

       1500

       {
          amount: 1500,
          unit: "ml"
       }

       {
          dailyAmount: 1.5,
          unit: "L"
       }

       {
          text: "1.5 L per day"
       }
    */


    if (
        typeof value ===
        "number"
    ) {

        if (
            value <= 20
        ) {

            return `${value} L per day`;

        }


        return `${value} ml per day`;

    }


    if (
        typeof value ===
        "object"
    ) {

        const amount =
            value.amount ??
            value.dailyAmount ??
            value.quantity ??
            value.value;


        const unit =
            value.unit ||
            value.units ||
            "ml";


        if (
            amount !== undefined &&
            amount !== null &&
            amount !== ""
        ) {

            return `${amount} ${unit} per day`;

        }


        if (
            value.text
        ) {

            return String(
                value.text
            );

        }

    }


    return String(
        value
    );

}


/* =========================================================
   PAGE STATES
========================================================= */

function showLoading() {

    const loading =
        document.getElementById(
            "nutritionLoading"
        );


    const empty =
        document.getElementById(
            "noNutritionPlan"
        );


    const content =
        document.getElementById(
            "nutritionContent"
        );


    if (
        loading
    ) {

        loading.style.display =
            "";

    }


    if (
        empty
    ) {

        empty.style.display =
            "none";

    }


    if (
        content
    ) {

        content.style.display =
            "none";

    }

}


function showNutritionContent() {

    const loading =
        document.getElementById(
            "nutritionLoading"
        );


    const empty =
        document.getElementById(
            "noNutritionPlan"
        );


    const content =
        document.getElementById(
            "nutritionContent"
        );


    if (
        loading
    ) {

        loading.style.display =
            "none";

    }


    if (
        empty
    ) {

        empty.style.display =
            "none";

    }


    if (
        content
    ) {

        content.style.display =
            "";

    }

}


function showNoPlan(
    message =
        "No active nutrition schedule found."
) {

    const loading =
        document.getElementById(
            "nutritionLoading"
        );


    const empty =
        document.getElementById(
            "noNutritionPlan"
        );


    const content =
        document.getElementById(
            "nutritionContent"
        );


    if (
        loading
    ) {

        loading.style.display =
            "none";

    }


    if (
        content
    ) {

        content.style.display =
            "none";

    }


    if (
        empty
    ) {

        empty.style.display =
            "";


        const paragraph =
            empty.querySelector(
                "p"
            );


        if (
            paragraph
        ) {

            paragraph.textContent =
                message;

        }

    }

}


function showNutritionError(
    message
) {

    const loading =
        document.getElementById(
            "nutritionLoading"
        );


    const empty =
        document.getElementById(
            "noNutritionPlan"
        );


    const content =
        document.getElementById(
            "nutritionContent"
        );


    if (
        loading
    ) {

        loading.style.display =
            "none";

    }


    if (
        empty
    ) {

        empty.style.display =
            "none";

    }


    if (
        content
    ) {

        content.style.display =
            "";


        content.innerHTML = `

            <section
                class="nutrition-empty"
            >

                <div
                    class="empty-icon"
                >
                    ⚠️
                </div>

                <h2>
                    Unable to Load Nutrition
                </h2>

                <p>
                    ${escapeHTML(
                        message ||
                        "Something went wrong."
                    )}
                </p>

                <button
                    type="button"
                    class="nutrition-primary-btn"
                    id="retryNutritionBtn"
                >
                    Try Again
                </button>

            </section>

        `;


        const retry =
            document.getElementById(
                "retryNutritionBtn"
            );


        if (
            retry
        ) {

            retry.addEventListener(
                "click",
                loadNutritionData
            );

        }

    }

}


/* =========================================================
   LOAD PETS
========================================================= */

async function loadPets() {

    console.log(
        "Loading owner pets..."
    );


    const data =
        await apiFetch(
            `${API_BASE}/pets`
        );


    pets =
        Array.isArray(
            data.pets
        )
            ? data.pets
            : [];


    console.log(
        "OWNER PETS:",
        pets
    );


    if (
        pets.length ===
        0
    ) {

        showNoPlan(
            "No pets found. Please add a pet first."
        );

        return;

    }


    /*
       Get selected pet from localStorage.

       IMPORTANT:
       This must be the REAL MongoDB _id.
    */

    const storedPetId =
        localStorage.getItem(
            "pawsyncSelectedPet"
        );


    let pet =
        pets.find(
            item =>
                String(
                    item._id ||
                    item.id
                ) ===
                String(
                    storedPetId
                )
        );


    /*
       If the stored ID no longer exists,
       select the first real pet.
    */

    if (
        !pet
    ) {

        pet =
            pets[0];

    }


    selectedPet =
        pet;


    selectedPetId =
        String(
            pet._id ||
            pet.id
        );


    /*
       Store the REAL pet ID.
    */

    localStorage.setItem(
        "pawsyncSelectedPet",
        selectedPetId
    );


    console.log(
        "SELECTED PET:",
        selectedPet
    );


    console.log(
        "SELECTED PET ID:",
        selectedPetId
    );


    updateSelectedPetUI();

}


/* =========================================================
   UPDATE SELECTED PET UI
========================================================= */

function updateSelectedPetUI() {

    if (
        !selectedPet
    ) {

        return;

    }


    const name =
        selectedPet.petName ||
        selectedPet.name ||
        "Pet";


    setText(
        "petName",
        name
    );


    setText(
        "selectedPetName",
        name
    );


    setText(
        "dietPetName",
        `${name}'s active nutrition plan`
    );


    const petNameSpan =
        document.getElementById(
            "petName"
        );

    const petSelectDropdown =
        document.getElementById(
            "petSelect"
        );


    if (
        petSelectDropdown &&
        Array.isArray(pets) &&
        pets.length > 1
    ) {

        petSelectDropdown.innerHTML =
            pets.map(p => {

                const pId =
                    String(
                        p._id ||
                        p.id
                    );

                const pName =
                    p.petName ||
                    p.name ||
                    "Pet";

                return `<option value="${pId}" ${pId === selectedPetId ? "selected" : ""}>${pName}</option>`;

            }).join("");


        petSelectDropdown.style.display =
            "inline-block";

        if (petNameSpan) {

            petNameSpan.style.display =
                "none";

        }


        if (
            petSelectDropdown.dataset.bound !==
            "true"
        ) {

            petSelectDropdown.dataset.bound =
                "true";

            petSelectDropdown.addEventListener(
                "change",
                async (e) => {

                    const newPetId =
                        e.target.value;

                    if (
                        newPetId &&
                        newPetId !== selectedPetId
                    ) {

                        await switchSelectedPet(
                            newPetId
                        );

                    }

                }
            );

        }

    } else {

        if (petSelectDropdown) {

            petSelectDropdown.style.display =
                "none";

        }

        if (petNameSpan) {

            petNameSpan.style.display =
                "inline-block";

        }

    }


    const avatar =
        document.getElementById(
            "petAvatar"
        );


    if (
        avatar
    ) {

        const species =
            String(
                selectedPet.species ||
                ""
            ).toLowerCase();


        if (
            species.includes(
                "bird"
            )
        ) {

            avatar.textContent =
                "🐦";

        } else if (
            species.includes(
                "rabbit"
            )
        ) {

            avatar.textContent =
                "🐰";

        } else if (
            species.includes(
                "cat"
            )
        ) {

            avatar.textContent =
                "🐱";

        } else {

            avatar.textContent =
                "🐾";

        }

    }

}


async function switchSelectedPet(
    newPetId
) {

    const pet =
        pets.find(
            item =>
                String(
                    item._id ||
                    item.id
                ) ===
                String(
                    newPetId
                )
        );


    if (
        !pet
    ) {

        return;

    }


    selectedPet =
        pet;

    selectedPetId =
        String(
            pet._id ||
            pet.id
        );


    localStorage.setItem(
        "pawsyncSelectedPet",
        selectedPetId
    );


    updateSelectedPetUI();

    await loadNutritionData();

}



/* =========================================================
   FIND TODAY'S PLAN
========================================================= */

function findTodayPlan(
    schedule
) {

    if (
        !schedule ||
        !Array.isArray(
            schedule.days
        )
    ) {

        return null;

    }


    const today =
        getTodayIST();


    const plan =
        schedule.days.find(
            day =>
                day.date &&
                getISTDateString(
                    day.date
                ) ===
                today
        );


    return (
        plan ||
        null
    );

}


/* =========================================================
   AUTOMATIC GEMINI GENERATION
========================================================= */

async function generateScheduleIfNeeded() {

    if (
        !selectedPetId
    ) {

        throw new Error(
            "No pet selected."
        );

    }


    console.log(
        "No active nutrition schedule found."
    );


    console.log(
        "Trying automatic Gemini 30-day generation..."
    );


    try {

        const result =
            await apiFetch(
                `${API_BASE}/nutrition/generate-schedule/${selectedPetId}`,
                {
                    method:
                        "POST"
                }
            );


        console.log(
            "AUTO GENERATION RESULT:",
            result
        );


        if (
            result &&
            result.success
        ) {

            console.log(
                "✓ 30-day schedule generated."
            );


            return true;

        }


        return false;

    } catch (error) {

        /*
           409:
           Schedule already exists.
        */

        if (
            error.status ===
            409
        ) {

            console.log(
                "Schedule already exists."
            );


            return true;

        }


        /*
           404:
           Usually nutrition profile does not exist.
        */

        if (
            error.status ===
            404
        ) {

            console.log(
                "Nutrition profile is not available yet."
            );


            return false;

        }


        throw error;

    }

}


/* =========================================================
   LOAD FULL SCHEDULE
========================================================= */

async function loadFullSchedule() {

    return await apiFetch(
        `${API_BASE}/nutrition/schedule/${selectedPetId}`
    );

}


/* =========================================================
   LOAD NUTRITION DATA
========================================================= */

async function loadNutritionData() {

    showLoading();


    if (
        !selectedPetId
    ) {

        showNoPlan(
            "Please select a pet first."
        );


        return;

    }


    try {

        let scheduleData;


        /*
           STEP 1
           Load the active 30-day schedule.
        */

        try {

            scheduleData =
                await loadFullSchedule();

            if (scheduleData && (scheduleData.code === "PROFILE_INCOMPLETE" || scheduleData.profileIncomplete)) {
                const petName = selectedPet?.petName || "Pet";
                showNutritionProfileIncompleteState(petName);
                showProfileIncompletePopup(petName, "Nutrition", openNutritionModal);
                return;
            }

        } catch (scheduleError) {

            if (scheduleError.data && (scheduleError.data.code === "PROFILE_INCOMPLETE" || scheduleError.data.profileIncomplete)) {
                const petName = selectedPet?.petName || "Pet";
                showNutritionProfileIncompleteState(petName);
                showProfileIncompletePopup(petName, "Nutrition", openNutritionModal);
                return;
            }

            console.warn(
                "Schedule endpoint failed:",
                scheduleError
            );


            /*
               No schedule found.

               Automatically try Gemini generation.

               This is important for Meet:
               the nutrition profile can already
               exist in MongoDB even when the
               schedule was not generated.
            */

            if (
                scheduleError.status ===
                404
            ) {

                const generated =
                    await generateScheduleIfNeeded();


                if (
                    !generated
                ) {

                    showNoPlan(
                        "Please fill the nutrition form to generate a personalized 30-day plan."
                    );


                    return;

                }


                /*
                   Gemini generated the schedule.
                   Load it again.
                */

                scheduleData =
                    await loadFullSchedule();

            } else {

                throw scheduleError;

            }

        }


        fullSchedule =
            scheduleData.schedule ||
            scheduleData ||
            null;


        if (
            !fullSchedule
        ) {

            throw new Error(
                "Nutrition schedule data is empty."
            );

        }


        /*
           STEP 2
           Find today's day directly from
           the 30-day schedule.
        */

        todayPlan =
            findTodayPlan(
                fullSchedule
            );


        /*
           Fallback to backend today endpoint.
        */

        if (
            !todayPlan
        ) {

            try {

                const todayData =
                    await apiFetch(
                        `${API_BASE}/nutrition/today/${selectedPetId}`
                    );


                todayPlan =
                    todayData.today ||
                    null;

            } catch (todayError) {

                console.warn(
                    "Today endpoint fallback failed:",
                    todayError
                );

            }

        }


        if (
            !todayPlan
        ) {

            throw new Error(
                "Today's nutrition plan was not found in the active 30-day schedule."
            );

        }


        /*
           Save current data globally.
        */

        window.currentNutritionData = {

            pet:
                selectedPet,

            schedule:
                fullSchedule,

            today:
                todayPlan

        };


        showNutritionContent();


        renderOverview();


        renderTodayNutrition();


        renderSchedule();


        renderPlanCompletion();


        return (
            window.currentNutritionData
        );


    } catch (error) {

        console.error(
            "NUTRITION LOAD ERROR:",
            error
        );


        if (
            error.status ===
            404
        ) {

            showNoPlan(
                error.message ||
                "Please fill the nutrition form to generate a 30-day plan."
            );


            return null;

        }


        showNutritionError(
            error.message
        );


        return null;

    }

}


/* =========================================================
   RENDER OVERVIEW
========================================================= */

function renderOverview() {

    if (
        !fullSchedule
    ) {

        return;

    }


    const days =
        Array.isArray(
            fullSchedule.days
        )
            ? fullSchedule.days
            : [];


    const completedDays =
        Number(
            fullSchedule.completedDays
        ) ||
        days.filter(
            day =>
                day.status ===
                "Completed"
        ).length;


    const failedDays =
        Number(
            fullSchedule.failedDays
        ) ||
        days.filter(
            day =>
                day.status ===
                "Failed"
        ).length;


    const totalDays =
        Number(
            fullSchedule.totalDays
        ) ||
        days.length ||
        30;


    const creditsFromBackend =
        Number(
            fullSchedule.nutritionCredits
        );


    const creditsFromDays =
        days.reduce(
            (
                total,
                day
            ) =>
                total +
                (
                    Number(
                        day.nutritionCredit
                    ) ||
                    0
                ),
            0
        );


    const nutritionCredits =
        Number.isFinite(
            creditsFromBackend
        )
            ? creditsFromBackend
            : creditsFromDays;


    const maxCredits =
        Number(
            fullSchedule.maxNutritionCredits
        ) ||
        12;


    const progress =
        totalDays > 0
            ? Math.min(
                (
                    completedDays /
                    totalDays
                ) * 100,
                100
            )
            : 0;


    const creditPercentage =
        maxCredits > 0
            ? Math.min(
                (
                    nutritionCredits /
                    maxCredits
                ) * 100,
                100
            )
            : 0;


    setText(
        "completedDays",
        completedDays
    );


    setText(
        "failedDays",
        failedDays
    );


    setText(
        "planProgress",
        `${completedDays} / ${totalDays} Days`
    );


    setText(
        "nutritionCredits",
        nutritionCredits.toFixed(1)
    );


    setText(
        "creditValue",
        nutritionCredits.toFixed(1)
    );


    setText(
        "progressText",
        `${Math.round(
            progress
        )}%`
    );


    setText(
        "creditPercentage",
        `${Math.round(
            creditPercentage
        )}%`
    );


    const planProgressBar =
        document.getElementById(
            "planProgressBar"
        );


    if (
        planProgressBar
    ) {

        planProgressBar.style.width =
            `${progress}%`;

    }


    const creditProgressBar =
        document.getElementById(
            "creditProgressBar"
        );


    if (
        creditProgressBar
    ) {

        creditProgressBar.style.width =
            `${creditPercentage}%`;

    }


    const planStatus =
        document.getElementById(
            "planStatus"
        );


    if (
        planStatus
    ) {

        planStatus.textContent =
            fullSchedule.status ||
            "Active";

    }

}


/* =========================================================
   RENDER TODAY
========================================================= */

function renderTodayNutrition() {

    const today =
        todayPlan;


    if (
        !today
    ) {

        return;

    }


    setText(
        "todayDate",
        formatDateIST(
            today.date
        )
    );


    const status =
        today.status ||
        (
            today.completed
                ? "Completed"
                : "Pending"
        );


    const statusElement =
        document.getElementById(
            "todayStatus"
        );


    if (
        statusElement
    ) {

        statusElement.textContent =
            status;


        statusElement.className =
            `today-status ${String(
                status
            ).toLowerCase()}`;

    }


    renderTodayMeals(
        today.meals
    );


    renderWater(
        today
    );


    renderNutritionCompleteButton(
        today
    );

}


/* =========================================================
   TODAY'S MEALS
========================================================= */

function renderTodayMeals(
    meals
) {

    const container =
        document.getElementById(
            "todayMeals"
        );


    if (
        !container
    ) {

        return;

    }


    const mealList =
        Array.isArray(
            meals
        )
            ? meals
            : [];


    if (
        mealList.length ===
        0
    ) {

        container.innerHTML = `

            <div
                class="nutrition-empty-state"
            >

                <p>
                    No meals were returned for today.
                </p>

            </div>

        `;


        return;

    }


    container.innerHTML =
        mealList
            .map(
                (
                    meal,
                    index
                ) =>
                    renderMealCard(
                        meal,
                        index
                    )
            )
            .join("");

}


/* =========================================================
   MEAL CARD
========================================================= */

function renderMealCard(
    meal,
    index
) {

    const name =
        meal.meal ||
        meal.mealName ||
        meal.name ||
        meal.title ||
        `Meal ${index + 1}`;


    const food =
        meal.food ||
        meal.foodName ||
        meal.description ||
        meal.items ||
        "";


    const time =
        meal.time ||
        meal.feedingTime ||
        meal.scheduledTime ||
        "";


    const calories =
        meal.calories ??
        meal.kcal ??
        null;


    const portion =
        meal.portion ||
        meal.quantity ||
        "";


    const instructions =
        meal.instructions ||
        meal.notes ||
        "";


    const completed =
        meal.completed ===
            true ||
        meal.status ===
            "Completed";


    return `

        <article class="today-meal-card ${completed ? 'completed' : ''}">

            <div class="today-meal-header">

                <div class="today-meal-icon">
                    🥣
                </div>

                <div class="today-meal-title-wrap">

                    <h3>
                        ${escapeHTML(name)}
                    </h3>

                    ${
                        completed
                            ? `
                                <span class="meal-completed-badge">
                                    ✓ Done
                                </span>
                              `
                            : ""
                    }

                </div>

            </div>


            ${
                food
                    ? `
                        <p class="today-meal-food">
                            ${escapeHTML(food)}
                        </p>
                      `
                    : ""
            }


            <div class="today-meal-meta">

                ${
                    time
                        ? `
                            <span class="meta-pill">
                                🕐 ${escapeHTML(
                                    formatDisplayTime(time)
                                )}
                            </span>
                          `
                        : ""
                }

                ${
                    portion
                        ? `
                            <span class="meta-pill">
                                🍽️ ${escapeHTML(portion)}
                            </span>
                          `
                        : ""
                }

                ${
                    calories !== null && calories !== undefined
                        ? `
                            <span class="meta-pill">
                                🔥 ${escapeHTML(calories)} kcal
                            </span>
                          `
                        : ""
                }

            </div>


            ${
                instructions
                    ? `
                        <div class="today-meal-instructions">
                            💡 ${escapeHTML(instructions)}
                        </div>
                      `
                    : ""
            }

        </article>

    `;

}



/* =========================================================
   FORMAT TIME
========================================================= */

function formatDisplayTime(
    time
) {

    if (
        !time
    ) {

        return "";

    }


    if (
        /AM|PM/i.test(
            String(time)
        )
    ) {

        return String(
            time
        );

    }


    const parts =
        String(
            time
        ).split(":");


    if (
        parts.length <
        2
    ) {

        return String(
            time
        );

    }


    let hour =
        Number(
            parts[0]
        );


    const minute =
        parts[1];


    if (
        Number.isNaN(
            hour
        )
    ) {

        return String(
            time
        );

    }


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 ||
        12;


    return `${hour}:${minute} ${period}`;

}


/* =========================================================
   WATER
========================================================= */

function renderWater(
    today
) {

    const waterText =
        formatWaterTarget(
            today.waterTarget ??
            today.water ??
            today.dailyWaterTarget
        );


    setText(
        "waterTarget",
        waterText
    );


    const completed =
        today.waterCompleted ===
        true;


    const status =
        document.getElementById(
            "waterStatus"
        );


    if (
        status
    ) {

        status.textContent =
            completed
                ? "✓ Completed"
                : "Pending";


        status.className =
            `water-status ${
                completed
                    ? "completed"
                    : "pending"
            }`;

    }


    const button =
        document.getElementById(
            "completeWaterBtn"
        );


    if (
        button
    ) {

        button.disabled =
            completed;


        button.textContent =
            completed
                ? "✓ Water Completed"
                : "✓ Mark Water Complete";

    }

}


/* =========================================================
   NUTRITION COMPLETE BUTTON
========================================================= */

function renderNutritionCompleteButton(
    today
) {

    const button =
        document.getElementById(
            "completeNutritionBtn"
        );


    if (
        !button
    ) {

        return;

    }


    const status =
        today.status ||
        (
            today.completed
                ? "Completed"
                : "Pending"
        );


    if (
        status ===
            "Completed" ||
        today.completed ===
            true
    ) {

        button.disabled =
            true;


        button.textContent =
            "✓ Today's Nutrition Completed";


        button.classList.add(
            "completed"
        );


        return;

    }


    if (
        status ===
        "Failed"
    ) {

        button.disabled =
            true;


        button.textContent =
            "🔒 Day Locked — Failed";


        button.classList.add(
            "locked"
        );


        return;

    }


    button.disabled =
        false;


    button.textContent =
        "✓ Mark Today's Nutrition Complete";


    button.classList.remove(
        "completed",
        "locked"
    );

}


/* =========================================================
   RENDER 30-DAY SCHEDULE
========================================================= */

function renderSchedule() {

    const container =
        document.getElementById(
            "scheduleDays"
        );


    if (
        !container
    ) {

        console.warn(
            "scheduleDays element not found."
        );


        return;

    }


    const days =
        Array.isArray(
            fullSchedule?.days
        )
            ? fullSchedule.days
            : [];


    if (
        days.length ===
        0
    ) {

        container.innerHTML = `

            <div
                class="schedule-empty"
            >

                <span>
                    📅
                </span>

                <p>
                    No nutrition days found.
                </p>

            </div>

        `;


        return;

    }


    const todayKey =
        getTodayIST();


    container.innerHTML =
        days
            .map(
                (
                    day,
                    index
                ) => {

                    const dayKey =
                        day.date
                            ? getISTDateString(
                                day.date
                            )
                            : "";


                    const isToday =
                        dayKey ===
                        todayKey;


                    const status =
                        day.status ||
                        getAutomaticDayStatus(
                            day.date
                        );


                    const completed =
                        status ===
                        "Completed";


                    const failed =
                        status ===
                        "Failed";


                    const future =
                        !isToday &&
                        !completed &&
                        !failed &&
                        dayKey >
                            todayKey;


                    const statusClass =
                        completed
                            ? "completed"
                            : failed
                                ? "failed"
                                : isToday
                                    ? "today"
                                    : future
                                        ? "upcoming"
                                        : "pending";


                    const statusText =
                        completed
                            ? "✓ Completed"
                            : failed
                                ? "✕ Failed"
                                : isToday
                                    ? "Today"
                                    : future
                                        ? "Upcoming"
                                        : "Pending";


                    const meals =
                        Array.isArray(
                            day.meals
                        )
                            ? day.meals
                            : [];


                    const waterValue =
                        day.waterTarget ??
                        day.water ??
                        day.dailyWaterTarget;


                    const credit =
                        Number(
                            day.nutritionCredit
                        ) ||
                        0;


                    return `

                        <article
                            class="
                                schedule-day
                                ${statusClass}
                            "
                        >

                            <div class="schedule-day-sidebar">

                                <div class="schedule-day-badge">

                                    <span class="day-number">
                                        Day ${
                                            day.day ||
                                            index + 1
                                        }
                                    </span>

                                    ${
                                        isToday
                                            ? `
                                                <span class="today-badge">
                                                    TODAY
                                                </span>
                                              `
                                            : ""
                                    }

                                </div>

                                <p class="schedule-day-date">
                                    ${formatDateIST(
                                        day.date
                                    )}
                                </p>

                                <span class="schedule-status-pill ${statusClass}">
                                    ${statusText}
                                </span>

                            </div>


                            <div class="schedule-day-main">

                                ${
                                    meals.length > 0
                                        ? `
                                            <div class="schedule-meals">
                                                ${meals
                                                    .map((meal, mealIndex) =>
                                                        renderScheduleMeal(
                                                            meal,
                                                            mealIndex
                                                        )
                                                    )
                                                    .join("")}
                                            </div>
                                          `
                                        : `
                                            <p class="schedule-no-meals">
                                                No meal details available.
                                            </p>
                                          `
                                }


                                <div class="schedule-day-footer">

                                    ${
                                        waterValue !== undefined &&
                                        waterValue !== null &&
                                        waterValue !== ""
                                            ? `
                                                <div class="schedule-water">
                                                    <span class="water-icon">💧</span>
                                                    <div>
                                                        <strong>Water Target</strong>
                                                        <p>${escapeHTML(
                                                            formatWaterTarget(
                                                                waterValue
                                                            )
                                                        )}</p>
                                                    </div>
                                                </div>
                                              `
                                            : ""
                                    }


                                    ${
                                        credit > 0
                                            ? `
                                                <div class="schedule-credit">
                                                    ⭐ +${credit.toFixed(1)} health credit
                                                </div>
                                              `
                                            : ""
                                    }


                                    ${
                                        isToday && !completed && !failed
                                            ? `
                                                <button
                                                    type="button"
                                                    class="schedule-complete-btn"
                                                    data-complete-today
                                                >
                                                    ✓ Complete Today
                                                </button>
                                              `
                                            : ""
                                    }

                                </div>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    /*
       Connect schedule's completion button.
    */

    container
        .querySelectorAll(
            "[data-complete-today]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    completeTodayNutrition
                );

            }
        );

}


/* =========================================================
   SCHEDULE MEAL
========================================================= */

function renderScheduleMeal(
    meal,
    index
) {

    const name =
        meal.meal ||
        meal.mealName ||
        meal.name ||
        meal.title ||
        `Meal ${index + 1}`;


    const food =
        meal.food ||
        meal.foodName ||
        meal.description ||
        "";


    const time =
        meal.time ||
        meal.feedingTime ||
        "";


    const portion =
        meal.portion ||
        meal.quantity ||
        "";


    const calories =
        meal.calories ??
        meal.kcal ??
        null;


    return `

        <div class="schedule-meal-item">

            <div class="schedule-meal-icon">
                🥣
            </div>

            <div class="schedule-meal-content">

                <strong class="schedule-meal-title">
                    ${escapeHTML(name)}
                </strong>

                ${
                    food
                        ? `
                            <p class="schedule-meal-food">
                                ${escapeHTML(food)}
                            </p>
                          `
                        : ""
                }

                <div class="schedule-meal-meta">

                    ${
                        time
                            ? `
                                <span class="meta-pill">
                                    🕐 ${escapeHTML(
                                        formatDisplayTime(time)
                                    )}
                                </span>
                              `
                            : ""
                    }

                    ${
                        portion
                            ? `
                                <span class="meta-pill">
                                    🍽️ ${escapeHTML(portion)}
                                </span>
                              `
                            : ""
                    }

                    ${
                        calories !== null && calories !== undefined
                            ? `
                                <span class="meta-pill">
                                    🔥 ${escapeHTML(calories)} kcal
                                </span>
                              `
                            : ""
                    }

                </div>

            </div>

        </div>

    `;

}



/* =========================================================
   AUTOMATIC DAY STATUS
========================================================= */

function getAutomaticDayStatus(
    date
) {

    const dayKey =
        getISTDateString(
            date
        );


    const today =
        getTodayIST();


    if (
        dayKey ===
        today
    ) {

        return "Pending";

    }


    if (
        dayKey <
        today
    ) {

        return "Failed";

    }


    return "Upcoming";

}


/* =========================================================
   PLAN COMPLETION
========================================================= */

function renderPlanCompletion() {

    const section =
        document.getElementById(
            "planCompletedSection"
        );


    if (
        !section
    ) {

        return;

    }


    const days =
        Array.isArray(
            fullSchedule?.days
        )
            ? fullSchedule.days
            : [];


    const totalDays =
        Number(
            fullSchedule?.totalDays
        ) ||
        days.length ||
        30;


    const completedDays =
        Number(
            fullSchedule?.completedDays
        ) ||
        days.filter(
            day =>
                day.status ===
                "Completed"
        ).length;


    const failedDays =
        Number(
            fullSchedule?.failedDays
        ) ||
        days.filter(
            day =>
                day.status ===
                "Failed"
        ).length;


    const completed =
        fullSchedule?.status ===
            "Completed" ||
        (
            completedDays +
            failedDays >=
            totalDays
        );


    section.style.display =
        completed
            ? ""
            : "none";


    const button =
        document.getElementById(
            "newNutritionPlanBtn"
        );


    if (
        button &&
        button.dataset.bound !==
            "true"
    ) {

        button.dataset.bound =
            "true";


        button.addEventListener(
            "click",
            () => {

                /*
                   A new schedule should only be
                   generated after a new nutrition
                   profile is filled.

                   The form is on the owner dashboard.
                */

                window.location.href =
                    "../owner/dashboard/ownerdashboard.html";

            }
        );

    }

}


/* =========================================================
   COMPLETE TODAY'S NUTRITION
========================================================= */

async function completeTodayNutrition() {

    if (
        !selectedPetId
    ) {

        alert(
            "Please select a pet first."
        );


        return;

    }


    if (
        !todayPlan
    ) {

        alert(
            "Today's nutrition plan is not available."
        );


        return;

    }


    const todayKey =
        getTodayIST();


    const planKey =
        getISTDateString(
            todayPlan.date
        );


    if (
        todayKey !==
        planKey
    ) {

        alert(
            "This is not today's nutrition plan."
        );


        return;

    }


    if (
        todayPlan.status ===
            "Completed" ||
        todayPlan.completed ===
            true
    ) {

        return;

    }


    if (
        todayPlan.status ===
        "Failed"
    ) {

        alert(
            "Today's plan is already marked as failed."
        );


        return;

    }


    const button =
        document.getElementById(
            "completeNutritionBtn"
        );


    const originalText =
        button
            ? button.textContent
            : "";


    if (
        button
    ) {

        button.disabled =
            true;


        button.textContent =
            "Completing...";

    }


    try {

        console.log(
            "Completing nutrition for:",
            selectedPetId
        );


        const result =
            await apiFetch(
                `${API_BASE}/nutrition/complete/${selectedPetId}`,
                {
                    method:
                        "POST"
                }
            );


        console.log(
            "COMPLETE NUTRITION RESULT:",
            result
        );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Failed to complete today's nutrition."
            );

        }


        /*
           Backend saves:

           status = Completed
           completed = true
           nutritionCredit = 0.4

           Then it recalculates:

           completedDays
           failedDays
           nutritionCredits

           So reload MongoDB data.
        */

        await loadNutritionData();


    } catch (error) {

        console.error(
            "COMPLETE NUTRITION ERROR:",
            error
        );


        if (
            button
        ) {

            button.disabled =
                false;


            button.textContent =
                originalText ||
                "✓ Mark Today's Nutrition Complete";

        }


        alert(
            error.message ||
            "Unable to complete today's nutrition."
        );

    }

}


/* =========================================================
   COMPLETE TODAY'S WATER
========================================================= */

async function completeWaterTarget() {

    if (
        !selectedPetId
    ) {

        alert(
            "Please select a pet first."
        );


        return;

    }


    if (
        !todayPlan
    ) {

        alert(
            "Today's nutrition plan is not available."
        );


        return;

    }


    if (
        todayPlan.waterCompleted ===
        true
    ) {

        return;

    }


    const button =
        document.getElementById(
            "completeWaterBtn"
        );


    const originalText =
        button
            ? button.textContent
            : "";


    if (
        button
    ) {

        button.disabled =
            true;


        button.textContent =
            "Completing...";

    }


    try {

        console.log(
            "Completing water for:",
            selectedPetId
        );


        const result =
            await apiFetch(
                `${API_BASE}/nutrition/water/${selectedPetId}`,
                {
                    method:
                        "POST"
                }
            );


        console.log(
            "WATER COMPLETION RESULT:",
            result
        );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Unable to complete today's water target."
            );

        }


        /*
           Update local state.
        */

        todayPlan.waterCompleted =
            true;


        /*
           Reload from MongoDB.
        */

        await loadNutritionData();


    } catch (error) {

        console.error(
            "WATER COMPLETION ERROR:",
            error
        );


        /*
           If it was already completed,
           just reload.
        */

        if (
            String(
                error.message ||
                ""
            )
                .toLowerCase()
                .includes(
                    "already completed"
                )
        ) {

            await loadNutritionData();

            return;

        }


        if (
            button
        ) {

            button.disabled =
                false;


            button.textContent =
                originalText ||
                "✓ Mark Water Complete";

        }


        alert(
            error.message ||
            "Unable to complete today's water target."
        );

    }

}


/* =========================================================
   CONNECT BUTTONS
========================================================= */

function setupNutritionButtons() {

    const completeButton =
        document.getElementById(
            "completeNutritionBtn"
        );


    if (
        completeButton &&
        completeButton.dataset.bound !==
            "true"
    ) {

        completeButton.dataset.bound =
            "true";


        completeButton.addEventListener(
            "click",
            completeTodayNutrition
        );

    }


    const waterButton =
        document.getElementById(
            "completeWaterBtn"
        );


    if (
        waterButton &&
        waterButton.dataset.bound !==
            "true"
    ) {

        waterButton.dataset.bound =
            "true";


        waterButton.addEventListener(
            "click",
            completeWaterTarget
        );

    }


    const createButton =
        document.getElementById(
            "createNutritionPlanBtn"
        );


    if (
        createButton &&
        createButton.dataset.bound !==
            "true"
    ) {

        createButton.dataset.bound =
            "true";


        createButton.addEventListener(
            "click",
            async () => {

                if (
                    !selectedPetId
                ) {

                    return;

                }


                createButton.disabled =
                    true;


                createButton.textContent =
                    "Generating Plan...";


                try {

                    const generated =
                        await generateScheduleIfNeeded();


                    if (
                        !generated
                    ) {

                        alert(
                            "Please fill the nutrition form first."
                        );


                        return;

                    }


                    await loadNutritionData();


                } catch (error) {

                    console.error(
                        "CREATE PLAN ERROR:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to generate the nutrition plan."
                    );


                } finally {

                    createButton.disabled =
                        false;


                    createButton.textContent =
                        "Create Nutrition Plan";

                }

            }
        );

    }

}


/* =========================================================
   REFRESH
========================================================= */

async function refreshNutritionPage() {

    try {

        await loadNutritionData();

    } catch (error) {

        console.error(
            "Nutrition refresh error:",
            error
        );

    }

}


/* =========================================================
   REFRESH WHEN USER RETURNS TO TAB
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            refreshNutritionPage();

        }

    }
);


/* =========================================================
   MIDNIGHT REFRESH
========================================================= */

let lastNutritionDate =
    getTodayIST();


setInterval(
    async () => {

        const currentDate =
            getTodayIST();


        if (
            currentDate !==
            lastNutritionDate
        ) {

            lastNutritionDate =
                currentDate;


            console.log(
                "NEW NUTRITION DAY:",
                currentDate
            );


            await refreshNutritionPage();

        }

    },
    60 * 1000
);


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "=========================================="
        );

        console.log(
            "PAWSYNC NUTRITION PAGE"
        );

        console.log(
            "INDIA TIMEZONE:",
            "Asia/Kolkata"
        );

        console.log(
            "TODAY:",
            getTodayIST()
        );

        console.log(
            "=========================================="
        );


        try {

            setupNutritionButtons();

            const closeModalBtn = document.getElementById("closeNutritionModalBtn");
            const cancelModalBtn = document.getElementById("cancelNutritionModalBtn");
            const nutritionForm = document.getElementById("nutritionForm");

            if (closeModalBtn) closeModalBtn.addEventListener("click", hideNutritionModal);
            if (cancelModalBtn) cancelModalBtn.addEventListener("click", hideNutritionModal);
            if (nutritionForm) nutritionForm.addEventListener("submit", handleNutritionFormSubmit);


            /*
               1. Load real pets.
            */

            await loadPets();


            /*
               2. Load existing schedule.

               If profile exists but schedule
               doesn't exist, Gemini generation
               is automatically attempted.
            */

            await loadNutritionData();


            /*
               3. Connect buttons again after
                  page state changes.
            */

            setupNutritionButtons();


        } catch (error) {

            console.error(
                "Nutrition initialization failed:",
                error
            );


            showNutritionError(
                error.message
            );

        }

    }
);

/* =========================================================
   NUTRITION PROFILE MODAL & POPUP HELPERS
========================================================= */

function openNutritionModal() {
    const modal = document.getElementById("nutritionModal");
    if (modal) modal.style.display = "flex";
}

function hideNutritionModal() {
    const modal = document.getElementById("nutritionModal");
    if (modal) modal.style.display = "none";
}

async function handleNutritionFormSubmit(e) {
    e.preventDefault();
    if (!selectedPetId) return;

    const saveBtn = document.getElementById("saveNutritionModalBtn");
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving Nutrition...";
    }

    try {
        const payload = {
            petId: selectedPetId,
            dietType: document.getElementById("dietType")?.value || "Kibble/Dry",
            primaryFood: document.getElementById("primaryFood")?.value || "",
            mealsPerDay: Number(document.getElementById("mealsPerDay")?.value || 2),
            calorieTarget: Number(document.getElementById("calorieTarget")?.value || 0),
            allergies: document.getElementById("allergies")?.value || "",
            treatsAllowed: document.getElementById("treatsAllowed")?.value || "Yes",
            waterAccess: document.getElementById("waterAccess")?.value || "Constant access to fresh clean water",
            nutritionGoal: document.getElementById("nutritionGoal")?.value || ""
        };

        const res = await apiFetch(`${API_BASE}/nutrition`, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        hideNutritionModal();
        alert("Nutrition is Saved! 🍲");
        await loadNutritionData();
    } catch (error) {
        console.error("Error saving nutrition profile:", error);
        alert(error.message || "Failed to save nutrition profile.");
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Save Nutrition";
        }
    }
}

function showNutritionProfileIncompleteState(petName) {
    const content = document.getElementById("nutritionContent");
    const loading = document.getElementById("nutritionLoading");
    const empty = document.getElementById("noNutritionPlan");

    if (loading) loading.style.display = "none";
    if (empty) empty.style.display = "none";

    if (content) {
        content.style.display = "";
        content.innerHTML = `
            <section class="nutrition-empty" style="padding: 40px; text-align: center; background: white; border-radius: 20px; box-shadow: 0 6px 20px rgba(28,67,74,0.04);">
                <div class="empty-icon" style="font-size: 48px; margin-bottom: 12px;">🍲</div>
                <h2 style="color: #173b5f; margin: 0 0 8px;">Complete ${escapeHTML(petName)}'s Nutrition Profile</h2>
                <p style="color: #64748b; max-width: 480px; margin: 0 auto 20px; line-height: 1.5;">
                    ${escapeHTML(petName)}'s Nutrition profile is not completed yet. Please complete the Nutrition information before generating a personalized nutrition schedule.
                </p>
                <button type="button" class="nutrition-primary-btn" onclick="openNutritionModal()">
                    Complete Nutrition Profile
                </button>
            </section>
        `;
    }
}

function showProfileIncompletePopup(petName, sectionName, onCompleteClick) {
    let existingModal = document.getElementById("profileIncompleteModal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "profileIncompleteModal";
    modal.className = "modal-backdrop";
    modal.style.display = "flex";
    modal.style.zIndex = "4000";

    const icon = sectionName === "Nutrition" ? "🍲" : sectionName === "Grooming" ? "✂️" : "🏃";

    modal.innerHTML = `
        <div class="modal-dialog incomplete-modal-dialog" style="max-width: 480px; padding: 28px; text-align: center; border-radius: 20px; background: white; box-shadow: 0 20px 50px rgba(0,0,0,0.25);">
            <div style="font-size: 42px; margin-bottom: 12px;">${icon}</div>
            <h2 style="margin: 0 0 12px 0; font-size: 1.3rem; font-weight: 800; color: #173b5f;">Complete ${sectionName} Profile</h2>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px;">
                <strong>${escapeHTML(petName)}'s ${sectionName} profile is not completed yet.</strong><br>
                Please complete the ${sectionName} information before generating a personalized ${sectionName.toLowerCase()} schedule.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px;">
                <button type="button" id="cancelIncompleteModalBtn" class="action-btn btn-secondary" style="padding: 10px 20px; border-radius: 10px; font-weight: 700; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer; color: #475569;">Cancel</button>
                <button type="button" id="completeIncompleteModalBtn" class="action-btn btn-primary" style="padding: 10px 20px; border-radius: 10px; font-weight: 700; background: #0d9588; color: white; border: none; cursor: pointer;">Complete ${sectionName} Profile</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cancelIncompleteModalBtn").addEventListener("click", () => {
        modal.remove();
    });

    document.getElementById("completeIncompleteModalBtn").addEventListener("click", () => {
        modal.remove();
        if (typeof onCompleteClick === "function") {
            onCompleteClick();
        }
    });
}