const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const cloudinary =
    require("../config/cloudinary");

const User =
    require("../models/User");

const EmailVerification =
    require("../models/EmailVerification");

const {
    sendOTPEmail
} =
    require("../services/emailService");


const googleClient =
    new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID
    );


/* =========================================
   GENERATE OTP
========================================= */

const generateOTP = () => {

    return Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();

};

/* =========================================
   REGISTER USER
========================================= */

const registerUser =
    async (req, res) => {

        try {

            const {
                name,
                email,
                phone,
                password,
                role,
                clinicName,
                licenseNumber
            } = req.body;


            /* -------------------------
               VALIDATION
            ------------------------- */

            if (
                !name ||
                !email ||
                !password ||
                !role
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please fill all required fields."

                });

            }


            if (
                role !== "owner" &&
                role !== "vet"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid user role."

                });

            }


            /* -------------------------
               VET VALIDATION
            ------------------------- */

            if (role === "vet") {

                if (
                    !clinicName ||
                    !licenseNumber
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Clinic name and license number are required."

                    });

                }

            }


            /* -------------------------
               CHECK EXISTING USER
            ------------------------- */

            const existingUser =
                await User.findOne({

                    email:
                        email.toLowerCase()

                });


            if (existingUser) {

                if (
                    existingUser.isEmailVerified
                ) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "An account with this email already exists."

                    });

                }


                const otp =
                    generateOTP();


                await EmailVerification.deleteMany({

                    email:
                        email.toLowerCase()

                });


                await EmailVerification.create({

                    email:
                        email.toLowerCase(),

                    otp,

                    expiresAt:
                        new Date(
                            Date.now() +
                            10 * 60 * 1000
                        )

                });


                await sendOTPEmail(
                    email,
                    otp,
                    name
                );


                return res.status(200).json({

                    success: true,

                    requiresVerification: true,

                    message:
                        "A new OTP has been sent to your email."

                });

            }


            /* -------------------------
               HASH PASSWORD
            ------------------------- */

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            /* -------------------------
               CREATE USER
            ------------------------- */

            const user =
                await User.create({

                    name,

                    email:
                        email.toLowerCase(),

                    phone,

                    password:
                        hashedPassword,

                    authProvider:
                        "local",

                    role,

                    clinicName:
                        role === "vet"
                            ? clinicName
                            : undefined,

                    licenseNumber:
                        role === "vet"
                            ? licenseNumber
                            : undefined,

                    isEmailVerified:
                        false

                });


            /* -------------------------
               GENERATE OTP
            ------------------------- */

            const otp =
                generateOTP();


            /* -------------------------
               SAVE OTP
            ------------------------- */

            await EmailVerification.create({

                email:
                    email.toLowerCase(),

                otp,

                expiresAt:
                    new Date(
                        Date.now() +
                        10 * 60 * 1000
                    )

            });


            /* -------------------------
               SEND EMAIL
            ------------------------- */

            await sendOTPEmail(
                email,
                otp,
                name
            );


            return res.status(201).json({

                success: true,

                requiresVerification: true,

                message:
                    "Account created. OTP sent to your email."

            });


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error during registration."

            });

        }

    };

    /* =========================================
   VERIFY EMAIL OTP
========================================= */

const verifyEmail =
    async (req, res) => {

        try {

            const {
                email,
                otp
            } = req.body;


            if (!email || !otp) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and OTP are required."

                });

            }


            const verification =
                await EmailVerification.findOne({

                    email:
                        email.toLowerCase(),

                    otp

                });


            if (!verification) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid OTP."

                });

            }


            /* -------------------------
               CHECK EXPIRATION
            ------------------------- */

            if (
                verification.expiresAt <
                new Date()
            ) {

                await EmailVerification.deleteOne({

                    _id:
                        verification._id

                });


                return res.status(400).json({

                    success: false,

                    message:
                        "OTP has expired. Please request a new OTP."

                });

            }


            /* -------------------------
               VERIFY USER
            ------------------------- */

            const user =
                await User.findOne({

                    email:
                        email.toLowerCase()

                });


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User account not found."

                });

            }


            user.isEmailVerified =
                true;


            await user.save();


            /* -------------------------
               DELETE USED OTP
            ------------------------- */

            await EmailVerification.deleteOne({

                _id:
                    verification._id

            });


            return res.status(200).json({

                success: true,

                message:
                    "Email verified successfully."

            });


        } catch (error) {

            console.error(
                "OTP Verification Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error during email verification."

            });

        }

    };

    /* =========================================
   LOGIN
========================================= */

