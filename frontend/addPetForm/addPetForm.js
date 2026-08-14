/**
 * PET REGISTRATION FORM - VANILLA JS ENGINE
 */

// Breed Data per Species
const BREED_DATA = {
  Dog: [
    "Labrador Retriever", "Golden Retriever", "German Shepherd", "Beagle", 
    "Pug", "Shih Tzu", "Rottweiler", "Husky", "Dachshund", "French Bulldog", 
    "Poodle", "Boxer", "Australian Shepherd", "Other"
  ],
  Cat: [
    "Persian", "Siamese", "Maine Coon", "Bengal", "British Shorthair", 
    "Ragdoll", "Sphynx", "American Shorthair", "Scottish Fold", "Abyssinian", "Other"
  ],
  Bird: [
    "Parakeet / Budgie", "Cockatiel", "Canary", "Lovebird", "Cockatoo", 
    "Macaw", "Conure", "Finch", "Other"
  ],
  Reptile: [
    "Bearded Dragon", "Leopard Gecko", "Ball Python", "Corn Snake", 
    "Red-Eared Slider", "Chameleon", "Iguana", "Other"
  ],
  Fish: [
    "Goldfish", "Betta", "Guppy", "Angelfish", "Neon Tetra", "Molly", "Other"
  ],
  Horse: [
    "Quarter Horse", "Thoroughbred", "Arabian", "Appaloosa", "Paint Horse", "Other"
  ],
  Exotic: [
    "Rabbit", "Guinea Pig", "Hamster", "Ferret", "Chinchilla", "Hedgehog", "Other"
  ]
};

// Global State
const state = {
  allergies: [],
  medicalConditions: [],
  photoDataUrl: null,
  selectedBreed: ''
};

// DOM Elements Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  initMaxDateRestriction();
  initSpeciesBreedLogic();
  initImageUpload();
  initTagInputs();
  initFormValidationAndSubmission();
});

/**
 * Prevent Future Dates in Date Picker
 */
function initMaxDateRestriction() {
  const dateInput = document.getElementById('dateOfBirth');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('max', today);
  }
}

/**
 * Species & Searchable Breed Selection Logic
 */
function initSpeciesBreedLogic() {
  const speciesSelect = document.getElementById('species');
  const breedSearchInput = document.getElementById('breedSearch');
  const breedHiddenInput = document.getElementById('breed');
  const breedDropdown = document.getElementById('breedDropdown');
  const breedContainer = document.getElementById('breedSelectContainer');

  let currentBreeds = [];

  // Enable and populate breeds when species changes
  speciesSelect.addEventListener('change', (e) => {
    const species = e.target.value;
    currentBreeds = BREED_DATA[species] || [];
    
    breedSearchInput.disabled = false;
    breedSearchInput.value = '';
    breedHiddenInput.value = '';
    state.selectedBreed = '';
    breedSearchInput.placeholder = 'Search or select breed';
    
    clearFieldError('breed');
    renderBreedDropdown(currentBreeds);
  });

  // Filter breed list on input
  breedSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    breedHiddenInput.value = ''; // clear hidden value until selected
    state.selectedBreed = '';

    const filtered = currentBreeds.filter(b => b.toLowerCase().includes(query));
    renderBreedDropdown(filtered);
    showBreedDropdown();
  });

  // Open dropdown on focus
  breedSearchInput.addEventListener('focus', () => {
    if (!breedSearchInput.disabled) {
      renderBreedDropdown(currentBreeds);
      showBreedDropdown();
    }
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!breedContainer.contains(e.target)) {
      hideBreedDropdown();
    }
  });

  function renderBreedDropdown(list) {
    breedDropdown.innerHTML = '';

    if (list.length === 0) {
      breedDropdown.innerHTML = `<div class="dropdown-empty">No breeds found</div>`;
      return;
    }

    list.forEach(breed => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = breed;
      
      item.addEventListener('click', () => {
        breedSearchInput.value = breed;
        breedHiddenInput.value = breed;
        state.selectedBreed = breed;
        clearFieldError('breed');
        hideBreedDropdown();
      });

      breedDropdown.appendChild(item);
    });
  }

  function showBreedDropdown() {
    breedDropdown.hidden = false;
  }

  function hideBreedDropdown() {
    breedDropdown.hidden = true;
  }
}

