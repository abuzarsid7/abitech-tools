console.log("Abitech Tools Loaded");

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburgerLines = document.querySelectorAll('.hamburger-line');

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      
      // Animate hamburger lines
      hamburgerLines[0].classList.toggle('rotate-45');
      hamburgerLines[0].classList.toggle('translate-y-2');
      hamburgerLines[1].classList.toggle('opacity-0');
      hamburgerLines[2].classList.toggle('-rotate-45');
      hamburgerLines[2].classList.toggle('-translate-y-2');
    });

    // Close menu when a link is clicked
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        hamburgerLines[0].classList.remove('rotate-45', 'translate-y-2');
        hamburgerLines[1].classList.remove('opacity-0');
        hamburgerLines[2].classList.remove('-rotate-45', '-translate-y-2');
      });
    });
  }
});