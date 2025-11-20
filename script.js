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

// 2. Scroll Reveal Logic (Intersection Observer)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach(el => observer.observe(el));
