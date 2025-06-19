document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Header ---
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu'); // ul#nav-menu-list
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        // Set initial state for accessibility
        navMenu.setAttribute('hidden', ''); // Hide initially if not active

        menuToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active'); // For animating the hamburger icon itself
            menuToggle.setAttribute('aria-expanded', isActive);

            if (isActive) {
                navMenu.removeAttribute('hidden');
                document.body.style.overflow = 'hidden';
            } else {
                navMenu.setAttribute('hidden', '');
                document.body.style.overflow = '';
            }
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    navMenu.setAttribute('hidden', '');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // --- Smooth Scrolling ---
    const scrollLinks = document.querySelectorAll('.scroll-link');
    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - (header ? header.offsetHeight : 0);
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

     // --- Active link highlighting on scroll ---
     const sections = document.querySelectorAll('section[id]');
     const allNavLinks = document.querySelectorAll('.nav-menu a.nav-link'); // Re-query for navHighlighter

     function navHighlighter() {
        let scrollY = window.pageYOffset;
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - (header ? header.offsetHeight + 50 : 50);
            const sectionId = current.getAttribute('id');
            
            const navLinkForSection = document.querySelector('.nav-menu a.nav-link[href*="#' + sectionId + '"]');

            if (navLinkForSection) {
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    allNavLinks.forEach(link => link.classList.remove('active'));
                    navLinkForSection.classList.add('active');
                }
            }
        });
        // Special case for top of page / hero
        if (sections.length > 0 && scrollY < sections[0].offsetTop - (header ? header.offsetHeight + 50 : 50)) {
            allNavLinks.forEach(link => link.classList.remove('active'));
            const homeLink = document.querySelector('.nav-menu a.nav-link[href*="#hero"]');
            if (homeLink) homeLink.classList.add('active');
        }
     }
     window.addEventListener('scroll', navHighlighter);
     navHighlighter(); // Initial call


    // --- Portfolio Filtering (kept for potential future use, but no filter buttons in HTML currently) ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filterValue = button.getAttribute('data-filter');
                portfolioItems.forEach(item => {
                    item.style.display = 'none'; 
                    item.style.opacity = '0';   
                    item.style.transform = 'scale(0.9)'; 
                    if (item.classList.contains(filterValue.replace('.', '')) || filterValue === '*') {
                        setTimeout(() => {
                            item.style.display = 'block';
                            void item.offsetWidth; 
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 10); 
                    }
                });
            });
        });
    } else if (portfolioItems.length > 0) {
        portfolioItems.forEach(item => {
            item.style.display = 'block';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
        });
    }


    // --- Lightbox Functionality ---
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('.lightbox-content img');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        const lightboxPrev = lightbox.querySelector('.lightbox-prev');
        const lightboxNext = lightbox.querySelector('.lightbox-next');
        let currentImageIndex = 0;
        let currentGalleryItems = [];
        let previouslyFocusedElement;

        const allLightboxLinks = document.querySelectorAll('.portfolio-item a[data-lightbox]');

        allLightboxLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                currentGalleryItems = Array.from(allLightboxLinks);
                currentImageIndex = currentGalleryItems.findIndex(galleryLink => galleryLink === link);
                showLightbox(currentImageIndex);
            });
        });

        function showLightbox(index) {
            if (index < 0 || index >= currentGalleryItems.length || !lightboxImg || !lightboxCaption) return;

            previouslyFocusedElement = document.activeElement; // Store focus

            const link = currentGalleryItems[index];
            lightboxImg.setAttribute('src', link.getAttribute('href'));
            // If data-title is unique and descriptive, it's good for alt. Otherwise, a generic one.
            lightboxImg.setAttribute('alt', `Enlarged view: ${link.getAttribute('data-title') || 'Portfolio image'}`);
            lightboxCaption.textContent = link.getAttribute('data-title') || '';
            currentImageIndex = index;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus management
            lightboxClose.focus(); 
            lightbox.addEventListener('keydown', trapFocusInLightbox);
        }

        function closeLightbox() {
            lightbox.classList.remove('show');
            document.body.style.overflow = '';
            lightbox.removeEventListener('keydown', trapFocusInLightbox);
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus();
            }
        }

        function showPrevImage() {
            showLightbox((currentImageIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length);
        }

        function showNextImage() {
            showLightbox((currentImageIndex + 1) % currentGalleryItems.length);
        }
        
        function trapFocusInLightbox(e) {
            if (e.key !== 'Tab') return;

            const focusableElements = Array.from(lightbox.querySelectorAll('button, [href]')).filter(el => el.offsetParent !== null); // only visible elements
            if (focusableElements.length === 0) return;

            const firstFocusableElement = focusableElements[0];
            const lastFocusableElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }

        if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if(lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);
        if(lightboxNext) lightboxNext.addEventListener('click', showNextImage);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('show')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') showPrevImage();
                if (e.key === 'ArrowRight') showNextImage();
            }
        });
    }


    // --- Back to Top Button ---
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { 
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
    }

    // --- Scroll Animations with IntersectionObserver ---
    const scrollAnimatedElements = document.querySelectorAll('.animate-on-scroll');

    if ("IntersectionObserver" in window) {
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // observer.unobserve(entry.target); // Uncomment to animate only once
                } else {
                    // entry.target.classList.remove('visible'); // Uncomment to re-animate on scroll up/down
                }
            });
        };
        const scrollObserver = new IntersectionObserver(observerCallback, {
            root: null,
            threshold: 0.15, // Element is 15% visible
        });
        scrollAnimatedElements.forEach(el => scrollObserver.observe(el));
    } else {
        // Fallback for older browsers: just make them visible
        scrollAnimatedElements.forEach(el => el.classList.add('visible'));
        console.warn("IntersectionObserver not supported, scroll animations may not be as smooth.");
    }

    // Animate elements that are for immediate display on load (e.g., hero section)
    const animateOnLoadElements = document.querySelectorAll('.animate-on-load');
    animateOnLoadElements.forEach(el => {
        // Small timeout to ensure transitions apply correctly after paint
        setTimeout(() => el.classList.add('visible'), 50);
    });


    // --- Footer Current Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

});