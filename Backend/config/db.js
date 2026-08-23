const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        const conn = await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            `MongoDB Connected: ${conn.connection.host}`
        );

        // Seed default platform admin account
        const seedAdminUser = require("../seedAdmin");
        await seedAdminUser();

    } catch (error) {

        console.error(
            "MongoDB Connection Error:",
            error.message
        );

        process.exit(1);
    }
};

module.exports = connectDB;