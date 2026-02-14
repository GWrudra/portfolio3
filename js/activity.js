// ============================================
// GitHub-Style Coding Activity Heatmap
// ============================================

(function () {
    const grid = document.getElementById('heatmapGrid');
    const tooltip = document.getElementById('heatmapTooltip');
    if (!grid) return;

    const WEEKS = 52;
    const DAYS = 7;
    const DAY_NAMES = ['Mon', '', 'Wed', '', 'Fri', '', ''];
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate realistic contribution data
    function generateData() {
        const data = [];
        const today = new Date();
        // Start from 52 weeks ago
        const start = new Date(today);
        start.setDate(start.getDate() - (WEEKS * 7));
        // Align to Sunday
        start.setDate(start.getDate() - start.getDay());

        for (let w = 0; w < WEEKS; w++) {
            const week = [];
            for (let d = 0; d < DAYS; d++) {
                const date = new Date(start);
                date.setDate(date.getDate() + (w * 7) + d);

                if (date > today) {
                    week.push({ count: -1, date }); // future
                    continue;
                }

                // Weighted random — more activity on recent days and weekdays
                const recency = w / WEEKS; // 0 = old, 1 = recent
                const isWeekday = d >= 1 && d <= 5;
                const baseChance = 0.3 + recency * 0.5;
                const dayBoost = isWeekday ? 1.3 : 0.6;

                let count = 0;
                if (Math.random() < baseChance * dayBoost) {
                    // Exponential distribution for count
                    count = Math.floor(Math.random() * Math.random() * 12) + 1;
                    // Occasional big days
                    if (Math.random() < 0.05) count += Math.floor(Math.random() * 8);
                }

                week.push({ count, date });
            }
            data.push(week);
        }
        return data;
    }

    function getLevel(count) {
        if (count <= 0) return 0;
        if (count <= 2) return 1;
        if (count <= 5) return 2;
        if (count <= 8) return 3;
        return 4;
    }

    function formatDate(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    // ---- RENDER ----
    const data = generateData();

    // Month labels
    const monthRow = document.getElementById('heatmapMonths');
    if (monthRow) {
        let lastMonth = -1;
        const today = new Date();
        const start = new Date(today);
        start.setDate(start.getDate() - (WEEKS * 7));
        start.setDate(start.getDate() - start.getDay());

        for (let w = 0; w < WEEKS; w++) {
            const weekDate = new Date(start);
            weekDate.setDate(weekDate.getDate() + w * 7);
            const month = weekDate.getMonth();
            const label = document.createElement('span');
            label.className = 'heatmap-month-label';
            if (month !== lastMonth) {
                label.textContent = MONTH_NAMES[month];
                lastMonth = month;
            }
            monthRow.appendChild(label);
        }
    }

    // Day labels
    const dayLabels = document.getElementById('heatmapDayLabels');
    if (dayLabels) {
        DAY_NAMES.forEach(name => {
            const label = document.createElement('span');
            label.className = 'heatmap-day-label';
            label.textContent = name;
            dayLabels.appendChild(label);
        });
    }

    // Build cells
    const allCells = [];
    for (let d = 0; d < DAYS; d++) {
        for (let w = 0; w < WEEKS; w++) {
            const cell = document.createElement('div');
            const entry = data[w][d];
            const level = entry.count < 0 ? -1 : getLevel(entry.count);

            cell.className = 'heatmap-cell';
            cell.dataset.level = level;
            cell.dataset.count = entry.count;
            cell.dataset.date = formatDate(entry.date);
            cell.style.opacity = '0';
            cell.style.transform = 'scale(0)';
            grid.appendChild(cell);
            allCells.push(cell);

            // Tooltip
            cell.addEventListener('mouseenter', (e) => {
                if (entry.count < 0) return;
                const text = entry.count === 0
                    ? `No contributions on ${formatDate(entry.date)}`
                    : `${entry.count} contribution${entry.count > 1 ? 's' : ''} on ${formatDate(entry.date)}`;
                tooltip.textContent = text;
                tooltip.style.opacity = '1';
                const rect = cell.getBoundingClientRect();
                const containerRect = grid.closest('.activity-heatmap').getBoundingClientRect();
                tooltip.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - containerRect.top - 32}px`;
            });

            cell.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        }
    }

    // ---- STATS ----
    let totalContributions = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Flatten data chronologically
    const flat = [];
    for (let w = 0; w < WEEKS; w++) {
        for (let d = 0; d < DAYS; d++) {
            flat.push(data[w][d]);
        }
    }

    flat.forEach(entry => {
        if (entry.count > 0) {
            totalContributions += entry.count;
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else if (entry.count === 0) {
            tempStreak = 0;
        }
    });

    // Current streak: count backwards from today
    for (let i = flat.length - 1; i >= 0; i--) {
        if (flat[i].count > 0) {
            currentStreak++;
        } else if (flat[i].count === 0) {
            break;
        }
    }

    // Set stat values
    const setCounter = (id, target) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.setAttribute('data-count', target);
    };
    setCounter('statTotal', totalContributions);
    setCounter('statStreak', currentStreak);
    setCounter('statLongest', longestStreak);

    // ---- SCROLL ANIMATION ----
    const section = document.getElementById('activity');
    if (section) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Animate cells in with stagger
                allCells.forEach((cell, i) => {
                    setTimeout(() => {
                        cell.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        cell.style.opacity = '1';
                        cell.style.transform = 'scale(1)';
                    }, i * 3); // Fast stagger
                });

                // Animate counters
                document.querySelectorAll('.activity-stat-value[data-count]').forEach(el => {
                    const target = parseInt(el.getAttribute('data-count'));
                    let current = 0;
                    const step = Math.max(1, target / 60);
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = Math.floor(current);
                    }, 16);
                });

                observer.unobserve(section);
            }
        }, { threshold: 0.15 });
        observer.observe(section);
    }

})();
