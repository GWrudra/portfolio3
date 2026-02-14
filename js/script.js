// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.about-content, .info-card, .project-card, .skill-card, .ai-tool-card, .contact-info, .contact-form').forEach(el => {
    observer.observe(el);
});

// Enhanced parallax effect
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');

            if (hero && scrolled < window.innerHeight) {
                hero.style.transform = `translateY(${scrolled * 0.4}px)`;
                hero.style.opacity = Math.max(0, 1 - (scrolled / 600));
            }

            ticking = false;
        });

        ticking = true;
    }
});

// Add stagger animation to nav links
document.querySelectorAll('.nav-links a').forEach((link, index) => {
    link.style.animation = `fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.1}s both`;
});

// Button ripple effect
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Contact form submission via Web3Forms
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Sending...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(this);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                submitBtn.innerHTML = '✅ Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #28c840, #00e89d)';
                this.reset();
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error(result.message || 'Something went wrong');
            }
        } catch (error) {
            submitBtn.innerHTML = '❌ Failed — Try Again';
            submitBtn.style.background = 'linear-gradient(135deg, #ff5f57, #ff375f)';
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// Add stagger animation to project cards on load
document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});