const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const MedicalDocument = require("../models/MedicalDocument");
const Pet = require("../models/Pet");
const protect = require("../middleware/authMiddleware");


// =========================================================
// CLOUDINARY CONFIGURATION
// =========================================================

cloudinary.config({
    cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,

    api_key:
        process.env.CLOUDINARY_API_KEY,

    api_secret:
        process.env.CLOUDINARY_API_SECRET
});


// =========================================================
// MULTER CONFIGURATION
// =========================================================

const storage =
    multer.memoryStorage();


const upload =
    multer({

        storage: storage,

        limits: {
            fileSize:
                10 * 1024 * 1024
        },

        fileFilter:
            (req, file, cb) => {

                const allowedTypes = [

                    "application/pdf",

                    "image/jpeg",

                    "image/png",

                    "image/webp"

                ];


                if (
                    allowedTypes.includes(
                        file.mimetype
                    )
                ) {

                    cb(
                        null,
                        true
                    );

                }

                else {

                    cb(
                        new Error(
                            "Only PDF, JPG, PNG and WEBP files are allowed."
                        )
                    );

                }

            }

    });


// =========================================================
// CLOUDINARY UPLOAD HELPER
// =========================================================

function uploadToCloudinary(
    fileBuffer,
    mimetype
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const resourceType =
                mimetype ===
                "application/pdf"
                    ? "raw"
                    : "image";


            const uploadStream =
                cloudinary.uploader.upload_stream(

                    {
                        folder:
                            "pawsync/medical-vault",

                        resource_type:
                            resourceType
                    },

                    (
                        error,
                        result
                    ) => {

                        if (error) {

                            reject(
                                error
                            );

                            return;

                        }


                        resolve(
                            result
                        );

                    }

                );


            uploadStream.end(
                fileBuffer
            );

        }
    );

}


// =========================================================
// POST
// UPLOAD MEDICAL DOCUMENT
// =========================================================

