// ============================================================
// CANVAS BACKGROUND (shared with main site)
// ============================================================
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initParticles(); });

class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
        this.x = Math.random() * W;
        this.y = initial ? Math.random() * H : H + 10;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.color = Math.random() > 0.5 ? '0,240,255' : '191,0,255';
        this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.pulse += 0.02;
        if (this.y < -10) this.reset();
    }
    draw() {
        const op = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${op})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.floor((W * H) / 9000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

function drawNebula() {
    const blobs = [
        { x: W * 0.1,  y: H * 0.15, r: W * 0.3,  color: '191,0,255',  op: 0.06 },
        { x: W * 0.9,  y: H * 0.8,  r: W * 0.35, color: '0,240,255',   op: 0.05 },
        { x: W * 0.5,  y: H * 0.5,  r: W * 0.2,  color: '255,45,120',  op: 0.03 },
    ];
    blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(${b.color},${b.op})`);
        g.addColorStop(1, `rgba(${b.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawGrid() {
    const vanishX = W / 2, vanishY = H * 0.45, lines = 20;
    ctx.strokeStyle = `rgba(0,240,255,0.03)`;
    ctx.lineWidth = 1;
    for (let i = 0; i <= lines; i++) {
        const p = i / lines;
        const y = vanishY + (H - vanishY) * (p * p);
        const spread = (W / 2) * p;
        ctx.beginPath();
        ctx.moveTo(vanishX - spread, y);
        ctx.lineTo(vanishX + spread, y);
        ctx.stroke();
    }
    const vLines = 18;
    for (let i = 0; i <= vLines; i++) {
        ctx.beginPath();
        ctx.moveTo(vanishX, vanishY);
        ctx.lineTo((W / vLines) * i, H);
        ctx.stroke();
    }
}

function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020510';
    ctx.fillRect(0, 0, W, H);
    drawNebula();
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(render);
}
render();


// ============================================================
// AUTH — credentials (for static/demo use only)
// ============================================================
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'realbox2025'
};

const SESSION_KEY = 'rb_admin_session';

function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
}

// Auto-login if session exists
if (isLoggedIn()) {
    showDashboard();
}

// ============================================================
// LOGIN FORM
// ============================================================
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const loginBtnText = document.getElementById('loginBtnText');
const loginSpinner = document.getElementById('loginSpinner');

// Password toggle
document.getElementById('eyeBtn').addEventListener('click', () => {
    const pass = document.getElementById('adminPass');
    const isHidden = pass.type === 'password';
    pass.type = isHidden ? 'text' : 'password';
    document.getElementById('eyeIcon').innerHTML = isHidden
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
           <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
           <line x1="1" y1="1" x2="23" y2="23"/>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
           <circle cx="12" cy="12" r="3"/>`;
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.classList.remove('show');

    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value;

    // Simulate async check
    loginBtnText.textContent = 'Authenticating...';
    loginSpinner.classList.add('show');
    loginBtn.disabled = true;

    setTimeout(() => {
        if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
            sessionStorage.setItem(SESSION_KEY, '1');
            showDashboard();
        } else {
            loginError.classList.add('show');
            loginBtnText.textContent = 'Sign In';
            loginSpinner.classList.remove('show');
            loginBtn.disabled = false;
            document.getElementById('adminPass').value = '';
        }
    }, 900);
});

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashScreen').classList.remove('hidden');
    refreshStats();
    renderActivity();
    renderTable();
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    document.getElementById('dashScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    loginError.classList.remove('show');
    loginBtnText.textContent = 'Sign In';
    loginSpinner.classList.remove('show');
    loginBtn.disabled = false;
}


// ============================================================
// LOCAL STORAGE — waitlist
// ============================================================
const WAITLIST_KEY = 'rb_waitlist';

function getEmails() {
    try {
        return JSON.parse(localStorage.getItem(WAITLIST_KEY)) || [];
    } catch { return []; }
}

function saveEmails(list) {
    localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
}

// Seed some demo data if empty (remove in production)
function seedDemo() {
    if (getEmails().length === 0) {
        const demos = [
            'aisha.k@gmail.com',
            'rahul.dev@proton.me',
            'contact@example.org',
        ];
        const now = Date.now();
        const seeded = demos.map((email, i) => ({
            email,
            timestamp: now - (i + 1) * 86400000 * (i + 1)
        }));
        saveEmails(seeded);
    }
}
seedDemo();


// ============================================================
// STATS
// ============================================================
function refreshStats() {
    const emails = getEmails();
    const now = Date.now();
    const dayMs  = 86400000;
    const weekMs = dayMs * 7;

    const total = emails.length;
    const week  = emails.filter(e => now - e.timestamp < weekMs).length;
    const today = emails.filter(e => now - e.timestamp < dayMs).length;

    animateNumber('statTotal', total);
    animateNumber('statWeek',  week);
    animateNumber('statToday', today);

    document.getElementById('recentCount').textContent = Math.min(total, 5);
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = parseInt(el.textContent) || 0;
    const duration = 600;
    const startTime = performance.now();
    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (target - start) * ease);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}


// ============================================================
// ACTIVITY FEED
// ============================================================
function renderActivity() {
    const emails = getEmails();
    const list = document.getElementById('activityList');
    list.innerHTML = '';

    if (emails.length === 0) {
        list.innerHTML = '<div class="empty-state">No signups yet. Share your page!</div>';
        return;
    }

    const recent = [...emails]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

    recent.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-dot"></div>
            <div class="activity-email">${escapeHtml(entry.email)}</div>
            <div class="activity-time">${formatTime(entry.timestamp)}</div>
        `;
        list.appendChild(item);
    });
}


