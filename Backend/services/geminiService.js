// =========================================================
// GEMINI SERVICE — PETVERSE AI
// =========================================================

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const GEMINI_MODEL = "gemini-3.6-flash";

async function testGemini() {
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: "Reply with exactly: Gemini connection successful"
        });
        return response.text;
    } catch (error) {
        console.error("GEMINI ERROR:", error);
        throw error;
    }
}

async function listGeminiModels() {
    try {
        const response = await ai.models.list();
        return response.models || response;
    } catch (error) {
        console.error("LIST GEMINI MODELS ERROR:", error);
        throw error;
    }
}

// =========================================================
// GENERATE 30-DAY NUTRITION SCHEDULE
// =========================================================

async function generateNutritionSchedule(pet, nutritionProfile, knowledgeBase) {
    try {
        const prompt = `
You are a professional pet nutrition planning assistant.
Create a personalized 30-day nutrition schedule for this pet.

PET INFORMATION:
${JSON.stringify(pet, null, 2)}

NUTRITION PROFILE:
${JSON.stringify(nutritionProfile, null, 2)}

SPECIES-SPECIFIC KNOWLEDGE:
${JSON.stringify(knowledgeBase, null, 2)}

Return JSON only with summary and 30 days array.
`;

        let response = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                break;
            } catch (error) {
                if ((error.status === 503 || error.status === 429) && attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, attempt * 3000));
                } else {
                    break;
                }
            }
        }

        let schedule = null;
        if (response && response.text) {
            const cleanText = response.text.replace(/```json/gi, "").replace(/```/g, "").trim();
            try {
                schedule = JSON.parse(cleanText);
            } catch (e) {}
        }

        if (!schedule || !schedule.days || !Array.isArray(schedule.days)) {
            schedule = buildKnowledgeBaseFallbackSchedule(pet, nutritionProfile, knowledgeBase);
        }

        return schedule;
    } catch (error) {
        return buildKnowledgeBaseFallbackSchedule(pet, nutritionProfile, knowledgeBase);
    }
}

function buildKnowledgeBaseFallbackSchedule(pet, nutritionProfile, knowledgeBase) {
    const petName = pet.name || pet.petName || "Pet";
    const species = pet.species || "Pet";
    const food = nutritionProfile?.primaryFood || "Species-appropriate diet";
    const petWeightKg = Number(pet?.weight?.value || pet?.currentWeight?.value || 1);
    const waterMl = Math.round(petWeightKg * 50) || 250;

    const days = [];
    for (let i = 1; i <= 30; i++) {
        days.push({
            day: i,
            meals: [
                {
                    mealName: "Morning Meal",
                    food: food,
                    portion: "Standard morning portion",
                    time: "08:00",
                    calories: Math.round((Number(nutritionProfile?.calorieTarget) || 150) / 2),
                    instructions: `Provide fresh ${food} for ${petName}.`
                },
                {
                    mealName: "Evening Meal",
                    food: food,
                    portion: "Standard evening portion",
                    time: "18:00",
                    calories: Math.round((Number(nutritionProfile?.calorieTarget) || 150) / 2),
                    instructions: `Provide evening feeding for ${petName}.`
                }
            ],
            water: {
                dailyTargetMl: waterMl,
                display: `${waterMl} ml/day`,
                instructions: "Provide fresh, clean drinking water continuously."
            },
            treat: "Healthy species-appropriate treat",
            notes: `Balanced nutrition plan for ${species} (${petName}).`
        });
    }

    return {
        summary: {
            goal: nutritionProfile?.nutritionGoal || "Healthy pet maintenance",
            dailyMeals: 2,
            specialConsiderations: [`Species: ${species}`, `Primary food: ${food}`]
        },
        days: days
    };
}

async function prepareNutritionData(pet, nutritionProfile, knowledge) {
    return {
        pet: {
            id: pet._id,
            name: pet.petName,
            species: pet.species,
            breed: pet.breed,
            gender: pet.gender,
            reproductiveStatus: pet.reproductiveStatus,
            dateOfBirth: pet.dateOfBirth,
            weight: pet.currentWeight
        },
        nutritionProfile,
        knowledgeBase: knowledge
    };
}

// =========================================================
// GENERATE 30-DAY GROOMING PLAN (PET-SPECIFIC GEMINI & FALLBACK)
// =========================================================

