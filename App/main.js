document.addEventListener("DOMContentLoaded", () => {
    // Smooth navigation only for sections that exist on this landing page.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    // training.html is intentionally NOT intercepted.
    // When the team creates that file, both Start Training buttons will open it.

    // Reveal content sections as the user scrolls.
    const revealItems = document.querySelectorAll(
        ".step-card, .scenario-card, .trainer-layout, .about-section, .training-cta"
    );

    revealItems.forEach(item => item.classList.add("reveal-ready"));

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealItems.forEach(item => observer.observe(item));

    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener("click", () => {
            console.log("Opening SafeAR dashboard in a new tab.");
        });
    });
});