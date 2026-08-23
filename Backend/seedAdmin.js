const bcrypt = require("bcryptjs");
const User = require("./models/User");

/**
 * Seeds the initial PawSync Administrator account into the database.
 * Admin email: canzee.1981@gmail.com
 * Securely hashes the password using bcrypt (10 rounds).
 * Will not overwrite existing admin account.
 */
async function seedAdminUser() {
  try {
    const adminEmail = "canzee.1981@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Ensure role is admin
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("Updated existing canzee.1981@gmail.com account to 'admin' role.");
      }
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash("Admin@pawsync2026", 10);

    const adminUser = await User.create({
      name: "PawSync Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      authProvider: "local",
      isEmailVerified: true
    });

    console.log("Successfully seeded default PawSync Administrator account (canzee.1981@gmail.com).");
    return adminUser;
  } catch (error) {
    console.error("Error seeding administrator account:", error);
  }
}

module.exports = seedAdminUser;