async function generateGroomingPlan(
    pet,
    groomingProfile,
    knowledgeBase,
    previousHistory = []
) {
    const species = (pet.species || "Dog").trim();
    const breed = (pet.breed || "Standard").trim();
    const petName = (pet.petName || pet.name || "Pet").trim();

    try {
        const prompt = `
You are an expert veterinary pet hygiene and grooming AI specialist.

Create a highly personalized 30-day (4-week) monthly grooming and dental hygiene plan specifically for this pet.

PET DETAILS:
- Name: ${petName}
- Species: ${species}
- Breed: ${breed}
- Age: ${pet.age || "Unknown"}
- Weight: ${JSON.stringify(pet.weight || {})}

GROOMING & DENTAL PROFILE:
${JSON.stringify(groomingProfile || {}, null, 2)}

SPECIES KNOWLEDGE BASE:
${JSON.stringify(knowledgeBase || {}, null, 2)}

PREVIOUS HISTORY:
${JSON.stringify(previousHistory || [], null, 2)}

CRITICAL SPECIES & PET CUSTOMIZATION RULES:
1. THE PLAN MUST BE 100% SPECIFIC TO THIS PET'S SPECIES (${species.toUpperCase()}) AND BREED (${breed.toUpperCase()}).
2. DO NOT GENERATE GENERIC DOG/CAT ROUTINES FOR OTHER SPECIES!
   - For TURTLES / REPTILES: Recommends Shell Gentle Brushing, Scute Inspection, Beak/Cuttlebone Check, Tympanic Ear Membrane Check, Claw Wear, Water/Basking Dock Hygiene. DO NOT recommend coat brushing or tooth brushing with toothpaste!
   - For RABBITS: Recommends Soft Slicker Fur Brushing, Incisor Tooth & Hay Consumption Check, Sore Hock Foot Pad Inspection, Ear Canal Mite Check, Claw Trimming. DO NOT submerge in water baths!
   - For BIRDS: Recommends Feather Misting/Shower, Beak Cleaning & Mineral Block Check, Foot Pad & Bumblefoot Inspection, Claw Wear on Perches.
   - For CATS: Recommends Coat Brushing & Hairball Care, Claw Tip Trimming, Dental Chew & Gum Check, Ear Pinna Inspection, Waterless Shampoo.
   - For DOGS: Recommends Coat Brushing, Tooth Brushing with Dog Toothpaste, Ear Wipes, Paw Pad Moisture Check, Nail Trimming, Bathing.
   - For HORSES: Recommends Curry Combing, Hoof Picking, Farrier Check, Ear Wipe, Equine Tooth Check.
   - For FISH: Recommends Slime Coat Inspection, Water Quality & Filter Refresh, Feeding & Mouth Check.
3. Allowed activityType values:
   - "coat_care"
   - "brushing"
   - "bathing"
   - "nail_care"
   - "ear_care"
   - "paw_care"
   - "dental_care"
4. Distribute activities reasonably across 30 days (12 to 24 activities total). Assign weekNumber (1-4) and dayNumber (1-30).
5. Each activity must have a creditValue of 0.4.

RETURN ONLY VALID JSON matching this exact structure:
{
    "summary": {
        "goal": "Personalized Monthly Grooming Plan for ${petName} (${species})",
        "recommendationNotes": "Specific grooming advice for ${species} based on coat/shell, claws, ears, and oral health.",
        "specialConsiderations": [
            "Species-specific note 1",
            "Species-specific note 2"
        ]
    },
    "activities": [
        {
            "dayNumber": 1,
            "weekNumber": 1,
            "dayOfWeek": "Monday",
            "activityType": "coat_care",
            "activityName": "Species Specific Activity Name",
            "description": "Specific instruction tailored for ${petName} the ${species}.",
            "creditValue": 0.4
        }
    ]
}

Return JSON only.
`;

        let response = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`Gemini Grooming Request for ${petName} (${species}) attempt ${attempt}/3`);
                response = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json"
                    }
                });
                console.log(`Gemini Grooming Request successful on attempt ${attempt}`);
                break;
            } catch (error) {
                console.error(`Gemini Grooming attempt ${attempt} failed:`, error.message);
                if ((error.status === 503 || error.status === 429) && attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, attempt * 3000));
                } else {
                    break;
                }
            }
        }

        let planData = null;
        if (response && response.text) {
            const cleanText = response.text.replace(/```json/gi, "").replace(/```/g, "").trim();
            try {
                planData = JSON.parse(cleanText);
            } catch (e1) {
                const firstBrace = cleanText.indexOf("{");
                const lastBrace = cleanText.lastIndexOf("}");
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    try {
                        planData = JSON.parse(cleanText.substring(firstBrace, lastBrace + 1));
                    } catch (e2) {
                        console.error("Substring parse failed for grooming plan:", e2.message);
                    }
                }
            }
        }

        if (!planData || !Array.isArray(planData.activities) || planData.activities.length === 0) {
            console.warn("Using species-aware Knowledge Base fallback generator for:", petName, `(${species})`);
            planData = buildKnowledgeBaseFallbackGroomingPlan(pet, groomingProfile, knowledgeBase);
        }

        return planData;
    } catch (error) {
        console.error("Gemini Grooming Plan error, generating species fallback:", error.message);
        return buildKnowledgeBaseFallbackGroomingPlan(pet, groomingProfile, knowledgeBase);
    }
}

