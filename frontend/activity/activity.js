/* ============================================================
   PAWSYNC ACTIVITY PAGE
   ============================================================ */


/* ============================================================
   ACTIVITY DATA
   ============================================================ */

const activityData = {

    bruno: {

        name: "Bruno",
        species: "Dog",

        score: 78,

        sleep: "11h 20m",

        water: {
            current: 1.70,
            goal: 2.00
        },

        goals: [

            {
                name: "Walking",
                current: 42,
                target: 60,
                unit: "min",
                color: "green"
            },

            {
                name: "Playing",
                current: 28,
                target: 30,
                unit: "min",
                color: "blue"
            },

            {
                name: "Outdoor Time",
                current: 45,
                target: 60,
                unit: "min",
                color: "orange"
            }

        ],

        chart: {

            "7": [
                52,
                45,
                68,
                58,
                72,
                84,
                60
            ],

            "30": [
                42,
                50,
                61,
                48,
                55,
                68,
                73,
                59,
                64,
                70,
                58,
                76
            ],

            "90": [
                48,
                55,
                62,
                58,
                70,
                66,
                74,
                69,
                78,
                72,
                80,
                76
            ]

        },

        activities: [

            {
                name: "Morning Walk",
                icon: "🚶",
                details: "35 min · 2.1 km",
                time: "07:30 AM"
            },

            {
                name: "Play Session",
                icon: "🎾",
                details: "20 min · Moderate",
                time: "12:30 PM"
            },

            {
                name: "Outdoor Time",
                icon: "🌳",
                details: "25 min",
                time: "03:20 PM"
            },

            {
                name: "Evening Walk",
                icon: "🚶",
                details: "45 min · Planned",
                time: "05:30 PM"
            }

        ]

    },


    kitty: {

        name: "Kitty",
        species: "Cat",

        score: 65,

        sleep: "15h 30m",

        water: {
            current: 0.15,
            goal: 0.25
        },

        goals: [

            {
                name: "Playing",
                current: 20,
                target: 40,
                unit: "min",
                color: "blue"
            },

            {
                name: "Climbing",
                current: 15,
                target: 20,
                unit: "min",
                color: "purple"
            },

            {
                name: "Exploration",
                current: 25,
                target: 30,
                unit: "min",
                color: "green"
            }

        ],

        chart: {

            "7": [
                30,
                45,
                40,
                25,
                50,
                35,
                45
            ],

            "30": [
                35,
                40,
                30,
                45,
                38,
                42,
                35,
                40,
                39,
                45,
                30,
                42
            ],

            "90": [
                40,
                38,
                42,
                39,
                45,
                40,
                43,
                46,
                41,
                44,
                39,
                45
            ]

        },

        activities: [

            {
                name: "Laser Pointer Chase",
                icon: "🔴",
                details: "15 min · High",
                time: "08:00 AM"
            },

            {
                name: "Morning Nap",
                icon: "😴",
                details: "3 hrs",
                time: "09:30 AM"
            },

            {
                name: "Cat Tree Exploration",
                icon: "🐈",
                details: "10 min",
                time: "02:00 PM"
            }

        ]

    },


    coco: {

        name: "Coco",
        species: "Bird",

        score: 88,

        sleep: "10h",

        water: {
            current: 0.05,
            goal: 0.10
        },

        goals: [

            {
                name: "Out of Cage",
                current: 90,
                target: 120,
                unit: "min",
                color: "green"
            },

            {
                name: "Flight Time",
                current: 20,
                target: 30,
                unit: "min",
                color: "blue"
            },

            {
                name: "Enrichment",
                current: 20,
                target: 30,
                unit: "min",
                color: "orange"
            }

        ],

        chart: {

            "7": [
                120,
                110,
                130,
                125,
                140,
                115,
                130
            ],

            "30": [
                110,
                120,
                115,
                125,
                130,
                120,
                110,
                135,
                120,
                125,
                115,
                130
            ],

            "90": [
                115,
                120,
                125,
                120,
                130,
                125,
                128,
                132,
                126,
                135,
                130,
                138
            ]

        },

        activities: [

            {
                name: "Morning Roam",
                icon: "🦜",
                details: "60 min",
                time: "08:00 AM"
            },

            {
                name: "Room Flights",
                icon: "💨",
                details: "15 min",
                time: "10:30 AM"
            },

            {
                name: "Foraging Toy",
                icon: "🧩",
                details: "20 min",
                time: "01:00 PM"
            }

        ]

    }

};


/* ============================================================
   STATE
   ============================================================ */

let currentPet = "bruno";

let currentRange = "7";

let activityChart = null;


/* ============================================================
   PAGE LOAD
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeActivity();

    }
);


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeActivity() {

    setupPetSelector();

    setupRangeButtons();

    setupActivityModal();

    renderActivityPage();

}


/* ============================================================
   PET SELECTOR
   ============================================================ */

