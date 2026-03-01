const CONFIG = {
    images: ['foto1.png', 'foto2.png', 'foto3.png', 'foto4.png', 'foto5.png', 'foto6.png'],
    audioPath: 'music/lagu1.mp3',
    introAudioPath: 'music/intro.mp3',
    introDuration: 5000,
    scrollSpeed: 0.35,
    heartInterval: 900,
    gridCopies: 5,
    totalRows: 10
};

const elements = {
    romanticIntro: document.getElementById('romanticIntro'),
    galleryMain: document.getElementById('galleryMain'),
    galleryWrapper: document.getElementById('galleryWrapper'),
    gridTrack: document.getElementById('gridTrack'),
    floatingHearts: document.getElementById('floatingHearts'),
    petalsContainer: document.getElementById('petalsContainer'),
    starParticles: document.getElementById('starParticles'),
    musicBtn: document.getElementById('musicBtn'),
    musicIcon: document.getElementById('musicIcon'),
    musicWave: document.getElementById('musicWave'),
    modal: document.getElementById('imageModal'),
    modalImage: document.getElementById('modalImage'),
    modalClose: document.getElementById('modalClose'),
    modalPrev: document.getElementById('modalPrev'),
    modalNext: document.getElementById('modalNext'),
    modalCounter: document.getElementById('modalCounter'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalImageContainer: document.getElementById('modalImageContainer')
};

let state = {
    audio: null,
    introAudio: null,
    isPlaying: false,
    introPlaying: false,
    isDragging: false,
    isPaused: false,
    startX: 0,
    scrollLeft: 0,
    currentTranslateX: 0,
    animationFrame: null,
    heartInterval: null,
    gridWidth: 0,
    gridItems: [],
    currentModalIndex: 0,
    wheelTimeout: null,
    audioLoaded: false,
    introAudioLoaded: false,
    userInteracted: false
};

const gridPatterns = [
    [0, 1, 2, 3, 4, 5, 0, 1],
    [2, 3, 4, 5, 0, 1, 2, 3],
    [4, 5, 0, 1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5, 0, 1, 2],
    [3, 4, 5, 0, 1, 2, 3, 4],
    [5, 0, 1, 2, 3, 4, 5, 0],
    [0, 1, 2, 3, 4, 5, 0, 1],
    [2, 3, 4, 5, 0, 1, 2, 3],
    [4, 5, 0, 1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5, 0, 1, 2]
];

class RomanticIntro {
    constructor() {
        this.petalInterval = null;
    }

    init() {
        this.setBlackBars();
        this.startPetals();
        this.createStars();
        this.startIntro();
    }

    setBlackBars() {
        const bars = document.querySelectorAll('.cinematic-bar');
        const height = window.innerWidth <= 768 ? 40 : 80;
        bars.forEach(bar => {
            bar.style.height = `${height}px`;
        });
    }

    createStars() {
        if (!elements.starParticles) return;
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 5 + 's';
            star.style.animationDuration = (Math.random() * 3 + 2) + 's';
            elements.starParticles.appendChild(star);
        }
    }

    startPetals() {
        this.petalInterval = setInterval(() => {
            this.createPetal();
        }, 250);
        setTimeout(() => {
            clearInterval(this.petalInterval);
        }, 4500);
    }

    createPetal() {
        if (!elements.petalsContainer) return;
        const petal = document.createElement('div');
        petal.className = 'petal';
        const petals = ['🌸', '🌸', '🌸', '🌸'];
        petal.innerHTML = petals[Math.floor(Math.random() * petals.length)];
        const size = Math.random() * 12 + 10;
        const left = Math.random() * 100;
        const duration = Math.random() * 5 + 4;
        const delay = Math.random() * 2;
        petal.style.fontSize = `${size}px`;
        petal.style.left = `${left}%`;
        petal.style.animation = `fall ${duration}s linear ${delay}s forwards`;
        petal.style.opacity = Math.random() * 0.3 + 0.2;
        elements.petalsContainer.appendChild(petal);
        setTimeout(() => {
            if (petal.parentNode === elements.petalsContainer) {
                elements.petalsContainer.removeChild(petal);
            }
        }, (duration + delay) * 1000);
    }

    startIntro() {
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            if (state.introAudio && state.introPlaying) {
                state.introAudio.pause();
                state.introAudio = null;
                state.introPlaying = false;
            }
            
            elements.romanticIntro.classList.add('hide');
            elements.galleryMain.classList.add('show');

            setTimeout(() => {
                gallery.init();
                if (!state.audioLoaded) {
                    audioManager.init();
                }
                heartEffect.start();
            }, 500);
        }, CONFIG.introDuration);
    }
}

