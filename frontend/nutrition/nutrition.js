/* ============================================================
   PAWSYNC - NUTRITION
   ============================================================ */

const nutritionData = {

    bruno: {

        name: "Bruno",

        diet: {
            type: "Adult Maintenance",
            primaryFood: "Royal Canin Adult",
            mealsPerDay: 3,
            calorieTarget: 850,
            restrictions: "Low Fat",
            allergies: "None",
            goal: "Healthy Weight"
        },

        calories: {
            consumed: 620,
            target: 850
        },

        hydration: {
            intake: 1.70,
            target: 2.00
        },

        meals: [
            {
                type: "Breakfast",
                food: "Royal Canin Adult",
                time: "08:00",
                quantity: "120 g",
                calories: 280,
                status: "Completed"
            },
            {
                type: "Lunch",
                food: "Egg + Kibble",
                time: "13:00",
                quantity: "100 g",
                calories: 160,
                status: "Completed"
            },
            {
                type: "Dinner",
                food: "Royal Canin Adult",
                time: "19:30",
                quantity: "120 g",
                calories: 180,
                status: "Upcoming"
            }
        ],

        nutrients: [
            {
                name: "Protein",
                current: 52,
                target: 60,
                unit: "g"
            },
            {
                name: "Fat",
                current: 21,
                target: 30,
                unit: "g"
            },
            {
                name: "Carbohydrates",
                current: 48,
                target: 65,
                unit: "g"
            },
            {
                name: "Fiber",
                current: 8,
                target: 10,
                unit: "g"
            }
        ],

        schedule: [
            {
                time: "08:00",
                meal: "Breakfast",
                portion: "120 g",
                food: "Royal Canin Adult"
            },
            {
                time: "13:00",
                meal: "Lunch",
                portion: "100 g",
                food: "Egg + Kibble"
            },
            {
                time: "19:30",
                meal: "Dinner",
                portion: "120 g",
                food: "Royal Canin Adult"
            }
        ],

        foods: [
            {
                name: "Royal Canin Adult",
                category: "Dry Food",
                brand: "Royal Canin",
                calories: 350
            },
            {
                name: "Boiled Egg",
                category: "Protein",
                brand: "Homemade",
                calories: 78
            },
            {
                name: "Pumpkin",
                category: "Vegetable",
                brand: "Homemade",
                calories: 26
            }
        ],

        treats: [
            {
                name: "Dental Treat",
                quantity: "1 piece",
                calories: 45,
                time: "16:00"
            }
        ],

        sensitivities: [],

        streak: 8,

        trends: {

            "7": {
                calories: [720, 810, 780, 850, 800, 760, 620],
                water: [1.5, 1.8, 1.6, 1.9, 1.7, 2.0, 1.7]
            },

            "30": {
                calories: [
                    720, 810, 780, 850,
                    800, 760, 820, 790,
                    830, 810, 780, 850
                ],
                water: [
                    1.5, 1.8, 1.6, 1.9,
                    1.7, 2.0, 1.8, 1.7,
                    1.9, 1.8, 1.7, 2.0
                ]
            },

            "90": {
                calories: [
                    720, 810, 780, 850,
                    800, 760, 820, 790,
                    830, 810, 780, 850
                ],
                water: [
                    1.5, 1.8, 1.6, 1.9,
                    1.7, 2.0, 1.8, 1.7,
                    1.9, 1.8, 1.7, 2.0
                ]
            }

        }

    }

};


let currentPet = "bruno";
let currentRange = "7";
let trendChart = null;


/* ============================================================
   START
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeNutrition();

    }
);


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeNutrition() {

    setupButtons();

    setupModals();

    setupForms();

    setupRangeButtons();

    renderNutrition();

}


/* ============================================================
   RENDER EVERYTHING
   ============================================================ */

function renderNutrition() {

    const pet =
        nutritionData[currentPet];

    if (!pet) return;

    renderPet(pet);
    renderDiet(pet);
    renderMeals(pet);
    renderCalories(pet);
    renderHydration(pet);
    renderNutrients(pet);
    renderSchedule(pet);
    renderFoods(pet);
    renderTreats(pet);
    renderSensitivities(pet);
    renderStreak(pet);

    setTimeout(
        () => renderChart(pet),
        50
    );

}


/* ============================================================
   PET
   ============================================================ */

