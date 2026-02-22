// ============================================
// Floating Particles + Cursor Glow + Animations
// ============================================

(function () {
    // ---- FLOATING PARTICLES ----
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, particles;
    const PARTICLE_COUNT = 60;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = document.body.scrollHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.35;
            this.opacity = Math.random() * 0.5 + 0.15;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.01 + Math.random() * 0.025;
            // Random color from neon palette
            const colors = [
                [0, 232, 157],   // neon green
                [123, 97, 255],  // purple
                [255, 107, 157], // pink
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.pulse += this.pulseSpeed;

            // Wrap around edges
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;
            if (this.y < -10) this.y = height + 10;
            if (this.y > height + 10) this.y = -10;
        }

        draw() {
            const glow = Math.sin(this.pulse) * 0.2 + 0.8;
            const [r, g, b] = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * glow, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity * glow})`;
            ctx.fill();

            // Glow ring
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * glow * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.06 * glow})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 160) {
                    const opacity = (1 - dist / 160) * 0.1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    const [r, g, b] = particles[i].color;
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawLines();
        requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animate();

    window.addEventListener('resize', () => {
        resize();
    });

    // Resize canvas when scrolling reveals more content
    let resizeTimer;
    window.addEventListener('scroll', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newHeight = document.body.scrollHeight;
            if (canvas.height !== newHeight) {
                canvas.height = newHeight;
                height = newHeight;
            }
        }, 200);
    });

    // ---- CURSOR GLOW ----
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow) {
        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateGlow() {
            // Smooth follow with lerp
            glowX += (mouseX - glowX) * 0.15;
            glowY += (mouseY - glowY) * 0.15;
            cursorGlow.style.transform = `translate(${glowX - 150}px, ${glowY - 150}px)`;
            requestAnimationFrame(updateGlow);
        }
        updateGlow();
    }

    // ---- ENHANCED 3D TILT WITH LIGHT REFLECTION ----
    const tiltCards = document.querySelectorAll('.project-card, .skill-card, .info-card, .edu-card, .cert-card');

    // Clear CSS stagger delays after entrance animation so all cards tilt at same speed
    const delayObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.transitionDelay = '0s';
                }, 600);
                delayObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    tiltCards.forEach(card => delayObserver.observe(card));

    tiltCards.forEach(card => {
        // Create light reflection overlay
        const reflection = document.createElement('div');
        reflection.classList.add('card-3d-reflection');
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(reflection);

        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
        let rafId = null;

        function lerpTilt() {
            currentX += (targetX - currentX) * 0.1;
            currentY += (targetY - currentY) * 0.1;

            card.style.transform = `perspective(600px) rotateX(${currentY}deg) rotateY(${currentX}deg) translateZ(10px)`;

            // Move light reflection
            const lightX = 50 + (currentX / 10) * 50;
            const lightY = 50 + (currentY / 10) * 50;
            reflection.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;

            if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
                rafId = requestAnimationFrame(lerpTilt);
            } else {
                rafId = null;
            }
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            targetX = ((x - centerX) / centerX) * 10;
            targetY = ((y - centerY) / centerY) * -10;

            reflection.style.opacity = '1';

            if (!rafId) {
                rafId = requestAnimationFrame(lerpTilt);
            }
        });

        card.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
            reflection.style.opacity = '0';
            if (!rafId) {
                rafId = requestAnimationFrame(lerpTilt);
            }
        });
    });

    // ---- 3D HERO MOUSE PARALLAX ----
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroH1 = hero.querySelector('h1');
        const heroSubtitle = hero.querySelector('.subtitle');
        const heroDesc = hero.querySelector('.description');
        const heroCta = hero.querySelector('.cta-buttons');
        const heroSocial = hero.querySelector('.social-links');
        const heroBadge = hero.querySelector('.status-badge');

        const layers = [
            { el: heroH1, depth: 20 },
            { el: heroSubtitle, depth: 15 },
            { el: heroDesc, depth: 10 },
            { el: heroCta, depth: 12 },
            { el: heroSocial, depth: 8 },
            { el: heroBadge, depth: 18 },
        ];

        let heroMouseX = 0, heroMouseY = 0;

        document.addEventListener('mousemove', (e) => {
            heroMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            heroMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        function animateHeroParallax() {
            layers.forEach(layer => {
                if (layer.el) {
                    const moveX = heroMouseX * layer.depth;
                    const moveY = heroMouseY * layer.depth;
                    layer.el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
                }
            });
            requestAnimationFrame(animateHeroParallax);
        }
        animateHeroParallax();
    }

    // ---- TEXT COUNTER / NUMBER ANIMATION ----
    // Animate any element with data-count attribute
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.getAttribute('data-count'));
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                let current = 0;
                const step = target / 60;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = Math.floor(current);
                }, 16);
                observer.unobserve(el);
            }
        });
        observer.observe(el);
    });

    // ---- STAGGERED REVEAL FOR SKILL TAGS ----
    document.querySelectorAll('.skill-tags').forEach(container => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                container.querySelectorAll('.skill-tag').forEach((tag, i) => {
                    tag.style.animation = `tagPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.04}s both`;
                });
                observer.unobserve(container);
            }
        }, { threshold: 0.3 });
        observer.observe(container);
    });

    // ---- MAGNETIC HOVER ON BUTTONS ----
    document.querySelectorAll('.btn, .submit-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ---- SECTION HEADER SLIDE-IN ----
    document.querySelectorAll('.section-header, .contact-info').forEach(header => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                header.classList.add('animate-in');
                observer.unobserve(header);
            }
        }, { threshold: 0.2 });
        observer.observe(header);
    });

})();