const gallery = {
    init() {
        this.createGrid();
        this.calculateGridWidth();
        this.startAutoScroll();
        this.addEventListeners();
        this.collectGridItems();
    },

    createGrid() {
        let gridHTML = '';
        const cols = this.getColumnCount();

        for (let copy = 0; copy < CONFIG.gridCopies; copy++) {
            gridHTML += '<div class="grid-container">';
            for (let row = 0; row < CONFIG.totalRows; row++) {
                const patternIndex = row % gridPatterns.length;
                const pattern = gridPatterns[patternIndex];
                for (let col = 0; col < cols; col++) {
                    const imageIndex = pattern[col % pattern.length];
                    const imgSrc = CONFIG.images[imageIndex];
                    gridHTML += `
                        <div class="grid-item" data-src="${imgSrc}" data-index="${copy * CONFIG.totalRows * cols + row * cols + col}">
                            <img src="images/${imgSrc}" alt="Your Photos" loading="lazy">
                        </div>
                    `;
                }
            }
            gridHTML += '</div>';
        }
        elements.gridTrack.innerHTML = gridHTML;
    },

    collectGridItems() {
        state.gridItems = document.querySelectorAll('.grid-item');
        state.gridItems.forEach((item, index) => {
            item.setAttribute('data-index', index);
            item.addEventListener('click', () => {
                modal.open(index);
            });
        });
    },

    getColumnCount() {
        if (window.innerWidth <= 480) return 3;
        if (window.innerWidth <= 1024) return 5;
        return 8;
    },

    calculateGridWidth() {
        const container = document.querySelector('.grid-container');
        if (container) {
            const containerWidth = container.offsetWidth;
            state.gridWidth = containerWidth * CONFIG.gridCopies;
        }
    },

    setTranslateX(value) {
        if (elements.gridTrack) {
            elements.gridTrack.style.transform = `translateX(${value}px)`;
        }
    },

    startAutoScroll() {
        const scroll = () => {
            if (!state.isDragging && !state.isPaused && elements.gridTrack) {
                state.currentTranslateX -= CONFIG.scrollSpeed;
                if (Math.abs(state.currentTranslateX) >= state.gridWidth / 2) {
                    state.currentTranslateX = 0;
                }
                this.setTranslateX(state.currentTranslateX);
            }
            state.animationFrame = requestAnimationFrame(scroll);
        };
        scroll();
    },

    addEventListeners() {
        elements.galleryWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY * 0.35;
            state.currentTranslateX -= delta;
            const maxScroll = state.gridWidth - window.innerWidth;
            if (Math.abs(state.currentTranslateX) > maxScroll) {
                state.currentTranslateX = -maxScroll;
            }
            this.setTranslateX(state.currentTranslateX);
            state.isPaused = true;
            if (state.wheelTimeout) clearTimeout(state.wheelTimeout);
            state.wheelTimeout = setTimeout(() => {
                state.isPaused = false;
            }, 1500);
        });

        elements.gridTrack.addEventListener('mousedown', (e) => {
            state.isDragging = true;
            state.startX = e.pageX - state.currentTranslateX;
            state.scrollLeft = state.currentTranslateX;
            elements.gridTrack.style.cursor = 'grabbing';
        });

        elements.gridTrack.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;
            e.preventDefault();
            const x = e.pageX;
            const walk = (x - state.startX) * 1;
            state.currentTranslateX = state.scrollLeft + walk;
            this.setTranslateX(state.currentTranslateX);
        });

        elements.gridTrack.addEventListener('touchstart', (e) => {
            state.isDragging = true;
            state.startX = e.touches[0].pageX - state.currentTranslateX;
            state.scrollLeft = state.currentTranslateX;
        });

        elements.gridTrack.addEventListener('touchmove', (e) => {
            if (!state.isDragging) return;
            e.preventDefault();
            const x = e.touches[0].pageX;
            const walk = (x - state.startX) * 1;
            state.currentTranslateX = state.scrollLeft + walk;
            this.setTranslateX(state.currentTranslateX);
        });

        ['mouseup', 'mouseleave', 'touchend'].forEach(event => {
            elements.gridTrack.addEventListener(event, () => {
                state.isDragging = false;
                elements.gridTrack.style.cursor = 'grab';
            });
        });

        elements.gridTrack.addEventListener('mouseenter', () => state.isPaused = true);
        elements.gridTrack.addEventListener('mouseleave', () => state.isPaused = false);
    }
};