function renderPet(pet) {

    const petName =
        document.getElementById(
            "selectedPetName"
        );

    const dietPetName =
        document.getElementById(
            "dietPetName"
        );

    if (petName) {
        petName.textContent =
            pet.name;
    }

    if (dietPetName) {
        dietPetName.textContent =
            `${pet.name}'s active nutrition plan`;
    }

}


/* ============================================================
   DIET
   ============================================================ */

function renderDiet(pet) {

    const container =
        document.getElementById(
            "dietGrid"
        );

    if (!container) return;

    const diet =
        pet.diet;

    container.innerHTML = `

        <div class="diet-field">

            <span class="field-label">
                Diet Type
            </span>

            <span class="field-value">
                ${escapeHTML(diet.type)}
            </span>

        </div>


        <div class="diet-field">

            <span class="field-label">
                Primary Food
            </span>

            <span class="field-value">
                ${escapeHTML(diet.primaryFood)}
            </span>

        </div>


        <div class="diet-field">

            <span class="field-label">
                Meals / Day
            </span>

            <span class="field-value">
                ${diet.mealsPerDay}
            </span>

        </div>


        <div class="diet-field highlight">

            <span class="field-label">
                Daily Calories
            </span>

            <span class="field-value">
                ${diet.calorieTarget} kcal
            </span>

        </div>


        <div class="diet-field">

            <span class="field-label">
                Restrictions
            </span>

            <span class="field-value">
                ${escapeHTML(diet.restrictions)}
            </span>

        </div>


        <div class="diet-field allergy">

            <span class="field-label">
                Allergies
            </span>

            <span class="field-value">
                ${escapeHTML(diet.allergies)}
            </span>

        </div>


        <div class="diet-field">

            <span class="field-label">
                Nutrition Goal
            </span>

            <span class="field-value">
                ${escapeHTML(diet.goal)}
            </span>

        </div>

    `;

}


/* ============================================================
   MEALS
   ============================================================ */

function renderMeals(pet) {

    const list =
        document.getElementById(
            "feedLogList"
        );

    if (!list) return;

    list.innerHTML = "";

    pet.meals.forEach(
        (meal, index) => {

            list.innerHTML += `

                <li class="feed-item">

                    <div>

                        <span class="feed-name">
                            ${escapeHTML(meal.type)}
                        </span>

                        <span class="feed-food">
                            ${escapeHTML(meal.food)}
                        </span>

                    </div>


                    <span class="feed-time">
                        ${formatTime(meal.time)}
                    </span>


                    <span class="feed-qty">
                        ${escapeHTML(meal.quantity)}
                    </span>


                    <span class="
                        status-pill
                        ${meal.status.toLowerCase()}
                    ">
                        ${meal.status}
                    </span>


                    <button
                        class="feed-delete"
                        data-delete-meal="${index}"
                        type="button"
                    >
                        ×
                    </button>

                </li>

            `;

        }
    );


    document
        .querySelectorAll(
            "[data-delete-meal]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const index =
                            Number(
                                button.dataset.deleteMeal
                            );

                        pet.meals.splice(
                            index,
                            1
                        );

                        renderNutrition();

                    };

            }
        );

}


/* ============================================================
   CALORIES
   ============================================================ */

function renderCalories(pet) {

    const consumed =
        pet.calories.consumed;

    const target =
        pet.calories.target;

    const remaining =
        Math.max(
            target - consumed,
            0
        );

    const percentage =
        Math.min(
            consumed / target,
            1
        );


    const consumedText =
        document.getElementById(
            "calorieConsumedText"
        );

    const targetText =
        document.getElementById(
            "calorieTargetText"
        );

    const statConsumed =
        document.getElementById(
            "statConsumed"
        );

    const statRemaining =
        document.getElementById(
            "statRemaining"
        );

    const statTarget =
        document.getElementById(
            "statTarget"
        );

    const ring =
        document.getElementById(
            "calorieRingProgress"
        );


    if (consumedText)
        consumedText.textContent =
            consumed;

    if (targetText)
        targetText.textContent =
            target;

    if (statConsumed)
        statConsumed.textContent =
            `${consumed} kcal`;

    if (statRemaining)
        statRemaining.textContent =
            `${remaining} kcal`;

    if (statTarget)
        statTarget.textContent =
            `${target} kcal`;


    if (ring) {

        const circumference =
            2 * Math.PI * 68;

        ring.style.strokeDasharray =
            circumference;

        ring.style.strokeDashoffset =
            circumference *
            (1 - percentage);

    }


    renderMealBreakdown(
        pet
    );

}


/* ============================================================
   MEAL BREAKDOWN
   ============================================================ */

