const express = require("express");
const router = express.Router();

const Vaccination = require("../models/Vaccination");


// ==========================================
// ADD NEW VACCINATION
// POST /api/vaccinations
// ==========================================

router.post("/", async (req, res) => {
    try {

        const {
            petId,
            vaccine,
            dateGiven,
            nextDue,
            doctor,
            notes,
            reminder
        } = req.body;


        // Basic validation
        if (!petId || !vaccine || !dateGiven || !nextDue) {

            return res.status(400).json({
                success: false,
                message:
                    "petId, vaccine, dateGiven and nextDue are required."
            });

        }


        // Create vaccination
        const vaccination =
            await Vaccination.create({

                petId,
                vaccine,
                dateGiven,
                nextDue,
                doctor,
                notes,
                reminder,

                // New vaccination starts as incomplete
                completed: false

            });


        res.status(201).json({

            success: true,

            message:
                "Vaccination added successfully.",

            vaccination

        });


    } catch (error) {

        console.error(
            "Add vaccination error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while adding vaccination."

        });

    }
});


// ==========================================
// GET VACCINATIONS FOR A PET
// GET /api/vaccinations/:petId
// ==========================================

router.get("/:petId", async (req, res) => {

    try {

        const {
            petId
        } = req.params;


        const vaccinations =
            await Vaccination

                .find({
                    petId
                })

                .sort({
                    nextDue: 1
                });


        res.status(200).json({

            success: true,

            vaccinations

        });


    } catch (error) {

        console.error(
            "Get vaccinations error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while fetching vaccinations."

        });

    }

});


// ==========================================
// MARK VACCINATION AS COMPLETED
// PUT /api/vaccinations/:vaccinationId/complete
// ==========================================

router.put(
    "/:vaccinationId/complete",
    async (req, res) => {

        try {

            const {
                vaccinationId
            } = req.params;


            const vaccination =
                await Vaccination.findByIdAndUpdate(

                    vaccinationId,

                    {
                        completed: true
                    },

                    {
                        new: true,
                        runValidators: true
                    }

                );


            // Vaccination not found
            if (!vaccination) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Vaccination record not found."

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Vaccination marked as completed.",

                vaccination

            });


        } catch (error) {

            console.error(
                "Complete vaccination error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error while completing vaccination."

            });

        }

    }
);


module.exports = router;