const modal = {
    open(index) {
        state.currentModalIndex = index;
        const imgSrc = state.gridItems[index].getAttribute('data-src');
        
        elements.modalImage.src = '';
        
        setTimeout(() => {
            elements.modalImage.src = `images/${imgSrc}`;
        }, 50);
        
        elements.modal.classList.add('active');
        this.updateCounter(index, state.gridItems.length);
        document.body.style.overflow = 'hidden';
    },

    close() {
        elements.modal.classList.remove('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            elements.modalImage.src = '';
        }, 300);
    },

    next() {
        state.currentModalIndex = (state.currentModalIndex + 1) % state.gridItems.length;
        const imgSrc = state.gridItems[state.currentModalIndex].getAttribute('data-src');
        
        elements.modalImage.style.opacity = '0';
        setTimeout(() => {
            elements.modalImage.src = `images/${imgSrc}`;
            elements.modalImage.style.opacity = '1';
        }, 150);
        
        this.updateCounter(state.currentModalIndex, state.gridItems.length);
    },

    prev() {
        state.currentModalIndex = (state.currentModalIndex - 1 + state.gridItems.length) % state.gridItems.length;
        const imgSrc = state.gridItems[state.currentModalIndex].getAttribute('data-src');
        
        elements.modalImage.style.opacity = '0';
        setTimeout(() => {
            elements.modalImage.src = `images/${imgSrc}`;
            elements.modalImage.style.opacity = '1';
        }, 150);
        
        this.updateCounter(state.currentModalIndex, state.gridItems.length);
    },

    updateCounter(current, total) {
        elements.modalCounter.textContent = `${current + 1} / ${total}`;
    },

    init() {
        elements.modalImage.style.transition = 'opacity 0.15s ease';
        elements.modalImage.style.opacity = '1';

        elements.modalClose.addEventListener('click', () => this.close());
        elements.modalPrev.addEventListener('click', () => this.prev());
        elements.modalNext.addEventListener('click', () => this.next());
        elements.modalOverlay.addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (!elements.modal.classList.contains('active')) return;
            if (e.key === 'Escape') {
                this.close();
            } else if (e.key === 'ArrowRight') {
                this.next();
            } else if (e.key === 'ArrowLeft') {
                this.prev();
            }
        });

        elements.modal.addEventListener('wheel', (e) => {
            if (!elements.modal.classList.contains('active')) return;
            e.preventDefault();
            if (e.deltaY > 0) {
                this.next();
            } else {
                this.prev();
            }
        });

        let touchStartX = 0, touchEndX = 0;
        elements.modal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        elements.modal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) {
                this.next();
            } else if (touchEndX > touchStartX + 50) {
                this.prev();
            }
        });

        elements.modalImage.addEventListener('error', () => {
            console.log('Image failed to load');
        });
    }
};