function renderMealBreakdown(pet) {

    const container =
        document.getElementById(
            "mealBreakdown"
        );

    if (!container) return;

    container.innerHTML = "";

    pet.meals
        .filter(
            meal =>
                meal.status ===
                "Completed"
        )
        .forEach(
            meal => {

                container.innerHTML += `

                    <div class="breakdown-row">

                        <span>
                            ${escapeHTML(meal.type)}
                        </span>

                        <strong>
                            ${meal.calories} kcal
                        </strong>

                    </div>

                `;

            }
        );

}


/* ============================================================
   HYDRATION
   ============================================================ */

function renderHydration(pet) {

    const intake =
        pet.hydration.intake;

    const target =
        pet.hydration.target;

    const percent =
        Math.min(
            Math.round(
                (intake / target) * 100
            ),
            100
        );


    const intakeEl =
        document.getElementById(
            "hydrationIntake"
        );

    const targetEl =
        document.getElementById(
            "hydrationTarget"
        );

    const fill =
        document.getElementById(
            "hydrationBarFill"
        );

    const percentEl =
        document.getElementById(
            "hydrationPercent"
        );


    if (intakeEl)
        intakeEl.textContent =
            `${intake.toFixed(2)} L`;

    if (targetEl)
        targetEl.textContent =
            `${target.toFixed(2)} L`;

    if (fill)
        fill.style.width =
            `${percent}%`;

    if (percentEl)
        percentEl.textContent =
            `${percent}%`;

}


/* ============================================================
   NUTRIENTS
   ============================================================ */

function renderNutrients(pet) {

    const list =
        document.getElementById(
            "nutrientList"
        );

    if (!list) return;

    list.innerHTML = "";


    pet.nutrients.forEach(
        nutrient => {

            const percent =
                Math.min(
                    Math.round(
                        (
                            nutrient.current /
                            nutrient.target
                        ) * 100
                    ),
                    100
                );


            list.innerHTML += `

                <div class="nutrient-row">

                    <div class="nutrient-top">

                        <span class="nutrient-name">
                            ${nutrient.name}
                        </span>

                        <span class="nutrient-pct">
                            ${nutrient.current}
                            /
                            ${nutrient.target}
                            ${nutrient.unit}
                            · ${percent}%
                        </span>

                    </div>


                    <div class="nutrient-track">

                        <div
                            class="nutrient-fill"
                            style="width:${percent}%"
                        ></div>

                    </div>

                    <p class="nutrient-caption">
                        Daily target progress
                    </p>

                </div>

            `;

        }
    );

}


/* ============================================================
   SCHEDULE
   ============================================================ */

function renderSchedule(pet) {

    const list =
        document.getElementById(
            "scheduleTimeline"
        );

    if (!list) return;

    list.innerHTML = "";


    pet.schedule.forEach(
        (item, index) => {

            list.innerHTML += `

                <li class="timeline-item">

                    <span class="timeline-time">
                        ${formatTime(item.time)}
                    </span>


                    <div class="timeline-body">

                        <div>

                            <span class="timeline-name">
                                ${escapeHTML(item.meal)}
                            </span>

                            <span class="timeline-detail">
                                ${escapeHTML(item.food)}
                                ·
                                ${escapeHTML(item.portion)}
                            </span>

                        </div>


                        <button
                            type="button"
                            class="feed-delete"
                            data-delete-schedule="${index}"
                        >
                            ×
                        </button>

                    </div>

                </li>

            `;

        }
    );


    document
        .querySelectorAll(
            "[data-delete-schedule]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const index =
                            Number(
                                button.dataset.deleteSchedule
                            );

                        pet.schedule.splice(
                            index,
                            1
                        );

                        renderSchedule(
                            pet
                        );

                    };

            }
        );

}


/* ============================================================
   FOOD
   ============================================================ */

function renderFoods(pet) {

    const list =
        document.getElementById(
            "foodList"
        );

    if (!list) return;

    list.innerHTML = "";


    pet.foods.forEach(
        (food, index) => {

            list.innerHTML += `

                <li class="food-item">

                    <div>

                        <span class="food-name">
                            ${escapeHTML(food.name)}
                        </span>

                        <span class="food-meta">
                            ${escapeHTML(food.category)}
                            ·
                            ${escapeHTML(food.brand)}
                            ·
                            ${food.calories} kcal
                        </span>

                    </div>


                    <button
                        type="button"
                        class="btn-danger-text"
                        data-delete-food="${index}"
                    >
                        Remove
                    </button>

                </li>

            `;

        }
    );


    document
        .querySelectorAll(
            "[data-delete-food]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const index =
                            Number(
                                button.dataset.deleteFood
                            );

                        pet.foods.splice(
                            index,
                            1
                        );

                        renderFoods(
                            pet
                        );

                    };

            }
        );

}


