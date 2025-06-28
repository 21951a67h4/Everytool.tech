/**
 * Initializes an interactive, auto-scrolling, and draggable "Top Tools Scroller" component.
 *
 * This function is designed to be called after the component's HTML has been injected
 * into the DOM (e.g., via fetch + innerHTML). It is idempotent, meaning it can be
 * called multiple times on the same element without causing issues.
 *
 * @param {HTMLElement} containerElement The main container element for the scroller,
 * which should have the class `.tools-scroller-section`.
 */
export function initTopToolsScroller(containerElement) {
    // 1. --- SAFETY & IDEMPOTENCY CHECKS ---
    // Exit if the container doesn't exist or is already initialized.
    if (!containerElement || containerElement.dataset.scrollerInitialized) {
        return;
    }

    const scroller = containerElement.querySelector('.tools-scroller');

    // Exit if the inner scroller element isn't found.
    if (!scroller) {
        console.error('Initialization failed: .tools-scroller element not found inside the container.');
        return;
    }

    // 2. --- DYNAMIC CONTENT GENERATION ---
    // Data for the scroller items. In a real application, this could be passed
    // as an argument or read from a data-* attribute.
    const tools = [
        { name: 'Figma', url: 'https://contact.everytool.tech' },
        { name: 'Visual Studio Code', url: 'https://contact.everytool.tech' },
        { name: 'GitHub', url: 'https://contact.everytool.tech' },
        { name: 'Notion', url: 'https://contact.everytool.tech' },
        { name: 'Slack', url: 'https://contact.everytool.tech' },
        { name: 'Jira', url: 'https://contact.everytool.tech' },
        { name: 'Postman', url: 'https://contact.everytool.tech' },
        { name: 'Docker', url: 'https://contact.everytool.tech' },
        { name: 'Netflix', url: 'https://contact.everytool.tech' },
        { name: 'React', url: 'https://contact.everytool.tech' },
        { name: 'Vue.js', url: 'https://contact.everytool.tech' },
        { name: 'Svelte', url: 'https://contact.everytool.tech' },
        { name: 'Next.js', url: 'https://contact.everytool.tech' },
        { name: 'Tailwind CSS', url: 'https://contact.everytool.tech' },
        { name: 'Vercel', url: 'https://contact.everytool.tech' },
    ];

    const createToolList = () => {
        const toolList = document.createElement('ul');
        toolList.className = 'tool-list';
        tools.forEach(toolObject => {
            const listItem = document.createElement('li');
            listItem.className = 'tool-item';
            const link = document.createElement('a');
            link.href = toolObject.url;
            link.textContent = toolObject.name;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            listItem.appendChild(link);
            toolList.appendChild(listItem);
        });
        return toolList;
    };

    // Clear any existing content and populate the scroller with two lists for a seamless loop
    scroller.innerHTML = '';
    const list1 = createToolList();
    const list2 = createToolList();
    list2.setAttribute('aria-hidden', 'true'); // Important for accessibility

    scroller.appendChild(list1);
    scroller.appendChild(list2);


    // 3. --- STATE & ANIMATION LOGIC ---
    let isHovering = false;
    let isDown = false;
    let isActuallyDragging = false;
    let startX;
    let scrollStartPos;
    let currentX = 0;
    const scrollSpeed = 0.5;
    const DRAG_THRESHOLD = 10; // Min pixels to move to be considered a drag

    // Calculate width for infinite loop reset
    let scrollWidth = list1.offsetWidth;
    const updateScrollWidth = () => {
        scrollWidth = list1.offsetWidth;
    };
    window.addEventListener('resize', updateScrollWidth);
    
    // Animation loop
    const animate = () => {
        // Only auto-scroll if user is not hovering or actively dragging
        if (!isHovering && !isActuallyDragging) {
            currentX -= scrollSpeed;
            // Reset position for infinite loop effect
            if (currentX <= -scrollWidth) {
                currentX += scrollWidth;
            }
        }
        scroller.style.transform = `translateX(${currentX}px)`;
        requestAnimationFrame(animate);
    };


    // 4. --- EVENT LISTENERS ---
    const startDrag = (e) => {
        isDown = true;
        isActuallyDragging = false; // Reset on new mousedown/touchstart
        startX = e.pageX || e.touches[0].pageX;
        scrollStartPos = currentX;
        containerElement.classList.add('is-dragging-intent'); // Optional: for immediate feedback
    };

    const onDrag = (e) => {
        if (!isDown) return;

        const currentDragX = e.pageX || e.touches[0].pageX;
        const walk = currentDragX - startX;

        // Confirm it's a drag, not a click
        if (!isActuallyDragging && Math.abs(walk) > DRAG_THRESHOLD) {
            isActuallyDragging = true;
            containerElement.classList.add('is-dragging');
        }

        if (isActuallyDragging) {
            e.preventDefault(); // Prevent text selection
            let newPos = scrollStartPos + walk;
            
            // Boundary checks for the infinite loop
            while (newPos > 0) newPos -= scrollWidth;
            while (newPos < -scrollWidth) newPos += scrollWidth;
            
            currentX = newPos;
        }
    };

    const stopDrag = () => {
        isDown = false;
        // The 'is-dragging' class (which blocks clicks) is only removed now,
        // ensuring a quick drag-and-release doesn't register as a click.
        containerElement.classList.remove('is-dragging');
        containerElement.classList.remove('is-dragging-intent');
        
        // Timeout to allow a potential 'click' event to fire before resetting.
        // This helps distinguish a drag-release from a genuine click.
        setTimeout(() => {
            isActuallyDragging = false;
        }, 50);
    };

    // Attach mouse events
    containerElement.addEventListener('mouseover', () => { isHovering = true; });
    containerElement.addEventListener('mouseout', () => { isHovering = false; });
    containerElement.addEventListener('mousedown', startDrag);
    containerElement.addEventListener('mousemove', onDrag);
    containerElement.addEventListener('mouseup', stopDrag);
    containerElement.addEventListener('mouseleave', stopDrag);

    // Attach touch events for mobile
    containerElement.addEventListener('touchstart', startDrag, { passive: true });
    containerElement.addEventListener('touchmove', onDrag, { passive: true });
    containerElement.addEventListener('touchend', stopDrag);

    // 5. --- KICK OFF & FINALIZE ---
    animate();
    containerElement.dataset.scrollerInitialized = 'true';
}