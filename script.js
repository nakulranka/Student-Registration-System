// Function to handle navigation link clicks
document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', function(event) {
        const pageName = this.getAttribute('href').split('.')[0];
        console.log(`Navigating to ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`);
    });
});

  
  