/* ============================================================
   TREATS
   ============================================================ */

function renderTreats(pet) {

    const list =
        document.getElementById(
            "treatList"
        );

    const totalEl =
        document.getElementById(
            "treatTotal"
        );

    if (!list) return;

    list.innerHTML = "";

    let total = 0;


    pet.treats.forEach(
        (treat, index) => {

            total +=
                Number(
                    treat.calories
                );


            list.innerHTML += `

                <li class="treat-item">

                    <div>

                        <span class="treat-name">
                            ${escapeHTML(treat.name)}
                        </span>

                        <span class="treat-meta">
                            ${escapeHTML(treat.quantity)}
                            ·
                            ${formatTime(treat.time)}
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${treat.calories} kcal
                        </strong>

                        <button
                            type="button"
                            class="btn-danger-text"
                            data-delete-treat="${index}"
                        >
                            Remove
                        </button>

                    </div>

                </li>

            `;

        }
    );


    if (totalEl)
        totalEl.textContent =
            `${total} kcal`;


    document
        .querySelectorAll(
            "[data-delete-treat]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const index =
                            Number(
                                button.dataset.deleteTreat
                            );

                        pet.treats.splice(
                            index,
                            1
                        );

                        renderTreats(
                            pet
                        );

                    };

            }
        );

}


/* ============================================================
   SENSITIVITIES
   ============================================================ */

function renderSensitivities(pet) {

    const list =
        document.getElementById(
            "sensitivityList"
        );

    if (!list) return;

    list.innerHTML = "";


    if (!pet.sensitivities.length) {

        list.innerHTML = `

            <li class="empty-state">
                No food sensitivities recorded.
            </li>

        `;

        return;
    }


    pet.sensitivities.forEach(
        (item, index) => {

            list.innerHTML += `

                <li class="sensitivity-item">

                    <div>

                        <div class="sensitivity-food">
                            ${escapeHTML(item.food)}
                        </div>

                        <div class="sensitivity-reaction">
                            ${escapeHTML(item.reaction)}
                        </div>

                    </div>


                    <div>

                        <span
                            class="
                                severity-pill
                                ${item.severity.toLowerCase()}
                            "
                        >
                            ${item.severity}
                        </span>

                        <br>

                        <button
                            type="button"
                            class="btn-danger-text"
                            data-delete-sensitivity="${index}"
                        >
                            Remove
                        </button>

                    </div>

                </li>

            `;

        }
    );


    document
        .querySelectorAll(
            "[data-delete-sensitivity]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const index =
                            Number(
                                button.dataset.deleteSensitivity
                            );

                        pet.sensitivities.splice(
                            index,
                            1
                        );

                        renderSensitivities(
                            pet
                        );

                    };

            }
        );

}


/* ============================================================
   STREAK
   ============================================================ */

function renderStreak(pet) {

    const number =
        document.getElementById(
            "streakNumber"
        );

    const caption =
        document.getElementById(
            "streakCaption"
        );


    if (number)
        number.textContent =
            pet.streak;

    if (caption)
        caption.textContent =
            `You've completed scheduled meals for ${pet.streak} consecutive days.`;

}


/* ============================================================
   CHART
   ============================================================ */

