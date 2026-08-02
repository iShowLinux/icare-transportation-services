export function validateField(input) {
  const value = input.value.trim();
  let error = '';

  if (input.required && !value) {
    error = 'This field is required.';
  } else if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error = 'Please enter a valid email address.';
  } else if (input.type === 'tel' && value && !/^[\d\s\-\(\)\+]{7,15}$/.test(value)) {
    error = 'Please enter a valid phone number.';
  }

  showFieldError(input, error);
  return !error;
}

export function showFieldError(input, message) {
  input.classList.toggle('error', !!message);

  let msg = input.parentElement.querySelector('.form-message');
  if (!msg) {
    msg = document.createElement('span');
    msg.className = 'form-message error';
    input.parentElement.appendChild(msg);
  }
  msg.textContent = message;
  msg.style.display = message ? 'block' : 'none';
}

export function setupLiveValidation(form) {
  form.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });
}
