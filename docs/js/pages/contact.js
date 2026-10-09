import { validateField, validateRadioGroup, setupLiveValidation } from '../components/forms.js';

const form = document.getElementById('contact-form');
const successCard = document.getElementById('form-success');

// Address autocomplete using Nominatim (OpenStreetMap)
function setupAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);

  if (!input || !suggestions) return;

  let debounceTimer;

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query.length < 3) {
      suggestions.classList.remove('active');
      suggestions.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        // Focus on South Carolina, USA for better local results
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en-US,en',
              'User-Agent': 'iCare-Transportation-Website'
            }
          }
        );

        const data = await response.json();

        if (data.length > 0) {
          suggestions.innerHTML = data.map(place => {
            // Format address to remove comma between house number and street
            const display = place.display_name.replace(/^(\d+),\s*/, '$1 ');
            return `<div class="autocomplete-suggestion" data-address="${display}">${display}</div>`;
          }).join('');
          suggestions.classList.add('active');
        } else {
          suggestions.classList.remove('active');
          suggestions.innerHTML = '';
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      }
    }, 300);
  });

  // Handle suggestion click
  suggestions.addEventListener('click', (e) => {
    const suggestion = e.target.closest('.autocomplete-suggestion');
    if (suggestion) {
      input.value = suggestion.dataset.address;
      suggestions.classList.remove('active');
      suggestions.innerHTML = '';
    }
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.classList.remove('active');
      suggestions.innerHTML = '';
    }
  });

  // Close suggestions on Escape key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      suggestions.classList.remove('active');
      suggestions.innerHTML = '';
    }
  });
}

// Initialize autocomplete for both address fields
setupAutocomplete('pickup', 'pickup-suggestions');
setupAutocomplete('destination', 'destination-suggestions');

// Handle trip type selection - show/hide return date/time
const tripTypeRadios = document.querySelectorAll('input[name="trip_type"]');
const returnDatetimeRow = document.getElementById('return-datetime-row');
const returnDate = document.getElementById('return-date');
const returnTime = document.getElementById('return-time');

function updateReturnFields() {
  const isRoundTrip = document.querySelector('input[name="trip_type"]:checked')?.value === 'round_trip';
  if (isRoundTrip) {
    returnDatetimeRow.style.display = 'grid';
    returnDate.required = true;
    returnTime.required = true;
  } else {
    returnDatetimeRow.style.display = 'none';
    returnDate.required = false;
    returnTime.required = false;
    returnDate.value = '';
    returnTime.value = '';
  }
}

tripTypeRadios.forEach(radio => {
  radio.addEventListener('change', updateReturnFields);
});

if (form) {
  setupLiveValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll('.form-control');
    let valid = true;
    inputs.forEach(input => {
      // Skip validation for hidden/optional fields
      if (input.offsetParent === null && !input.required) return;
      if (!validateField(input)) valid = false;
    });

    // Validate radio group
    if (!validateRadioGroup('trip_type')) valid = false;

    // Validate return date/time if round trip
    const isRoundTrip = document.querySelector('input[name="trip_type"]:checked')?.value === 'round_trip';
    if (isRoundTrip) {
      if (!validateField(returnDate)) valid = false;
      if (!validateField(returnTime)) valid = false;
    }

    if (!valid) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, submitting...');

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    // Log form data for debugging
    const formData = new FormData(form);
    console.log('Form data being sent:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Web3Forms' AJAX API requires a JSON body with Content-Type: application/json.
    // Sending FormData (multipart) makes the API respond with an HTML success page
    // instead of JSON, so res.json() throws and the form appears broken.
    try {
      const payload = Object.fromEntries(new FormData(form).entries());

      const res = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok || data.success) {
        form.style.display = 'none';
        if (successCard) successCard.style.display = 'block';
      } else {
        throw new Error(data.message || `Server error: ${res.status}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Request <i class="fas fa-paper-plane"></i>';
      alert(`Something went wrong: ${error.message}. Please call us at (843) 227-4621 or try again.`);
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
