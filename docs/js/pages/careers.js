import { validateField, validateCheckbox, validateRadioGroup, setupLiveValidation } from '../components/forms.js';

const form = document.getElementById('application-form');
const workHistoryContainer = document.getElementById('work-history-container');
const addWorkHistoryBtn = document.getElementById('add-work-history');

let workHistoryCount = 1;

// Add work history entry
addWorkHistoryBtn.addEventListener('click', () => {
  workHistoryCount++;
  const entry = document.createElement('div');
  entry.className = 'work-history-entry';
  entry.innerHTML = `
    <button type="button" class="remove-work-history" data-entry="${workHistoryCount}">
      <i class="fas fa-times"></i> Remove
    </button>
    <h4>Employment #${workHistoryCount}</h4>
    <div class="form-row">
      <div class="form-group">
        <label>Employer Name <span class="required">*</span></label>
        <input type="text" name="employer_${workHistoryCount}" class="form-control" placeholder="Company name" required>
      </div>
      <div class="form-group">
        <label>Supervisor Name</label>
        <input type="text" name="supervisor_${workHistoryCount}" class="form-control" placeholder="Supervisor name">
      </div>
    </div>
    <div class="form-group">
      <label>Address</label>
      <input type="text" name="employer_address_${workHistoryCount}" class="form-control" placeholder="Street address">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>City</label>
        <input type="text" name="employer_city_${workHistoryCount}" class="form-control" placeholder="City">
      </div>
      <div class="form-group">
        <label>State</label>
        <input type="text" name="employer_state_${workHistoryCount}" class="form-control" placeholder="SC">
      </div>
      <div class="form-group">
        <label>ZIP</label>
        <input type="text" name="employer_zip_${workHistoryCount}" class="form-control" placeholder="29401">
      </div>
    </div>
    <div class="form-group">
      <label>Job Duties</label>
      <textarea name="job_duties_${workHistoryCount}" class="form-control" placeholder="Description of responsibilities"></textarea>
    </div>
    <div class="form-group">
      <label>Reason for Leaving</label>
      <input type="text" name="reason_leaving_${workHistoryCount}" class="form-control" placeholder="Reason for leaving">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Start Date <span class="required">*</span></label>
        <input type="month" name="employment_start_${workHistoryCount}" class="form-control" required>
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input type="month" name="employment_end_${workHistoryCount}" class="form-control">
      </div>
    </div>
  `;
  workHistoryContainer.appendChild(entry);

  // Setup remove button
  entry.querySelector('.remove-work-history').addEventListener('click', () => {
    entry.remove();
  });
});

// Remove work history entry (for existing entries)
workHistoryContainer.addEventListener('click', (e) => {
  if (e.target.closest('.remove-work-history')) {
    const entry = e.target.closest('.work-history-entry');
    if (workHistoryContainer.children.length > 1) {
      entry.remove();
    } else {
      alert('At least one work history entry is required');
    }
  }
});

if (form) {
  setupLiveValidation(form);

  // Add live validation for violations
  const violations = document.getElementById('violations');
  if (violations) {
    violations.addEventListener('blur', () => {
      const violationsValue = parseInt(violations.value);
      if (violations.value && violationsValue > 2) {
        violations.classList.add('error');
        let msg = violations.parentElement.querySelector('.form-message');
        if (!msg) {
          msg = document.createElement('span');
          msg.className = 'form-message error';
          violations.parentElement.appendChild(msg);
        }
        msg.textContent = 'Cannot be more than 2 violations';
        msg.style.display = 'block';
      } else {
        violations.classList.remove('error');
        let msg = violations.parentElement.querySelector('.form-message');
        if (msg) msg.style.display = 'none';
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll('.form-control');
    let valid = true;
    inputs.forEach(input => {
      if (input.offsetParent === null && !input.required) return;
      if (!validateField(input)) valid = false;
    });

    // Validate driver's license
    const licenseChecked = document.querySelector('input[name="valid_license"]:checked');
    if (!licenseChecked) {
      alert('Please answer: Do you have a valid driver\'s license?');
      valid = false;
    } else if (licenseChecked.value !== 'yes') {
      alert('Requirement: A valid driver\'s license is required for this position.');
      valid = false;
    }

    // Validate moving violations
    const violations = document.getElementById('violations');
    const violationsValue = parseInt(violations.value);
    if (isNaN(violationsValue) || violationsValue > 2) {
      alert('Requirement: Cannot have more than 2 moving violations in the past 3 years.');
      violations.classList.add('error');
      valid = false;
    } else {
      violations.classList.remove('error');
    }

    // Validate background check consent
    const bgCheckChecked = document.querySelector('input[name="background_check"]:checked');
    if (!bgCheckChecked) {
      alert('Please answer: Are you willing to undergo a background check?');
      valid = false;
    } else if (bgCheckChecked.value !== 'yes') {
      alert('Requirement: Willingness to undergo a background check is required.');
      valid = false;
    }

    // Validate DOT physical consent
    const dotPhysicalChecked = document.querySelector('input[name="dot_physical"]:checked');
    if (!dotPhysicalChecked) {
      alert('Please answer: Are you willing to undergo a DOT Physical?');
      valid = false;
    } else if (dotPhysicalChecked.value !== 'yes') {
      alert('Requirement: Willingness to undergo a DOT Physical and drug screening is required.');
      valid = false;
    }

    // Validate at least one work history entry
    const workHistoryEntries = workHistoryContainer.querySelectorAll('.work-history-entry');
    let hasWorkHistory = false;
    workHistoryEntries.forEach(entry => {
      const employer = entry.querySelector('input[name^="employer"]').value.trim();
      const startDate = entry.querySelector('input[name^="employment_start"]').value.trim();
      if (employer && startDate) hasWorkHistory = true;
    });

    if (!hasWorkHistory) {
      alert('Please provide at least one complete work history entry (employer and start date)');
      valid = false;
    }

    // Validate final consent checkbox
    const finalConsent = document.getElementById('final-consent');
    if (!validateCheckbox(finalConsent)) valid = false;

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

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        redirect: 'follow'
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok || data.success) {
        form.style.display = 'none';
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.style.display = 'block';
        successMessage.innerHTML = `
          <i class="fas fa-circle-check"></i>
          <h3>Application Received!</h3>
          <p>Thank you for your interest in joining iCare Transportation! We'll review your application and contact you soon to discuss next steps.</p>
        `;
        form.parentElement.appendChild(successMessage);
      } else {
        throw new Error(data.message || `Server error: ${res.status}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit Application <i class="fas fa-paper-plane"></i>';
      alert(`Something went wrong: ${error.message}. Please try again or call us at (843) 227-4621.`);
    }
  });
}