const loginUser =
    async (req, res) => {

        try {

            const {
                email,
                password,
                role
            } = req.body;


            /* -------------------------
               VALIDATION
            ------------------------- */

            if (
                !email ||
                !password ||
                !role
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email, password and role are required."

                });

            }


            /* -------------------------
               FIND USER
            ------------------------- */

            const user =
                await User.findOne({

                    email:
                        email.toLowerCase(),

                    role

                });


            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email, password or role."

                });

            }


            /* -------------------------
               EMAIL VERIFICATION
            ------------------------- */

            if (
                !user.isEmailVerified
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Please verify your email before logging in."

                });

            }


            /* -------------------------
               PASSWORD
            ------------------------- */

            const passwordMatch =
                await bcrypt.compare(

                    password,

                    user.password

                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email, password or role."

                });

            }


            /* -------------------------
               JWT
            ------------------------- */

            const token =
                jwt.sign(

                    {

                        userId:
                            user._id,

                        role:
                            user.role

                    },

                    process.env.JWT_SECRET,

                    {

                        expiresIn:
                            "7d"

                    }

                );


            /* -------------------------
               RESPONSE
            ------------------------- */

            return res.status(200).json({

                success: true,

                message:
                    "Login successful.",

                token,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role,

                    profilePhoto:
                        user.profilePhoto

                }

            });


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error during login."

            });

        }

    };

    /* =========================================
   GOOGLE LOGIN
========================================= */

const googleLogin =
    async (req, res) => {

        try {

            const {
                credential,
                role
            } = req.body;


            /* -------------------------
               VALIDATION
            ------------------------- */

            if (!credential) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Google credential is required."

                });

            }


            if (
                role !== "owner" &&
                role !== "vet"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid user role."

                });

            }


            /* -------------------------
               VERIFY GOOGLE TOKEN
            ------------------------- */

            const ticket =
                await googleClient.verifyIdToken({

                    idToken:
                        credential,

                    audience:
                        process.env.GOOGLE_CLIENT_ID

                });


            const payload =
                ticket.getPayload();


            const googleEmail =
                payload.email;

            const googleName =
                payload.name;

            const googleEmailVerified =
                payload.email_verified;


            if (
                !googleEmail ||
                !googleEmailVerified
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Google email could not be verified."

                });

            }


            /* -------------------------
               FIND USER
            ------------------------- */

            let user =
                await User.findOne({

                    email:
                        googleEmail.toLowerCase()

                });


            /* -------------------------
               CREATE USER
               IF NOT EXISTS
            ------------------------- */

            if (!user) {

                user =
                    await User.create({

                        name:
                            googleName ||
                            "Google User",

                        email:
                            googleEmail.toLowerCase(),

                        role,

                        authProvider:
                            "google",

                        isEmailVerified:
                            true

                    });

            }


            /* -------------------------
               MARK EXISTING GOOGLE ACCOUNT
            ------------------------- */

            if (
                user &&
                !user.password &&
                user.authProvider !== "google"
            ) {

                user.authProvider =
                    "google";

                await user.save();

            }


            /* -------------------------
               CHECK ROLE
            ------------------------- */

            if (
                user.role !== role
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        `This Google account is registered as ${user.role}. Please select the correct role.`

                });

            }


            /* -------------------------
               MAKE SURE EMAIL IS VERIFIED
            ------------------------- */

            if (
                !user.isEmailVerified
            ) {

                user.isEmailVerified =
                    true;

                await user.save();

            }


            /* -------------------------
               CREATE JWT
            ------------------------- */

            const token =
                jwt.sign(

                    {

                        userId:
                            user._id,

                        role:
                            user.role

                    },

                    process.env.JWT_SECRET,

                    {

                        expiresIn:
                            "7d"

                    }

                );


            /* -------------------------
               RESPONSE
            ------------------------- */

            return res.status(200).json({

                success: true,

                message:
                    "Google login successful.",

                token,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role,

                    profilePhoto:
                        user.profilePhoto

                }

            });


        } catch (error) {

            console.error(
                "Google Login Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Google login failed."

            });

        }

    };

    /* =========================================
   GET LOGGED-IN USER PROFILE
========================================= */

const getProfile =
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                ).select("-password");


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            return res.status(200).json({

                success: true,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    phone:
                        user.phone,

                    role:
                        user.role,

                    clinicName:
                        user.clinicName,

                    licenseNumber:
                        user.licenseNumber,

                    authProvider:
                        user.authProvider,

                    profilePhoto:
                        user.profilePhoto

                }

            });


        } catch (error) {

            console.error(
                "Get Profile Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while getting profile."

            });

        }

    };

    /* =========================================
   UPDATE LOGGED-IN USER PROFILE
========================================= */