function renderChart(pet) {

    const canvas =
        document.getElementById(
            "trendChart"
        );

    if (!canvas) return;

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js is not loaded."
        );

        return;

    }


    const data =
        pet.trends[
            currentRange
        ];

    if (!data) return;


    if (trendChart) {

        trendChart.destroy();

        trendChart = null;

    }


    let labels;


    if (currentRange === "7") {

        labels = [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ];

    }

    else if (currentRange === "30") {

        labels =
            data.calories.map(
                (_, i) =>
                    `Day ${i + 1}`
            );

    }

    else {

        labels =
            data.calories.map(
                (_, i) =>
                    `Week ${i + 1}`
            );

    }


    trendChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {
                            label: "Calories",

                            data:
                                data.calories,

                            borderColor:
                                "#2FA58A",

                            backgroundColor:
                                "rgba(47,165,138,0.10)",

                            borderWidth: 2,

                            fill: true,

                            tension: 0.35,

                            pointRadius: 3,

                            pointBackgroundColor:
                                "#ffffff",

                            pointBorderColor:
                                "#2FA58A",

                            pointBorderWidth: 2
                        },

                        {
                            label: "Water",

                            data:
                                data.water.map(
                                    value =>
                                        value * 400
                                ),

                            borderColor:
                                "#3AAED8",

                            backgroundColor:
                                "transparent",

                            borderWidth: 2,

                            borderDash:
                                [5, 5],

                            fill: false,

                            tension: 0.35,

                            pointRadius: 2
                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },


                    interaction: {

                        mode: "index",

                        intersect: false

                    },


                    scales: {

                        y: {

                            beginAtZero: false,

                            grid: {
                                color: "#e8efed"
                            },

                            ticks: {
                                color: "#7d8d9b",
                                font: {
                                    size: 9
                                }
                            }

                        },

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {
                                color: "#7d8d9b",
                                font: {
                                    size: 9
                                }
                            }

                        }

                    }

                }

            }
        );

}


/* ============================================================
   BUTTONS
   ============================================================ */

function setupButtons() {

    const buttons = {

        editDietBtn: "modalEditDiet",

        logMealBtn: "modalLogMeal",

        logWaterBtn: "modalLogWater",

        addFoodBtn: "modalAddFood",

        logTreatBtn: "modalLogTreat",

        addScheduleBtn: "modalAddSchedule",

        addSensitivityBtn:
            "modalAddSensitivity"

    };


    Object.keys(buttons)
        .forEach(
            buttonId => {

                const button =
                    document.getElementById(
                        buttonId
                    );

                if (!button) return;


                button.addEventListener(
                    "click",
                    () => {

                        if (
                            buttonId ===
                            "editDietBtn"
                        ) {

                            loadDietForm();

                        }


                        openModal(
                            buttons[buttonId]
                        );

                    }
                );

            }
        );

}


/* ============================================================
   RANGE
   ============================================================ */

function setupRangeButtons() {

    document
        .querySelectorAll(
            ".range-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".range-btn"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "is-active"
                                    )
                            );


                        button.classList.add(
                            "is-active"
                        );


                        currentRange =
                            button.dataset.range;


                        renderChart(
                            nutritionData[
                                currentPet
                            ]
                        );

                    }
                );

            }
        );

}


/* ============================================================
   MODALS
   ============================================================ */

function openModal(id) {

    const modal =
        document.getElementById(id);

    if (modal)
        modal.classList.add(
            "is-open"
        );

}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal)
        modal.classList.remove(
            "is-open"
        );

}


function setupModals() {

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        closeModal(
                            button.dataset.closeModal
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            modal.classList.remove(
                                "is-open"
                            );

                        }

                    }
                );

            }
        );

}


/* ============================================================
   FORMS
   ============================================================ */

function setupForms() {

    const dietForm =
        document.getElementById(
            "formEditDiet"
        );

    const mealForm =
        document.getElementById(
            "formLogMeal"
        );

    const waterForm =
        document.getElementById(
            "formLogWater"
        );

    const foodForm =
        document.getElementById(
            "formAddFood"
        );

    const treatForm =
        document.getElementById(
            "formLogTreat"
        );

    const scheduleForm =
        document.getElementById(
            "formAddSchedule"
        );

    const sensitivityForm =
        document.getElementById(
            "formAddSensitivity"
        );


    if (dietForm)
        dietForm.onsubmit =
            saveDiet;

    if (mealForm)
        mealForm.onsubmit =
            saveMeal;

    if (waterForm)
        waterForm.onsubmit =
            saveWater;

    if (foodForm)
        foodForm.onsubmit =
            saveFood;

    if (treatForm)
        treatForm.onsubmit =
            saveTreat;

    if (scheduleForm)
        scheduleForm.onsubmit =
            saveSchedule;

    if (sensitivityForm)
        sensitivityForm.onsubmit =
            saveSensitivity;

}


/* ============================================================
   DIET FORM
   ============================================================ */

function loadDietForm() {

    const form =
        document.getElementById(
            "formEditDiet"
        );

    const diet =
        nutritionData[
            currentPet
        ].diet;

    if (!form) return;

    form.dietType.value =
        diet.type;

    form.primaryFood.value =
        diet.primaryFood;

    form.mealsPerDay.value =
        diet.mealsPerDay;

    form.calorieTarget.value =
        diet.calorieTarget;

    form.restrictions.value =
        diet.restrictions;

    form.allergies.value =
        diet.allergies;

    form.goal.value =
        diet.goal;

}