/**
 * Image Upload & Preview Logic
 */
function initImageUpload() {
  const uploadContainer = document.getElementById('uploadContainer');
  const fileInput = document.getElementById('petPhoto');
  const dropzone = document.getElementById('uploadDropzone');
  const preview = document.getElementById('uploadPreview');
  const previewImage = document.getElementById('previewImage');
  const btnChange = document.getElementById('btnChangePhoto');
  const btnRemove = document.getElementById('btnRemovePhoto');

  // Click dropzone to select file
  dropzone.addEventListener('click', () => fileInput.click());
  btnChange.addEventListener('click', () => fileInput.click());

  // Handle Drag & Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadContainer.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadContainer.classList.remove('drag-over');
    });
  });

  uploadContainer.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  });

  // File Input Selection
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleImageFile(e.target.files[0]);
    }
  });

  // Remove Photo Action
  btnRemove.addEventListener('click', () => {
    fileInput.value = '';
    state.photoDataUrl = null;
    previewImage.src = '';
    preview.hidden = true;
    dropzone.hidden = false;
    clearFieldError('petPhoto');
  });

  function handleImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      showFieldError('petPhoto', 'Please select a valid image (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > maxSize) {
      showFieldError('petPhoto', 'Image size must be less than 5MB.');
      return;
    }

    clearFieldError('petPhoto');

    const reader = new FileReader();
    reader.onload = (e) => {
      state.photoDataUrl = e.target.result;
      previewImage.src = state.photoDataUrl;
      dropzone.hidden = true;
      preview.hidden = false;
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Tags / Chips System (Allergies & Medical Conditions)
 */
function initTagInputs() {
  setupTagField('allergyInput', 'allergyTags', state.allergies);
  setupTagField('conditionInput', 'conditionTags', state.medicalConditions);
}

function setupTagField(inputId, tagsContainerId, listArray) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(tagsContainerId);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.value.trim().replace(/^,|,$/g, '');
      if (val && !listArray.includes(val)) {
        listArray.push(val);
        renderTags(container, listArray);
        input.value = '';
      }
    }
  });

  // Process input on blur if text remains
  input.addEventListener('blur', () => {
    const val = input.value.trim().replace(/^,|,$/g, '');
    if (val && !listArray.includes(val)) {
      listArray.push(val);
      renderTags(container, listArray);
      input.value = '';
    }
  });
}

function renderTags(container, listArray) {
  container.innerHTML = '';
  listArray.forEach((item, index) => {
    const chip = document.createElement('div');
    chip.className = 'tag-chip';
    chip.innerHTML = `
      <span>${escapeHtml(item)}</span>
      <button type="button" class="tag-chip-remove" aria-label="Remove ${escapeHtml(item)}">
        <i data-lucide="x"></i>
      </button>
    `;

    chip.querySelector('.tag-chip-remove').addEventListener('click', () => {
      listArray.splice(index, 1);
      renderTags(container, listArray);
    });

    container.appendChild(chip);
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Validation & Submission Engine
 */
function initFormValidationAndSubmission() {
  const form = document.getElementById('petRegistrationForm');
  const btnCancel = document.getElementById('btnCancel');

  // Real-time blur validation
  document.getElementById('petName').addEventListener('blur', validatePetName);
  document.getElementById('species').addEventListener('change', validateSpecies);
  document.getElementById('dateOfBirth').addEventListener('change', validateDateOfBirth);
  document.getElementById('weightValue').addEventListener('input', validateWeight);

  // Clear radio error on change
  document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', () => clearFieldError('gender'));
  });

  // Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = validatePetName();
    const isSpeciesValid = validateSpecies();
    const isBreedValid = validateBreed();
    const isGenderValid = validateGender();
    const isDobValid = validateDateOfBirth();
    const isWeightValid = validateWeight();

    const isFormValid = isNameValid && isSpeciesValid && isBreedValid && 
                        isGenderValid && isDobValid && isWeightValid;

    if (!isFormValid) {
      // Scroll to first error smoothly
      const firstError = document.querySelector('.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Collect Form Data into JS Object
    const petData = {
      petName: document.getElementById('petName').value.trim(),
      species: document.getElementById('species').value,
      breed: document.getElementById('breed').value || document.getElementById('breedSearch').value,
      gender: document.querySelector('input[name="gender"]:checked').value,
      dateOfBirth: document.getElementById('dateOfBirth').value,
      currentWeight: {
        value: parseFloat(document.getElementById('weightValue').value),
        unit: document.getElementById('weightUnit').value
      },
      petPhoto: state.photoDataUrl,
      colorMarkings: document.getElementById('colorMarkings').value.trim(),
      spayedNeutered: getSelectedRadioValue('spayedNeutered'),
      knownAllergies: [...state.allergies],
      existingMedicalConditions: [...state.medicalConditions]
    };

    console.log('✅ Pet Registered Successfully:', petData);

    showToast(`✓ ${petData.petName} has been added successfully!`);

    // Reset Form safely after short delay
    setTimeout(() => {
      resetForm();
    }, 1200);
  });

  // Cancel Button Action
  btnCancel.addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      resetForm();
    }
  });
}

