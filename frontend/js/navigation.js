// Navigation utilities
const addNavigation = () => {
    // Add back button
    const backButton = document.createElement('a');
    backButton.href = 'javascript:history.back()';
    backButton.className = 'nav-back-button';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back';
    document.body.appendChild(backButton);

    // Add navigation menu
    const navMenu = document.createElement('div');
    navMenu.className = 'nav-menu';

    // Common navigation links
    const links = [
        { url: 'homepage.html', text: 'Home' },
        { url: 'Appointment.html', text: 'Appointments' },
        { url: 'Diagnostics.html', text: 'Diagnostics' },
        { url: 'EPrescription.html', text: 'E-Prescription' },
        { url: 'finddoc.html', text: 'Find Doctor' },
        { url: 'History.html', text: 'History' },
        { url: 'Videocall.html', text: 'Video Call' }
    ];

    // Add links to menu
    links.forEach(link => {
        if (window.location.pathname.toLowerCase() !== '/' + link.url.toLowerCase()) {
            const a = document.createElement('a');
            a.href = link.url;
            a.className = 'nav-menu-item';
            a.textContent = link.text;
            navMenu.appendChild(a);
        }
    });

    document.body.appendChild(navMenu);
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Don't add navigation to login and register pages
    if (!window.location.pathname.toLowerCase().includes('login.html') && 
        !window.location.pathname.toLowerCase().includes('register.html')) {
        addNavigation();
    }
});