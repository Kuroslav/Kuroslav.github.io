document.addEventListener('DOMContentLoaded', function() {
    // Set your hardcoded target date here (YYYY, MM-1, DD, HH, MM, SS)
    const targetDate = new Date(2025, 11, 28, 60, 60, 60); // January 1, 2025
    
    // Display the target date
    document.getElementById('target-date-display').textContent = targetDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Start countdown immediately
    updateCountdown(targetDate);
    const countdownInterval = setInterval(() => updateCountdown(targetDate), 1000);
    
    function updateCountdown(targetDate) {
        const now = new Date();
        const difference = targetDate - now;
        
        if (difference <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            document.getElementById('event-title').textContent = "The event has started!";
            document.getElementById('event-title').style.color = "var(--accent)";
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
});