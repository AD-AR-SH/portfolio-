/* ================================================================
   ADARSH S — Premium Portfolio
   script.js
   ================================================================ */

'use strict';

/* ── 1. UTILITIES ──────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 2. NAV: scroll state + mobile toggle ──────────────────────── */
function initNav() {
  const nav        = $('#nav');
  const toggle     = $('#navToggle');
  const menu       = $('#navMenu');
  const navLinks   = $$('.nav__link');

  if (!nav || !toggle || !menu) return;

  // Scroll state
  const updateNav = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 48);
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // Active link highlight on scroll
  const sections = $$('section[id]');
  const highlightNav = () => {
    const scrollMid = window.scrollY + window.innerHeight / 3;
    sections.forEach(section => {
      const link = $(`.nav__link[href="#${section.id}"]`);
      if (!link) return;
      const inView =
        section.offsetTop <= scrollMid &&
        section.offsetTop + section.offsetHeight > scrollMid;
      link.classList.toggle('is-active', inView);
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });
}

/* ── 3. SCROLL REVEAL ──────────────────────────────────────────── */
function initReveal() {
  const reveals = $$('.reveal');
  if (!reveals.length) return;

  if (prefersReducedMotion()) {
    reveals.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
}

/* ── 4. ROLE ROTATOR ───────────────────────────────────────────── */
function initRoles() {
  const rotator = $('#rolesRotator');
  if (!rotator || prefersReducedMotion()) return;

  const roles = $$('.role', rotator);
  if (!roles.length) return;

  let current = 0;

  const rotate = () => {
    const prev = roles[current];
    current = (current + 1) % roles.length;
    const next = roles[current];

    prev.classList.add('exiting');
    setTimeout(() => {
      prev.classList.remove('active', 'exiting');
    }, 400);

    next.classList.add('active');
  };

  setInterval(rotate, 2600);
}

/* ── 5. EXPERTISE TABS ─────────────────────────────────────────── */
function initTabs() {
  const tabBtns   = $$('.tab-btn');
  const tabPanels = $$('.tab-panel');

  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const panel = $(`#tab-${target}`);
      if (panel) panel.classList.add('active');
    });

    // Keyboard navigation
    btn.addEventListener('keydown', e => {
      const idx    = tabBtns.indexOf(btn);
      let newIdx   = idx;

      if (e.key === 'ArrowRight') newIdx = (idx + 1) % tabBtns.length;
      if (e.key === 'ArrowLeft')  newIdx = (idx - 1 + tabBtns.length) % tabBtns.length;
      if (e.key === 'Home')       newIdx = 0;
      if (e.key === 'End')        newIdx = tabBtns.length - 1;

      if (newIdx !== idx) {
        e.preventDefault();
        tabBtns[newIdx].focus();
        tabBtns[newIdx].click();
      }
    });
  });
}

/* ── 6. CONTACT FORM ───────────────────────────────────────────── */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const fields = {
    name:    { el: $('#form-name'),    err: $('#name-error'),    label: 'Name' },
    email:   { el: $('#form-email'),   err: $('#email-error'),   label: 'Email' },
    message: { el: $('#form-message'), err: $('#message-error'), label: 'Message' },
  };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(field, msg) {
    field.el.classList.add('is-error');
    if (field.err) field.err.textContent = msg;
  }
  function clearError(field) {
    field.el.classList.remove('is-error');
    if (field.err) field.err.textContent = '';
  }

  function validateField(key) {
    const f = fields[key];
    const val = f.el.value.trim();

    if (!val) {
      setError(f, `${f.label} is required.`);
      return false;
    }
    if (key === 'email' && !emailRe.test(val)) {
      setError(f, 'Please enter a valid email address.');
      return false;
    }
    clearError(f);
    return true;
  }

  // Live validation
  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('blur', () => validateField(key));
    fields[key].el.addEventListener('input', () => {
      if (fields[key].el.classList.contains('is-error')) validateField(key);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const valid = Object.keys(fields).map(validateField).every(Boolean);
    if (!valid) return;

    const name    = fields.name.el.value.trim();
    const email   = fields.email.el.value.trim();
    const subject = ($('#form-subject') || {}).value?.trim() || 'Enquiry from portfolio';
    const message = fields.message.el.value.trim();

    const body = encodeURIComponent(
      `Hi Adarsh,\n\nMy name is ${name} and my email is ${email}.\n\n${message}\n\nSent from your portfolio contact form.`
    );
    const subjectEnc = encodeURIComponent(subject || 'Enquiry from portfolio');

    window.location.href =
      `mailto:adarshuser27@gmail.com?subject=${subjectEnc}&body=${body}`;
  });
}

