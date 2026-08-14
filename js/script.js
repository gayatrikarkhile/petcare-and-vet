document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll('.nav-link');

    // Handle Active Click State
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent jump for demo
            
            // Remove active class from all
            navLinks.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    
    const sliderWrapper = document.getElementById('sliderWrapper');
    const track = document.getElementById('sliderTrack');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    const totalSlides = slides.length;
    const slideDuration = 5000;
    let currentIndex = 0;
    
    class SliderTimer {
        constructor(callback, delay) {
            this.callback = callback;
            this.delay = delay;
            this.remaining = delay;
            this.resume();
        }

        pause() {
            window.clearTimeout(this.timerId);
            this.remaining -= Date.now() - this.start;
        }

        resume() {
            this.start = Date.now();
            window.clearTimeout(this.timerId);
            this.timerId = window.setTimeout(() => {
                this.remaining = this.delay; 
                this.callback();
                this.resume(); 
            }, this.remaining);
        }
        
        reset() {
            window.clearTimeout(this.timerId);
            this.remaining = this.delay;
            this.resume();
        }
    }
    
    function updateSlider() {
        // Slide track horizontally
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Update active slide class to trigger text fade/zoom animations
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Update Dot Indicators
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    }

    // Initialize Timer
    const autoPlayTimer = new SliderTimer(nextSlide, slideDuration);

    // Event Listeners for Clicking Dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
            autoPlayTimer.reset(); // Reset timer so it doesn't auto-slide immediately after click
        });
    });

    // Pause on Hover
    sliderWrapper.addEventListener('mouseenter', () => {
        autoPlayTimer.pause();
    });

    sliderWrapper.addEventListener('mouseleave', () => {
        autoPlayTimer.resume();
    });

    // Trigger Initial State
    updateSlider();
});

document.addEventListener('DOMContentLoaded', () => {

    // Staggered Scroll Reveal Animations (Fixed)
    const revealElements = document.querySelectorAll('.pws-fade-up');
    
    // Bulletproof observation settings
    const observerOptions = { 
        root: null, 
        rootMargin: '50px', // Triggers slightly before you scroll to it
        threshold: 0 // Triggers immediately when 1px enters the viewport
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Unobserve so it only animates once per reload
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => sectionObserver.observe(el));

});


document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal-wrapper, .reveal-elem');

    // Bulletproof Observer Options
    const observerOptions = {
        root: null,
        rootMargin: '50px', // A positive margin triggers the animation slightly BEFORE you reach it
        threshold: 0 // Triggers the exact moment 1 pixel of the element enters the view
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        scrollObserver.observe(el);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.trust-reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.12
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        sectionObserver.observe(el);
    });

    // 2. Dynamic Floating Ambient Particles Generator
    const particlesContainer = document.getElementById('trustParticles');
    if (particlesContainer) {
        const particleCount = 18;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'ambient-particle';
            
            // Random positioning and sizes
            const size = Math.random() * 6 + 4;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 8 + 6;
            const delay = Math.random() * 5;

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(15, 82, 186, ${Math.random() * 0.15 + 0.05});
                border-radius: 50%;
                left: ${posX}%;
                top: ${posY}%;
                pointer-events: none;
                animation: particleFloat ${duration}s ease-in-out infinite ${delay}s;
            `;
            particlesContainer.appendChild(particle);
        }
    }
});

// Inject keyframes dynamically for particles
const styleSheet = document.styleSheets[0];
if (styleSheet) {
    try {
        styleSheet.insertRule(`
            @keyframes particleFloat {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
                50% { transform: translateY(-30px) translateX(15px); opacity: 0.8; }
            }
        `, styleSheet.cssRules.length);
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Universal Scroll Observer (Handles elements sliding up as you scroll)
    const revealElements = document.querySelectorAll('.pt-reveal, .vac-reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', // Triggers slightly before appearing
        threshold: 0.05
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Unobserve after revealing to prevent refiring and save memory
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        sectionObserver.observe(el);
    });

    // Ambient Particles Generator for the "Trust" Section Background
    const particlesContainer = document.getElementById('ptParticles');
    
    if (particlesContainer) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'pt-particle';
            
            // Randomize properties to make it look organic
            const size = Math.random() * 6 + 3; // 3px to 9px
            const posX = Math.random() * 100; // 0% to 100%
            const posY = Math.random() * 100; // 0% to 100%
            const duration = Math.random() * 10 + 8; // 8s to 18s
            const delay = Math.random() * 5; // 0s to 5s
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.animation = `floatParticle ${duration}s ease-in-out infinite ${delay}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
});



