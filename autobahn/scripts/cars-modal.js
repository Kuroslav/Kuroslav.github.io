document.addEventListener('DOMContentLoaded', () =>{
    const openButtons = [
        {buttonId: 'open1', modalId: 'modal_container1'},
        {buttonId: 'open2', modalId: 'modal_container2'},
        {buttonId: 'open3', modalId: 'modal_container3'},
        {buttonId: 'open4', modalId: 'modal_container4'},
    ];

    openButtons.forEach(({ buttonId, modalId }) => {
        const button = document.getElementById(buttonId);
        const modal = document.getElementById(modalId);

        button.addEventListener('click', () => {
            modal.classList.add('show');
        });
    });

    // Close buttons
    const closeButtons = document.querySelectorAll('.close');

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            modal.classList.remove('show');
        });
    });
});