function setupPetSelector() {

    const selector =
        document.getElementById(
            "petSelector"
        );


    if (!selector) {
        return;
    }


    selector.addEventListener(
        "change",
        function () {

            currentPet =
                this.value;

            renderActivityPage();

        }
    );

}


/* ============================================================
   RANGE BUTTONS
   ============================================================ */

function setupRangeButtons() {

    const buttons =
        document.querySelectorAll(
            ".range-btn"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );


                    currentRange =
                        this.dataset.range;


                    renderChart();

                }
            );

        }
    );

}


/* ============================================================
   RENDER PAGE
   ============================================================ */

function renderActivityPage() {

    const pet =
        activityData[currentPet];


    if (!pet) {
        return;
    }


    renderScore(pet);

    renderSleep(pet);

    renderWater(pet);

    renderGoals(pet);

    renderRecentActivities(pet);

    renderChart();

}


/* ============================================================
   ACTIVITY SCORE
   ============================================================ */

function renderScore(pet) {

    const score =
        document.getElementById(
            "activityScore"
        );


    const scoreBar =
        document.getElementById(
            "activityScoreBar"
        );


    if (score) {

        score.textContent =
            pet.score;

    }


    if (scoreBar) {

        scoreBar.style.width =
            `${pet.score}%`;

    }

}


/* ============================================================
   SLEEP
   ============================================================ */

function renderSleep(pet) {

    const sleep =
        document.getElementById(
            "sleepValue"
        );


    if (sleep) {

        sleep.textContent =
            pet.sleep;

    }

}


/* ============================================================
   WATER
   ============================================================ */

function renderWater(pet) {

    const current =
        pet.water.current;


    const goal =
        pet.water.goal;


    const percentage =
        Math.min(
            Math.round(
                (
                    current /
                    goal
                ) * 100
            ),
            100
        );


    const waterValue =
        document.getElementById(
            "waterValue"
        );


    const waterPercentage =
        document.getElementById(
            "waterPercentage"
        );


    if (waterValue) {

        waterValue.textContent =
            `${current.toFixed(2)} L`;

    }


    if (waterPercentage) {

        waterPercentage.textContent =
            percentage + "%";

    }

}


/* ============================================================
   GOALS
   ============================================================ */

function renderGoals(pet) {

    const container =
        document.getElementById(
            "goalsList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    let totalPercentage = 0;


    pet.goals.forEach(
        goal => {

            const percentage =
                Math.min(
                    Math.round(
                        (
                            goal.current /
                            goal.target
                        ) * 100
                    ),
                    100
                );


            totalPercentage +=
                percentage;


            container.innerHTML +=
                `
                <div class="goal-item">

                    <div class="goal-top">

                        <span class="goal-name">
                            ${goal.name}
                        </span>

                        <span class="goal-value">
                            ${goal.current}
                            /
                            ${goal.target}
                            ${goal.unit}
                        </span>

                    </div>


                    <div
                        class="
                            goal-progress
                            ${goal.color}
                        "
                    >

                        <div
                            style="
                                width:${percentage}%
                            "
                        ></div>

                    </div>

                </div>
                `;

        }
    );


    const overall =
        Math.round(
            totalPercentage /
            pet.goals.length
        );


    const overallText =
        document.getElementById(
            "overallPercentage"
        );


    const overallBar =
        document.getElementById(
            "overallProgressBar"
        );


    if (overallText) {

        overallText.textContent =
            `${overall}% Complete`;

    }


    if (overallBar) {

        overallBar.style.width =
            `${overall}%`;

    }

}


/* ============================================================
   RECENT ACTIVITIES
   ============================================================ */

function renderRecentActivities(pet) {

    const container =
        document.getElementById(
            "recentActivities"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    pet.activities.forEach(
        activity => {

            container.innerHTML +=
                `
                <div class="recent-item">

                    <div class="recent-icon">
                        ${activity.icon}
                    </div>


                    <div class="recent-info">

                        <p class="recent-name">
                            ${activity.name}
                        </p>

                        <p class="recent-meta">
                            ${activity.details}
                        </p>

                    </div>


                    <span class="recent-time">
                        ${activity.time}
                    </span>

                </div>
                `;

        }
    );

}


/* ============================================================
   CHART
   ============================================================ */

function renderChart() {

    if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.js is not loaded."
        );

        return;

    }


    const canvas =
        document.getElementById(
            "activityChart"
        );


    if (!canvas) {
        return;
    }


    const pet =
        activityData[currentPet];


    if (!pet) {
        return;
    }


    const values =
        pet.chart[currentRange];


    let labels;


    if (
        currentRange === "7"
    ) {

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

    else if (
        currentRange === "30"
    ) {

        labels =
            values.map(
                (_, index) =>
                    `Day ${index + 1}`
            );

    }

    else {

        labels =
            values.map(
                (_, index) =>
                    `Week ${index + 1}`
            );

    }


    if (activityChart) {

        activityChart.destroy();

    }


    activityChart =
        new Chart(
            canvas,
            {

                type: "line",


                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Active Minutes",

                            data: values,

                            borderColor:
                                "#2FA58A",

                            backgroundColor:
                                "rgba(47,165,138,0.10)",

                            borderWidth: 2,

                            fill: true,

                            tension: 0.4,

                            pointRadius: 4,

                            pointHoverRadius: 6,

                            pointBackgroundColor:
                                "#FFFFFF",

                            pointBorderColor:
                                "#2FA58A",

                            pointBorderWidth: 2

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    interaction: {

                        intersect: false,

                        mode: "index"

                    },


                    plugins: {

                        legend: {

                            display: false

                        },


                        tooltip: {

                            backgroundColor:
                                "#26364A",

                            titleColor:
                                "#FFFFFF",

                            bodyColor:
                                "#FFFFFF",

                            padding: 10,

                            cornerRadius: 8,

                            displayColors: false,

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return `
                                            ${context.parsed.y}
                                            active minutes
                                        `;

                                    }

                            }

                        }

                    },


                    scales: {

                        y: {

                            beginAtZero: true,

                            border: {
                                display: false
                            },

                            grid: {

                                color:
                                    "#E4ECE9"

                            },

                            ticks: {

                                color:
                                    "#7B8794",

                                font: {
                                    size: 10
                                }

                            }

                        },


                        x: {

                            border: {
                                display: false
                            },

                            grid: {
                                display: false
                            },

                            ticks: {

                                color:
                                    "#7B8794",

                                font: {
                                    size: 10
                                }

                            }

                        }

                    }

                }

            }
        );

}


