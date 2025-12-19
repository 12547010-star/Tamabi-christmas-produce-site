document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM要素の取得 ---
    const galleryContainer = document.getElementById('main');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const viewText = toggleViewBtn?.querySelector('.view-text');
    const viewIcon = toggleViewBtn?.querySelector('.minimalist-icon');
    
    // モーダル関連
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-main-image');
    const enlargeLink = modal?.querySelector('.enlarge-icon');
    const closeBtn = modal?.querySelector('.close-btn');

    // 監視対象のセクション
    const processItems = document.querySelectorAll('.process-item');
    const infoSections = document.querySelectorAll('.info-section, footer');
    
    // Aboutセクション
    const toggleAboutBtn = document.getElementById('toggle-about-btn');
    const aboutFullText = document.getElementById('about-full-text');
    
    let currentView = 'tree';

    // --- ギャラリービュー切り替え機能 ---
    const updateButtonState = () => {
        const isTree = currentView === 'tree';
        // コンテナのクラスを切り替え
        galleryContainer.classList.toggle('tree-view', isTree);
        galleryContainer.classList.toggle('grid-view', !isTree);
        
        // ボタンのテキストとアイコン更新
        if (viewText) viewText.textContent = isTree ? 'GRID VIEW' : 'TREE VIEW';
        if (viewIcon) viewIcon.className = isTree ? 'fas fa-th minimalist-icon' : 'fas fa-tree minimalist-icon';
        
        toggleViewBtn?.setAttribute('aria-expanded', !isTree);
    };

    if (toggleViewBtn) {
        // 初期状態を確認してセット
        const initialView = toggleViewBtn.getAttribute('data-view');
        if (initialView) currentView = initialView;
        
        toggleViewBtn.addEventListener('click', () => {
            currentView = currentView === 'tree' ? 'grid' : 'tree';
            updateButtonState();
            
            // アニメーションをリセットして再実行
            galleryItems.forEach(item => {
                item.classList.remove('is-visible');
                galleryObserver.unobserve(item);
                galleryObserver.observe(item);
            });
        });
    }

    // --- ギャラリーアニメーション (Intersection Observer) ---
    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const rowElement = item.closest('.gallery-row');
                const rowData = parseInt(rowElement?.dataset.row || 0); 
                // 親要素(div.gallery-row)の子要素内でのインデックスを取得
                const itemIndex = Array.from(rowElement?.children || []).indexOf(item);

                // アニメーション遅延計算
                const delayFactor = currentView === 'tree' ? 0.08 : 0.04;
                const rowFactor = currentView === 'tree' ? (rowData - 1) * 0.5 : 0; 
                const delay = rowFactor + (itemIndex * delayFactor);
                
                item.style.setProperty('--item-delay', `${delay}s`);
                item.classList.add('is-visible');
                galleryObserver.unobserve(item);
            }
        });
    }, { threshold: 0.1 });
    galleryItems.forEach(item => galleryObserver.observe(item));

    // --- モーダル制御 ---
    const openModal = (imgSrc) => {
        if (!modal || !modalImage || !enlargeLink) return;
        modalImage.src = imgSrc;
        enlargeLink.href = imgSrc;
        modal.style.display = 'flex';
        // 少し遅らせてopacityを1にすることでフェードインさせる
        setTimeout(() => { modal.classList.add('is-open'); }, 10);
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('is-open');
        setTimeout(() => { 
            modal.style.display = 'none'; 
            if (modalImage) modalImage.src = '';
        }, 300); // CSSのtransition時間と合わせる
    };

    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const img = item.querySelector('img');
            if (img) openModal(img.src);
        });
    });

    if (modal) {
        closeBtn?.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
             if (e.target === modal) closeModal();
         });
    }

    // --- Process & Info Sections Animation ---
    const processObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const images = item.querySelector('.process-images');
                const caption = item.querySelector('.process-caption');
                const itemIndex = Array.from(processItems).indexOf(item);
                const delayBase = itemIndex * 0.1;

                if (images) {
                    images.style.setProperty('--process-delay', `${delayBase}s`);
                    images.classList.add('is-revealed-process');
                }
                if (caption) {
                    caption.style.setProperty('--process-delay-text', `${delayBase + 0.1}s`);
                    caption.classList.add('is-revealed-process');
                }
                processObserver.unobserve(item);
            }
        });
    }, { threshold: 0.1 });
    processItems.forEach(item => processObserver.observe(item));

    const contentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('is-animated')) {
                const section = entry.target;
                const targets = section.querySelectorAll('.section-title, .info-content p, .info-content .button-area, .credit-content dl'); 
                let delay = 0.05;
                targets.forEach((element) => {
                    element.style.setProperty('--text-delay', `${delay}s`);
                    element.classList.add('is-revealed-text');
                    delay += 0.05;
                });
                section.classList.add('is-animated');
                contentObserver.unobserve(section);
            }
        });
    }, { threshold: 0.1 });
    infoSections.forEach(section => contentObserver.observe(section));

    // --- About Toggle ---
    if (toggleAboutBtn && aboutFullText) {
        toggleAboutBtn.addEventListener('click', () => {
            const isExpanded = toggleAboutBtn.getAttribute('aria-expanded') === 'true';
            const textSpan = toggleAboutBtn.querySelector('.read-more-text');

            if (!isExpanded) {
                // 展開
                aboutFullText.style.height = `${aboutFullText.scrollHeight}px`;
                aboutFullText.classList.add('is-expanded');
                toggleAboutBtn.setAttribute('aria-expanded', 'true');
                textSpan.textContent = '閉じる';
                
                aboutFullText.addEventListener('transitionend', function handler() {
                    if (aboutFullText.classList.contains('is-expanded')) aboutFullText.style.height = 'auto';
                    aboutFullText.removeEventListener('transitionend', handler);
                }, { once: true });
            } else {
                // 折りたたみ
                aboutFullText.style.height = `${aboutFullText.scrollHeight}px`;
                requestAnimationFrame(() => {
                    aboutFullText.style.height = '0';
                    aboutFullText.classList.remove('is-expanded');
                    toggleAboutBtn.setAttribute('aria-expanded', 'false');
                });
                textSpan.textContent = '詳細';
            }
        });
    }

    // --- Snow Animation ---
    const createSnowflakes = () => {
        const snowContainer = document.getElementById('snow-container');
        if (!snowContainer) return;

        const numberOfSnowflakes = 50; // 雪片の数

        for (let i = 0; i < numberOfSnowflakes; i++) {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');

            // ランダムなスタイル設定
            const size = Math.random() * 5 + 2; // 2px〜7px
            const position = Math.random() * 100; // 左からの位置 (%)
            const duration = Math.random() * 10 + 5; // 落下時間 5s〜15s
            const delay = Math.random() * 5; // 開始遅延 0s〜5s
            const opacity = Math.random() * 0.5 + 0.3; // 透明度 0.3〜0.8

            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${position}%`;
            snowflake.style.animationDuration = `${duration}s`;
            snowflake.style.animationDelay = `${delay}s`;
            snowflake.style.opacity = opacity;

            snowContainer.appendChild(snowflake);
        }
    };

    const stopSnowfall = () => {
        const snowflakes = document.querySelectorAll('.snowflake');
        snowflakes.forEach(flake => {
            // 現在のY軸の移動量を取得
            const transform = getComputedStyle(flake).transform;
            let currentY = 0;
            if (transform && transform !== 'none') {
                const matrix = transform.match(/matrix.*\((.+)\)/)?.[1].split(', ');
                currentY = matrix ? parseFloat(matrix[5]) : 0;
            }
            
            // アニメーションを停止し、現在の位置を固定
            flake.style.animationPlayState = 'paused';
            flake.style.transform = `translateY(${currentY}px)`;
            flake.style.opacity = '0'; // 停止した雪はフェードアウト
        });

        // 停止後のフェードアウトが完了したらコンテナ自体を非表示にする
        const snowContainer = document.getElementById('snow-container');
        if (snowContainer) {
            snowContainer.style.transition = 'opacity 2s ease-out';
            snowContainer.style.opacity = '0';
            setTimeout(() => {
                snowContainer.style.display = 'none';
            }, 2000); // 2秒後に非表示
        }
    };

    createSnowflakes(); // 雪を生成

    // 10秒後に雪を停止 (10000ミリ秒)
    const stopTimeInMilliseconds = 10000; 
    setTimeout(stopSnowfall, stopTimeInMilliseconds);

});
