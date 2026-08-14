/* ==========================
   PAWSYNC SHARED JS
   ========================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 3D FLIP CARD TOUCH SUPPORT ---
    // Select all flip cards on the page
    const flipCards = document.querySelectorAll('.flip-card');

    flipCards.forEach(card => {
        card.addEventListener('click', function() {
            // Toggle the 'flipped' class when tapped
            this.classList.toggle('flipped');
        });
    });

    // --- NUTRITION SECTION INTERACTION ---
    
    // 1. The data we want to show when a button is clicked
    const nutritionData = {
        protein: {
            title: "🥩 High-Quality Protein",
            desc: "Protein is the building block of your dog's body. It is essential for muscle growth, tissue repair, and maintaining a healthy, shiny coat."
        },
        nutrients: {
            title: "🥕 Balanced Vitamins & Minerals",
            desc: "Dogs need a specific balance of vitamins, minerals, and carbohydrates. Avoid human food that is heavily spiced, salted, or toxic to dogs."
        },
        water: {
            title: "💧 Fresh Hydration",
            desc: "Hydration is absolutely critical. Always provide a clean, accessible bowl of fresh water, and be sure to wash the bowl and change the water daily."
        },
        portions: {
            title: "⚖️ Proper Portions",
            desc: "Follow portion guidelines based on your dog's age, weight, and activity level. Overfeeding is a leading cause of pet obesity and joint issues."
        }
    };

    // 2. Select the HTML elements we need to manipulate
    const radialItems = document.querySelectorAll('.radial-item');
    const panelTitle = document.getElementById('panel-title');
    const panelDesc = document.getElementById('panel-desc');
    const infoPanel = document.getElementById('nutrition-panel');

    // 3. Add click events to all buttons
    radialItems.forEach(item => {
        item.addEventListener('click', function() {
            
            // Remove 'active' highlight from all buttons, then add to the clicked one
            radialItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // Find out which button was clicked using the 'data-info' attribute
            const infoKey = this.getAttribute('data-info');
            const data = nutritionData[infoKey];

            // Animate text change: fade out, change text, fade in
            infoPanel.classList.add('fade-out');
            
            setTimeout(() => {
                panelTitle.textContent = data.title;
                panelDesc.textContent = data.desc;
                infoPanel.classList.remove('fade-out');
            }, 300); // 300ms matches our CSS transition speed
            
        });
    });

// --- SCROLL REVEAL ANIMATIONS ---
    // Select all elements that have the 'reveal-on-scroll' class
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const revealOptions = {
        threshold: 0.15, // Animation triggers when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Triggers slightly before it hits the bottom of screen
    };

    const scrollObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            // If the element is visible on the screen
            if (entry.isIntersecting) {
                // Add the visible class to trigger CSS animation
                entry.target.classList.add('is-visible');
                // Stop observing it so it doesn't animate out and in repeatedly
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Apply the observer to all our hidden elements
    revealElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // --- HEALTH MODAL INTERACTION ---
    
    // 1. The data for our modals
    const modalData = {
        'puppy-vax': {
            icon: '💉',
            title: 'Puppy Vaccinations',
            desc: 'Puppies require a series of core vaccinations (like Parvovirus, Distemper, and Rabies) starting around 6-8 weeks of age to build their immune system. Your vet will outline a multi-step schedule.'
        },
        'puppy-prev': {
            icon: '🛡️',
            title: 'Preventive Care',
            desc: 'Early preventive care includes deworming and starting monthly heartworm, flea, and tick preventatives. Early protection is much safer and cheaper than treating illnesses later.'
        },
        'adult-check': {
            icon: '🩺',
            title: 'Routine Checkups',
            desc: 'Adult dogs should visit the vet at least once a year. These annual wellness exams check their weight, heart, lungs, and overall body condition to catch any issues early.'
        },
        'adult-dental': {
            icon: '🦷',
            title: 'Dental Care',
            desc: 'Dental disease is incredibly common in adult dogs. Regular brushing at home, along with professional veterinary cleanings, prevents tooth loss and systemic infections.'
        },
        'senior-monitor': {
            icon: '📈',
            title: 'Health Monitoring',
            desc: 'Senior dogs (typically 7+ years) benefit from bi-annual checkups. Bloodwork and urinalysis help monitor organ function and detect age-related conditions like diabetes or kidney issues.'
        },
        'senior-joint': {
            icon: '🦴',
            title: 'Joint Care',
            desc: 'Arthritis and joint stiffness are common in older dogs. Weight management, joint supplements (like Glucosamine), and soft bedding can significantly improve their quality of life.'
        }
    };

    // 2. Select Elements
    const healthBtns = document.querySelectorAll('.health-btn');
    const healthModal = document.getElementById('health-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

    // 3. Open Modal Event
    healthBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const topic = this.getAttribute('data-modal');
            const data = modalData[topic];

            if(data) {
                modalIcon.textContent = data.icon;
                modalTitle.textContent = data.title;
                modalDesc.textContent = data.desc;
                
                healthModal.classList.add('active');
                // Prevent background page from scrolling when modal is open
                document.body.style.overflow = 'hidden'; 
            }
        });
    });

    // 4. Close Modal Event
    const closeModal = () => {
        healthModal.classList.remove('active');
        // Restore page scrolling
        document.body.style.overflow = '';
    };

    closeModalBtn.addEventListener('click', closeModal);

    // Close modal if user clicks outside the modal box
    healthModal.addEventListener('click', function(e) {
        if (e.target === healthModal) {
            closeModal();
        }
    });

});

// Enable click/tap-to-flip for 3D breed cards on touch devices
document.addEventListener('DOMContentLoaded', () => {
    const flipCards = document.querySelectorAll('.breed-flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
});

// Interactive Nutrition Tabs Handler for Cat Page
document.addEventListener('DOMContentLoaded', () => {
    const nutriTabs = document.querySelectorAll('.nutri-tab');
    const nutriPanes = document.querySelectorAll('.nutri-content-pane');

    if (nutriTabs.length > 0) {
        nutriTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active state from all tabs
                nutriTabs.forEach(t => t.classList.remove('active'));
                // Add active state to clicked tab
                tab.classList.add('active');

                // Get target pane identifier
                const targetId = tab.getAttribute('data-target');

                // Hide all content panes
                nutriPanes.forEach(pane => pane.classList.remove('active'));

                // Show the matched target pane
                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }
});

// Interactive Health Stages Handler for Cat Page
document.addEventListener('DOMContentLoaded', () => {
    const stageButtons = document.querySelectorAll('.stage-btn');
    const healthPanes = document.querySelectorAll('.health-pane');

    if (stageButtons.length > 0) {
        stageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active state from all buttons
                stageButtons.forEach(b => b.classList.remove('active'));
                // Add active state to clicked button
                btn.classList.add('active');

                // Get target stage identifier
                const targetStage = btn.getAttribute('data-stage');

                // Hide all health panes
                healthPanes.forEach(pane => pane.classList.remove('active'));

                // Show the matched target pane
                const targetPane = document.getElementById(targetStage);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }
});



// Step 10: Smooth Sliding Facts Carousel with Strict Focus Lock on Click
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('factsCarousel');
    if (!carousel) return;

    const track = carousel.querySelector('.sliding-track');
    
    // Create backdrop element dynamically
    const backdrop = document.createElement('div');
    backdrop.className = 'facts-backdrop';
    document.body.appendChild(backdrop);

    let isPaused = false;
    let scrollSpeed = 0.7;
    let currentScroll = 0;
    let activeExpandedCard = null;

    // Duplicate track for infinite loop effect
    track.innerHTML += track.innerHTML; 
    const allCards = carousel.querySelectorAll('.sliding-card');

    function updateCarouselLoop() {
        if (!isPaused) {
            currentScroll += scrollSpeed;
            const maxScroll = track.scrollWidth / 2;
            if (currentScroll >= maxScroll) {
                currentScroll = 0;
            }
            carousel.scrollLeft = currentScroll;

            // Calculate center of carousel viewport when moving
            const viewportRect = carousel.getBoundingClientRect();
            const viewportCenter = viewportRect.left + viewportRect.width / 2;

            allCards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(viewportCenter - cardCenter);

                if (distance < 160) {
                    card.classList.add('in-focus');
                } else {
                    card.classList.remove('in-focus');
                }
            });
        } else {
            // When paused (card clicked), strictly ensure only the clicked card is sharp/expanded
            allCards.forEach(card => {
                if (card === activeExpandedCard) {
                    card.classList.add('expanded');
                    card.classList.remove('in-focus');
                } else {
                    card.classList.remove('expanded');
                    card.classList.remove('in-focus');
                }
            });
        }

        requestAnimationFrame(updateCarouselLoop);
    }

    requestAnimationFrame(updateCarouselLoop);

    // Card click handler: pause, center, and sharp-focus the selected card
    allCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            isPaused = true;
            activeExpandedCard = card;
            backdrop.classList.add('active');

            // Smoothly scroll container to center the clicked card exactly
            const cardRect = card.getBoundingClientRect();
            const carouselRect = carousel.getBoundingClientRect();
            const currentScrollLeft = carousel.scrollLeft;
            const targetOffset = currentScrollLeft + (cardRect.left - carouselRect.left) - (carouselRect.width / 2 - cardRect.width / 2);
            
            carousel.scrollTo({
                left: targetOffset,
                behavior: 'smooth'
            });
            currentScroll = targetOffset;
        });
    });

    // Resume sliding when tapping backdrop or outside the carousel
    function resumeCarousel() {
        if (activeExpandedCard) {
            activeExpandedCard.classList.remove('expanded');
            activeExpandedCard = null;
        }
        backdrop.classList.remove('active');
        isPaused = false;
    }

    backdrop.addEventListener('click', resumeCarousel);
    document.addEventListener('click', (e) => {
        if (!e.closest('.sliding-carousel-container') && activeExpandedCard) {
            resumeCarousel();
        }
    });
});