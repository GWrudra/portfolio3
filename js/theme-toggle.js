// ============================================
// Theme Toggle — Light/Dark Mode
// ============================================

(function () {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const STORAGE_KEY = 'portfolio-theme';

    // Check saved preference or system preference
    function getPreferredTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
        // Default to dark
        return 'dark';
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        localStorage.setItem(STORAGE_KEY, theme);
    }

    // Apply on load (immediately, before animations)
    applyTheme(getPreferredTheme());

    // Toggle on click
    toggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        const newTheme = isLight ? 'dark' : 'light';
        applyTheme(newTheme);

        // Add a little spin animation on click
        toggle.style.transform = 'rotate(360deg) scale(1.1)';
        setTimeout(() => {
            toggle.style.transform = '';
        }, 500);
    });
})();
