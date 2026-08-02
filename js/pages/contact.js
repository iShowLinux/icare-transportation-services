import { validateField, setupLiveValidation } from '../components/forms.js';

const form = document.getElementById('contact-form');
const successCard = document.getElementById('form-success');

if (form) {
  setupLiveValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll('.form-control');
    let valid = true;
    inputs.forEach(input => { if (!validateField(input)) valid = false; });
    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    // Replace the action URL with your form service endpoint (e.g. Formspree, Netlify Forms)
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        form.style.display = 'none';
        if (successCard) successCard.style.display = 'block';
      } else {
        throw new Error('Server error');
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Request <i class="fas fa-paper-plane"></i>';
      alert('Something went wrong. Please call us at (843) 227-4621 or try again.');
    }
  });
}

// FAQ accordion (reused on FAQ page too)
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// FAQ category filter
document.querySelectorAll('.faq-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    document.querySelectorAll('.faq-item').forEach(item => {
      item.style.display = (!cat || cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
    });
  });
});