/* ============================================================
   MODAL
   ============================================================ */

function setupActivityModal() {

    const modal =
        document.getElementById(
            "activityModal"
        );


    const openButton =
        document.getElementById(
            "logActivityBtn"
        );


    const closeButton =
        document.getElementById(
            "closeModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelModal"
        );


    const form =
        document.getElementById(
            "activityForm"
        );


    if (
        !modal ||
        !openButton ||
        !closeButton ||
        !cancelButton ||
        !form
    ) {

        return;

    }


    /* Open */

    openButton.addEventListener(
        "click",
        function () {

            modal.classList.add(
                "active"
            );


            setCurrentTime();

        }
    );


    /* Close */

    closeButton.addEventListener(
        "click",
        closeActivityModal
    );


    /* Cancel */

    cancelButton.addEventListener(
        "click",
        closeActivityModal
    );


    /* Click outside */

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                closeActivityModal();

            }

        }
    );


    /* Form submit */

    form.addEventListener(
        "submit",
        saveActivity
    );

}


/* ============================================================
   SET CURRENT TIME
   ============================================================ */

function setCurrentTime() {

    const timeInput =
        document.getElementById(
            "activityTime"
        );


    if (!timeInput) {
        return;
    }


    const now =
        new Date();


    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    timeInput.value =
        `${hours}:${minutes}`;

}


/* ============================================================
   CLOSE MODAL
   ============================================================ */

function closeActivityModal() {

    const modal =
        document.getElementById(
            "activityModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );

}


/* ============================================================
   SAVE ACTIVITY
   ============================================================ */

function saveActivity(event) {

    event.preventDefault();


    const type =
        document.getElementById(
            "activityType"
        ).value;


    const duration =
        document.getElementById(
            "activityDuration"
        ).value;


    const time =
        document.getElementById(
            "activityTime"
        ).value;


    const notes =
        document.getElementById(
            "activityNotes"
        ).value;


    if (
        !type ||
        !duration ||
        !time
    ) {

        return;

    }


    const pet =
        activityData[currentPet];


    /* Add new activity */

    pet.activities.unshift({

        name: type,

        icon:
            getActivityIcon(type),

        details:
            `${duration} min`
            +
            (
                notes
                    ? ` · ${notes}`
                    : ""
            ),

        time:
            formatTime(time)

    });


    /* Re-render */

    renderRecentActivities(
        pet
    );


    /* Close */

    closeActivityModal();


    /* Reset */

    document
        .getElementById(
            "activityForm"
        )
        .reset();


    /* Toast */

    showToast(
        "Activity added successfully"
    );

}


/* ============================================================
   ACTIVITY ICON
   ============================================================ */

function getActivityIcon(
    activityType
) {

    const type =
        activityType.toLowerCase();


    if (
        type.includes("walk")
    ) {

        return "🚶";

    }


    if (
        type.includes("play")
    ) {

        return "🎾";

    }


    if (
        type.includes("outdoor")
    ) {

        return "🌳";

    }


    if (
        type.includes("run")
    ) {

        return "🏃";

    }


    if (
        type.includes("train")
    ) {

        return "🎯";

    }


    return "🐾";

}


/* ============================================================
   FORMAT TIME
   ============================================================ */

function formatTime(time) {

    const parts =
        time.split(":");


    let hour =
        Number(
            parts[0]
        );


    const minutes =
        parts[1];


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return `
        ${hour}:${minutes} ${period}
    `;

}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(message) {

    const toast =
        document.getElementById(
            "activityToast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}