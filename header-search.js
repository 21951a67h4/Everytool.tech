let fuse;
let searchData = [];
let isSearchInitialized = false;

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

class ErrorHandler {
    #errors = new Map();
    logError(error, context = {}) {
        const errorId = Date.now();
        this.#errors.set(errorId, {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
        console.error(`[Header Script] Error ${errorId}:`, error, context);
        return errorId;
    }
}
const errorHandler = new ErrorHandler();

// --- END: Global State & Utilities ---


// --- START: Search Data Handling ---

/**
 * Fetches the search index from `/search-index.json` and initializes 
 * the Fuse.js search instance.
 */
async function initUniversalSearch() {
    try {
        // ====== START: THIS IS THE CORRECTED CODE ======
        // Construct the absolute path to the search index file.
        // This is robust and works from any page on the site.
        const searchIndexPath = window.location.origin + '/search-index.json';
        const response = await fetch(searchIndexPath);
        // ====== END: THIS IS THE CORRECTED CODE ======

        if (!response.ok) {
            throw new Error(`Failed to fetch search-index.json: ${response.statusText}`);
        }
        const allPages = await response.json();
        
        searchData = allPages;

        const options = {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'content', weight: 0.3 }
            ],
            includeScore: true,
            threshold: 0.4,
            minMatchCharLength: 2,
        };

        if (typeof Fuse === 'undefined') {
            throw new Error('Fuse.js is not loaded. Please ensure the CDN script tag is in your HTML.');
        }

        fuse = new Fuse(searchData, options);
        isSearchInitialized = true;
        console.log('Universal search initialized successfully.');

    } catch (error) {
        errorHandler.logError(error, { context: 'initUniversalSearch' });
        throw error;
    }
}

/**
 * Performs a search against the initialized search index.
 * @param {string} query The user's search query.
 * @returns {Array} An array of search results.
 */
function performSearch(query) {
    if (!fuse) {
        console.warn('Search is not initialized yet.');
        return [];
    }
    return fuse.search(query);
}

// --- END: Search Data Handling ---


// --- START: Header UI Initialization ---

/**
 * Initializes all interactive parts of the header.
 * This function is called once the header HTML is in the DOM.
 */
