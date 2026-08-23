/* ============================================================
   PAWSYNC AI ASSISTANT (UPDATED SCRIPT)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initializeAIAssistant();
});

/* ============================================================
   INITIALIZE
   ============================================================ */
function initializeAIAssistant() {
    const input = document.getElementById("chatInput");
    const sendButton = document.getElementById("sendButton");
    const suggestions = document.querySelectorAll(".suggestion-btn");
    const clearBtn = document.getElementById("clearChatBtn");

    /* Send button action */
    if (sendButton) {
        sendButton.addEventListener("click", sendMessage);
    }

    /* Enter Key Handling */
    if (input) {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });

        /* Dynamic Auto-Resize */
        input.addEventListener("input", () => {
            input.style.height = "auto";
            input.style.height = Math.min(input.scrollHeight, 100) + "px";
        });
    }

    /* Quick Suggestions */
    suggestions.forEach((button) => {
        button.addEventListener("click", () => {
            const question = button.dataset.question;
            if (!question) return;
            askQuestion(question);
        });
    });

    /* Clear Chat */
    if (clearBtn) {
        clearBtn.addEventListener("click", clearChat);
    }

    loadUserPetsForAI();
}

async function loadUserPetsForAI() {
    const selector = document.getElementById("petSelector");
    if (!selector) return;

    const token = localStorage.getItem("pawsyncToken");
    if (!token) {
        selector.innerHTML = "<option value=''>Please login</option>";
        return;
    }

    try {
        const res = await fetch("/api/pets", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.pets) && data.pets.length > 0) {
            selector.innerHTML = "";
            const savedPet = localStorage.getItem("pawsyncSelectedPet");

            data.pets.forEach(pet => {
                const opt = document.createElement("option");
                opt.value = pet._id;
                opt.textContent = `🐾 ${pet.petName}`;
                if (savedPet && pet._id === savedPet) opt.selected = true;
                selector.appendChild(opt);
            });

            selector.addEventListener("change", () => {
                localStorage.setItem("pawsyncSelectedPet", selector.value);
            });
        } else {
            selector.innerHTML = "<option value=''>No pets added</option>";
        }
    } catch (err) {
        console.error("AI Assistant pet loading error:", err);
        selector.innerHTML = "<option value=''>No pets available</option>";
    }
}

/* ============================================================
   SEND MESSAGE
   ============================================================ */
function sendMessage() {
    const input = document.getElementById("chatInput");
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    /* Render User Message */
    addUserMessage(message);

    /* Clear and Reset Input Height */
    input.value = "";
    input.style.height = "auto";

    /* Disable Send Button */
    const sendButton = document.getElementById("sendButton");
    if (sendButton) sendButton.disabled = true;

    /* Show Typing Animation */
    const typingId = showTyping();

    /* Simulated AI Response Delay */
    setTimeout(() => {
        removeTyping(typingId);

        const response = generateResponse(message);
        addAIMessage(response);

        if (sendButton) sendButton.disabled = false;
    }, 850);
}

/* ============================================================
   ASK QUESTION DIRECTLY
   ============================================================ */
function askQuestion(question) {
    const input = document.getElementById("chatInput");
    if (!input) return;

    input.value = question;
    sendMessage();
}

/* ============================================================
   ADD USER MESSAGE TO UI
   ============================================================ */
function addUserMessage(message) {
    const container = document.getElementById("chatMessages");
    if (!container) return;

    const messageElement = document.createElement("div");
    messageElement.className = "message user-message";

    messageElement.innerHTML = `
        <div class="message-bubble">
            <p>${escapeHTML(message)}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
    `;

    container.appendChild(messageElement);
    scrollChat();
}

/* ============================================================
   ADD AI MESSAGE TO UI
   ============================================================ */
function addAIMessage(message) {
    const container = document.getElementById("chatMessages");
    if (!container) return;

    const messageElement = document.createElement("div");
    messageElement.className = "message ai-message";

    messageElement.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-bubble">
            ${formatResponse(message)}
            <span class="message-time">${getCurrentTime()}</span>
        </div>
    `;

    container.appendChild(messageElement);
    scrollChat();
}

/* ============================================================
   RESPONSE GENERATOR LOGIC
   ============================================================ */
function generateResponse(question) {
    const text = question.toLowerCase();
    const petSelect = document.getElementById("petSelector");
    const petName = petSelect ? petSelect.options[petSelect.selectedIndex].text.replace("🐾", "").trim() : "your pet";

    if (text.includes("food") || text.includes("feed") || text.includes("nutrition") || text.includes("diet")) {
        return `A balanced diet for **${petName}** should match their age, size, activity level, and specific health needs.\n\nMake sure fresh drinking water is always available. For tailored diet plans or medical conditions, check with your vet!`;
    }

    if (text.includes("vaccin")) {
        return `Vaccination schedules for **${petName}** depend on their age and past medical history.\n\nCheck the **Vaccination & Calendar** tab in PawSync to log and track upcoming reminder dates.`;
    }

    if (text.includes("exercise") || text.includes("activity") || text.includes("walk") || text.includes("play")) {
        return `Regular daily exercise is key for **${petName}**'s health and happiness.\n\nAdjust activity intensity based on their energy levels and age. Avoid strenuous activity during extreme heat!`;
    }

    if (text.includes("groom") || text.includes("bath") || text.includes("brush") || text.includes("nail")) {
        return `Regular grooming keeps **${petName}**'s coat, skin, and nails in top condition.\n\nIf you notice persistent itching or unusual shedding, consult your vet.`;
    }

    if (text.includes("dental") || text.includes("teeth") || text.includes("tooth") || text.includes("mouth")) {
        return `Dental health is vital! Regular pet-safe brushing or dental chews help keep **${petName}**'s teeth clean.\n\nWatch out for bad breath, swollen gums, or difficulty eating.`;
    }

    if (text.includes("health") || text.includes("sick") || text.includes("pain") || text.includes("symptom")) {
        return `I can offer general guidance, but I can't diagnose **${petName}**.\n\nIf they show severe pain, lethargy, or sudden symptoms, please reach out to your veterinarian immediately.`;
    }

    return `I'm here to help with health, nutrition, vaccines, exercise, and grooming for **${petName}**.\n\nFeel free to select one of the quick suggestions above or ask any question!`;
}

/* ============================================================
   FORMAT RESPONSE
   ============================================================ */
function formatResponse(message) {
    return message
        .trim()
        .split("\n\n")
        .map((paragraph) => `<p>${escapeHTML(paragraph.trim()).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
        .join("");
}

/* ============================================================
   TYPING INDICATOR
   ============================================================ */
function showTyping() {
    const container = document.getElementById("chatMessages");
    if (!container) return null;

    const id = "typing-" + Date.now();
    const element = document.createElement("div");

    element.id = id;
    element.className = "message ai-message";

    element.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-bubble">
            <div class="typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    container.appendChild(element);
    scrollChat();
    return id;
}

function removeTyping(id) {
    if (!id) return;
    const element = document.getElementById(id);
    if (element) element.remove();
}

/* ============================================================
   CLEAR CHAT
   ============================================================ */
function clearChat() {
    const container = document.getElementById("chatMessages");
    if (!container) return;

    container.innerHTML = `
        <div class="message ai-message">
            <div class="message-avatar">🤖</div>
            <div class="message-bubble">
                <p>Chat cleared! How else can I assist you today?</p>
                <span class="message-time">${getCurrentTime()}</span>
            </div>
        </div>
    `;
}

/* ============================================================
   HELPERS
   ============================================================ */
function scrollChat() {
    const container = document.getElementById("chatMessages");
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}