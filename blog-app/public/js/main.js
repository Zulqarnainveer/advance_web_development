
// main.js — BlogFlow Client-Side Scripts

// ── Toast Notification System ─────────────────────────
window.showToast = function(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'fa-solid fa-circle-check',
    error  : 'fa-solid fa-circle-xmark',
    info   : 'fa-solid fa-circle-info',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info}"></i>
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.classList.add('removing');setTimeout(()=>this.parentElement.remove(),350)">&times;</button>
  `;
  container.appendChild(toast);

  // Auto-dismiss
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 350);
    }
  }, duration);
};

// ── Dark Mode Toggle ──────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeIcon) {
    themeIcon.className = theme === 'dark'
      ? 'fa-solid fa-sun'
      : 'fa-solid fa-moon';
  }
}

// Init theme icon on load
(function() {
  const saved = localStorage.getItem('theme') || 'light';
  setTheme(saved);
})();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// ── Mobile Navigation Toggle ──────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// ── Navbar Scroll Shadow ──────────────────────────────
const navbar = document.querySelector('.navbar');
if (navbar) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ── Confirm Delete ────────────────────────────────────
function confirmDelete() {
  return confirm('Are you sure you want to delete this post? This action cannot be undone.');
}

// ── Toggle Password Visibility ────────────────────────
function togglePassword(id) {
  const input = document.getElementById(id);
  const icon  = document.getElementById('icon-' + id);
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
}

// ── Password Strength Indicator ───────────────────────
const pwInput    = document.getElementById('password');
const pwStrength = document.getElementById('pwStrength');
if (pwInput && pwStrength) {
  pwInput.addEventListener('input', () => {
    const val = pwInput.value;
    let score = 0;
    if (val.length >= 6)  score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val))  score++;
    if (/[0-9]/.test(val))  score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const colours = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];
    const widths  = ['0%', '20%', '40%', '60%', '80%', '100%'];
    pwStrength.style.background = colours[score];
    pwStrength.style.width      = widths[score];
  });
}

// ── File Drag & Drop ──────────────────────────────────
const dropZone = document.getElementById('dropZone');
if (dropZone) {
  ['dragenter', 'dragover'].forEach(event => {
    dropZone.addEventListener(event, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(event => {
    dropZone.addEventListener(event, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });
  dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    const input = document.getElementById('imageInput');
    if (file && input) {
      // Update file input
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change'));
    }
  });
}

// ── Auto-dismiss flash alerts ─────────────────────────
setTimeout(() => {
  document.querySelectorAll('.alert').forEach(alert => {
    alert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-10px)';
    setTimeout(() => alert.remove(), 500);
  });
}, 6000);

// ── Active nav link highlight ─────────────────────────
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.style.color = 'var(--primary)';
    link.style.background = 'var(--primary-light)';
  }
});