// ===== FIXED AUDIO MANAGER FOR HOSTING =====
const audioManager = {
    init() {
        try {
            // Pake path absolut relatif biar aman di hosting
            const basePath = window.location.pathname.includes('/') ? '' : '';
            state.audio = new Audio(CONFIG.audioPath);
            state.audio.loop = true;
            state.audio.volume = 0;
            
            // Force preload
            state.audio.preload = 'auto';
            
            state.audio.addEventListener('canplaythrough', () => {
                state.audioLoaded = true;
                console.log('Audio loaded, ready to play');
                // Coba play otomatis kalo user udah interaksi
                if (state.userInteracted && !state.isPlaying) {
                    this.play();
                }
            });
            
            state.audio.addEventListener('play', () => {
                state.isPlaying = true;
                this.updateUI();
                console.log('Audio playing');
            });
            
            state.audio.addEventListener('pause', () => {
                state.isPlaying = false;
                this.updateUI();
                console.log('Audio paused');
            });
            
            state.audio.addEventListener('ended', () => {
                // Loop manually kalo perlu
                if (state.audio.loop) {
                    state.audio.currentTime = 0;
                    state.audio.play().catch(console.log);
                }
            });
            
            state.audio.addEventListener('error', (e) => {
                console.log('Audio error:', e);
            });
            
            // Coba load
            state.audio.load();
            
            this.addEventListeners();
        } catch (error) {
            console.log('Audio init error:', error);
        }
    },

    play() {
        if (!state.audio) {
            console.log('Audio not initialized');
            return;
        }

        // Force UI update dulu biar keliatan ada response
        this.updateUI();
        
        const playPromise = state.audio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    state.isPlaying = true;
                    this.fadeIn();
                    this.updateUI();
                    console.log('Playback started successfully');
                })
                .catch(err => {
                    console.log('Playback failed:', err);
                    state.isPlaying = false;
                    this.updateUI();
                    
                    // Fallback: coba lagi setelah user klik
                    if (err.name === 'NotAllowedError') {
                        console.log('Autoplay blocked, waiting for user interaction');
                        // Tetap update UI ke pause state
                        this.updateUI();
                    }
                });
        }
    },

    fadeIn() {
        if (!state.audio) return;
        let volume = 0;
        const interval = setInterval(() => {
            volume += 0.03;
            if (volume >= 0.3) {
                volume = 0.3;
                clearInterval(interval);
            }
            if (state.audio) state.audio.volume = volume;
        }, 100);
    },

    fadeOut() {
        if (!state.audio) return;
        let volume = 0.3;
        const interval = setInterval(() => {
            volume -= 0.03;
            if (volume <= 0) {
                volume = 0;
                state.audio.pause();
                clearInterval(interval);
            }
            if (state.audio) state.audio.volume = volume;
        }, 100);
    },

    toggle() {
        if (!state.audio) {
            console.log('Audio not ready');
            return;
        }
        
        // Tandai user udah interaksi
        state.userInteracted = true;
        
        if (state.isPlaying) {
            console.log('Pausing audio');
            this.fadeOut();
            // isPlaying akan di-update via event listener pause
        } else {
            console.log('Starting audio');
            state.audio.play()
                .then(() => {
                    this.fadeIn();
                    // isPlaying akan di-update via event listener play
                })
                .catch(err => {
                    console.log('Toggle play failed:', err);
                    state.isPlaying = false;
                    this.updateUI();
                });
        }
        
        // Tetap update UI biar responsive
        this.updateUI();
    },

    updateUI() {
        // Update icon berdasarkan state.isPlaying
        if (elements.musicIcon) {
            if (state.isPlaying) {
                elements.musicIcon.className = 'fas fa-pause';
                console.log('UI: set to pause icon');
            } else {
                elements.musicIcon.className = 'fas fa-play';
                console.log('UI: set to play icon');
            }
        }
        
        // Update wave animation berdasarkan state.isPlaying
        if (state.isPlaying) {
            elements.musicWave.classList.add('active');
            console.log('UI: wave active');
        } else {
            elements.musicWave.classList.remove('active');
            console.log('UI: wave inactive');
        }
        
        // Force reflow biar animasi Jalan di hosting
        if (elements.musicWave) {
            // Trigger reflow dengan manipulasi DOM kecil
            elements.musicWave.style.display = 'none';
            elements.musicWave.offsetHeight; // Force reflow
            elements.musicWave.style.display = 'flex';
        }
    },

    addEventListeners() {
        // Click listener untuk toggle
        elements.musicBtn.addEventListener('click', () => {
            console.log('Music button clicked');
            this.toggle();
        });
        
        // Listener untuk user interaction pertama
        const enableAudio = () => {
            if (!state.userInteracted && state.audio && !state.isPlaying) {
                state.userInteracted = true;
                console.log('User interacted, enabling audio');
                if (state.audioLoaded) {
                    this.play();
                }
            }
        };
        
        // Berbagai event buat deteksi user interaction
        document.addEventListener('click', enableAudio, { once: false });
        document.addEventListener('touchstart', enableAudio, { once: false });
        document.addEventListener('keydown', enableAudio, { once: false });
        
        // Scroll juga bisa jadi indikasi user interaction
        window.addEventListener('scroll', enableAudio, { once: false });
        
        // Untuk hosting, coba play pas visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && state.userInteracted && state.audio && !state.isPlaying && state.audioLoaded) {
                console.log('Tab visible, trying to play');
                this.play();
            }
        });
    }
};