router.post(
    "/",
    protect,
    upload.single("document"),

    async (
        req,
        res
    ) => {

        try {

            console.log(
                "================================"
            );

            console.log(
                "MEDICAL DOCUMENT UPLOAD"
            );

            console.log(
                "Logged-in user:",
                req.user
            );

            console.log(
                "Request body:",
                req.body
            );

            console.log(
                "Uploaded file:",
                req.file
                    ? req.file.originalname
                    : "No file"
            );


            // -------------------------------------------------
            // CHECK AUTHENTICATION
            // -------------------------------------------------

            if (
                !req.user ||
                !req.user.userId
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Authentication information is missing."

                });

            }


            // -------------------------------------------------
            // CHECK FILE
            // -------------------------------------------------

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please upload a document."

                });

            }


            // -------------------------------------------------
            // GET FORM DATA
            // -------------------------------------------------

            const {

                petId,

                title,

                type,

                doctor,

                documentDate,

                description

            } = req.body;


            // -------------------------------------------------
            // VALIDATE PET ID
            // -------------------------------------------------

            if (!petId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Pet ID is required."

                });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    petId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid pet ID."

                });

            }


            // -------------------------------------------------
            // VALIDATE TITLE
            // -------------------------------------------------

            if (
                !title ||
                !title.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Document title is required."

                });

            }


            // -------------------------------------------------
            // FIND PET
            //
            // IMPORTANT:
            // Your Pet routes use:
            // req.user.userId
            //
            // NOT:
            // req.user._id
            // -------------------------------------------------

            const pet =
                await Pet.findOne({

                    _id:
                        petId,

                    ownerId:
                        req.user.userId

                });


            console.log(
                "Selected pet:",
                pet
            );


            if (!pet) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Pet not found or you do not have permission."

                });

            }


            // -------------------------------------------------
            // UPLOAD FILE TO CLOUDINARY
            // -------------------------------------------------

            console.log(
                "Uploading document to Cloudinary..."
            );


            const uploadedFile =
                await uploadToCloudinary(

                    req.file.buffer,

                    req.file.mimetype

                );


            console.log(
                "Cloudinary upload successful:",
                uploadedFile.secure_url
            );


            // -------------------------------------------------
            // SAVE DOCUMENT IN MONGODB
            // -------------------------------------------------

            const document =
                await MedicalDocument.create({

                    ownerId:
                        req.user.userId,

                    petId:
                        pet._id,

                    title:
                        title.trim(),

                    type:
                        type || "other",

                    doctor:
                        doctor
                            ? doctor.trim()
                            : "",

                    documentDate:
                        documentDate
                            ? new Date(
                                documentDate
                            )
                            : null,

                    fileUrl:
                        uploadedFile.secure_url,

                    cloudinaryPublicId:
                        uploadedFile.public_id,

                    fileType:
                        req.file.mimetype,

                    fileSize:
                        req.file.size,

                    description:
                        description
                            ? description.trim()
                            : ""

                });


            console.log(
                "Medical document saved:",
                document._id
            );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Medical document uploaded successfully.",

                document:

                    document

            });

        }

        catch (error) {

            console.error(
                "UPLOAD MEDICAL DOCUMENT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to upload medical document.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// GET
// GET DOCUMENTS FOR A PET
// =========================================================

router.get(
    "/pet/:petId",
    protect,

    async (
        req,
        res
    ) => {

        try {

            const {
                petId
            } = req.params;


            // -------------------------------------------------
            // VALIDATE PET ID
            // -------------------------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(
                    petId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid pet ID."

                });

            }


            // -------------------------------------------------
            // CHECK PET OWNERSHIP
            // -------------------------------------------------
const pet = await Pet.findOne({

    _id: petId,

    ownerId: req.user.userId

});


            if (!pet) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Pet not found or access denied."

                });

            }


            // -------------------------------------------------
            // GET DOCUMENTS
            // -------------------------------------------------

            const documents =
                await MedicalDocument.find({

                    petId:
                        pet._id,

                    
                        ownerId: req.user.userId

                })
                .sort({
                    createdAt:
                        -1
                });


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.json({

                success: true,

                count:
                    documents.length,

                pet: {

                    _id:
                        pet._id,

                    petName:
                        pet.petName,

                    species:
                        pet.species,

                    breed:
                        pet.breed,

                    gender:
                        pet.gender,

                    dateOfBirth:
                        pet.dateOfBirth,

                    currentWeight:
                        pet.currentWeight,

                    petPhoto:
                        pet.petPhoto || ""

                },

                documents:
                    documents

            });

        }

        catch (error) {

            console.error(
                "GET MEDICAL DOCUMENTS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load medical documents.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// GET
// GET SINGLE DOCUMENT
// =========================================================

router.get(
    "/:id",
    protect,

    async (
        req,
        res
    ) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid document ID."

                });

            }


            const document =
                await MedicalDocument.findOne({

                    _id:
                        req.params.id,

                    ownerId:
                        req.user.userId

                })
                .populate(
                    "petId",
                    "petName species breed gender currentWeight petPhoto"
                );


            if (!document) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Document not found."

                });

            }


            return res.json({

                success: true,

                document:
                    document

            });

        }

        catch (error) {

            console.error(
                "GET SINGLE DOCUMENT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to load document.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// DELETE
// DELETE MEDICAL DOCUMENT
// =========================================================

router.delete(
    "/:id",
    protect,

    async (
        req,
        res
    ) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid document ID."

                });

            }


            // -------------------------------------------------
            // FIND DOCUMENT
            // -------------------------------------------------

            const document =
                await MedicalDocument.findOne({

                    _id:
                        req.params.id,

                    ownerId:
                        req.user.userId

                });


            if (!document) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Document not found."

                });

            }


            // -------------------------------------------------
            // DELETE FROM CLOUDINARY
            // -------------------------------------------------

            if (
                document.cloudinaryPublicId
            ) {

                try {

                    const resourceType =
                        document.fileType ===
                        "application/pdf"

                            ? "raw"

                            : "image";


                    await cloudinary.uploader.destroy(

                        document.cloudinaryPublicId,

                        {
                            resource_type:
                                resourceType
                        }

                    );

                }

                catch (
                    cloudinaryError
                ) {

                    console.error(
                        "Cloudinary delete error:",
                        cloudinaryError
                    );

                }

            }


            // -------------------------------------------------
            // DELETE FROM MONGODB
            // -------------------------------------------------

            await MedicalDocument.deleteOne({

                _id:
                    document._id

            });


            return res.json({

                success: true,

                message:
                    "Medical document deleted successfully."

            });

        }

        catch (error) {

            console.error(
                "DELETE MEDICAL DOCUMENT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to delete medical document.",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// MULTER / UPLOAD ERROR HANDLER
// =========================================================

router.use(
    (
        error,
        req,
        res,
        next
    ) => {

        if (
            error instanceof
            multer.MulterError
        ) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }


        next();

    }
);


module.exports = router;