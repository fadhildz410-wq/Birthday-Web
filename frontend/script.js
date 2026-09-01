/*
 * ============================================================
 * HAPPY BIRTHDAY AYA - Frontend Script
 * ============================================================
 * Alur:
 *  1. Buka web  -> tampil LOGIN PAGE (tanpa navbar)
 *  2. Login OK  -> tampil PAGE 1 (tanpa navbar)
 *  3. Klik "View Gifts" -> PAGE 2, 3, TIMELINE, 4 muncul + NAVBAR aktif
 *  4. Klik "Play Video" -> popup video muncul
 *  5. Scroll ke timeline -> tiap item fade-in / slide-up
 *  6. Klik "Rayakan" di card terakhir timeline -> confetti muncul
 * ============================================================
 */

// GANTI URL INI dengan alamat backend FastAPI kamu
// Contoh lokal: 'http://localhost:8001/api'
const API_BASE = 'https://birthday-web-production-4e27.up.railway.app/api';

// ==================== ELEMENT REFERENCES ====================
const loginPage    = document.getElementById('login-page');
const loginBtn     = document.getElementById('login-btn');
const usernameEl   = document.getElementById('username');
const codeEl       = document.getElementById('code-unik');
const loginError   = document.getElementById('login-error');

const navbar       = document.getElementById('navbar');
const logoutBtn    = document.getElementById('logout-btn');

const homeBtn      = document.getElementById('home-btn');

const page1        = document.getElementById('page-1');
const page2        = document.getElementById('page-2');
const page3        = document.getElementById('page-3');
const page4        = document.getElementById('page-4');
// PERBAIKAN #3: referensi ke section timeline, supaya bisa ikut ditampilkan/disembunyikan
const pageTimeline = document.getElementById('page-timeline');

const viewGiftsBtn = document.getElementById('view-gifts-btn');
const nextBtn1     = document.getElementById('next-btn-1');
const nextBtn2     = document.getElementById('next-btn-2');
const beforeBtn1   = document.getElementById('before-btn-1');
const beforeBtn2   = document.getElementById('before-btn-2');

const bacaBtn      = document.getElementById('baca-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');

const balloonContainer = document.getElementById('balloon-container');
const bgMusic          = document.getElementById('bg-music');

const videoBtn    = document.getElementById('video-btn');
const pageVideo   = document.getElementById('page-video');
const videoClose  = document.getElementById('video-close');
const videoPlayer = document.getElementById('video-player');

const pageLogoutPopup = document.getElementById('page-logout-popup');
const logoutPopupBtn = document.getElementById('logout-popup-btn');
const logoutClose = document.getElementById('logout-close');

// ==================== LOGIN (validasi ke backend) ====================
async function handleLogin() {
    const username = (usernameEl.value || '').trim();
    const code     = (codeEl.value || '').trim();
    loginError.textContent = '';

    if (!username || !code) {
        loginError.textContent = 'Username dan kode wajib diisi.';
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Memeriksa...';

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, code })
        });
        const data = await res.json();

        if (data.success) {
            sessionStorage.setItem('aya_logged_in', '1');
            showPage1();
        } else {
            loginError.textContent = data.message || 'Login gagal.';
        }
    } catch (err) {
        console.error('Login error:', err);
        loginError.textContent = 'Tidak dapat terhubung ke server.';
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Masuk';
    }
}

loginBtn.addEventListener('click', handleLogin);
[usernameEl, codeEl].forEach(el => {
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
});


// ===================== LOGOUT POPUP ====================
function openLogoutPopup() {
    pageLogoutPopup.classList.add('logout-open');
}
function closeLogoutPopup() {
    pageLogoutPopup.classList.remove('logout-open');
}
logoutPopupBtn.addEventListener('click', openLogoutPopup);
logoutClose.addEventListener('click', closeLogoutPopup);
logoutBtn.addEventListener('click', function (e) {
    e.preventDefault();
    sessionStorage.removeItem('aya_logged_in');
    [page1, page2, page3, page4, pageTimeline].forEach(p => {
        p.classList.remove('page-active');
        p.classList.add('page-hidden');
    });
    navbar.classList.add('navbar-hidden');
    document.body.classList.remove('with-navbar');
    loginPage.classList.remove('page-hidden');
    usernameEl.value = '';
    codeEl.value = '';

    closeLogoutPopup();
});

if (sessionStorage.getItem('aya_logged_in') === '1') {
    showPage1();
}


