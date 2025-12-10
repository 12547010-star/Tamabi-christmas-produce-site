document.addEventListener('DOMContentLoaded', () => {
    
    // --- ギャラリービュー切り替え機能 ---
    const galleryContainer = document.getElementById('main');
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const viewText = toggleViewBtn ? toggleViewBtn.querySelector('.view-text') : null;
    const viewIcon = toggleViewBtn ? toggleViewBtn.querySelector('.minimalist-icon') : null;
    let currentView = 'tree';

    const updateButtonState = () => {
        if (currentView === 'tree') {
            galleryContainer.classList.remove('grid-view');
            galleryContainer.classList.add('tree-view');
            if (viewText) viewText.textContent = 'GRID VIEW';
            if (viewIcon) viewIcon.className = 'fas fa-th minimalist-icon';
        } else {
            galleryContainer.classList.remove('tree-view');
            galleryContainer.classList.add('grid-view');
            if (viewText) viewText.textContent = 'TREE VIEW';
            if (viewIcon) viewIcon.className = 'fas fa-tree minimalist-icon';
        }
    };
    updateButtonState();

    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', () => {
            currentView = currentView === 'tree' ? 'grid' : 'tree';
            updateButtonState();
            galleryItems.forEach(item => {
                item.classList.remove('is-visible');
                galleryObserver.unobserve(item);
            });
            galleryItems.forEach(item => galleryObserver.observe(item));
        });
    }

    // --- ギャラリーアニメーション ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const rowElement = item.closest('.gallery-row');
                const rowData = parseInt(rowElement.dataset.row);
                const itemIndex = Array.from(rowElement.children).indexOf(item);

                // アニメーション遅延の高速化 (係数を小さく)
                const delayFactor = currentView === 'tree' ? 0.1 : 0.05;
                const rowFactor = currentView === 'tree' ? (rowData - 1) * 0.4 : 0;
                const delay = rowFactor + (itemIndex * delayFactor);
                
                item.style.setProperty('--item-delay', `${delay}s`);
                item.classList.add('is-visible');
                observer.unobserve(item);
            }
        });
    }, { threshold: 0.1 });
    galleryItems.forEach(item => galleryObserver.observe(item));

    // --- シンプルモーダル (画像のみ) ---
    const detailModal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-main-image');
    const enlargeLink = detailModal.querySelector('.enlarge-icon');
    const detailCloseBtns = detailModal.querySelectorAll('.detail-close-btn');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgElement = item.querySelector('img');
            modalImage.src = imgElement.src;
            enlargeLink.href = imgElement.src;
            
            detailModal.style.display = 'block'; 
            requestAnimationFrame(() => detailModal.classList.add('is-open'));
            document.body.style.overflow = 'hidden'; 
        });
    });

    const closeDetailModal = () => {
        detailModal.classList.remove('is-open');
        document.body.style.overflow = 'auto'; 
        setTimeout(() => {
            detailModal.style.display = 'none';
            modalImage.src = '';
        }, 300); // 遷移時間短縮
    };

    detailCloseBtns.forEach(btn => btn.addEventListener('click', closeDetailModal));
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal || e.target.classList.contains('modal-content')) {
            closeDetailModal();
        }
    });

    // --- Process & Other Sections Animation ---
    const processItems = document.querySelectorAll('.process-item');
    const processObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const images = item.querySelector('.process-images');
                const caption = item.querySelector('.process-caption');
                const itemIndex = Array.from(processItems).indexOf(item);
                // 高速化
                const delayBase = itemIndex * 0.15;

                if (images) {
                    images.style.setProperty('--process-delay', `${delayBase}s`);
                    images.classList.add('is-revealed-process');
                }
                if (caption) {
                    caption.style.setProperty('--process-delay-text', `${delayBase + 0.15}s`);
                    caption.classList.add('is-revealed-process');
                }
                observer.unobserve(item);
            }
        });
    }, { threshold: 0.1 });
    processItems.forEach(item => processObserver.observe(item));

    const infoSections = document.querySelectorAll('.info-section, footer');
    const contentObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('is-animated')) {
                const section = entry.target;
                const targets = section.querySelectorAll('.section-title, .info-content p, .info-content .button-area, .info-content dl');
                // 高速化
                let delay = 0.1;
                targets.forEach((element) => {
                    element.style.setProperty('--text-delay', `${delay}s`);
                    element.classList.add('is-revealed-text');
                    delay += 0.1;
                });
                section.classList.add('is-animated');
                observer.unobserve(section);
            }
        });
    }, { threshold: 0.1 });
    infoSections.forEach(section => contentObserver.observe(section));

    // --- About Toggle ---
    const toggleAboutBtn = document.getElementById('toggle-about-btn');
    const aboutFullText = document.getElementById('about-full-text');
    if (toggleAboutBtn && aboutFullText) {
        const getFullHeight = (element) => {
            const currentHeight = element.style.height;
            element.style.height = 'auto';
            const height = element.scrollHeight + 'px';
            element.style.height = currentHeight;
            return height;
        };
        toggleAboutBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const isExpanded = aboutFullText.classList.contains('is-expanded');
            const textSpan = toggleAboutBtn.querySelector('.read-more-text');
            if (!isExpanded) {
                const height = getFullHeight(aboutFullText);
                requestAnimationFrame(() => {
                    aboutFullText.style.height = height;
                    aboutFullText.classList.add('is-expanded');
                    toggleAboutBtn.setAttribute('aria-expanded', 'true'); 
                    aboutFullText.addEventListener('transitionend', function handler() {
                        if (aboutFullText.classList.contains('is-expanded')) aboutFullText.style.height = 'auto';
                        aboutFullText.removeEventListener('transitionend', handler);
                    });
                });
                textSpan.textContent = '閉じる';
            } else {
                aboutFullText.style.height = aboutFullText.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    aboutFullText.style.height = '0';
                    aboutFullText.classList.remove('is-expanded');
                    toggleAboutBtn.setAttribute('aria-expanded', 'false'); 
                });
                textSpan.textContent = '詳細';
            }
        });
    }
});