const updateProfile =
    async (req, res) => {

        try {

            const {
                name,
                phone
            } = req.body;


            /* -------------------------
               BASIC VALIDATION
            ------------------------- */

            if (
                !name ||
                !name.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name is required."

                });

            }


            /* -------------------------
               FIND LOGGED-IN USER
            ------------------------- */

            const user =
                await User.findById(
                    req.user.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            /* ========================================
               PROFILE PHOTO → CLOUDINARY
            ======================================== */

            if (req.file) {

                try {

                    const uploadResult =
                        await new Promise(
                            (resolve, reject) => {

                                const uploadStream =
                                    cloudinary
                                        .uploader
                                        .upload_stream(

                                            {
                                                folder:
                                                    "pawsync/profile-photos",

                                                resource_type:
                                                    "image"
                                            },

                                            (
                                                error,
                                                result
                                            ) => {

                                                if (error) {

                                                    reject(
                                                        error
                                                    );

                                                } else {

                                                    resolve(
                                                        result
                                                    );

                                                }

                                            }

                                        );


                                uploadStream.end(
                                    req.file.buffer
                                );

                            }
                        );


                    /* -------------------------
                       SAVE CLOUDINARY URL
                    ------------------------- */

                    user.profilePhoto =
                        uploadResult.secure_url;


                } catch (uploadError) {

                    console.error(
                        "Cloudinary Upload Error:",
                        uploadError
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Profile photo upload failed."

                    });

                }

            }


            /* -------------------------
               UPDATE NAME
            ------------------------- */

            user.name =
                name.trim();


            /* -------------------------
               UPDATE PHONE
            ------------------------- */

            user.phone =
                phone
                    ? phone.trim()
                    : "";


            /* -------------------------
               SAVE USER
            ------------------------- */

            await user.save();


            /* -------------------------
               RESPONSE
            ------------------------- */

            return res.status(200).json({

                success: true,

                message:
                    "Profile updated successfully.",

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    phone:
                        user.phone,

                    role:
                        user.role,

                    profilePhoto:
                        user.profilePhoto

                }

            });


        } catch (error) {

            console.error(
                "Update Profile Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while updating profile."

            });

        }

    };

    /* =========================================
   CHANGE PASSWORD
========================================= */

const changePassword =
    async (req, res) => {

        try {

            const {
                currentPassword,
                newPassword,
                confirmPassword
            } = req.body;


            /* -------------------------
               VALIDATION
            ------------------------- */

            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "All password fields are required."

                });

            }


            /* -------------------------
               CHECK NEW PASSWORD
            ------------------------- */

            if (
                newPassword !==
                confirmPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "New passwords do not match."

                });

            }


            /* -------------------------
               PASSWORD LENGTH
            ------------------------- */

            if (
                newPassword.length < 8
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "New password must be at least 8 characters."

                });

            }


            /* -------------------------
               FIND USER
            ------------------------- */

            const user =
                await User.findById(
                    req.user.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            /* -------------------------
               GOOGLE ACCOUNT CHECK
            ------------------------- */

            if (
                user.authProvider ===
                "google"
            ) {

                return res.status(403).json({

                    success: false,

                    googleAccount: true,

                    message:
                        "Password changes are not available for Google Sign-In accounts. Please manage your password through your Google Account."

                });

            }


            /* -------------------------
               CHECK PASSWORD EXISTS
            ------------------------- */

            if (!user.password) {

                return res.status(403).json({

                    success: false,

                    message:
                        "This account does not have a PawSync password."

                });

            }


            /* -------------------------
               VERIFY CURRENT PASSWORD
            ------------------------- */

            const passwordMatch =
                await bcrypt.compare(

                    currentPassword,

                    user.password

                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Current password is incorrect."

                });

            }


            /* -------------------------
               PREVENT SAME PASSWORD
            ------------------------- */

            const samePassword =
                await bcrypt.compare(

                    newPassword,

                    user.password

                );


            if (samePassword) {

                return res.status(400).json({

                    success: false,

                    message:
                        "New password must be different from your current password."

                });

            }


            /* -------------------------
               HASH NEW PASSWORD
            ------------------------- */

            const hashedPassword =
                await bcrypt.hash(

                    newPassword,

                    10

                );


            /* -------------------------
               SAVE PASSWORD
            ------------------------- */

            user.password =
                hashedPassword;

            user.authProvider =
                "local";


            await user.save();


            /* -------------------------
               SUCCESS
            ------------------------- */

            return res.status(200).json({

                success: true,

                message:
                    "Password changed successfully."

            });


        } catch (error) {

            console.error(
                "Change Password Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while changing password."

            });

        }

    };

    /* =========================================
   EXPORT CONTROLLERS
========================================= */

module.exports = {

    registerUser,

    verifyEmail,

    loginUser,

    googleLogin,

    getProfile,

    updateProfile,

    changePassword

};