function initializeHeader() {

    // --- 1. Basic Header Interactivity (Mobile Menu, Scroll, Active Link) ---
    try {
        const headerElement = document.querySelector('.header.glassy-header');
        if (!headerElement) throw new Error("Header element '.header.glassy-header' not found.");

        const mobileMenuButton = headerElement.querySelector('.header__mobile-menu');
        const navList = headerElement.querySelector('.header__nav-list');
        
        if (!mobileMenuButton || !navList) throw new Error("Mobile menu button or nav list not found.");

        let isMenuOpen = false;

        const toggleMenu = (shouldOpen) => {
            isMenuOpen = typeof shouldOpen === 'boolean' ? shouldOpen : !isMenuOpen;
            navList.classList.toggle('active', isMenuOpen);
            mobileMenuButton.setAttribute('aria-expanded', String(isMenuOpen));
            mobileMenuButton.classList.toggle('open', isMenuOpen);
            document.body.classList.toggle('menu-open', isMenuOpen);
        };

        mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        document.addEventListener('click', (e) => {
            if (isMenuOpen && !navList.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                toggleMenu(false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                toggleMenu(false);
            }
        });

        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 768 && isMenuOpen) {
                toggleMenu(false);
            }
        }, 250));

        window.addEventListener('scroll', debounce(() => {
            headerElement.classList.toggle('scrolled', window.scrollY > 50);
        }, 10), { passive: true });

        const navLinks = navList.querySelectorAll('.header__nav-link');
        const currentPath = window.location.pathname;
        let bestMatchLink = null;
        let longestMatchLength = -1;

        navLinks.forEach(link => {
            link.removeAttribute('aria-current');
            const linkPath = new URL(link.href, window.location.origin).pathname;
            const normalizedCurrentPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, "");
            const normalizedLinkPath = linkPath === '/' ? '/' : linkPath.replace(/\/$/, "");

            if (normalizedCurrentPath.startsWith(normalizedLinkPath) && normalizedLinkPath.length > longestMatchLength) {
                longestMatchLength = normalizedLinkPath.length;
                bestMatchLink = link;
            }
        });

        if (bestMatchLink) {
            bestMatchLink.setAttribute('aria-current', 'page');
            bestMatchLink.classList.add('active');
        }
    } catch (error) {
        errorHandler.logError(error, { context: 'Header Interactivity Setup' });
    }

    // --- 2. Search Popup Functionality ---
    try {
        const searchTrigger = document.querySelector('.header__search-btn');
        const popup = document.getElementById('searchPopup');
        const closeBtn = document.getElementById('searchPopupClose');
        const input = document.getElementById('searchPopupInput');
        const clearBtn = document.getElementById('searchPopupClearBtn');
        const resultsList = document.getElementById('searchPopupResultsList');
        const feedback = document.getElementById('searchPopupFeedback');

        if (!searchTrigger || !popup || !closeBtn || !input || !clearBtn || !resultsList || !feedback) {
            throw new Error("One or more search popup elements are missing from the DOM.");
        }

        const openPopup = async () => {
            popup.classList.add('is-open');
            document.body.classList.add('search-popup-open');
            popup.setAttribute('aria-hidden', 'false');
            input.focus();

            if (isSearchInitialized) return;

            try {
                feedback.textContent = 'Initializing search...';
                await initUniversalSearch();
                feedback.textContent = 'Ready to search.';
            } catch (error) {
                feedback.textContent = 'Error: Could not load search.';
            }
        };

        const closePopup = () => {
            popup.classList.remove('is-open');
            document.body.classList.remove('search-popup-open');
            popup.setAttribute('aria-hidden', 'true');
            input.value = '';
            resultsList.innerHTML = '';
            feedback.textContent = '';
        };

        const renderResults = (results) => {
            resultsList.innerHTML = '';
            if (results.length === 0) {
                feedback.textContent = 'No results found.';
                return;
            }

            feedback.textContent = '';
            const fragment = document.createDocumentFragment();
            results.slice(0, 10).forEach(result => {
                const li = document.createElement('li');
                li.className = 'search-popup__result-item';
                const a = document.createElement('a');
                a.href = result.item.url;
                a.textContent = result.item.title;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = a.href;
                    closePopup();
                });
                li.appendChild(a);
                fragment.appendChild(li);
            });
            resultsList.appendChild(fragment);
        };

        const handleSearch = (query) => {
            if (!isSearchInitialized) {
                feedback.textContent = 'Search is not ready yet.';
                return;
            }
            if (query.length >= 2) {
                const results = performSearch(query);
                renderResults(results);
            } else {
                resultsList.innerHTML = '';
                feedback.textContent = query.length > 0 ? 'Keep typing...' : 'Ready to search.';
            }
        };
        
        const debouncedSearch = debounce(handleSearch, 300);

        searchTrigger.addEventListener('click', openPopup);
        closeBtn.addEventListener('click', closePopup);
        input.addEventListener('input', (e) => {
            const query = e.target.value;
            clearBtn.classList.toggle('visible', query.length > 0);
            debouncedSearch(query.trim());
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            input.dispatchEvent(new Event('input'));
            input.focus();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('is-open')) {
                closePopup();
            }
        });
        
        popup.addEventListener('click', (e) => {
            if (e.target === popup) closePopup();
        });

        window.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                const activeEl = document.activeElement;
                if (popup.classList.contains('is-open') || (activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName))) {
                    return;
                }
                openPopup();
            }
        });
    } catch (error) {
        errorHandler.logError(error, { context: 'Search Popup Setup' });
    }
}

// --- END: Header UI Initialization ---