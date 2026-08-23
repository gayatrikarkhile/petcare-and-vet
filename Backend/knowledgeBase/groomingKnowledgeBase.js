const groomingKnowledgeBase = {
    Dog: {
        coatCare: "Regular brushing removes loose fur, mats, and dander. Bathing frequency depends on coat type and activity level.",
        nailCare: "Trim nails every 3-4 weeks to prevent overgrowth, splitting, or joint strain.",
        earCare: "Inspect and clean ears regularly using pet-safe wipes/cleansers to prevent wax buildup and infections.",
        pawCare: "Examine paw pads for cracks, foreign objects, or excess hair growth between pads.",
        dentalCare: "Brush teeth 3-7 times a week using dog-formulated toothpaste. Provide dental chews and toys to reduce tartar buildup.",
        speciesNotes: "Dogs with double coats require specialized brushing; long-haired breeds need frequent detangling."
    },
    Cat: {
        coatCare: "Cats self-groom regularly but require routine brushing to prevent hairballs, especially long-haired breeds.",
        nailCare: "Trim claw tips every 2-3 weeks to avoid snagging and scratching injuries.",
        earCare: "Gently check ears for dark wax, redness, or ear mites. Clean only external pinna when dirty.",
        pawCare: "Inspect paw pads and claw sheaths periodically.",
        dentalCare: "Daily to weekly tooth brushing using cat-safe toothpaste; monitor for feline periodontal disease and gingivitis.",
        speciesNotes: "Avoid bathing cats frequently unless necessary or medically indicated."
    },
    Rabbit: {
        coatCare: "Gently brush coat with soft slicker brush. Rabbits molt heavily during seasonal changes.",
        nailCare: "Trim claws every 4-6 weeks taking care to avoid the quick.",
        earCare: "Check ears for wax buildup or mites.",
        pawCare: "Monitor hocks for sore hocks or fur thinning.",
        dentalCare: "Provide continuous high-fiber hay to naturally wear down continuously growing teeth. Inspect front incisors.",
        speciesNotes: "Never submerge a rabbit in water baths as it causes severe shock."
    },
    Bird: {
        coatCare: "Provide misting, water dishes, or gentle bird showers for feather hygiene and preening.",
        nailCare: "Use varied perch diameters to wear claws naturally; trim beak/claws only under vet guidance.",
        earCare: "Inspect feathering around ear openings during routine health checks.",
        pawCare: "Check foot pads for bumblefoot or sores.",
        dentalCare: "Keep beak clean and properly aligned by providing cuttlebone and mineral blocks.",
        speciesNotes: "Feather preening is natural; sudden feather plucking requires veterinary check."
    },
    Horse: {
        coatCare: "Daily curry combing and dandy brushing to remove dirt, sweat, and bring out skin oils.",
        nailCare: "Farrier check and hoof trimming every 6-8 weeks.",
        earCare: "Wipe inner ears gently to remove flies and dirt.",
        pawCare: "Pick hooves daily to clean rocks and prevent thrush.",
        dentalCare: "Equine dental floating once or twice a year by a vet to smooth sharp enamel points.",
        speciesNotes: "Bathe after heavy exercise using horse-formulated shampoo."
    },
    Turtle: {
        coatCare: "Gently brush shell with soft brush to remove algae or shedding scutes.",
        nailCare: "Provide rough basking surfaces for natural claw wear.",
        earCare: "Inspect ear membranes behind eyes for swelling.",
        pawCare: "Inspect webbed feet or limbs for scabs or fungal signs.",
        dentalCare: "Provide cuttlebone or hard food items to keep beak properly trimmed.",
        speciesNotes: "Keep water clean to prevent shell rot."
    },
    Fish: {
        coatCare: "Maintain optimal aquarium water quality, pH, and filtration for healthy slime coat.",
        nailCare: "N/A",
        earCare: "N/A",
        pawCare: "N/A",
        dentalCare: "Feed balanced diet; monitor mouth area for fungal growth.",
        speciesNotes: "Slime coat protects fish; use water conditioner with slime coat support when changing water."
    },
    Other: {
        coatCare: "Regular inspection and species-appropriate hygiene.",
        nailCare: "Keep claws trimmed as applicable for species.",
        earCare: "Keep ear canals clean and dry.",
        pawCare: "Check foot pads and limbs for lesions.",
        dentalCare: "Provide species-appropriate oral hygiene and dental chew items.",
        speciesNotes: "Follow veterinary recommendations for specialized species."
    }
};

module.exports = groomingKnowledgeBase;