//before review: 

document.addEventListener('DOMContentLoaded', () => {
    
    // Select all elements needing scroll animations
    const revealElements = document.querySelectorAll('.nutri-reveal, .groom-reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1 
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // Specific trigger for Nutrition Progress Bars
                if(entry.target.classList.contains('nutri-content-col')) {
                    setTimeout(() => {
                        const progressBars = entry.target.querySelectorAll('.ind-progress');
                        progressBars.forEach(bar => {
                            const targetWidth = bar.getAttribute('data-target');
                            bar.style.width = targetWidth; // Animate width from 0
                        });
                    }, 400); // Slight delay after container fades in
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => sectionObserver.observe(el));

});

document.addEventListener('DOMContentLoaded', () => {
    
    const track = document.getElementById('testiTrack');
    const wrapper = document.getElementById('testiCarouselWrapper');
    
    if (!track || !wrapper) return;

    // 1. Robust Infinite Cloning
    // Clone twice to ensure track covers ultra-wide screens seamlessly
    const originalCards = Array.from(track.children);
    for (let i = 0; i < 2; i++) {
        originalCards.forEach(card => track.appendChild(card.cloneNode(true)));
    }

    const allCards = Array.from(track.querySelectorAll('.testi-card-wrapper'));

    // 2. State Management
    let currentX = 0;
    let targetX = null; 
    let isHovered = false;
    let isDragging = false;
    let startX = 0;
    let dragDistance = 0;
    const dragThreshold = 5; 
    
    const speed = 1; 
    let animationFrameId;

    // 3. Pointer & Drag Events
    wrapper.addEventListener('mouseenter', () => isHovered = true);
    wrapper.addEventListener('mouseleave', () => {
        isHovered = false;
        isDragging = false;
    });

    wrapper.addEventListener('mousedown', (e) => {
        isHovered = true;
        isDragging = true;
        dragDistance = 0;
        startX = e.pageX;
        targetX = null; 
    });
    
    wrapper.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const xDiff = e.pageX - startX;
        dragDistance += Math.abs(xDiff);
        currentX -= xDiff;
        startX = e.pageX;
    });
    
    wrapper.addEventListener('mouseup', () => {
        isHovered = false;
        isDragging = false;
    });

    // Touch Support
    wrapper.addEventListener('touchstart', (e) => {
        isHovered = true;
        isDragging = true;
        dragDistance = 0;
        startX = e.touches[0].pageX;
        targetX = null;
    }, {passive: true});
    
    wrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const xDiff = e.touches[0].pageX - startX;
        dragDistance += Math.abs(xDiff);
        currentX -= xDiff;
        startX = e.touches[0].pageX;
    }, {passive: true});
    
    wrapper.addEventListener('touchend', () => {
        isHovered = false;
        isDragging = false;
    });

    // 4. Perfect Click-to-Center Feature
    allCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (dragDistance > dragThreshold) {
                e.preventDefault();
                return; // User was dragging, not clicking
            }
            
            // Calculate exact position to bring clicked card to viewport center
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + (rect.width / 2);
            const viewportCenter = window.innerWidth / 2;
            const offset = cardCenter - viewportCenter;
            
            targetX = currentX + offset;
        });
    });

    // 5. Render Loop Engine
    function renderLoop() {
        
        // --- Smooth Interpolation (Lerp) for Click-to-Center ---
        if (targetX !== null) {
            currentX += (targetX - currentX) * 0.08; 
            if (Math.abs(targetX - currentX) < 1) {
                currentX = targetX;
                targetX = null; 
            }
        } 
        // Normal Auto-Scrolling
        else if (!isHovered && !isDragging) {
            currentX += speed;
        }

        // --- Bulletproof Infinite Loop ---
        const firstCard = allCards[0];
        const cardWidthWithMargin = firstCard.offsetWidth + 48; 
        const singleSetWidth = cardWidthWithMargin * originalCards.length;

        // Instantly snap track back or forward without visual interruption
        if (currentX >= singleSetWidth) {
            currentX -= singleSetWidth;
            if (targetX !== null) targetX -= singleSetWidth;
        } else if (currentX < 0) {
            currentX += singleSetWidth;
            if (targetX !== null) targetX += singleSetWidth;
        }

        // Apply Transform
        track.style.transform = `translateX(${-currentX}px)`;

        // --- 6. Dynamic Depth, Scale, and Focus ---
        const viewportCenter = window.innerWidth / 2;
        const activationDistance = window.innerWidth < 768 ? 200 : 450; 

        allCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + (rect.width / 2);
            const distanceFromCenter = Math.abs(viewportCenter - cardCenter);
            
            // Calculate scale ratio (0 to 1)
            let ratio = 1 - (distanceFromCenter / activationDistance);
            if (ratio < 0) ratio = 0;
            if (ratio > 1) ratio = 1;

            // Smooth out the animation curve
            const easeRatio = ratio * ratio * (3 - 2 * ratio); 

            // Calculate active bounds
            const currentScale = 0.85 + ((1.12 - 0.85) * easeRatio);
            const currentOpacity = 0.5 + ((1 - 0.5) * easeRatio);
            const currentBlur = 3 - (3 * easeRatio);

            // Apply calculated styles
            card.style.transform = `scale(${currentScale})`;
            card.style.opacity = currentOpacity;
            card.style.filter = `blur(${currentBlur}px)`;

            // Toggle center class for glowing effects
            if (easeRatio > 0.85) {
                card.classList.add('is-center');
            } else {
                card.classList.remove('is-center');
            }
        });

        // Request next frame
        animationFrameId = requestAnimationFrame(renderLoop);
    }

    // Start engine
    renderLoop();

    // Prevent issues on resize
    window.addEventListener('resize', () => {
        if(!isHovered && !isDragging && targetX === null) {
            cancelAnimationFrame(animationFrameId);
            renderLoop();
        }
    });
});



document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Intersection Observer for Premium Scroll Reveal
    const revealElements = document.querySelectorAll('.footer-reveal');
    
   const footerObserverOptions = {
        root: null,
        rootMargin: '50px', // Adds a buffer so it triggers perfectly at the bottom
        threshold: 0
    };

    const footerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Unobserve after revealing to save performance
                observer.unobserve(entry.target);
            }
        });
    }, footerObserverOptions);

    revealElements.forEach(el => {
        footerObserver.observe(el);
    });

    // 2. Generate Ambient Sub-Opacity Floating Particles (Maintains 60FPS)
    const particlesContainer = document.getElementById('footerParticles');
    
    if (particlesContainer) {
        const particleCount = 10; 
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'footer-particle';
            
            // Randomize variables for organic depth
            const size = Math.random() * 4 + 2; 
            const posX = Math.random() * 100; 
            const posY = Math.random() * 100; 
            const duration = Math.random() * 12 + 8; 
            const delay = Math.random() * 5; 
            
            // Apply inline styles
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.animation = `floatParticleFT ${duration}s ease-in-out infinite ${delay}s`;
            
            fragment.appendChild(particle);
        }
        
        particlesContainer.appendChild(fragment);
    }
});