/* Individual Validation Rules */
function validatePetName() {
  const val = document.getElementById('petName').value.trim();
  if (!val) {
    showFieldError('petName', 'Pet name is required.');
    return false;
  }
  clearFieldError('petName');
  return true;
}

function validateSpecies() {
  const val = document.getElementById('species').value;
  if (!val) {
    showFieldError('species', 'Please select a species.');
    return false;
  }
  clearFieldError('species');
  return true;
}

function validateBreed() {
  const breedVal = document.getElementById('breed').value || document.getElementById('breedSearch').value.trim();
  if (!breedVal) {
    showFieldError('breed', 'Please select or search for a breed.');
    return false;
  }
  clearFieldError('breed');
  return true;
}

function validateGender() {
  const selected = document.querySelector('input[name="gender"]:checked');
  if (!selected) {
    showFieldError('gender', 'Please select gender.');
    return false;
  }
  clearFieldError('gender');
  return true;
}

function validateDateOfBirth() {
  const input = document.getElementById('dateOfBirth');
  const val = input.value;
  
  if (!val) {
    showFieldError('dateOfBirth', 'Please enter your pet\'s date of birth.');
    return false;
  }

  const selectedDate = new Date(val);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (selectedDate > today) {
    showFieldError('dateOfBirth', 'Date of birth cannot be in the future.');
    return false;
  }

  clearFieldError('dateOfBirth');
  return true;
}

function validateWeight() {
  const val = document.getElementById('weightValue').value;
  const num = parseFloat(val);

  if (!val || isNaN(num)) {
    showFieldError('weight', 'Please enter a valid weight.');
    return false;
  }
  if (num <= 0) {
    showFieldError('weight', 'Weight must be greater than 0.');
    return false;
  }
  if (num > 1000) {
    showFieldError('weight', 'Please enter a realistic weight value.');
    return false;
  }

  clearFieldError('weight');
  return true;
}

/* Helper Utilities */
function showFieldError(groupId, message) {
  const group = document.getElementById(`group-${groupId}`);
  const errSpan = document.getElementById(`err-${groupId}`);
  if (group) group.classList.add('has-error');
  if (errSpan) errSpan.textContent = message;
}

function clearFieldError(groupId) {
  const group = document.getElementById(`group-${groupId}`);
  const errSpan = document.getElementById(`err-${groupId}`);
  if (group) group.classList.remove('has-error');
  if (errSpan) errSpan.textContent = '';
}

function getSelectedRadioValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  toastMessage.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function resetForm() {
  const form = document.getElementById('petRegistrationForm');
  form.reset();
  
  // Clear error states
  document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

  // Reset custom states
  state.allergies = [];
  state.medicalConditions = [];
  state.photoDataUrl = null;
  state.selectedBreed = '';

  document.getElementById('allergyTags').innerHTML = '';
  document.getElementById('conditionTags').innerHTML = '';
  document.getElementById('btnRemovePhoto').click();

  // Reset Breed dropdown input state
  const breedSearch = document.getElementById('breedSearch');
  breedSearch.disabled = true;
  breedSearch.placeholder = 'Select species first';
}