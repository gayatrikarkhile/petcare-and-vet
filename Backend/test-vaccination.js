const http = require("http");

const data = JSON.stringify({
    petId: "6a7f2e7dabb799e338de3663",
    vaccine: "Rabies",
    dateGiven: "2026-08-10",
    nextDue: "2027-08-10",
    doctor: "Dr. Sharma",
    notes: "Annual booster",
    reminder: true
});

const options = {
    hostname: "127.0.0.1",
    port: 5000,
    path: "/api/vaccinations",
    method: "POST",

    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
    }
};
const request = http.request(options, (response) => {

    let result = "";

    response.on("data", (chunk) => {
        result += chunk;
    });

    response.on("end", () => {
        console.log("Status:", response.statusCode);
        console.log("Response:", result);
    });

});

request.on("error", (error) => {
    console.error("Request failed:", error.message);
});

request.write(data);
request.end();