// =========================================================
// SPECIES-AWARE KNOWLEDGE BASE FALLBACK GENERATOR
// =========================================================

function buildKnowledgeBaseFallbackGroomingPlan(pet, groomingProfile, knowledgeBase) {
    const rawSpecies = (pet.species || "Dog").trim();
    const speciesLower = rawSpecies.toLowerCase();
    const petName = pet.petName || pet.name || "Pet";
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    let templates = [];

    if (speciesLower.includes("turtle") || speciesLower.includes("reptile")) {
        templates = [
            { type: "coat_care", name: "Shell Gentle Brushing", desc: `Gently brush ${petName}'s shell with soft bristles and clean water to remove algae.` },
            { type: "dental_care", name: "Beak & Cuttlebone Check", desc: `Inspect ${petName}'s beak alignment and check cuttlebone access for beak wear.` },
            { type: "ear_care", name: "Ear Membrane Check", desc: `Check tympanic ear membranes behind ${petName}'s eyes for swelling or redness.` },
            { type: "paw_care", name: "Scute & Limb Inspection", desc: `Examine shedding scutes and webbed claws/limbs for healthy growth.` },
            { type: "bathing", name: "Basking Dock & Water Refresh", desc: `Clean ${petName}'s basking dock and verify fresh, clean water filtration.` }
        ];
    } else if (speciesLower.includes("rabbit")) {
        templates = [
            { type: "brushing", name: "Soft Slicker Fur Brushing", desc: `Gently brush ${petName}'s fur to remove loose shedding hair and prevent hairballs.` },
            { type: "dental_care", name: "Incisor Tooth & Hay Check", desc: `Check front incisors alignment and verify continuous fresh timothy hay supply.` },
            { type: "ear_care", name: "Ear Canal Mite Check", desc: `Inspect ${petName}'s ears for wax buildup, irritation, or ear mite signs.` },
            { type: "paw_care", name: "Rear Hock Inspection", desc: `Check rear hocks for fur thinning or sore hock redness.` },
            { type: "nail_care", name: "Claw Trimming", desc: `Trim claw tips carefully, keeping clear of the quick.` }
        ];
    } else if (speciesLower.includes("bird")) {
        templates = [
            { type: "coat_care", name: "Feather Misting / Shower", desc: `Mist ${petName} with lukewarm water or provide a shallow bath dish for preening.` },
            { type: "dental_care", name: "Beak & Mineral Block Check", desc: `Inspect beak condition and ensure mineral block/cuttlebone is available.` },
            { type: "ear_care", name: "Head & Ear Feather Check", desc: `Examine feathering around ${petName}'s ear openings.` },
            { type: "paw_care", name: "Foot Pad & Perch Hygiene", desc: `Check foot pads for bumblefoot signs and wipe clean perches.` },
            { type: "nail_care", name: "Claw Wear & Perch Check", desc: `Check claw length and natural wear on varied diameter perches.` }
        ];
    } else if (speciesLower.includes("cat")) {
        templates = [
            { type: "brushing", name: "Coat Brushing & Hairball Care", desc: `Brush ${petName}'s coat to remove shed hair and reduce hairball formation.` },
            { type: "dental_care", name: "Cat Dental Chew & Gum Check", desc: `Provide cat dental chew treat and inspect gums.` },
            { type: "ear_care", name: "Ear Pinna Check", desc: `Gently check inner ear flaps for wax or redness.` },
            { type: "paw_care", name: "Claw Sheath & Pad Check", desc: `Inspect claw sheaths and clean paw pads.` },
            { type: "nail_care", name: "Claw Tip Trimming", desc: `Trim sharp claw tips safely using cat nail trimmers.` },
            { type: "bathing", name: "Coat Wipe & Refresh", desc: `Wipe coat with cat-safe damp cloth or waterless foam shampoo.` }
        ];
    } else if (speciesLower.includes("horse")) {
        templates = [
            { type: "coat_care", name: "Curry Combing & Dandy Brush", desc: `Curry comb ${petName}'s body to loosen dirt and bring out coat skin oils.` },
            { type: "dental_care", name: "Equine Tooth Inspection", desc: `Check teeth for sharp enamel points and monitor feed chewing.` },
            { type: "ear_care", name: "Ear Wipe & Fly Guard", desc: `Wipe inner ears gently to remove flies and dust.` },
            { type: "paw_care", name: "Hoof Picking & Thrush Check", desc: `Pick hooves to remove rocks and check for thrush.` },
            { type: "nail_care", name: "Farrier Hoof Check", desc: `Inspect hoof wall balance and farrier trimming schedule.` }
        ];
    } else if (speciesLower.includes("fish")) {
        templates = [
            { type: "coat_care", name: "Slime Coat Health Check", desc: `Observe ${petName}'s slime coat and scale integrity under aquarium lighting.` },
            { type: "dental_care", name: "Mouth & Feeding Inspection", desc: `Check mouth area and feeding behavior.` },
            { type: "bathing", name: "Water Refresh & Filter Care", desc: `Perform partial water change and check aquarium filter.` }
        ];
    } else {
        // Dog or Default Canine
        templates = [
            { type: "brushing", name: "Brush Coat & Remove Shedding", desc: `Thoroughly brush ${petName}'s coat to remove loose fur and dander.` },
            { type: "dental_care", name: "Tooth Brushing", desc: `Brush ${petName}'s teeth using dog-formulated enzymatic toothpaste.` },
            { type: "ear_care", name: "Ear Cleaning & Check", desc: `Wipe inner ears gently using pet-safe ear cleanser.` },
            { type: "paw_care", name: "Paw Pad & Moisture Check", desc: `Inspect paw pads for cracks, dry skin, or debris.` },
            { type: "nail_care", name: "Nail Trimming", desc: `Trim claw tips safely avoiding the quick.` },
            { type: "bathing", name: "Bath & Coat Refresh", desc: `Wash coat with pet-safe shampoo and dry thoroughly.` }
        ];
    }

    const activities = [];
    const templateCount = templates.length;

    for (let day = 1; day <= 30; day++) {
        const weekNumber = Math.min(4, Math.floor((day - 1) / 7) + 1);
        const dayOfWeek = daysOfWeek[(day - 1) % 7];

        if (day % 2 === 1 || day % 3 === 0) {
            const templateIndex = ((day - 1) % templateCount);
            const t = templates[templateIndex];

            activities.push({
                dayNumber: day,
                weekNumber: weekNumber,
                dayOfWeek: dayOfWeek,
                activityType: t.type,
                activityName: t.name,
                description: t.desc,
                creditValue: 0.4
            });
        }
    }

    return {
        summary: {
            goal: `Personalized Monthly Grooming & Hygiene Plan for ${petName} (${rawSpecies})`,
            recommendationNotes: `Tailored hygiene and grooming routine designed for ${rawSpecies} (${pet.breed || "Standard"}).`,
            specialConsiderations: [
                `Species: ${rawSpecies}`,
                `Breed: ${pet.breed || "Standard"}`,
                `Shedding level: ${groomingProfile?.sheddingLevel || "Normal"}`
            ]
        },
        activities: activities
    };
}

