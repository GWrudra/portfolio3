// ============================================
// Interactive Terminal Hero
// Type real commands in the hero section
// ============================================

(function () {
    const terminalEl = document.getElementById('terminalBody');
    const terminalInput = document.getElementById('terminalInput');
    const terminalInputLine = document.querySelector('.terminal-input-line');
    if (!terminalEl || !terminalInput) return;

    const CHAR_DELAY = 40;
    const LINE_DELAY = 400;
    const CMD_DELAY = 800;

    const personalData = {
        name: 'Rudra Pratap Nayak',
        role: 'Developer • Problem Solver • Engineering Student',
        location: 'Koraput, Odisha, India',
        email: 'rudrapnayak111@gmail.com',
        skills: ['Java', 'C', 'C++', 'Python', 'SQL', 'HTML', 'CSS', 'Git', 'GitHub', 'VS Code', 'Linux'],
        focus: 'DSA & Web Development',
        education: '2nd Year Engineering Student'
    };

    const commands = {
        help: () => [
            '<span class="term-accent">Available commands:</span>',
            '',
            '  <span class="term-cmd">whoami</span>      — Who am I?',
            '  <span class="term-cmd">about</span>       — Learn more about me',
            '  <span class="term-cmd">skills</span>      — My tech stack',
            '  <span class="term-cmd">projects</span>    — View my work',
            '  <span class="term-cmd">contact</span>     — Get in touch',
            '  <span class="term-cmd">resume</span>      — Download resume',
            '  <span class="term-cmd">social</span>      — My social links',
            '  <span class="term-cmd">clear</span>       — Clear terminal',
            '  <span class="term-cmd">sudo hire-me</span> — 😉',
            '',
            '<span class="term-dim">Tip: Click any section in the nav to jump there</span>',
        ],
        whoami: () => [
            `<span class="term-accent">${personalData.name}</span>`,
            `<span class="term-dim">${personalData.role}</span>`,
        ],
        about: () => {
            smoothScrollTo('#about');
            return [
                `📍 Based in <span class="term-accent">${personalData.location}</span>`,
                `🎓 ${personalData.education}`,
                `💼 Focus: <span class="term-accent">${personalData.focus}</span>`,
                '',
                '<span class="term-dim">↓ Scrolling to About section...</span>',
            ];
        },
        skills: () => {
            smoothScrollTo('#skills');
            return [
                '<span class="term-accent">Tech Stack:</span>',
                '',
                ...personalData.skills.map(s => `  <span class="term-tag">▸</span> ${s}`),
                '',
                '<span class="term-dim">↓ Scrolling to Skills section...</span>',
            ];
        },
        projects: () => {
            smoothScrollTo('#projects');
            return ['<span class="term-dim">↓ Scrolling to Projects section...</span>'];
        },
        contact: () => {
            smoothScrollTo('#contact');
            return [
                `📧 <span class="term-accent">${personalData.email}</span>`,
                '',
                '<span class="term-dim">↓ Scrolling to Contact section...</span>',
            ];
        },
        resume: () => [
            '<span class="term-accent">📄 Downloading resume...</span>',
            '<span class="term-dim">(Resume download will be linked here)</span>',
        ],
        social: () => [
            '<span class="term-accent">🔗 Social Links:</span>',
            '',
            '  <span class="term-cmd">GitHub</span>    — github.com/rudra',
            '  <span class="term-cmd">LinkedIn</span>  — linkedin.com/in/rudra-pratap-nayak',
            '  <span class="term-cmd">Email</span>     — rudrapnayak111@gmail.com',
        ],
        clear: () => {
            terminalEl.innerHTML = '';
            return [];
        },
        'sudo hire-me': () => [
            '',
            '<span class="term-success">✅ Request approved!</span>',
            '',
            '  <span class="term-accent">█████████████████████████ 100%</span>',
            '',
            '  Deploying world-class developer...',
            '  <span class="term-success">Rudra is now available for hire! 🚀</span>',
            '',
            `  Contact: <span class="term-accent">${personalData.email}</span>`,
            '',
        ],
    };

    function smoothScrollTo(selector) {
        setTimeout(() => {
            const el = document.querySelector(selector);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);
    }

    // ---- TYPING ENGINE ----
    function typeText(container, text, charDelay = CHAR_DELAY) {
        return new Promise(resolve => {
            let i = 0;
            const span = document.createElement('span');
            container.appendChild(span);

            // If text contains HTML, we insert it all at once after the "typing" effect
            if (text.includes('<')) {
                let plainText = text.replace(/<[^>]*>/g, '');
                const interval = setInterval(() => {
                    i++;
                    if (i >= plainText.length) {
                        clearInterval(interval);
                        span.innerHTML = text; // Swap in the rich HTML
                        resolve();
                    } else {
                        span.textContent = plainText.substring(0, i) + '█';
                    }
                }, charDelay);
            } else {
                const interval = setInterval(() => {
                    i++;
                    if (i >= text.length) {
                        clearInterval(interval);
                        span.textContent = text;
                        resolve();
                    } else {
                        span.textContent = text.substring(0, i) + '█';
                    }
                }, charDelay);
            }
        });
    }

    function addLine(html, className = '') {
        const line = document.createElement('div');
        line.className = 'terminal-line ' + className;
        line.innerHTML = html;
        terminalEl.appendChild(line);
        terminalEl.scrollTop = terminalEl.scrollHeight;
        return line;
    }

    function addCommandLine(cmd) {
        return addLine(`<span class="term-prompt">visitor@rudra</span><span class="term-colon">:</span><span class="term-path">~</span><span class="term-dollar">$</span> <span class="term-typed">${cmd}</span>`);
    }

    async function typeCommand(cmd) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = '<span class="term-prompt">visitor@rudra</span><span class="term-colon">:</span><span class="term-path">~</span><span class="term-dollar">$</span> ';
        terminalEl.appendChild(line);

        await typeText(line, cmd, CHAR_DELAY);
        terminalEl.scrollTop = terminalEl.scrollHeight;
    }

    async function showResponse(lines) {
        for (const line of lines) {
            addLine(line, 'term-response');
            await new Promise(r => setTimeout(r, 80));
        }
        addLine(''); // blank spacer
    }

    // ---- BOOT SEQUENCE ----
    async function bootSequence() {
        terminalInputLine.style.display = 'none';

        await new Promise(r => setTimeout(r, 500));
        await typeCommand('whoami');
        await new Promise(r => setTimeout(r, CMD_DELAY));
        await showResponse(commands.whoami());

        await new Promise(r => setTimeout(r, LINE_DELAY));
        await typeCommand('cat role.txt');
        await new Promise(r => setTimeout(r, CMD_DELAY));
        await showResponse([
            `<span class="term-accent">${personalData.role}</span>`,
        ]);

        await new Promise(r => setTimeout(r, LINE_DELAY));
        await typeCommand('echo "Type help for more"');
        await new Promise(r => setTimeout(r, CMD_DELAY));
        await showResponse([
            '<span class="term-dim">Type <span class="term-cmd">help</span> to see available commands</span>',
        ]);

        // Show the input line
        terminalInputLine.style.display = 'flex';
        terminalEl.scrollTop = terminalEl.scrollHeight;
    }

    // ---- USER INPUT ----
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = terminalInput.value.trim().toLowerCase();
            terminalInput.value = '';

            if (!cmd) return;

            addCommandLine(cmd);

            if (commands[cmd]) {
                const output = commands[cmd]();
                if (output.length > 0) {
                    output.forEach(line => addLine(line, 'term-response'));
                }
            } else {
                addLine(`<span class="term-error">command not found: ${cmd}</span>`, 'term-response');
                addLine('<span class="term-dim">Type <span class="term-cmd">help</span> for available commands</span>', 'term-response');
            }
            addLine('');
            terminalEl.scrollTop = terminalEl.scrollHeight;
        }
    });

    // Click on terminal body to focus input
    document.querySelector('.terminal-hero').addEventListener('click', () => {
        terminalInput.focus();
    });

    // Start boot sequence
    bootSequence();

})();