// ==================== NAVIGASI HALAMAN ====================
function showPage1() {
    loginPage.classList.add('page-hidden');
    page1.classList.remove('page-hidden');
    page1.classList.add('page-active');
    page2.classList.add('page-hidden');
    navbar.classList.add('navbar-hidden');
    document.body.classList.remove('with-navbar');
    generateStars();
    observeFadeIns(); // Daftarkan ulang animasi fade-in untuk Page 1
}
function showHome() {
    // Sembunyikan semua page gifts
    page2.classList.remove('page-active');
    page2.classList.add('page-hidden');

    page3.classList.remove('page-active');
    page3.classList.add('page-hidden');

    page4.classList.remove('page-active');
    page4.classList.add('page-hidden');

    pageTimeline.classList.remove('page-active');
    pageTimeline.classList.add('page-hidden');

    // Tampilkan Page 1
    page1.classList.remove('page-hidden');
    page1.classList.add('page-active');

    // Sembunyikan navbar (Page 1 tidak punya navbar)
    navbar.classList.add('navbar-hidden');
    document.body.classList.remove('with-navbar');

    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
    observeFadeIns();
}

homeBtn.addEventListener('click', function (e) {
    e.preventDefault();
    showHome();
});

function showGiftsPages() {
    page1.classList.add('page-hidden');
    page2.classList.add('page-active');
    page2.classList.remove('page-hidden');
    page3.classList.add('page-hidden');
    page4.classList.add('page-hidden');
    pageTimeline.classList.add('page-hidden');
    pageTimeline.classList.remove('page-active');

    navbar.classList.remove('navbar-hidden');
    document.body.classList.add('with-navbar');
    generateStars();
    observeFadeIns();
    observeReveals(); // Daftarkan animasi scroll-reveal untuk timeline
    setTimeout(() => {
        page2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
}

viewGiftsBtn.addEventListener('click', function (e) {
    e.preventDefault();
    showGiftsPages();
});

function showBeforePage1() {
    page1.classList.add('page-active');
    page1.classList.remove('page-hidden');
    page2.classList.add('page-hidden');
    page3.classList.add('page-hidden');
    page4.classList.add('page-hidden');
    pageTimeline.classList.add('page-hidden');
    pageTimeline.classList.remove('page-active');
    generateStars();
    observeFadeIns();
    observeReveals(); 
}
beforeBtn1.addEventListener('click', function (e) {
    e.preventDefault();
    showBeforePage1();
});
function showBeforePage2() {
    page1.classList.add('page-hidden');
    page2.classList.add('page-active');
    page2.classList.remove('page-hidden');
    page3.classList.add('page-hidden');
    page4.classList.add('page-hidden');
    pageTimeline.classList.add('page-hidden');
    pageTimeline.classList.remove('page-active');
    generateStars();
    observeFadeIns();
    observeReveals(); 
}
beforeBtn2.addEventListener('click', function (e) {
    e.preventDefault();
    showBeforePage2();
});
function showNextPage1() {
    page1.classList.add('page-hidden');
    page2.classList.add('page-hidden');
    page3.classList.add('page-active');
    page3.classList.remove('page-hidden');
    page4.classList.add('page-hidden');
    pageTimeline.classList.add('page-active');
    pageTimeline.classList.remove('page-hidden');
    navbar.classList.remove('navbar-hidden');
    document.body.classList.add('with-navbar');
    generateStars();
    observeFadeIns();
    observeReveals(); 
    setTimeout(() => {
        page2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
}

nextBtn1.addEventListener('click', function (e) {
    e.preventDefault();
    showNextPage1();
});



function showNextPage2() {
    page1.classList.add('page-hidden');
    page2.classList.add('page-hidden');
    page3.classList.add('page-hidden');
    page4.classList.add('page-active');
    page4.classList.remove('page-hidden');
    pageTimeline.classList.add('page-active');
    pageTimeline.classList.remove('page-hidden');
    navbar.classList.remove('navbar-hidden');
    document.body.classList.add('with-navbar');
    generateStars();
    observeFadeIns();
    observeReveals(); 

}
nextBtn2.addEventListener('click', function (e) {
    e.preventDefault();
    showNextPage2();
});



// ==================== SURAT POPUP ====================
bgMusic.addEventListener('error', () => console.error('Audio gagal dimuat.'));

function openLetter() {
    modalOverlay.classList.add('modal-open');
    launchBalloons();
    playMusic();
}
function closeLetter() {
    modalOverlay.classList.remove('modal-open');
    clearBalloons();
    stopMusic();
}
bacaBtn.addEventListener('click', openLetter);
modalClose.addEventListener('click', closeLetter);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeLetter(); });

// ==================== BALON ====================
const balloonColors = ['#F9C8CD', '#FFDDE2', '#FFB6C1', '#F4A6B7', '#FFC9DE'];

function launchBalloons() {
    clearBalloons();
    for (let i = 0; i < 18; i++) createBalloon(i);
}
function createBalloon(index) {
    const balloon = document.createElement('div');
    balloon.classList.add('balloon');
    balloon.style.left = (Math.random() * 100) + 'vw';
    balloon.style.backgroundColor = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    const size = 40 + Math.random() * 25;
    balloon.style.width = size + 'px';
    balloon.style.height = (size * 1.2) + 'px';
    const duration = 5 + Math.random() * 4;
    const delay = Math.random() * 1.5;
    balloon.style.animationDuration = duration + 's';
    balloon.style.animationDelay = delay + 's';

    const string = document.createElement('div');
    string.classList.add('balloon-string');
    balloon.appendChild(string);
    balloonContainer.appendChild(balloon);

    setTimeout(() => { if (balloon.parentNode) balloon.parentNode.removeChild(balloon); },
               (duration + delay) * 1000 + 200);
}
function clearBalloons() { balloonContainer.innerHTML = ''; }

// ==================== AUDIO ====================
function playMusic() {
    bgMusic.volume = 0.6;
    bgMusic.currentTime = 0;
    bgMusic.play().catch(err => console.error('Musik gagal diputar:', err.message));
}
function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}


// ==================== FADE-IN OBSERVER (page 1, 2, 3, 4) ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.style.getPropertyValue('--delay') || '0s';
            entry.target.style.transitionDelay = delay;
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.12 });

