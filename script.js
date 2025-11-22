const toggleButton = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

/* ============================
 * 1. THEME LOGIC (NO OVERLAY ANIMATION)
 * ============================ */

const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
} else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        htmlElement.setAttribute('data-theme', 'light');
    }
}

toggleButton && toggleButton.addEventListener('click', () => {
    const current = htmlElement.getAttribute('data-theme') || 'dark';
    const target = current === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', target);
    try { localStorage.setItem('theme', target); } catch (err) { /* ignore */ }
});

/* ============================
 * 1.5 CUSTOM CURSOR
 *      square → | over ANY text → _ over other clickables
 * ============================ */
(function initCustomCursor() {
    const hasFinePointer = window.matchMedia &&
    window.matchMedia('(pointer: fine)').matches;

    if (!hasFinePointer) return;

    const body = document.body;

    const cursorEl = document.createElement('div');
    cursorEl.className = 'cursor';
    body.appendChild(cursorEl);

    body.classList.add('custom-cursor-enabled');

    // Elements that should feel like "text" (caret |)
    const textSelector = [
        // generic text containers
        'p',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'span',
        'li',
        'label',
        'small',
        'strong',
        'em',
        'code',
        'pre',

        // site-specific text classes (optional but explicit)
        '.tagline',
        '.step-desc',
        '.step-heading',
        '.mono-label',
        '.acad-text',
        '.hack-text',

        // true text-input areas
        'input[type="text"]',
        'input[type="search"]',
        'input[type="email"]',
        'input[type="password"]',
        'textarea',
        '#term-input',
        '.terminal-body'
    ].join(', ');

    // Clickable UI (underscore _)
    // NOTE: we deliberately keep text inputs OUT of this list
    const clickSelector = [
        'a',
        'button',
        'input[type="button"]',
        'input[type="submit"]',
        '.btn-primary',
        '.btn-secondary',
        '#theme-toggle',
        '.scroll-indicator a',
        '.logo-link',
        '.terminal-prompt'
    ].join(', ');

    function updateCursorShape(target) {
        body.classList.remove('cursor-hover-text');
        body.classList.remove('cursor-hover-click');

        if (!target) return;

        const overClick = target.closest(clickSelector);
        const overText  = target.closest(textSelector);

        // Clickable (underscore) takes precedence over text (caret)
        if (overClick) {
            body.classList.add('cursor-hover-click');
        } else if (overText) {
            body.classList.add('cursor-hover-text');
        }
        // else: stays default square
    }

    function handleMouseMove(e) {
        const x = e.clientX;
        const y = e.clientY;
        cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        body.classList.add('cursor-visible');

        updateCursorShape(e.target);
    }

    window.addEventListener('mousemove', handleMouseMove);

    window.addEventListener('mouseleave', () => {
        body.classList.remove('cursor-visible');
        body.classList.remove('cursor-hover-text');
        body.classList.remove('cursor-hover-click');
    });
})();

/* ============================
 * 2. SCROLL REVEAL LOGIC
 * ============================ */
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);
const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach(el => observer.observe(el));


/* ============================
 * 3. TERMINAL MODAL LOGIC
 * ============================ */
const btnProceed = document.getElementById('btn-proceed');
const modal = document.getElementById('terminal-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('terminal-output');

const TARGET_URL = "https://github.com/acadhack/acadhack-gui/wiki";

btnProceed && btnProceed.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('active');
    termInput.value = '';
    termInput.focus();
});

modalOverlay && modalOverlay.addEventListener('click', () => {
    modal.classList.remove('active');
});

