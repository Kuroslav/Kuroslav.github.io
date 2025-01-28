document.addEventListener('DOMContentLoaded', () => {
    const openButtons = document.querySelectorAll('[id^="open"]');
    const closeButtons = document.querySelectorAll('.close');
    const modals = document.querySelectorAll('.modal-container');

    // Open modal
    openButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.id.replace('open', 'modal_container');
            const modal = document.getElementById(modalId);
            modal.classList.add('show');
        });
    });

    // Close modal
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            modal.classList.remove('show');
        });
    });

    // Close modal on clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Slider functionality
    const sliders = document.querySelectorAll('.slider');

    sliders.forEach(slider => {
        const slides = slider.querySelectorAll('.slide');
        const prevButton = slider.querySelector('.prev');
        const nextButton = slider.querySelector('.next');

        let currentIndex = 0;

        const updateSlides = () => {
            // Update active slide
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentIndex);
            });

            // Show/hide navigation buttons
            prevButton.style.display = currentIndex === 0 ? 'none' : 'block';
            nextButton.style.display = currentIndex === slides.length - 1 ? 'none' : 'block';
        };

        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlides();
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
                updateSlides();
            }
        });

        // Initialize the first slide and buttons
        updateSlides();
    });
});