function observeFadeIns() {
    requestAnimationFrame(() => {
        document.querySelectorAll('.fade-in').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;

            el.classList.remove('visible');
            el.style.transitionDelay = '0s';
            observer.unobserve(el);
            observer.observe(el);
        });
    });
}

/*
 * PERBAIKAN #2: IntersectionObserver khusus untuk class ".reveal"
 * (dipakai oleh tl-card dan tl-marker di section timeline).
 * Tanpa observer ini, class "visible" tidak pernah ditambahkan, sehingga
 * semua item timeline permanen opacity:0 alias tidak pernah kelihatan.
 */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

function observeReveals() {
    requestAnimationFrame(() => {
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;
            revealObserver.unobserve(el);
            revealObserver.observe(el);
        });
    });
}

// ==================== BINTANG BERKERLIP ====================
function generateStars() {
    document.querySelectorAll('.stars-container').forEach(container => {
        if (container.dataset.filled === '1') return;
        container.innerHTML = '';
        for (let i = 0; i < 80; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            const size = 1 + Math.random() * 2;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.top = Math.random() * 100 + '%';
            star.style.left = Math.random() * 100 + '%';
            star.style.animationDuration = (1.5 + Math.random() * 2.5) + 's';
            star.style.animationDelay = (Math.random() * 3) + 's';
            container.appendChild(star);
        }
        container.dataset.filled = '1';
    });
}
generateStars();

// ==================== POPUP VIDEO ====================
function openVideo() {
    pageVideo.classList.add('video-open');
    launchBalloons();
    try {
        videoPlayer.currentTime = 0;
        videoPlayer.play().catch(err => console.warn('Autoplay diblokir:', err.name));
    } catch (e) {}
}
function closeVideo() {
    pageVideo.classList.remove('video-open');
    clearBalloons();
    try { videoPlayer.pause(); videoPlayer.currentTime = 0; } catch (e) {}
}
videoBtn.addEventListener('click', openVideo);
videoClose.addEventListener('click', closeVideo);
pageVideo.addEventListener('click', (e) => { if (e.target === pageVideo) closeVideo(); });



// ==================== TIMELINE: CONFETTI TOMBOL "RAYAKAN" ====================
const celebrateBtn = document.getElementById('celebrate-btn');
const confettiContainer = document.getElementById('confetti-container');
const confettiColors = ['#F9C8CD', '#f5adb6', '#c9b1d4', '#9c76a3', '#ffffff'];

if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
        launchConfetti();
    });
}

function launchConfetti() {
    for (let i = 0; i < 60; i++) createConfettiPiece();
}
function createConfettiPiece() {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');

    const size = 6 + Math.random() * 8;
    piece.style.width = size + 'px';
    piece.style.height = (size * 0.4) + 'px';
    piece.style.left = (Math.random() * 100) + 'vw';
    piece.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];

    const duration = 2.5 + Math.random() * 2;
    const delay = Math.random() * 0.6;
    piece.style.animationDuration = duration + 's';
    piece.style.animationDelay = delay + 's';

    confettiContainer.appendChild(piece);

    setTimeout(() => {
        if (piece.parentNode) piece.parentNode.removeChild(piece);
    }, (duration + delay) * 1000 + 200);
}

// ==================== ESCAPE key ====================
document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modalOverlay.classList.contains('modal-open')) closeLetter();
    if (pageVideo.classList.contains('video-open')) closeVideo();
});


