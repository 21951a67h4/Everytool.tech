function animateNumbers() {
    const numbers = document.querySelectorAll('.trust__number');
    const animatedNumbers = new Set();

    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedNumbers.has(entry.target)) {
                const number = entry.target;
                animatedNumbers.add(number);

                const target = parseFloat(number.dataset.target);
                const suffix = number.dataset.suffix || '';
                const duration = 2000;
                const steps = 60;
                const stepDuration = duration / steps;

                let current = 0;
                const increment = target / steps;
                const isDecimal = target % 1 !== 0;
                const decimals = isDecimal ? 1 : 0;

                const updateNumber = () => {
                    current += increment;
                    if (current <= target) {
                        number.textContent = current.toLocaleString('en-US', {
                            minimumFractionDigits: decimals,
                            maximumFractionDigits: decimals
                        }) + suffix;

                        number.classList.add('animate');

                        requestAnimationFrame(() => {
                            setTimeout(updateNumber, stepDuration);
                        });
                    } else {
                        number.textContent = target.toLocaleString('en-US', {
                            minimumFractionDigits: decimals,
                            maximumFractionDigits: decimals
                        }) + suffix;

                        setTimeout(() => {
                            number.classList.remove('animate');
                        }, 300);
                    }
                };

                updateNumber();
                observer.unobserve(number);
            }
        });
    }, options);

    numbers.forEach(number => {
        observer.observe(number);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Always run trust section animation
    animateNumbers();

    const mobileMenuButton = document.querySelector('.header__mobile-menu');
    const navList = document.querySelector('.header__nav-list');
    let isMenuOpen = false;

    function toggleMenu(shouldOpen) {
        isMenuOpen = typeof shouldOpen === 'boolean' ? shouldOpen : !isMenuOpen;
        navList.classList.toggle('active', isMenuOpen);
        mobileMenuButton.setAttribute('aria-expanded', isMenuOpen.toString());
        
        // Toggle menu icon animation
        mobileMenuButton.classList.toggle('open', isMenuOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    mobileMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !e.target.closest('.header__nav')) {
            toggleMenu(false);
        }
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu(false);
        }
    });

    // Close menu on resize if moving to desktop view
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768 && isMenuOpen) {
                toggleMenu(false);
            }
        }, 250);
    });

    // Intersection Observer for animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    // Observe category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        observer.observe(card);
    });

    // Observe popular tool cards
    const popularToolCards = document.querySelectorAll('.popular-tool-card');
    popularToolCards.forEach(card => {
        observer.observe(card);
    });

    // Observe testimonial cards
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        observer.observe(card);
    });

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = function() {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Error handling utility
    const ErrorHandler = {
        errors: new Map(),
        
        addError(type, message) {
            this.errors.set(type, message);
            this.showError(type);
        },
        
        clearError(type) {
            this.errors.delete(type);
            this.hideError(type);
        },
        
        showError(type) {
            const errorElement = document.querySelector(`.hero__search-error[data-error="${type}"]`);
            if (errorElement) {
                errorElement.textContent = this.errors.get(type);
                errorElement.hidden = false;
            }
        },
        
        hideError(type) {
            const errorElement = document.querySelector(`.hero__search-error[data-error="${type}"]`);
            if (errorElement) {
                errorElement.hidden = true;
                errorElement.textContent = '';
            }
        },
        
        hasErrors() {
            return this.errors.size > 0;
        }
    };

    // Search functionality (with null checks)
    const searchForm = document.querySelector('.hero__search');
    let searchInput, searchButton, clearButton, searchResults, searchResultsContent, searchError;
    if (searchForm) {
        searchInput = searchForm.querySelector('.hero__search-input');
        searchButton = searchForm.querySelector('.hero__search-button');
        clearButton = searchForm.querySelector('.hero__search-clear');
        searchResults = searchForm.querySelector('.hero__search-results');
        searchResultsContent = searchForm.querySelector('.hero__search-results-content');
        searchError = searchForm.querySelector('.hero__search-error');
        const popularTags = document.querySelectorAll('.hero__popular-tag');

        let searchTimeout;
        let isSearching = false;

        // Show/hide clear button based on input
        searchInput.addEventListener('input', () => {
            clearButton.classList.toggle('visible', searchInput.value.length > 0);
            ErrorHandler.clearError('search');
        });

        // Clear search
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            clearButton.classList.remove('visible');
            searchInput.focus();
            hideResults();
            ErrorHandler.clearError('search');
        });

        // Handle search submission
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await performSearch();
        });

        // Handle popular tag clicks
        popularTags.forEach(tag => {
            tag.addEventListener('click', () => {
                searchInput.value = tag.textContent;
                clearButton.classList.add('visible');
                performSearch();
            });
        });

        // Debounced search on input
        const debouncedSearch = debounce(async () => {
            if (searchInput.value.length >= 2) {
                await performSearch();
            } else {
                hideResults();
            }
        }, 300);

        searchInput.addEventListener('input', debouncedSearch);

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target)) {
                hideResults();
            }
        });

        // Handle keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideResults();
            }
        });

        // Static tool data for instant search
        const allTools = [
            {
                title: 'PDF to Word Converter',
                description: 'Convert PDF documents to editable Word files with high accuracy',
                icon: 'file-pdf',
                url: '/pdf-to-word'
            },
            {
                title: 'Image to PDF Converter',
                description: 'Convert images to PDF format while maintaining quality',
                icon: 'image',
                url: '/image-to-pdf'
            },
            {
                title: 'Password Generator',
                description: 'Create strong, secure passwords with custom requirements',
                icon: 'key',
                url: '/password-generator'
            },
            {
                title: 'JSON Formatter',
                description: 'Format and validate JSON data with syntax highlighting',
                icon: 'code',
                url: '/json-formatter'
            },
            {
                title: 'SEO Analyzer',
                description: 'Analyze your website SEO and get actionable insights',
                icon: 'search',
                url: '/seo-tools'
            },
            {
                title: 'Image Optimizer',
                description: 'Compress and optimize images without losing quality',
                icon: 'image',
                url: '/image-optimizer'
            },
            {
                title: 'Code Beautifier',
                description: 'Format and beautify your code with syntax highlighting',
                icon: 'code',
                url: '/code-beautifier'
            }
        ];

        // Update performSearch to redirect if found, else show error
        async function performSearch() {
            const query = searchInput.value.trim();
            if (!query) {
                hideLoading();
                ErrorHandler.addError('search', 'Please enter a search term');
                return;
            }

            showLoading();
            hideError();

            setTimeout(() => {
                // Find the first matching tool (title or description)
                const result = allTools.find(tool =>
                    tool.title.toLowerCase().includes(query.toLowerCase()) ||
                    tool.description.toLowerCase().includes(query.toLowerCase())
                );
                if (result) {
                    window.location.href = result.url;
                } else {
                    hideLoading();
                    ErrorHandler.addError('search', `No tool found matching your search.<br><button class='search-retry-btn' style='margin-left:8px;padding:0.3em 1em;border-radius:1em;border:none;background:#4361EE;color:#fff;cursor:pointer;'>Retry</button>`);
                    // Add retry handler
                    setTimeout(() => {
                        const retryBtn = document.querySelector('.search-retry-btn');
                        if (retryBtn) {
                            retryBtn.onclick = () => {
                                ErrorHandler.clearError('search');
                                searchInput.focus();
                            };
                        }
                    }, 10);
                }
            }, 500); // Short delay for loading effect
        }

        function displayResults(results) {
            searchResultsContent.innerHTML = ''; // Clear existing content

            if (results.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                
                const icon = document.createElement('i');
                icon.className = 'fas fa-search';
                icon.style.fontSize = '2rem';
                icon.style.color = '#cbd5e1';
                icon.style.marginBottom = '1rem';
                
                const message = document.createElement('p');
                message.textContent = 'No tools found matching your search.';
                
                const suggestion = document.createElement('p');
                suggestion.textContent = 'Try different keywords or browse our categories below.';
                suggestion.style.fontSize = '0.9rem';
                suggestion.style.color = '#94a3b8';
                suggestion.style.marginTop = '0.5rem';
                
                noResults.appendChild(icon);
                noResults.appendChild(message);
                noResults.appendChild(suggestion);
                searchResultsContent.appendChild(noResults);
            } else {
                results.forEach(result => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    
                    const title = document.createElement('h3');
                    const icon = document.createElement('i');
                    icon.className = `fas fa-${result.icon || 'tools'}`;
                    icon.style.marginRight = '0.5rem';
                    icon.style.color = '#3b7bbc';
                    
                    title.appendChild(icon);
                    title.appendChild(document.createTextNode(result.title));
                    
                    const description = document.createElement('p');
                    description.textContent = result.description;
                    
                    resultItem.appendChild(title);
                    resultItem.appendChild(description);
                    searchResultsContent.appendChild(resultItem);
                });
            }

            // Announce results for screen readers
            const resultCount = results.length;
            const message = resultCount === 0 
                ? 'No results found' 
                : `Found ${resultCount} result${resultCount === 1 ? '' : 's'}`;
            
            // Create and update aria-live region
            let announcer = document.getElementById('search-announcer');
            if (!announcer) {
                announcer = document.createElement('div');
                announcer.id = 'search-announcer';
                announcer.setAttribute('aria-live', 'polite');
                announcer.className = 'sr-only';
                document.body.appendChild(announcer);
            }
            announcer.textContent = message;
        }

        function showLoading() {
            searchButton.classList.add('loading');
            searchButton.disabled = true;
            searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Searching...</span>';
        }

        function hideLoading() {
            searchButton.classList.remove('loading');
            searchButton.disabled = false;
            searchButton.innerHTML = '<i class="fas fa-search"></i><span>Search</span>';
        }

        function hideResults() {
            searchResults.classList.remove('visible');
            searchResults.hidden = true;
            searchInput.setAttribute('aria-expanded', 'false');
        }

        // Voice search functionality
        const micButton = searchForm.querySelector('.hero__search-mic');
        const micTooltip = micButton.querySelector('.hero__search-mic-tooltip');
        let recognition = null;

        // Initialize speech recognition
        function initSpeechRecognition() {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                micButton.style.display = 'none';
                return;
            }

            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                micButton.classList.add('listening');
                micTooltip.textContent = 'Listening...';
                micTooltip.style.background = '#dc2626';
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                searchInput.value = transcript;
                clearButton.classList.add('visible');
                performSearch();
            };

            recognition.onerror = (event) => {
                handleSpeechError(event.error);
            };

            recognition.onend = () => {
                micButton.classList.remove('listening');
                micTooltip.textContent = 'Click to search by voice';
                micTooltip.style.background = '#333';
            };
        }

        function handleSpeechError(error) {
            let errorMessage = 'Sorry, there was an error with voice recognition.';
            
            switch (error) {
                case 'not-allowed':
                case 'permission-denied':
                    errorMessage = 'Please allow microphone access to use voice search.';
                    break;
                case 'no-speech':
                    errorMessage = 'No speech was detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone was found. Please check your device.';
                    break;
                case 'network':
                    errorMessage = 'Network error occurred. Please check your connection.';
                    break;
            }

            ErrorHandler.addError('speech', errorMessage);
            micButton.classList.remove('listening');
            micTooltip.textContent = 'Click to search by voice';
            micTooltip.style.background = '#333';
        }

        micButton.addEventListener('click', () => {
            if (!recognition) {
                initSpeechRecognition();
            }

            if (micButton.classList.contains('listening')) {
                recognition.stop();
            } else {
                try {
                    recognition.start();
                } catch (error) {
                    handleSpeechError(error);
                }
            }
        });

        // Initialize speech recognition on page load
        initSpeechRecognition();
    }

    // FAQ Accordion Functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');
        
        // Set initial state
        answer.style.maxHeight = '0px';
        answer.style.opacity = '0';
        
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherItem.querySelector('.faq-question i');
                    otherItem.classList.remove('active');
                    otherAnswer.style.maxHeight = '0px';
                    otherAnswer.style.opacity = '0';
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            const isActive = item.classList.contains('active');
            item.classList.toggle('active');
            
            if (isActive) {
                answer.style.maxHeight = '0px';
                answer.style.opacity = '0';
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.opacity = '1';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}); 