const introAudioManager = {
    init() {
        try {
            state.introAudio = new Audio(CONFIG.introAudioPath);
            state.introAudio.volume = 0.2;
            state.introAudio.loop = false;
            
            state.introAudio.addEventListener('canplaythrough', () => {
                state.introAudioLoaded = true;
                this.play();
            });
            
            state.introAudio.addEventListener('error', (e) => {
                console.log('Intro audio error:', e);
            });
        } catch (error) {
            console.log('Intro audio init error:', error);
        }
    },

    play() {
        if (!state.introAudio || !state.introAudioLoaded) return;
        
        state.introAudio.play()
            .then(() => {
                state.introPlaying = true;
            })
            .catch(err => {
                console.log('Intro playback failed:', err);
            });
    }
};

const heartEffect = {
    start() {
        state.heartInterval = setInterval(() => {
            this.createHeart();
        }, CONFIG.heartInterval);
    },

    createHeart() {
        if (!elements.floatingHearts) return;
        const heart = document.createElement('div');
        heart.className = 'heart-item';
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = (Math.random() * 80 + 10) + '%';
        heart.style.fontSize = (Math.random() * 12 + 8) + 'px';
        heart.style.animationDuration = (Math.random() * 2 + 4) + 's';
        elements.floatingHearts.appendChild(heart);
        setTimeout(() => {
            if (heart.parentNode === elements.floatingHearts) {
                elements.floatingHearts.removeChild(heart);
            }
        }, 6000);
    },

    stop() {
        if (state.heartInterval) clearInterval(state.heartInterval);
    }
};

window.addEventListener('resize', () => {
    const height = window.innerWidth <= 768 ? 40 : 80;
    document.querySelectorAll('.cinematic-bar').forEach(bar => {
        bar.style.height = `${height}px`;
    });
    if (elements.galleryMain.classList.contains('show')) {
        setTimeout(() => {
            gallery.calculateGridWidth();
        }, 100);
    }
});

window.addEventListener('beforeunload', () => {
    if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
    if (state.heartInterval) clearInterval(state.heartInterval);
    if (state.wheelTimeout) clearTimeout(state.wheelTimeout);
    if (state.audio) {
        state.audio.pause();
        state.audio = null;
    }
    if (state.introAudio) {
        state.introAudio.pause();
        state.introAudio = null;
    }
});

// Force update UI setiap beberapa detik buat jaga-jaga di hosting
setInterval(() => {
    if (state.audio && elements.musicWave) {
        // Cek apakah state sesuai dengan kondisi audio sebenarnya
        if (!state.audio.paused && !state.isPlaying) {
            state.isPlaying = true;
            audioManager.updateUI();
        } else if (state.audio.paused && state.isPlaying) {
            state.isPlaying = false;
            audioManager.updateUI();
        }
    }
}, 1000);

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    introAudioManager.init();
    const intro = new RomanticIntro();
    intro.init();
    modal.init();
    
    // Set initial UI state
    setTimeout(() => {
        if (elements.musicIcon) {
            elements.musicIcon.className = 'fas fa-play';
        }
        elements.musicWave.classList.remove('active');
    }, 100);
});