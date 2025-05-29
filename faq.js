// FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Function to initialize FAQ functionality
    function initializeFAQ(selector) {
        const faqItems = document.querySelectorAll(selector);
        const questionSelector = selector === '.faq-item' ? '.faq-question' : '.tools-faq-question';

        faqItems.forEach(item => {
            const question = item.querySelector(questionSelector);
            
            question.addEventListener('click', () => {
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current FAQ item
                item.classList.toggle('active');
            });

            // Add keyboard navigation
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });

            // Make the question focusable
            question.setAttribute('tabindex', '0');
            question.setAttribute('role', 'button');
            question.setAttribute('aria-expanded', 'false');
            
            // Update ARIA attributes when toggled
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                question.setAttribute('aria-expanded', isActive);
            });
        });
    }

    // Initialize both types of FAQ sections
    initializeFAQ('.faq-item');
    initializeFAQ('.tools-faq-item');
}); 