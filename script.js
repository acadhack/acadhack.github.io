const toggleButton = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// 1. Theme Logic
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    htmlElement.setAttribute('data-theme', currentTheme);
} else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        htmlElement.setAttribute('data-theme', 'light');
    }
}

toggleButton.addEventListener('click', () => {
    let theme = htmlElement.getAttribute('data-theme');
    if (theme === 'dark') {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});

// 2. Scroll Reveal Logic
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
   3. TERMINAL MODAL LOGIC
   ============================ */
const btnProceed = document.getElementById('btn-proceed');
const modal = document.getElementById('terminal-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('terminal-output');

const TARGET_URL = "https://github.com/acadhack/acadhack-gui/wiki";

btnProceed.addEventListener('click', (e) => {
    e.preventDefault(); 
    modal.classList.add('active');
    termInput.value = ''; 
    termInput.focus();
});

modalOverlay.addEventListener('click', () => {
    modal.classList.remove('active');
});

termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = this.value.trim().toLowerCase();
        
        const userLine = document.createElement('p');
        userLine.className = 'term-line';
        userLine.innerHTML = `<span class="prompt-user">root@acadhack:~</span> ${this.value}`;
        termOutput.appendChild(userLine);
        
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
            
            const termBody = document.querySelector('.terminal-body');
            termBody.scrollTop = termBody.scrollHeight;
        }
    }
});

document.querySelector('.terminal-body').addEventListener('click', () => {
    termInput.focus();
});


/* ============================
   4. EASTER EGG LOGIC
   ============================ */
const headerTerminal = document.getElementById('header-terminal');
const toastContainer = document.getElementById('toast-container');
let eggClicks = 0;

headerTerminal.addEventListener('click', () => {
    eggClicks++;
    if (eggClicks === 3) {
        // Change text and style
        headerTerminal.innerText = 'root@system:#';
        headerTerminal.classList.add('root-mode');
        
        // Create Toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = '> ROOT ACCESS GRANTED // SYSTEM UNLOCKED';
        toastContainer.appendChild(toast);
        
        // Remove toast DOM element after animation
        setTimeout(() => {
            toast.remove();
        }, 4000);
        
        // Prevent spamming (optional, reset if you want it repeatable)
        eggClicks = 0; 
    }
});
