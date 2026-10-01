// ============ FUTURISTIC CANVAS BACKGROUND ============
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [], gridOpacity = 0;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initParticles(); });

// --- Particle Class ---
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
    const count = Math.floor((W * H) / 8000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

// --- Grid Lines ---
function drawGrid() {
    const cellSize = 60;
    const vanishX = W / 2;
    const vanishY = H * 0.45;
    const lines = 20;

    ctx.strokeStyle = `rgba(0,240,255,0.04)`;
    ctx.lineWidth = 1;

    // Horizontal lines (converging)
    for (let i = 0; i <= lines; i++) {
        const progress = i / lines;
        const y = vanishY + (H - vanishY) * (progress * progress);
        const spread = (W / 2) * progress;
        ctx.beginPath();
        ctx.moveTo(vanishX - spread, y);
        ctx.lineTo(vanishX + spread, y);
        ctx.stroke();
    }

    // Vertical lines (converging to vanish point)
    const vLines = 18;
    for (let i = 0; i <= vLines; i++) {
        const startX = (W / vLines) * i;
        ctx.beginPath();
        ctx.moveTo(vanishX, vanishY);
        ctx.lineTo(startX, H);
        ctx.stroke();
    }
}

// --- Nebula blobs ---
function drawNebula() {
    const blobs = [
        { x: W * 0.15, y: H * 0.2, r: W * 0.3, color: '191,0,255', op: 0.07 },
        { x: W * 0.85, y: H * 0.75, r: W * 0.35, color: '0,240,255', op: 0.06 },
        { x: W * 0.5,  y: H * 0.5,  r: W * 0.2,  color: '255,45,120', op: 0.04 },
    ];
    blobs.forEach(b => {
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, `rgba(${b.color},${b.op})`);
        grad.addColorStop(1, `rgba(${b.color},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
    });
}

// --- Main render loop ---
function render() {
    ctx.clearRect(0, 0, W, H);

    // Deep space bg
    ctx.fillStyle = '#020510';
    ctx.fillRect(0, 0, W, H);

    drawNebula();
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });

    requestAnimationFrame(render);
}
render();

// ============ FORM HANDLING ============
const form = document.getElementById('notifyForm');
const successMsg = document.getElementById('successMsg');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    successMsg.classList.add('show');
});
