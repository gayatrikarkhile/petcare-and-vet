// =========================================================
// ACTIVITY KNOWLEDGE BASE — PETVERSE AI
// =========================================================

const activityKnowledgeBase = {
    Dog: {
        categories: ["physical_activity", "play", "mental_stimulation", "training"],
        dailyTargetMinutes: 60,
        recommendedActivities: [
            { category: "physical_activity", name: "Brisk Walk / Jog", duration: 30, description: "Outdoor exercise for muscle health and stamina" },
            { category: "play", name: "Fetch & Tug", duration: 20, description: "Interactive play to burn high energy" },
            { category: "mental_stimulation", name: "Sniff & Search Game", duration: 15, description: "Treat puzzle / scent search for brain exercise" },
            { category: "training", name: "Obedience & Tricks", duration: 10, description: "Basic command review and positive reinforcement" }
        ]
    },
    Cat: {
        categories: ["play", "mental_stimulation", "physical_activity"],
        dailyTargetMinutes: 30,
        recommendedActivities: [
            { category: "play", name: "Feather Wand Chase", duration: 15, description: "Simulated prey hunting session" },
            { category: "mental_stimulation", name: "Food Puzzle / Treat Maze", duration: 10, description: "Problem solving and foraging stimulation" },
            { category: "physical_activity", name: "Cat Tree Climbing & Pounce", duration: 10, description: "Vertical territory movement and agility" }
        ]
    },
    Bird: {
        categories: ["mental_stimulation", "play", "training"],
        dailyTargetMinutes: 45,
        recommendedActivities: [
            { category: "mental_stimulation", name: "Foraging Toy Exploration", duration: 20, description: "Paper shredding and treat puzzle foraging" },
            { category: "play", name: "Out-of-cage Flight / Perch Time", duration: 20, description: "Supervised flight and wing extension" },
            { category: "training", name: "Step-up & Vocal Commands", duration: 10, description: "Target training and social bonding" }
        ]
    },
    Rabbit: {
        categories: ["physical_activity", "mental_stimulation", "play"],
        dailyTargetMinutes: 40,
        recommendedActivities: [
            { category: "physical_activity", name: "Bunny Hop & Zoomies", duration: 20, description: "Supervised pen / room exploration" },
            { category: "mental_stimulation", name: "Tunnel & Digging Box", duration: 15, description: "Natural burrowing and cardboard tunneling" },
            { category: "play", name: "Toss Toys & Willow Balls", duration: 10, description: "Chewing and throwing natural toys" }
        ]
    },
    Default: {
        categories: ["physical_activity", "play", "mental_stimulation"],
        dailyTargetMinutes: 30,
        recommendedActivities: [
            { category: "physical_activity", name: "Guided Movement", duration: 15, description: "Gentle physical exercise suitable for species" },
            { category: "mental_stimulation", name: "Interactive Exploration", duration: 15, description: "Enrichment toys and habitat changes" }
        ]
    }
};

module.exports = activityKnowledgeBase;