termInput && termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = this.value.trim().toLowerCase();

        const userLine = document.createElement('p');
        userLine.className = 'term-line';
        userLine.innerHTML = `<span class="prompt-user">root@acadhack:~</span> ${this.value}`;
        termOutput.appendChild(userLine);
        termOutput.parentElement.scrollTop = termOutput.parentElement.scrollHeight;

        this.value = '';

        if (command === 'yes' || command === 'y') {
            const successLine = document.createElement('p');
            successLine.className = 'term-line term-success';
            successLine.textContent = '> ACCESS GRANTED. INITIALIZING SEQUENCE...';
            termOutput.appendChild(successLine);

            this.disabled = true;

            setTimeout(() => {
                window.open(TARGET_URL, '_blank');
                modal.classList.remove('active');
                this.disabled = false;
                termOutput.innerHTML = '<p class="term-line">> INITIALIZING SETUP WIZARD...</p><p class="term-line">> ACCESS RESTRICTED.</p><p class="term-line">> DO YOU WISH TO PROCEED? (yes/no)</p>';
            }, 1500);

        } else {
            const errorLine = document.createElement('p');
            errorLine.className = 'term-line';
            errorLine.innerHTML = '> COMMAND UNRECOGNIZED. INPUT <span class="term-success">"yes"</span> TO CONFIRM.';
            termOutput.appendChild(errorLine);
            termOutput.parentElement.scrollTop = termOutput.parentElement.scrollHeight;
        }
    }
});

document.querySelector('.terminal-body') && document.querySelector('.terminal-body').addEventListener('click', () => {
    termInput && termInput.focus();
});


/* ============================
 * 4. EASTER EGG (improved)
 * ============================ */
const headerTerminal = document.getElementById('header-terminal');
const toastContainer = document.getElementById('toast-container');

let eggClicks = 0;
let eggTimer = null;
let eggCooldown = false;

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

function createToast(text, opts = {}) {
    const t = document.createElement('div');
    t.className = 'toast';
    if (opts.egg) t.classList.add('egg-toast');
    t.textContent = text;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3200);
    return t;
}

async function typeLineIntoTerminal(line, opts = {}) {
    const p = document.createElement('p');
    p.className = 'term-line';
    if (opts.success) p.classList.add('term-egg-success');
    const span = document.createElement('span');
    p.appendChild(span);
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '_';
    p.appendChild(cursor);
    termOutput.appendChild(p);
    termOutput.parentElement.scrollTop = termOutput.parentElement.scrollHeight;
    for (let i = 0; i < line.length; i++) {
        span.textContent += line[i];
        termOutput.parentElement.scrollTop = termOutput.parentElement.scrollHeight;
        await sleep(18 + Math.random() * 40);
    }
    cursor.remove();
    termOutput.parentElement.scrollTop = termOutput.parentElement.scrollHeight;
    return p;
}

async function triggerEasterEgg() {
    if (eggCooldown) return;
    eggCooldown = true;

    headerTerminal.classList.add('root-mode');
    headerTerminal.classList.add('pulse');
    setTimeout(() => headerTerminal.classList.remove('pulse'), 900);

    createToast('> ROOT ACCESS GRANTED', { egg: true });
    await sleep(650);
    createToast('> SYSTEM UNLOCKED', { egg: true });
    await sleep(650);
    createToast('> INITIALIZING SECURE CHANNEL...', { egg: true });
    await sleep(600);

    modal.classList.add('active');
    termOutput.innerHTML = '';
    await sleep(250);

    const lines = [
        { text: '> AUTH TOKENS VALIDATED', success: true },
        { text: '> ESTABLISHING SECURE CHANNEL', success: false },
        { text: '> DEPLOYING AGENT...', success: false },
        { text: '> READY. LAUNCH? (yes/no)', success: true }
    ];

    for (const Ln of lines) {
        await typeLineIntoTerminal(Ln.text, { success: Ln.success });
        await sleep(400 + Math.random() * 400);
    }

    termInput && termInput.focus();

    await sleep(8000);
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
    }
    setTimeout(() => { eggCooldown = false; }, 7000);
}

if (headerTerminal) {
    headerTerminal.addEventListener('click', () => {
        if (eggCooldown) return;
        eggClicks++;
        if (eggTimer) clearTimeout(eggTimer);
        eggTimer = setTimeout(() => { eggClicks = 0; }, 1000);
        if (eggClicks >= 3) {
            eggClicks = 0;
            triggerEasterEgg().catch(err => console.error('Easter egg failed:', err));
        }
    });
}
