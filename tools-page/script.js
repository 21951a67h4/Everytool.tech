document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu functionality
    const mobileMenuButton = document.querySelector('.header__mobile-menu');
    const nav = document.querySelector('.header__nav-list');

    mobileMenuButton.addEventListener('click', () => {
        mobileMenuButton.classList.toggle('active');
        nav.classList.toggle('active');
        mobileMenuButton.setAttribute('aria-expanded', 
            mobileMenuButton.classList.contains('active'));
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header__nav') && nav.classList.contains('active')) {
            mobileMenuButton.classList.remove('active');
            nav.classList.remove('active');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
        }
    });

    // Add animation classes to elements
    const animateElements = document.querySelectorAll('.tool-card, .tools-faq-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animateElements.forEach(element => {
        observer.observe(element);
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const toolCards = document.querySelectorAll('.tool-card');
    const filterButtons = document.querySelectorAll('.filter-button');

    searchInput.addEventListener('input', filterTools);
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterTools();
        });
    });

    function filterTools() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-button.active').textContent;

        toolCards.forEach(card => {
            const toolName = card.querySelector('.tool-name').textContent.toLowerCase();
            const toolDescription = card.querySelector('.tool-description').textContent.toLowerCase();
            const toolCategory = card.getAttribute('data-category') || 'All';

            const matchesSearch = toolName.includes(searchTerm) || 
                                toolDescription.includes(searchTerm);
            const matchesFilter = activeFilter === 'All' || toolCategory === activeFilter;

            card.style.display = matchesSearch && matchesFilter ? 'flex' : 'none';
        });
    }
}); 