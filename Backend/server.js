const path = require("path");
const dotenv = require("dotenv");

// =========================================
// LOAD ENVIRONMENT VARIABLES
// =========================================

dotenv.config({
    path: path.join(__dirname, "../.env")
});


// =========================================
// IMPORT CLOUDINARY
// =========================================

const cloudinary = require("./config/cloudinary");


// =========================================
// IMPORT EXPRESS & MIDDLEWARE
// =========================================

const express = require("express");
const cors = require("cors");


// =========================================
// IMPORT DATABASE
// =========================================

const connectDB = require("./config/db");


// =========================================
// IMPORT ROUTES
// =========================================

const authRoutes = require("./routes/authRoutes");
const petRoutes = require("./routes/petRoutes");
const medicalDocumentRoutes = require("./routes/medicalDocumentRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");
const nutritionRoutes = require("./routes/nutritionRoutes");
const groomingRoutes = require("./routes/groomingRoutes");
const activityRoutes = require("./routes/activityRoutes");

// Vet, Admin, Appointment, Patient & Notification Routes
const vetRoutes = require("./routes/vetRoutes");
const adminRoutes = require("./routes/adminRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const patientRoutes = require("./routes/patientRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

console.log("====================================");
console.log("PAWSYNC VET, ADMIN & CARE ROUTES LOADED");
console.log("====================================");

// =========================================
// EXPRESS APP
// =========================================

const app = express();


// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);


// =========================================
// DATABASE
// =========================================

connectDB();


// =========================================
// API ROUTES
// =========================================

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/medical-documents", medicalDocumentRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/grooming", groomingRoutes);
app.use("/api/activity", activityRoutes);

// PawSync Vet & Practice API Routes
app.use("/api/vet", vetRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/notifications", notificationRoutes);

// =========================================
// HOME PAGE & REDIRECTS
// =========================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../index.html"
        )
    );
});

// Public QR Found Pet Route Redirect
app.get("/pet/found/:token", (req, res) => {
    res.redirect(`/frontend/public/foundPet.html?token=${req.params.token}`);
});


// =========================================
// SERVER
// =========================================

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `PawSync server running at: http://localhost:${PORT}`
        );
    }
);