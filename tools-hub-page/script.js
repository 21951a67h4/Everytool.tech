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

    if (mobileMenuButton && nav) {
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
    }

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

    // Search and Filter functionality
    const searchInput = document.querySelector('.search-input');
    const clearSearchButton = document.querySelector('.clear-search');
    const toolCards = document.querySelectorAll('.tool-card');
    const filterButtons = document.querySelectorAll('.filter-button');

    if (!searchInput || !clearSearchButton || toolCards.length === 0 || filterButtons.length === 0) {
        console.error('Required elements not found');
        return;
    }

    // Add data-category attributes to tool cards
    toolCards.forEach(card => {
        const toolName = card.querySelector('.tool-name').textContent.toLowerCase();
        let category = 'all';
        
        if (toolName.includes('calculator')) category = 'calculators';
        else if (toolName.includes('converter')) category = 'converters';
        else if (toolName.includes('generator')) category = 'generators';
        else if (toolName.includes('text') || toolName.includes('case') || toolName.includes('markdown')) category = 'text';
        else if (toolName.includes('image') || toolName.includes('color')) category = 'image';
        
        card.setAttribute('data-category', category);
    });

    // Search input event listener
    searchInput.addEventListener('input', () => {
        clearSearchButton.style.display = searchInput.value ? 'block' : 'none';
        filterTools();
    });

    // Clear search button event listener
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchButton.style.display = 'none';
        filterTools();
        searchInput.focus();
    });

    // Filter buttons event listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterTools();
        });
    });

    // Filter tools function
    function filterTools() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activeFilter = document.querySelector('.filter-button.active').getAttribute('data-category');

        toolCards.forEach(card => {
            const toolName = card.querySelector('.tool-name').textContent.toLowerCase();
            const toolDescription = card.querySelector('.tool-description').textContent.toLowerCase();
            const toolCategory = card.getAttribute('data-category');

            const matchesSearch = searchTerm === '' || 
                                toolName.includes(searchTerm) || 
                                toolDescription.includes(searchTerm);
            const matchesFilter = activeFilter === 'all' || toolCategory === activeFilter;

            if (matchesSearch && matchesFilter) {
                card.style.display = 'flex';
                card.classList.add('animate-fade-up');
            } else {
                card.style.display = 'none';
                card.classList.remove('animate-fade-up');
            }
        });
    }

    // Initialize the filter
    filterTools();
}); 