/* ============================================================
   SAVE DIET
   ============================================================ */

function saveDiet(event) {

    event.preventDefault();

    const form =
        event.target;

    const diet =
        nutritionData[
            currentPet
        ].diet;

    diet.type =
        form.dietType.value;

    diet.primaryFood =
        form.primaryFood.value;

    diet.mealsPerDay =
        Number(
            form.mealsPerDay.value
        );

    diet.calorieTarget =
        Number(
            form.calorieTarget.value
        );

    diet.restrictions =
        form.restrictions.value ||
        "None";

    diet.allergies =
        form.allergies.value ||
        "None";

    diet.goal =
        form.goal.value ||
        "Healthy Weight";


    closeModal(
        "modalEditDiet"
    );

    renderNutrition();

}


/* ============================================================
   SAVE MEAL
   ============================================================ */

function saveMeal(event) {

    event.preventDefault();

    const form =
        event.target;

    const meal = {

        type:
            form.mealType.value,

        food:
            form.foodName.value,

        time:
            form.time.value,

        quantity:
            `${form.quantity.value} g`,

        calories:
            Number(
                form.calories.value
            ),

        status:
            form.status.value

    };


    nutritionData[
        currentPet
    ].meals.push(
        meal
    );


    if (
        meal.status ===
        "Completed"
    ) {

        nutritionData[
            currentPet
        ].calories.consumed +=
            meal.calories;

    }


    closeModal(
        "modalLogMeal"
    );

    form.reset();

    renderNutrition();

}


/* ============================================================
   SAVE WATER
   ============================================================ */

function saveWater(event) {

    event.preventDefault();

    const amount =
        Number(
            event.target.amount.value
        );


    nutritionData[
        currentPet
    ].hydration.intake +=
        amount;


    closeModal(
        "modalLogWater"
    );

    event.target.reset();

    renderHydration(
        nutritionData[
            currentPet
        ]
    );

}


/* ============================================================
   SAVE FOOD
   ============================================================ */

function saveFood(event) {

    event.preventDefault();

    const form =
        event.target;


    nutritionData[
        currentPet
    ].foods.push({

        name:
            form.name.value,

        category:
            form.category.value ||
            "Other",

        brand:
            form.brand.value ||
            "Homemade",

        calories:
            Number(
                form.calories.value
            ) || 0

    });


    closeModal(
        "modalAddFood"
    );

    form.reset();

    renderFoods(
        nutritionData[
            currentPet
        ]
    );

}


/* ============================================================
   SAVE TREAT
   ============================================================ */

function saveTreat(event) {

    event.preventDefault();

    const form =
        event.target;


    nutritionData[
        currentPet
    ].treats.push({

        name:
            form.name.value,

        quantity:
            form.quantity.value,

        calories:
            Number(
                form.calories.value
            ),

        time:
            form.time.value

    });


    closeModal(
        "modalLogTreat"
    );

    form.reset();

    renderTreats(
        nutritionData[
            currentPet
        ]
    );

}


/* ============================================================
   SAVE SCHEDULE
   ============================================================ */

function saveSchedule(event) {

    event.preventDefault();

    const form =
        event.target;


    nutritionData[
        currentPet
    ].schedule.push({

        time:
            form.time.value,

        meal:
            form.mealName.value,

        portion:
            form.portion.value ||
            "As recommended",

        food:
            form.food.value ||
            "Regular food"

    });


    closeModal(
        "modalAddSchedule"
    );

    form.reset();

    renderSchedule(
        nutritionData[
            currentPet
        ]
    );

}


/* ============================================================
   SAVE SENSITIVITY
   ============================================================ */

function saveSensitivity(event) {

    event.preventDefault();

    const form =
        event.target;


    nutritionData[
        currentPet
    ].sensitivities.push({

        food:
            form.food.value,

        reaction:
            form.reaction.value ||
            "Not specified",

        severity:
            form.severity.value

    });


    closeModal(
        "modalAddSensitivity"
    );

    form.reset();

    renderSensitivities(
        nutritionData[
            currentPet
        ]
    );

}


/* ============================================================
   HELPERS
   ============================================================ */

function formatTime(time) {

    if (!time) return "";

    const [hour, minute] =
        time.split(":");

    let h =
        Number(hour);

    const period =
        h >= 12
            ? "PM"
            : "AM";

    h =
        h % 12 || 12;

    return `${h}:${minute} ${period}`;

}


function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}