// =========================================================
// GENERATE 30-DAY PERSONALIZED ACTIVITY PLAN
// =========================================================

async function generateActivityPlan(pet, activityProfile, history, knowledgeBase) {
    const petName = pet.name || pet.petName || "Pet";
    const species = pet.species || "Pet";

    try {
        const prompt = `
You are an expert pet physical activity, fitness, and animal behavior specialist.
Create a personalized rolling 30-day Activity & Exercise Plan for this pet.

PET PROFILE:
${JSON.stringify(pet, null, 2)}

ACTIVITY PROFILE:
${JSON.stringify(activityProfile, null, 2)}

PREVIOUS ACTIVITY HISTORY:
${JSON.stringify(history ? history.slice(-10) : [], null, 2)}

KNOWLEDGE BASE:
${JSON.stringify(knowledgeBase || {}, null, 2)}

REQUIREMENTS:
1. Generate an array of activities for 30 consecutive days (day 1 to 30).
2. Each day must contain 1-3 appropriate activities.
3. Categories MUST strictly be one of: "physical_activity", "play", "mental_stimulation", "training".
4. Each activity MUST have:
   - dayNumber (1-30)
   - weekNumber (1, 2, 3, or 4)
   - category ("physical_activity" | "play" | "mental_stimulation" | "training")
   - activityName (string, e.g. "Morning Walk", "Tug & Fetch", "Sniff Search")
   - description (string)
   - duration (number in minutes, e.g. 20)
   - creditValue (number, default 0.4)

Return JSON ONLY with format:
{
  "summary": {
    "activityLevel": "${activityProfile?.activityLevel || "Moderate"}",
    "energyLevel": "${activityProfile?.energyLevel || "Moderate"}",
    "dailyTargetMinutes": 45
  },
  "activities": [
    {
      "dayNumber": 1,
      "weekNumber": 1,
      "category": "physical_activity",
      "activityName": "Morning Walk",
      "description": "30 minutes brisk outdoor walking",
      "duration": 30,
      "creditValue": 0.4
    }
  ]
}
`;

        let response = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                break;
            } catch (err) {
                if ((err.status === 503 || err.status === 429) && attempt < 3) {
                    await new Promise(r => setTimeout(r, attempt * 2500));
                } else {
                    break;
                }
            }
        }

        let plan = null;
        if (response && response.text) {
            const cleanText = response.text.replace(/```json/gi, "").replace(/```/g, "").trim();
            try {
                plan = JSON.parse(cleanText);
            } catch (e) {}
        }

        if (!plan || !plan.activities || !Array.isArray(plan.activities) || plan.activities.length === 0) {
            plan = buildActivityFallbackPlan(pet, activityProfile, knowledgeBase);
        }

        return plan;
    } catch (error) {
        console.warn("Gemini Activity Plan Generation error, using fallback:", error.message);
        return buildActivityFallbackPlan(pet, activityProfile, knowledgeBase);
    }
}

