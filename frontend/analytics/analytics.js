/* =========================================
   PAWSYNC - ANALYTICS
   PAGE-SPECIFIC JAVASCRIPT

   Shared Navbar + Sidebar are handled by:
   ../shared/js/shared.js
========================================= */


/* =========================================
   CHART REFERENCES
========================================= */

let healthTrendChart;
let healthDistributionChart;
let vaccinationChart;
let activityChart;


/* =========================================
   CHART.JS DEFAULTS
========================================= */

Chart.defaults.font.family =
    "Inter, sans-serif";

Chart.defaults.color =
    "#7d8d98";


/* =========================================
   DOM CONTENT LOADED
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeAnalytics();

    }
);


/* =========================================
   INITIALIZE ANALYTICS
========================================= */

function initializeAnalytics() {

    createHealthTrendChart();

    createHealthDistributionChart();

    createVaccinationChart();

    createActivityChart();

    setupPeriodSelector();

    setupDownloadButton();

}


/* =========================================
   HEALTH TREND CHART
========================================= */

function createHealthTrendChart() {

    const canvas =
        document.getElementById(
            "healthTrendChart"
        );


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    healthTrendChart =
        new Chart(
            ctx,
            {

                type: "line",

                data: {

                    labels: [
                        "Jul 15",
                        "Jul 20",
                        "Jul 25",
                        "Jul 30",
                        "Aug 4",
                        "Aug 9",
                        "Aug 14"
                    ],

                    datasets: [

                        {

                            label:
                                "Health Score",

                            data: [
                                73,
                                75,
                                74,
                                78,
                                76,
                                79,
                                80
                            ],

                            borderColor:
                                "#15917b",

                            backgroundColor:
                                "rgba(21,145,123,0.08)",

                            fill: true,

                            tension: 0.4,

                            pointRadius: 3,

                            pointHoverRadius: 5,

                            borderWidth: 2

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            backgroundColor:
                                "#24445d",

                            titleFont: {
                                size: 11
                            },

                            bodyFont: {
                                size: 10
                            },

                            padding: 10,

                            displayColors: false

                        }

                    },

                    scales: {

                        y: {

                            min: 60,

                            max: 100,

                            ticks: {

                                stepSize: 10,

                                font: {
                                    size: 9
                                }

                            },

                            grid: {

                                color:
                                    "#edf2f0",

                                drawBorder:
                                    false

                            }

                        },

                        x: {

                            ticks: {

                                font: {
                                    size: 9
                                }

                            },

                            grid: {

                                display: false

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================
   HEALTH DISTRIBUTION
========================================= */

function createHealthDistributionChart() {

    const canvas =
        document.getElementById(
            "healthDistributionChart"
        );


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    healthDistributionChart =
        new Chart(
            ctx,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "Excellent",
                        "Good",
                        "Needs Attention"
                    ],

                    datasets: [

                        {

                            data: [
                                1,
                                1,
                                1
                            ],

                            backgroundColor: [
                                "#28a97f",
                                "#54b5d1",
                                "#e5a13b"
                            ],

                            borderWidth: 0,

                            spacing: 3

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "72%",

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            " " +
                                            context.label +
                                            ": " +
                                            context.raw +
                                            " pet"
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================
   VACCINATION CHART
========================================= */

function createVaccinationChart() {

    const canvas =
        document.getElementById(
            "vaccinationChart"
        );


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    vaccinationChart =
        new Chart(
            ctx,
            {

                type: "bar",

                data: {

                    labels: [
                        "Up to Date",
                        "Due Soon",
                        "Overdue"
                    ],

                    datasets: [

                        {

                            data: [
                                8,
                                1,
                                0
                            ],

                            backgroundColor: [
                                "#28a97f",
                                "#e5a13b",
                                "#d45d67"
                            ],

                            borderRadius: 7,

                            barThickness: 38

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

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                stepSize: 2,

                                font: {
                                    size: 9
                                }

                            },

                            grid: {

                                color:
                                    "#edf2f0",

                                drawBorder:
                                    false

                            }

                        },

                        x: {

                            ticks: {

                                font: {
                                    size: 9
                                }

                            },

                            grid: {

                                display: false

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================
   ACTIVITY CHART
========================================= */

function createActivityChart() {

    const canvas =
        document.getElementById(
            "activityChart"
        );


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    activityChart =
        new Chart(
            ctx,
            {

                type: "bar",

                data: {

                    labels: [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun"
                    ],

                    datasets: [

                        {

                            label:
                                "Activity (min)",

                            data: [
                                42,
                                38,
                                51,
                                45,
                                55,
                                62,
                                48
                            ],

                            backgroundColor:
                                "#54b5d1",

                            borderRadius: 7,

                            barThickness: 24

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            " " +
                                            context.raw +
                                            " minutes"
                                        );

                                    }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                font: {
                                    size: 9
                                }

                            },

                            grid: {

                                color:
                                    "#edf2f0",

                                drawBorder:
                                    false

                            }

                        },

                        x: {

                            ticks: {

                                font: {
                                    size: 9
                                }

                            },

                            grid: {

                                display: false

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================
   PERIOD SELECTOR
========================================= */

function setupPeriodSelector() {

    const periodSelect =
        document.getElementById(
            "periodSelect"
        );


    if (!periodSelect) {
        return;
    }


    periodSelect.addEventListener(
        "change",
        () => {

            const selectedPeriod =
                periodSelect.value;


            updateAnalyticsPeriod(
                selectedPeriod
            );

        }
    );

}


/* =========================================
   UPDATE PERIOD
========================================= */

function updateAnalyticsPeriod(period) {

    /*
        Static frontend for now.

        Later this function can call
        the backend/API and update the
        charts with real data.
    */

    console.log(
        `Analytics period changed to: ${period} days`
    );

}


/* =========================================
   DOWNLOAD REPORT
========================================= */

function setupDownloadButton() {

    const downloadButton =
        document.getElementById(
            "downloadButton"
        );


    if (!downloadButton) {
        return;
    }


    downloadButton.addEventListener(
        "click",
        () => {

            exportAnalyticsReport();

        }
    );

}


/* =========================================
   EXPORT REPORT
========================================= */

function exportAnalyticsReport() {

    const reportData = [

        "PawSync Analytics Report",

        "========================",

        "",

        "Total Pets: 3",

        "Average Health Score: 80",

        "Vaccination Rate: 92%",

        "Vet Visits This Year: 12",

        "",

        "Pet Health Overview",

        "Bruno: 61/100 - Needs Attention",

        "Kitty: 86/100 - Good",

        "Coco: 92/100 - Excellent"

    ];


    const blob =
        new Blob(
            [
                reportData.join("\n")
            ],
            {
                type: "text/plain"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "pawsync-analytics-report.txt";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}


/* =========================================
   WINDOW RESIZE
========================================= */

window.addEventListener(
    "resize",
    () => {

        /*
            Chart.js handles responsive
            resizing automatically.

            This listener is intentionally
            kept empty for future use.
        */

    }
);