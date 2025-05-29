// Search functionality implementation
class SearchManager {
    constructor() {
        this.searchInput = document.querySelector('.custom-search-input');
        this.clearButton = document.querySelector('.custom-search-clear');
        this.micButton = document.querySelector('.custom-search-mic');
        this.searchButton = document.querySelector('.custom-search-btn');
        this.searchWrapper = document.querySelector('.custom-search-bar-wrapper');
        this.dropdown = null;
        this.recognition = null;
        this.isListening = false;
        this.debounceTimer = null;
        this.tools = [
            {
                name: 'PDF to Word Converter',
                description: 'Convert PDFs to editable Word documents',
                icon: 'fa-file-pdf',
                url: '/pdf-to-word'
            },
            {
                name: 'Image Compressor',
                description: 'Optimize images without quality loss',
                icon: 'fa-image',
                url: '/image-compressor'
            },
            {
                name: 'Password Generator',
                description: 'Create strong, secure passwords instantly',
                icon: 'fa-key',
                url: '/password-generator'
            },
            {
                name: 'JSON Formatter',
                description: 'Format and validate JSON data',
                icon: 'fa-code',
                url: '/json-formatter'
            },
            {
                name: 'Unit Converter',
                description: 'Convert between different units of measurement',
                icon: 'fa-exchange-alt',
                url: '/unit-converter'
            }
        ];

        this.init();
    }

    init() {
        // Create dropdown element
        this.createDropdown();
        
        // Initialize speech recognition
        this.initSpeechRecognition();
        
        // Add event listeners
        this.addEventListeners();
    }

    createDropdown() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'search-dropdown';
        this.searchWrapper.appendChild(this.dropdown);
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.searchInput.value = transcript;
                this.handleSearch(transcript);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.micButton.classList.remove('listening');
            };
        }
    }

    addEventListeners() {
        // Input event for search
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
            // Show/hide clear button
            if (this.searchInput.value.length > 0) {
                this.clearButton.style.display = 'flex';
            } else {
                this.clearButton.style.display = 'none';
            }
        });

        // Clear button click
        this.clearButton.addEventListener('click', () => {
            this.searchInput.value = '';
            this.clearButton.style.display = 'none';
            this.hideDropdown();
            this.searchInput.focus();
        });

        // Mic button click
        this.micButton.addEventListener('click', () => {
            if (!this.recognition) {
                alert('Speech recognition is not supported in your browser.');
                return;
            }

            if (this.isListening) {
                this.recognition.stop();
            } else {
                this.recognition.start();
                this.isListening = true;
                this.micButton.classList.add('listening');
            }
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!this.searchWrapper.contains(e.target)) {
                this.hideDropdown();
            }
        });

        // Close dropdown on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideDropdown();
            }
        });

        // Search button click
        this.searchButton.addEventListener('click', () => {
            this.handleSearch(this.searchInput.value);
        });
    }

    handleSearch(query) {
        query = query.trim().toLowerCase();
        
        if (query.length < 1) {
            this.hideDropdown();
            return;
        }

        const results = this.tools.filter(tool => 
            tool.name.toLowerCase().includes(query) || 
            tool.description.toLowerCase().includes(query)
        );

        this.showResults(results);
    }

    showResults(results) {
        if (results.length === 0) {
            this.dropdown.innerHTML = `
                <div class="search-dropdown-item no-results">
                    <i class="fas fa-search"></i>
                    <span>No tools found</span>
                </div>
            `;
        } else {
            this.dropdown.innerHTML = results.map(tool => `
                <a href="${tool.url}" class="search-dropdown-item">
                    <i class="fas ${tool.icon}"></i>
                    <div class="search-dropdown-item-content">
                        <div class="search-dropdown-item-title">${tool.name}</div>
                        <div class="search-dropdown-item-description">${tool.description}</div>
                    </div>
                </a>
            `).join('');
        }

        this.dropdown.style.display = 'block';
    }

    hideDropdown() {
        this.dropdown.style.display = 'none';
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SearchManager();
}); 