function buildActivityFallbackPlan(pet, activityProfile, knowledgeBase) {
    const petName = pet.name || pet.petName || "Pet";
    const species = (pet.species || "Dog").toLowerCase();

    let recs = knowledgeBase?.[pet.species]?.recommendedActivities || knowledgeBase?.Default?.recommendedActivities || [
        { category: "physical_activity", name: "Daily Exercise Walk", duration: 30, description: "Outdoor activity for physical movement" },
        { category: "play", name: "Interactive Playtime", duration: 15, description: "Engaging play session with favorite toys" },
        { category: "mental_stimulation", name: "Sniff & Search Game", duration: 10, description: "Mental stimulation and treat puzzle" }
    ];

    const activities = [];
    for (let day = 1; day <= 30; day++) {
        const weekNum = Math.min(4, Math.floor((day - 1) / 7) + 1);
        const rec1 = recs[(day - 1) % recs.length];
        const rec2 = recs[day % recs.length];

        activities.push({
            dayNumber: day,
            weekNumber: weekNum,
            category: rec1.category,
            activityName: `${rec1.name}`,
            description: rec1.description,
            duration: rec1.duration,
            creditValue: 0.4
        });

        if (day % 2 === 0) {
            activities.push({
                dayNumber: day,
                weekNumber: weekNum,
                category: rec2.category,
                activityName: `${rec2.name}`,
                description: rec2.description,
                duration: rec2.duration,
                creditValue: 0.4
            });
        }
    }

    return {
        summary: {
            activityLevel: activityProfile?.activityLevel || "Moderate",
            energyLevel: activityProfile?.energyLevel || "Moderate",
            dailyTargetMinutes: species.includes("dog") ? 60 : 30
        },
        activities: activities
    };
}

module.exports = {
    testGemini,
    listGeminiModels,
    prepareNutritionData,
    generateNutritionSchedule,
    generateGroomingPlan,
    generateActivityPlan
};
