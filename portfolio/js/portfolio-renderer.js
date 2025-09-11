class PortfolioRenderer {
    constructor() {
        this.data = null;
        this.grid = null;
        this.observer = null;
    }

    async init() {
        try {
            // Load portfolio data
            const response = await fetch('./data/portfolio-data.json');
            this.data = await response.json();

            // Get DOM elements
            this.grid = document.getElementById('portfolio-grid');

            if (!this.grid) {
                throw new Error('Portfolio grid element not found');
            }

            // Render portfolio items
            this.renderItems();

            // Initialize filters
            this.initializeFilters();

            // Setup intersection observer for animations
            this.setupIntersectionObserver();

            // Initial filter application
            const initialFilter = this.getInitialFilter();
            this.applyFilter(initialFilter);

        } catch (error) {
            console.error('Failed to initialize portfolio:', error);
            // Fallback to existing hardcoded content
        }
    }

    renderItems() {
        // Clear existing content
        this.grid.innerHTML = '';

        // Sort items by priority
        const sortedItems = [...this.data.items].sort((a, b) => a.priority - b.priority);

        // Render each item
        sortedItems.forEach(item => {
            const cardElement = this.createCardElement(item);
            this.grid.appendChild(cardElement);
        });
    }

    createCardElement(item) {
        const article = document.createElement('article');
        article.className = 'card';
        article.dataset.cat = item.categories.join(' ');

        // Create thumbnail
        const thumbnailLink = document.createElement('a');
        thumbnailLink.className = 'thumb';
        thumbnailLink.href = this.getPrimaryUrl(item);

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = item.thumbnail.src;
        img.alt = item.thumbnail.alt;

        thumbnailLink.appendChild(img);

        // Create divider
        const divider = document.createElement('div');
        divider.className = 'divider';

        // Create body
        const body = document.createElement('div');
        body.className = 'body';

        // Title
        const title = document.createElement('h3');
        title.className = 'subtitle';
        title.textContent = item.title;

        // Description
        const desc = document.createElement('p');
        desc.className = 'desc';
        desc.textContent = item.description;

        // Buttons
        const buttonsContainer = this.createButtons(item.buttons);

        // Assemble body
        body.appendChild(title);
        body.appendChild(desc);
        if (buttonsContainer) {
            body.appendChild(buttonsContainer);
        }

        // Assemble card
        article.appendChild(thumbnailLink);
        article.appendChild(divider);
        article.appendChild(body);

        return article;
    }

    createButtons(buttons) {
        if (!buttons || buttons.length === 0) return null;

        if (buttons.length === 1) {
            // Single button - render directly
            return this.createButton(buttons[0]);
        } else {
            // Multiple buttons - wrap in container
            const container = document.createElement('div');
            container.className = 'button-group';
            container.style.display = 'flex';
            container.style.gap = '8px';
            container.style.flexWrap = 'wrap';

            buttons.forEach(buttonData => {
                const button = this.createButton(buttonData);
                container.appendChild(button);
            });

            return container;
        }
    }

    createButton(buttonData) {
        const button = document.createElement('a');
        button.className = 'btn';
        button.href = buttonData.url;
        button.textContent = buttonData.text;

        // Add button type class for styling
        if (buttonData.type) {
            button.classList.add(`btn--${buttonData.type}`);
        }

        // Handle external links
        if (buttonData.url.startsWith('http') || buttonData.url.startsWith('//')) {
            button.target = '_blank';
            button.rel = 'noopener noreferrer';
        }

        return button;
    }

    getPrimaryUrl(item) {
        // Return the URL of the first button, or '#' if no buttons
        return item.buttons && item.buttons.length > 0 ? item.buttons[0].url : '#';
    }

    initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                this.applyFilter(filter);
            });
        });
    }

    applyFilter(filterName) {
        const key = filterName.toLowerCase();
        const cards = Array.from(this.grid.querySelectorAll('.card'));
        const buttons = Array.from(document.querySelectorAll('.filter-btn'));

        // Update button states
        buttons.forEach(button => {
            button.setAttribute(
                'aria-pressed',
                button.dataset.filter === key ? 'true' : 'false'
            );
        });

        // Show/hide cards
        cards.forEach(card => {
            const categories = (card.getAttribute('data-cat') || '')
                .toLowerCase()
                .split(/\s+/);
            const show = key === 'all' || categories.includes(key);
            card.classList.toggle('is-hidden', !show);

            if (show) {
                // Reset visibility to allow re-animation
                card.classList.remove('is-visible');
            }
        });

        // Update hash for deep linking
        if (location.hash.replace('#', '') !== key) {
            history.replaceState(null, '', '#' + key);
        }

        // Re-observe visible cards for animation
        this.observeVisibleCards();
    }

    getInitialFilter() {
        // Check URL hash for initial filter
        const hashFilter = (location.hash || '#all').replace('#', '').toLowerCase();
        const validFilters = Object.keys(this.data.categories);
        return validFilters.includes(hashFilter) ? hashFilter : 'all';
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -10% 0px',
                threshold: 0.08
            }
        );
    }

    observeVisibleCards() {
        const visibleCards = this.grid.querySelectorAll('.card:not(.is-hidden)');
        visibleCards.forEach(card => {
            if (!card.classList.contains('is-visible')) {
                this.observer.observe(card);
            }
        });
    }

    // Method to add new items dynamically
    addItem(itemData) {
        this.data.items.push(itemData);
        this.renderItems();
        this.observeVisibleCards();
    }

    // Method to update existing item
    updateItem(itemId, newData) {
        const index = this.data.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.data.items[index] = { ...this.data.items[index], ...newData };
            this.renderItems();
            this.observeVisibleCards();
        }
    }

    // Method to remove item
    removeItem(itemId) {
        this.data.items = this.data.items.filter(item => item.id !== itemId);
        this.renderItems();
        this.observeVisibleCards();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new PortfolioRenderer();
    portfolio.init();

    // Make available globally for debugging/admin functions
    window.portfolioRenderer = portfolio;
});