// ============================================================
// EMAIL TABLE
// ============================================================
let filteredEmails = [];

function renderTable() {
    const emails = getEmails();
    filteredEmails = [...emails].sort((a, b) => b.timestamp - a.timestamp);
    renderTableRows(filteredEmails);
}

function renderTableRows(list) {
    const tbody = document.getElementById('emailTableBody');
    const tableEmpty = document.getElementById('tableEmpty');
    tbody.innerHTML = '';

    if (list.length === 0) {
        tableEmpty.classList.remove('hidden');
        return;
    }

    tableEmpty.classList.add('hidden');

    list.forEach((entry, i) => {
        const initial = entry.email[0].toUpperCase();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="row-num">${i + 1}</td>
            <td>
                <div class="email-cell">
                    <div class="email-avatar">${escapeHtml(initial)}</div>
                    ${escapeHtml(entry.email)}
                </div>
            </td>
            <td class="date-cell">${formatDateTime(entry.timestamp)}</td>
            <td>
                <button class="action-btn ghost" onclick="deleteEmail('${escapeHtml(entry.email)}')" title="Remove">
                    ✕ Remove
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterEmails() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const emails = getEmails();
    const filtered = emails
        .filter(e => e.email.toLowerCase().includes(q))
        .sort((a, b) => b.timestamp - a.timestamp);
    renderTableRows(filtered);
}

function deleteEmail(email) {
    let emails = getEmails();
    emails = emails.filter(e => e.email !== email);
    saveEmails(emails);
    renderTable();
    renderActivity();
    refreshStats();
    showToast(`Removed ${email}`, 'info');
}

function clearAllEmails() {
    if (!confirm('Clear ALL emails from the waitlist? This cannot be undone.')) return;
    saveEmails([]);
    renderTable();
    renderActivity();
    refreshStats();
    showToast('Waitlist cleared.', 'error');
}

function addEmailManually(e) {
    e.preventDefault();
    const input = document.getElementById('newEmailInput');
    const email = input.value.trim().toLowerCase();
    const emails = getEmails();

    if (emails.find(en => en.email === email)) {
        showToast('Email already in waitlist.', 'error');
        return;
    }

    emails.push({ email, timestamp: Date.now() });
    saveEmails(emails);
    input.value = '';
    renderTable();
    renderActivity();
    refreshStats();
    showToast(`Added ${email}`, 'success');
}


// ============================================================
// NAVIGATION
// ============================================================
let currentSection = 'dashboard';

function showSection(name) {
    const sections = { dashboard: 'sectionDashboard', waitlist: 'sectionWaitlist' };
    const navItems = { dashboard: 'navDashboard', waitlist: 'navWaitlist' };
    const titles   = { dashboard: 'Dashboard', waitlist: 'Waitlist' };

    Object.values(sections).forEach(id => document.getElementById(id).classList.add('hidden'));
    Object.values(navItems).forEach(id => document.getElementById(id).classList.remove('active'));

    document.getElementById(sections[name]).classList.remove('hidden');
    document.getElementById(navItems[name]).classList.add('active');
    document.getElementById('topbarTitle').textContent = titles[name];

    currentSection = name;

    if (name === 'waitlist') renderTable();
    if (name === 'dashboard') { refreshStats(); renderActivity(); }

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')
        && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});


// ============================================================
// EXPORT CSV
// ============================================================
function exportCSV() {
    const emails = getEmails();
    if (emails.length === 0) {
        showToast('No emails to export.', 'error');
        return;
    }

    const rows = [['#', 'Email', 'Signed Up']];
    emails
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach((e, i) => rows.push([i + 1, e.email, formatDateTime(e.timestamp)]));

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `realbox_waitlist_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported!', 'success');
}


// ============================================================
// TOAST
// ============================================================
let toastTimer = null;

function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


// ============================================================
// MAIN SITE INTEGRATION
// Override submit listener in main site to save to localStorage
// (Drop-in: paste this into the main site's script.js as well)
// ============================================================
// This script also hooks into the main page's form if loaded there.
// On the admin page it just reads from the same localStorage key.


// ============================================================
// HELPERS
// ============================================================
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return new Date(ts).toLocaleDateString();
}

function formatDateTime(ts) {
    return new Date(ts).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}
