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

export function validateRadioGroup(name) {
  const radios = document.querySelectorAll(`input[name="${name}"]`);
  const checked = Array.from(radios).some(radio => radio.checked);
  const fieldset = radios[0]?.closest('fieldset');
  let error = '';

  if (!checked) {
    error = 'Please select an option.';
  }

  if (fieldset) {
    fieldset.classList.toggle('error', !!error);
    let msg = fieldset.parentElement.querySelector('.form-message');
    if (!msg) {
      msg = document.createElement('span');
      msg.className = 'form-message error';
      fieldset.parentElement.appendChild(msg);
    }
    msg.textContent = error;
    msg.style.display = error ? 'block' : 'none';
  }

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

  // Setup radio group validation
  const radioGroups = new Set();
  form.querySelectorAll('input[type="radio"]').forEach(radio => {
    radioGroups.add(radio.name);
  });

  radioGroups.forEach(groupName => {
    form.querySelectorAll(`input[name="${groupName}"]`).forEach(radio => {
      radio.addEventListener('change', () => {
        const fieldset = radio.closest('fieldset');
        if (fieldset && fieldset.classList.contains('error')) {
          validateRadioGroup(groupName);
        }
      });
    });
  });
}