/* ── 7. BACK TO TOP ────────────────────────────────────────────── */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
  });
}

/* ── 8. FOOTER YEAR ────────────────────────────────────────────── */
function setFooterYear() {
  const el = $('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── 9. TAWK.TO CONFIG (PLACEHOLDER) ──────────────────────────────
   Instructions:
   1. Create account at https://www.tawk.to
   2. Add a "Property" for your website
   3. Copy your Property ID and Widget ID from the widget embed code
   4. Replace 'YOUR_PROPERTY_ID' and 'YOUR_WIDGET_ID' below
   5. Uncomment the initTawkTo() call at the bottom
   ──────────────────────────────────────────────────────────────── */
function initTawkTo() {
  const PROPERTY_ID = 'YOUR_PROPERTY_ID'; // e.g. '64abc123def456789'
  const WIDGET_ID   = 'YOUR_WIDGET_ID';   // e.g. '1h8def456'

  if (PROPERTY_ID === 'YOUR_PROPERTY_ID') {
    console.info('[Portfolio] tawk.to not configured. See script.js comments for setup.');
    return;
  }

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const s1 = document.createElement('script');
  const s0 = document.getElementsByTagName('script')[0];
  s1.async = true;
  s1.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);
}

/* ── 10. WHATSAPP CONFIG (PLACEHOLDER) ────────────────────────────
   Instructions:
   - Confirm the country code for number 9961308526
   - For India (+91): https://wa.me/919961308526
   - Replace WHATSAPP_URL below and un-comment the activateWhatsApp() call
   ──────────────────────────────────────────────────────────────── */
function activateWhatsApp() {
const WHATSAPP_URL = 'https://wa.me/919961308526'; // Set this after confirming country code

  if (!WHATSAPP_URL) {
    console.info('[Portfolio] WhatsApp URL not configured. Confirm country code first.');
    return;
  }

  // Find the pending WhatsApp contact item and make it a live link
  const waItem = document.querySelector('.contact-item--pending .fa-whatsapp');
  if (waItem) {
    const wrapper = waItem.closest('.contact-item');
    const link = document.createElement('a');
    link.href = WHATSAPP_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Chat on WhatsApp');
    link.className = wrapper.className.replace('contact-item--pending', '');
    link.innerHTML = wrapper.innerHTML;
    wrapper.parentNode.replaceChild(link, wrapper);
  }
}

/* ── 11. SKILL PILL HOVER ANIMATION ───────────────────────────── */
function initSkillPills() {
  if (prefersReducedMotion()) return;

  $$('.skill-pill').forEach(pill => {
    pill.addEventListener('mouseenter', () => {
      pill.style.transitionDelay = '0ms';
    });
  });
}

/* ── 12. SMOOTH HASH SCROLLING (fallback for older browsers) ───── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
      // Update focus for a11y
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

/* ── BOOT ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initRoles();
  initTabs();
  initContactForm();
  initBackToTop();
  setFooterYear();
  initSkillPills();
  initSmoothScroll();

  // Un-comment when configured:
  // initTawkTo();
  // activateWhatsApp();

  console.log(
    '%c Adarsh S Portfolio ',
    'background:#2a6ef5;color:#fff;font-family:monospace;padding:4px 8px;border-radius:4px;font-weight:bold;',
    '\nAI Systems & Automation\nhttps://github.com/AD-AR-SH'
  );
});
