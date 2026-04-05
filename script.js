/* ── THREE.JS PARTICLE BACKGROUND ─────────────────── */
(function initThree() {
  const canvas = document.getElementById('bg');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 80;

  /* Particles */
  const COUNT = window.innerWidth < 768 ? 80 : 160;
  const positions = new Float32Array(COUNT * 3);
  const velocities = [];

  for (let i = 0; i < COUNT; i++) {
    const spread = 120;
    positions[i * 3]     = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    velocities.push({
      x: (Math.random() - 0.5) * 0.015,
      y: (Math.random() - 0.5) * 0.015,
      z: (Math.random() - 0.5) * 0.005,
    });
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0x6366f1,
    size: 0.6,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  /* Connection lines */
  const lineMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.08 });
  let linesMesh = null;

  function buildLines() {
    if (linesMesh) { scene.remove(linesMesh); linesMesh.geometry.dispose(); }
    const linePositions = [];
    const THRESHOLD = 28;
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = positions[i * 3]     - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < THRESHOLD) {
          linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(linesMesh);
  }

  buildLines();

  /* Mouse parallax */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let frameCount = 0;
  function animate() {
    requestAnimationFrame(animate);
    frameCount++;

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;
      if (Math.abs(positions[i * 3])     > 60) velocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 60) velocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 30) velocities[i].z *= -1;
    }
    geo.attributes.position.needsUpdate = true;

    if (frameCount % 4 === 0) buildLines();

    camera.position.x += (mouseX * 6 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 4 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ── CUSTOM CURSOR ──────────────────────────────── */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let cx = 0, cy = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });

(function cursorLoop() {
  requestAnimationFrame(cursorLoop);
  rx += (cx - rx) * 0.14;
  ry += (cy - ry) * 0.14;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  ring.style.left   = rx + 'px';
  ring.style.top    = ry + 'px';
})();

document.querySelectorAll('a,button,.ltrig,.tilt').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

/* ── SCROLL PROGRESS ────────────────────────────── */
const scrollBar = document.getElementById('scrollBar');
window.addEventListener('scroll', () => {
  const prog = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  scrollBar.style.width = (prog * 100) + '%';
}, { passive: true });

/* ── HEADER SCROLL ──────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('stuck', window.scrollY > 50);
}, { passive: true });

/* ── MOBILE MENU ────────────────────────────────── */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});
mobileMenu.querySelectorAll('.mm-link').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── TYPEWRITER ─────────────────────────────────── */
const roles = ['3D Experiences', 'Game Prototypes', 'Brand Identities', 'Motion Graphics', 'Immersive Worlds'];
let roleIdx = 0, charIdx = 0, deleting = false;
const tw = document.getElementById('typewriter');

function type() {
  const word = roles[roleIdx];
  if (!deleting) {
    tw.textContent = word.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === word.length) {
      deleting = true;
      setTimeout(type, 2000);
      return;
    }
    setTimeout(type, 80);
  } else {
    tw.textContent = word.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(type, 400);
      return;
    }
    setTimeout(type, 45);
  }
}
setTimeout(type, 1000);

/* ── REVEAL ON SCROLL ───────────────────────────── */
const revealEls = document.querySelectorAll('.r-up');
const revObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('vis'); revObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revObs.observe(el));

/* ── STAT BARS ANIMATE ──────────────────────────── */
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.sfill').forEach(f => f.classList.add('anim'));
      barObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.scard').forEach(c => barObs.observe(c));

/* ── COUNT UP ───────────────────────────────────── */
function countUp(el) {
  const target = parseInt(el.dataset.to || el.dataset.target || '0');
  const duration = 1600;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(ease * target);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}
const countObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.count').forEach(countUp);
      countObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.hero-stats,.stat-grid,.about-right').forEach(s => countObs.observe(s));

/* ── PHOTO / CONTACT CARD 3D TILT ───────────────── */
function applyTilt(el, e) {
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width  - 0.5;
  const y = (e.clientY - r.top)  / r.height - 0.5;
  el.style.transform = `perspective(800px) rotateX(${-y * 12}deg) rotateY(${x * 16}deg)`;
}

const photoWrap = document.getElementById('photoWrap');
if (photoWrap) {
  photoWrap.addEventListener('mousemove', e => applyTilt(photoWrap, e));
  photoWrap.addEventListener('mouseleave', () => { photoWrap.style.transform = ''; });
}

const bizCard = document.getElementById('bizCard');
if (bizCard) {
  bizCard.addEventListener('mousemove', e => applyTilt(bizCard, e));
  bizCard.addEventListener('mouseleave', () => { bizCard.style.transform = ''; });
}

/* Project cards tilt */
document.querySelectorAll('.tilt').forEach(card => {
  if (window.innerWidth < 992) return;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(1200px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ── PROJECT FILTERS ────────────────────────────── */
const filterBtns = document.querySelectorAll('.fb');
const projectCards = document.querySelectorAll('.pcard');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.f;
    projectCards.forEach(card => {
      const show = f === 'all' || card.dataset.cat === f;
      card.classList.toggle('hidden', !show);
    });
  });
});

/* ── AUTOPLAY VIDEOS ────────────────────────────── */
const videoObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    const vid = e.target;
    if (e.isIntersecting) { vid.play().catch(() => {}); }
    else { vid.pause(); }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.av').forEach(v => {
  v.muted = true; v.loop = true; v.playsInline = true;
  videoObs.observe(v);
});

/* ── LIGHTBOX ───────────────────────────────────── */
const lightbox  = document.getElementById('lightbox');
const lbContent = document.getElementById('lbContent');
const lbCap     = document.getElementById('lbCap');
const lbClose   = document.getElementById('lbClose');

function openLB(type, src, cap) {
  lbContent.innerHTML = '';
  if (type === 'video') {
    const v = document.createElement('video');
    v.src = src; v.controls = true; v.autoplay = true; v.loop = true; v.playsInline = true;
    lbContent.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = src; img.alt = cap || '';
    lbContent.appendChild(img);
  }
  lbCap.textContent = cap || '';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLB() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lbContent.innerHTML = '';
  lbCap.textContent = '';
  document.body.style.overflow = '';
}

document.querySelectorAll('.ltrig').forEach(el => {
  el.addEventListener('click', () => openLB(el.dataset.t, el.dataset.s, el.dataset.c));
});
lbClose.addEventListener('click', closeLB);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });

/* ── ACTIVE NAV LINK ────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#nav a');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(link => {
      link.classList.toggle('active-link', link.getAttribute('href') === '#' + e.target.id);
    });
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
sections.forEach(s => sectionObs.observe(s));

/* ── SMOOTH SCROLL ──────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});
