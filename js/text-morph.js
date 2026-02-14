// ============================================
// Scroll-Driven Text Scramble/Morph Effect
// Hacker-style text decode on section headers
// ============================================

(function () {
    const CHARS = '!@#$%^&*()_+-={}[]|;:<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const ITERATIONS_PER_CHAR = 2; // How many scramble cycles before settling
    const FRAME_DELAY = 20; // ms per frame

    class TextScramble {
        constructor(el) {
            this.el = el;
            this.originalText = el.textContent;
            this.isAnimated = false;
        }

        animate() {
            if (this.isAnimated) return;
            this.isAnimated = true;

            const text = this.originalText;
            const length = text.length;
            let frame = 0;
            const totalFrames = length * ITERATIONS_PER_CHAR;

            const update = () => {
                let output = '';
                for (let i = 0; i < length; i++) {
                    if (text[i] === ' ') {
                        output += ' ';
                        continue;
                    }

                    // How many frames until this char resolves
                    const charResolveFrame = i * ITERATIONS_PER_CHAR;

                    if (frame >= charResolveFrame + ITERATIONS_PER_CHAR) {
                        // Resolved — show real character
                        output += text[i];
                    } else if (frame >= charResolveFrame) {
                        // Scrambling — show random character
                        output += CHARS[Math.floor(Math.random() * CHARS.length)];
                    } else {
                        // Not yet started — show random or blank
                        output += CHARS[Math.floor(Math.random() * CHARS.length)];
                    }
                }

                this.el.textContent = output;
                frame++;

                if (frame <= totalFrames) {
                    setTimeout(update, FRAME_DELAY);
                } else {
                    // Ensure final text is correct
                    this.el.textContent = this.originalText;
                }
            };

            update();
        }
    }

    // Apply to all section headers
    const targets = document.querySelectorAll('.section-header h2, .about-content h2, .contact-info h2');

    targets.forEach(el => {
        const scrambler = new TextScramble(el);

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Small delay so it feels intentional
                setTimeout(() => scrambler.animate(), 100);
                observer.unobserve(el);
            }
        }, { threshold: 0.5 });

        observer.observe(el);
    });

})();
