const nutritionKnowledgeBase = {

    Dog: {

        generalRules: [
            "Dogs require a balanced diet containing appropriate protein, fats, carbohydrates, vitamins and minerals.",
            "Fresh drinking water should always be available.",
            "Treats should be given in moderation.",
            "Food portions should consider the dog's weight, age, activity level and health condition."
        ],

        feedingGuidelines: {
            puppy: "Usually multiple meals per day depending on age and veterinary guidance.",
            adult: "Usually 1-2 meals per day.",
            senior: "Meal frequency and calorie intake should be adjusted according to health and activity."
        }

    },


    Cat: {

        generalRules: [
            "Cats are obligate carnivores and require animal-based nutrients.",
            "Fresh drinking water should always be available.",
            "Food portions should consider body weight, age and activity level.",
            "Treats should be given in moderation."
        ],

        feedingGuidelines: {
            kitten: "Multiple meals per day depending on age.",
            adult: "Usually 2 or more appropriately portioned meals per day.",
            senior: "Nutrition should be adjusted according to health and veterinary guidance."
        }

    },


    Bird: {

        generalRules: [
            "Birds require a species-appropriate balanced diet.",
            "Fresh clean water should be available every day.",
            "Seeds alone may not provide complete nutrition for many companion birds.",
            "Fresh vegetables and appropriate fruits can be included according to species."
        ],

        feedingGuidelines: {
            general: "Feed according to species, body size and activity level."
        }

    },


    Fish: {

        generalRules: [
            "Fish require species-appropriate high quality flake, pellet, or frozen food.",
            "Do not overfeed; excess food degrades tank water quality.",
            "Feed small amounts that fish can consume within 2-3 minutes.",
            "Maintain clean, properly filtered and conditioned water."
        ],

        feedingGuidelines: {
            general: "Feed 1-2 times daily in small controlled portions."
        }

    },


    Rabbit: {

        generalRules: [
            "Hay should form the major part of a rabbit's diet.",
            "Fresh clean water should always be available.",
            "Fresh vegetables can be provided in appropriate quantities.",
            "Pellets should be portion controlled."
        ],

        feedingGuidelines: {
            general: "Hay should generally be continuously available."
        }

    },


    Horse: {

        generalRules: [
            "Horses are herbivores requiring high-fiber forage such as quality hay or pasture.",
            "Fresh, clean water must be accessible at all times.",
            "Concentrates and grains should be fed in small, frequent meals if required for workload.",
            "Changes in diet should be introduced gradually over 7-10 days."
        ],

        feedingGuidelines: {
            general: "Provide 1.5% to 2.5% of body weight in forage daily, split into multiple feedings."
        }

    },


    Turtle: {

        generalRules: [
            "Turtles require a balanced diet of species-appropriate commercial pellets, leafy greens, and protein sources.",
            "Calcium and Vitamin D3 supplementation is critical for shell and bone health.",
            "Fresh clean water must be available for hydration and swimming depending on aquatic/terrestrial nature.",
            "Avoid overfeeding protein to prevent pyramiding of the shell."
        ],

        feedingGuidelines: {
            hatchling: "Feed daily with juvenile pelleted diet and calcium supplement.",
            adult: "Feed every 2-3 days with a variety of greens, pellets, and occasional protein."
        }

    },


    Other: {

        generalRules: [
            "Provide a species-appropriate balanced diet tailored to the pet's specific requirements.",
            "Fresh clean water should always be accessible.",
            "Monitor body weight, appetite, and energy levels regularly.",
            "Consult with a veterinarian for specialized dietary recommendations."
        ],

        feedingGuidelines: {
            general: "Provide appropriate portion sizes at regular daily feeding intervals."
        }

    }

};


module.exports =
    nutritionKnowledgeBase;