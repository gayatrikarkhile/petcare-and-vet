document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // PREDEFINED BREED DATA
  // =========================================================

  const breedDatabase = {

    Dog: [
      "Labrador Retriever",
      "Golden Retriever",
      "German Shepherd",
      "Beagle",
      "Poodle",
      "Rottweiler",
      "Dachshund",
      "Boxer",
      "Pomeranian",
      "Shih Tzu",
      "Doberman",
      "Indie / Mixed Breed",
      "Other"
    ],

    Cat: [
      "Persian",
      "Siamese",
      "Maine Coon",
      "Ragdoll",
      "Bengal",
      "British Shorthair",
      "Sphynx",
      "Scottish Fold",
      "Russian Blue",
      "Birman",
      "Abyssinian",
      "Domestic Shorthair",
      "Other"
    ],

    Bird: [
      "Budgerigar",
      "Cockatiel",
      "Lovebird",
      "African Grey",
      "Macaw",
      "Cockatoo",
      "Canary",
      "Finch",
      "Conure",
      "Indian Ringneck",
      "Eclectus",
      "Dove",
      "Other"
    ],

    Fish: [
      "Goldfish",
      "Betta",
      "Guppy",
      "Molly",
      "Platy",
      "Tetra",
      "Angelfish",
      "Oscar",
      "Koi",
      "Discus",
      "Zebra Danio",
      "Gourami",
      "Other"
    ],

    Rabbit: [
      "Holland Lop",
      "Netherland Dwarf",
      "Mini Rex",
      "Lionhead",
      "Flemish Giant",
      "Dutch Rabbit",
      "English Lop",
      "Rex Rabbit",
      "Himalayan",
      "Harlequin",
      "New Zealand",
      "Californian",
      "Other"
    ],

    Horse: [
      "Arabian",
      "Thoroughbred",
      "Quarter Horse",
      "Appaloosa",
      "Andalusian",
      "Clydesdale",
      "Friesian",
      "Mustang",
      "Morgan",
      "Paint Horse",
      "Marwari",
      "Lipizzaner",
      "Other"
    ],

    Turtle: [
      "Red-Eared Slider",
      "Indian Star Tortoise",
      "Russian Tortoise",
      "Greek Tortoise",
      "Sulcata Tortoise",
      "Box Turtle",
      "Painted Turtle",
      "Musk Turtle",
      "Map Turtle",
      "Snapping Turtle",
      "Leopard Tortoise",
      "Indian Roofed Turtle",
      "Other"
    ],

    Other: [
      "Hamster",
      "Guinea Pig",
      "Ferret",
      "Chinchilla",
      "Hedgehog",
      "Sugar Glider",
      "Gerbil",
      "Rat",
      "Mouse",
      "Prairie Dog",
      "Pygmy Goat",
      "Other"
    ]

  };


  // =========================================================
  // DOM ELEMENTS
  // =========================================================

  const petForm =
    document.getElementById('petForm');

  const speciesSelect =
    document.getElementById('species');

  const breedInput =
    document.getElementById('breedInput');

  const breedDropdownList =
    document.getElementById('breedDropdownList');

  const reproductiveStatusSelect =
    document.getElementById('reproductiveStatus');

  const uploadContainer =
    document.getElementById('uploadContainer');

  const uploadDropzone =
    document.getElementById('uploadDropzone');

  const uploadPreview =
    document.getElementById('uploadPreview');

  const photoInput =
    document.getElementById('photoInput');

  const previewImg =
    document.getElementById('previewImg');

  const btnChangePhoto =
    document.getElementById('btnChangePhoto');

  const btnRemovePhoto =
    document.getElementById('btnRemovePhoto');

  const tagInput =
    document.getElementById('tagInput');

  const tagsWrapper =
    document.getElementById('tagsWrapper');

  const toast =
    document.getElementById('toast');

  const toastMessage =
    document.getElementById('toastMessage');

  const btnCancel =
    document.getElementById('btnCancel');


  let activeTags = [];

  let availableBreeds = [];


  // =========================================================
  // 1. SPECIES → BREED
  // =========================================================

  function updateBreedOptions() {

    if (!speciesSelect || !breedInput) {
      return;
    }


    const species =
      speciesSelect.value;


    availableBreeds =
      breedDatabase[species] || [];


    if (
      species &&
      availableBreeds.length > 0
    ) {

      // Enable breed input
      breedInput.disabled = false;

      breedInput.placeholder =
        'Type or select breed...';

    }

    else {

      // Disable breed input
      breedInput.disabled = true;

      breedInput.value = '';

      breedInput.placeholder =
        'Select species first';

      if (breedDropdownList) {

        breedDropdownList.style.display =
          'none';

      }

    }

  }


  // =========================================================
  // SPECIES CHANGE
  // =========================================================

  if (speciesSelect) {

    speciesSelect.addEventListener(
      'change',
      function () {

        updateBreedOptions();

        breedInput.value = '';

        if (breedDropdownList) {

          breedDropdownList.style.display =
            'none';

        }

        clearFieldError(
          'breedInput'
        );

      }
    );

  }


  // Initialize breed on page load
  updateBreedOptions();


  // =========================================================
  // BREED AUTOCOMPLETE
  // =========================================================

  if (breedInput) {

    breedInput.addEventListener(
      'focus',
      () => {

        if (
          !breedInput.disabled
        ) {

          renderBreedOptions(
            breedInput.value
          );

        }

      }
    );


    breedInput.addEventListener(
      'input',
      (e) => {

        renderBreedOptions(
          e.target.value
        );

      }
    );

  }


  function renderBreedOptions(
    filterText = ''
  ) {

    if (
      !breedDropdownList ||
      !breedInput
    ) {

      return;

    }


    const query =
      filterText
        .toLowerCase()
        .trim();


    const filtered =
      availableBreeds.filter(
        breed =>
          breed
            .toLowerCase()
            .includes(query)
      );


    breedDropdownList.innerHTML =
      '';


    if (
      filtered.length === 0
    ) {

      breedDropdownList.innerHTML =
        `<div class="dropdown-empty">
          No matching breeds found
        </div>`;

    }

    else {

      filtered.forEach(
        breed => {

          const item =
            document.createElement(
              'div'
            );

          item.className =
            'dropdown-item';

          item.textContent =
            breed;


          item.addEventListener(
            'mousedown',
            (e) => {

              e.preventDefault();

              breedInput.value =
                breed;

              breedDropdownList.style.display =
                'none';

              clearFieldError(
                'breedInput'
              );

            }
          );


          breedDropdownList.appendChild(
            item
          );

        }
      );

    }


    breedDropdownList.style.display =
      'block';

  }


  // =========================================================
  // CLOSE BREED DROPDOWN
  // =========================================================

  document.addEventListener(
    'click',
    (e) => {

      if (
        !e.target.closest(
          '.searchable-select'
        )
      ) {

        if (breedDropdownList) {

          breedDropdownList.style.display =
            'none';

        }

      }

    }
  );


  // =========================================================
  // 2. REPRODUCTIVE STATUS
  // Depends on Gender
  // =========================================================

  function updateReproductiveStatusOptions() {

    if (!reproductiveStatusSelect) {

      console.error(
        'Reproductive status dropdown not found.'
      );

      return;

    }


    const selectedGender =
      document.querySelector(
        'input[name="gender"]:checked'
      );


    const gender =
      selectedGender
        ? selectedGender.value
        : '';


    console.log(
      'Current gender:',
      gender
    );


    // Clear old options
    reproductiveStatusSelect.innerHTML =
      '';


    // =======================================================
    // NO GENDER
    // =======================================================

    if (!gender) {

      const option =
        document.createElement(
          'option'
        );

      option.value =
        '';

      option.textContent =
        'Select gender first';

      reproductiveStatusSelect.appendChild(
        option
      );

      return;

    }


    // =======================================================
    // DEFAULT
    // =======================================================

    const defaultOption =
      document.createElement(
        'option'
      );

    defaultOption.value =
      '';

    defaultOption.textContent =
      'Select reproductive status';

    reproductiveStatusSelect.appendChild(
      defaultOption
    );


    // =======================================================
    // MALE
    // =======================================================

    if (
      gender === 'Male'
    ) {

      addReproductiveOption(
        'Intact'
      );

      addReproductiveOption(
        'Neutered'
      );

      addReproductiveOption(
        'Unknown'
      );

    }


    // =======================================================
    // FEMALE
    // =======================================================

    else if (
      gender === 'Female'
    ) {

      addReproductiveOption(
        'Intact'
      );

      addReproductiveOption(
        'Spayed'
      );

      addReproductiveOption(
        'Unknown'
      );

    }

  }


  // =========================================================
  // ADD REPRODUCTIVE OPTION
  // =========================================================

  function addReproductiveOption(
    value
  ) {

    const option =
      document.createElement(
        'option'
      );

    option.value =
      value;

    option.textContent =
      value;

    reproductiveStatusSelect.appendChild(
      option
    );

  }


  // =========================================================
  // GENDER BUTTON EVENTS
  // =========================================================

  const genderInputs =
    document.querySelectorAll(
      'input[name="gender"]'
    );


  genderInputs.forEach(
    function (input) {

      input.addEventListener(
        'change',
        function () {

          console.log(
            'Gender changed:',
            input.value
          );


          updateReproductiveStatusOptions();

        }
      );

    }
  );


  // Initialize reproductive status
  updateReproductiveStatusOptions();


  // =========================================================
  // HANDLE BROWSER FORM RESTORATION
  // =========================================================

  window.addEventListener(
    'pageshow',
    function () {

      updateBreedOptions();

      updateReproductiveStatusOptions();

    }
  );


  // =========================================================
  // 3. PHOTO UPLOAD
  // =========================================================

  if (
    uploadDropzone &&
    photoInput
  ) {

    uploadDropzone.addEventListener(
      'click',
      () => photoInput.click()
    );

  }


  if (
    btnChangePhoto &&
    photoInput
  ) {

    btnChangePhoto.addEventListener(
      'click',
      () => photoInput.click()
    );

  }


  if (uploadContainer) {

    [
      'dragenter',
      'dragover'
    ].forEach(
      eventName => {

        uploadContainer.addEventListener(
          eventName,
          (e) => {

            e.preventDefault();

            uploadContainer.classList.add(
              'drag-over'
            );

          }
        );

      }
    );


    [
      'dragleave',
      'drop'
    ].forEach(
      eventName => {

        uploadContainer.addEventListener(
          eventName,
          (e) => {

            e.preventDefault();

            uploadContainer.classList.remove(
              'drag-over'
            );

          }
        );

      }
    );


    uploadContainer.addEventListener(
      'drop',
      (e) => {

        const files =
          e.dataTransfer.files;


        if (
          files.length > 0
        ) {

          handleImageFile(
            files[0]
          );

        }

      }
    );

  }


  if (photoInput) {

    photoInput.addEventListener(
      'change',
      (e) => {

        if (
          e.target.files.length > 0
        ) {

          handleImageFile(
            e.target.files[0]
          );

        }

      }
    );

  }


  function handleImageFile(
    file
  ) {

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {

      showToast(
        'Please upload a valid image file'
      );

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      (e) => {

        if (previewImg) {

          previewImg.src =
            e.target.result;

        }


        if (uploadDropzone) {

          uploadDropzone.style.display =
            'none';

        }


        if (uploadPreview) {

          uploadPreview.style.display =
            'flex';

        }

      };


    reader.readAsDataURL(
      file
    );

  }


  if (btnRemovePhoto) {

    btnRemovePhoto.addEventListener(
      'click',
      () => {

        if (photoInput) {

          photoInput.value =
            '';

        }


        if (previewImg) {

          previewImg.src =
            '';

        }


        if (uploadPreview) {

          uploadPreview.style.display =
            'none';

        }


        if (uploadDropzone) {

          uploadDropzone.style.display =
            'flex';

        }

      }
    );

  }


  // =========================================================
  // 4. MEDICAL CONDITION TAGS
  // =========================================================

  if (tagInput) {

    tagInput.addEventListener(
      'keydown',
      (e) => {

        if (
          e.key === 'Enter' ||
          e.key === ','
        ) {

          e.preventDefault();


          const val =
            tagInput.value
              .trim()
              .replace(
                /,/g,
                ''
              );


          if (
            val &&
            !activeTags.includes(
              val
            )
          ) {

            activeTags.push(
              val
            );

            renderTags();

            tagInput.value =
              '';

          }

        }

      }
    );

  }


  function renderTags() {

    if (!tagsWrapper) {
      return;
    }


    tagsWrapper.innerHTML =
      '';


    activeTags.forEach(
      (tag, index) => {

        const chip =
          document.createElement(
            'span'
          );

        chip.className =
          'tag-chip';


        chip.innerHTML = `
          ${tag}
          <button
            type="button"
            class="tag-chip-remove"
            data-index="${index}"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
              ></line>

              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              ></line>
            </svg>
          </button>
        `;


        tagsWrapper.appendChild(
          chip
        );

      }
    );

  }


  if (tagsWrapper) {

    tagsWrapper.addEventListener(
      'click',
      (e) => {

        const removeBtn =
          e.target.closest(
            '.tag-chip-remove'
          );


        if (removeBtn) {

          const index =
            removeBtn.getAttribute(
              'data-index'
            );


          activeTags.splice(
            index,
            1
          );


          renderTags();

        }

      }
    );

  }


  // =========================================================
  // 5. FORM SUBMISSION
  // =========================================================

  if (petForm) {

    petForm.addEventListener(
      'submit',
      async (e) => {

        e.preventDefault();


        let isValid =
          true;


        clearAllErrors();


        // ===================================================
        // GET FORM ELEMENTS
        // ===================================================

        const name =
          document.getElementById(
            'petName'
          );


        const dob =
          document.getElementById(
            'dob'
          );


        const weight =
          document.getElementById(
            'weight'
          );


        const weightUnit =
          document.getElementById(
            'weightUnit'
          );


        const microchip =
          document.getElementById(
            'microchip'
          );


        // ===================================================
        // PET NAME
        // ===================================================

        if (
          !name ||
          !name.value.trim()
        ) {

          showFieldError(
            'petName',
            'Pet name is required'
          );

          isValid =
            false;

        }


        // ===================================================
        // SPECIES
        // ===================================================

        if (
          !speciesSelect ||
          !speciesSelect.value
        ) {

          showFieldError(
            'species',
            'Please select a species'
          );

          isValid =
            false;

        }


        // ===================================================
        // BREED
        // ===================================================

        if (
          !breedInput ||
          !breedInput.value.trim()
        ) {

          showFieldError(
            'breedInput',
            'Please enter or select a breed'
          );

          isValid =
            false;

        }


        // ===================================================
        // GENDER
        // ===================================================

        const genderChecked =
          document.querySelector(
            'input[name="gender"]:checked'
          );


        if (!genderChecked) {

          showFieldError(
            'gender',
            'Please select gender'
          );

          isValid =
            false;

        }


        // ===================================================
        // REPRODUCTIVE STATUS
        // ===================================================

        if (
          !reproductiveStatusSelect ||
          !reproductiveStatusSelect.value
        ) {

          showFieldError(
            'reproductiveStatus',
            'Please select reproductive status'
          );

          isValid =
            false;

        }


        // ===================================================
        // DATE OF BIRTH
        // ===================================================

        if (
          !dob ||
          !dob.value
        ) {

          showFieldError(
            'dob',
            'Date of birth is required'
          );

          isValid =
            false;

        }


        // ===================================================
        // WEIGHT
        // ===================================================

        if (
          !weight ||
          !weight.value ||
          Number(weight.value) <= 0
        ) {

          showFieldError(
            'weight',
            'Enter a valid weight'
          );

          isValid =
            false;

        }


        // ===================================================
        // STOP IF INVALID
        // ===================================================

        if (!isValid) {

          return;

        }


        // ===================================================
        // LOGIN TOKEN
        // ===================================================

        const token =
          localStorage.getItem(
            'pawsyncToken'
          );


        if (!token) {

          showToast(
            'Please login before adding a pet.'
          );

          return;

        }


        // ===================================================
        // CREATE FORMDATA
        // ===================================================

        const formData =
          new FormData();


        // ===================================================
        // BASIC INFORMATION
        // ===================================================

        formData.append(
          'petName',
          name.value.trim()
        );


        formData.append(
          'species',
          speciesSelect.value
        );


        formData.append(
          'breed',
          breedInput.value.trim()
        );


        formData.append(
          'gender',
          genderChecked.value
        );


        // ===================================================
        // REPRODUCTIVE STATUS
        // IMPORTANT:
        // Do NOT redeclare const here.
        // We already have reproductiveStatusSelect.
        // ===================================================

        formData.append(
          'reproductiveStatus',
          reproductiveStatusSelect.value
        );


        // ===================================================
        // DATE OF BIRTH
        // ===================================================

        formData.append(
          'dateOfBirth',
          dob.value
        );


        // ===================================================
        // WEIGHT
        // ===================================================

        formData.append(
          'weight',
          weight.value
        );


        formData.append(
          'weightUnit',
          weightUnit
            ? weightUnit.value
            : 'kg'
        );


        // ===================================================
        // MICROCHIP
        // ===================================================

        formData.append(
          'microchip',
          microchip
            ? microchip.value.trim()
            : ''
        );

        const ownerPhoneInput = document.getElementById('ownerPhone');
        formData.append(
          'ownerPhone',
          ownerPhoneInput ? ownerPhoneInput.value.trim() : ''
        );


        // ===================================================
        // MEDICAL CONDITIONS
        // ===================================================

        formData.append(
          'medicalConditions',
          JSON.stringify(
            activeTags
          )
        );


        // ===================================================
        // PET PHOTO
        // ===================================================

        if (
          photoInput &&
          photoInput.files &&
          photoInput.files.length > 0
        ) {

          formData.append(
            'petPhoto',
            photoInput.files[0]
          );

        }


        // ===================================================
        // DEBUG
        // ===================================================

        console.log(
          'Sending pet data to backend...'
        );


        for (
          const [key, value]
          of formData.entries()
        ) {

          if (
            value instanceof File
          ) {

            console.log(
              key,
              value.name,
              value.type,
              value.size
            );

          }

          else {

            console.log(
              key,
              value
            );

          }

        }


        // ===================================================
        // SUBMIT BUTTON
        // ===================================================

        const submitButton =
          document.getElementById(
            'btnSubmit'
          );


        const originalButtonText =
          submitButton
            ? submitButton.textContent
            : 'Add Pet';


        if (submitButton) {

          submitButton.disabled =
            true;

          submitButton.textContent =
            'Adding Pet...';

        }


        // ===================================================
        // SEND REQUEST
        // ===================================================

        try {

          const response =
            await fetch(
              '/api/pets',
              {

                method: 'POST',

                headers: {

                  Authorization:
                    `Bearer ${token}`

                },

                body:
                  formData

              }
            );


          // =================================================
          // BACKEND RESPONSE
          // =================================================

          const data =
            await response.json();


          console.log(
            'Backend response:',
            data
          );


          // =================================================
          // SUCCESS
          // =================================================

          if (
            response.ok &&
            data.success
          ) {

            showToast(
              'Pet profile created successfully!'
            );


            console.log(
              'Saved pet:',
              data.pet
            );


            setTimeout(
              () => {

                petForm.reset();

                activeTags = [];

                renderTags();


                if (
                  btnRemovePhoto
                ) {

                  btnRemovePhoto.click();

                }


                // Reset breed
                updateBreedOptions();


                // Reset reproductive status
                updateReproductiveStatusOptions();

              },
              1200
            );

          }


          // =================================================
          // BACKEND ERROR
          // =================================================

          else {

            console.error(
              'Backend returned error:',
              data
            );


            showToast(
              data.message ||
              'Unable to add pet.'
            );

          }

        }


        // ===================================================
        // NETWORK ERROR
        // ===================================================

        catch (error) {

          console.error(
            'Add pet request failed:',
            error
          );


          showToast(
            'Unable to connect to the server.'
          );

        }


        // ===================================================
        // ENABLE BUTTON AGAIN
        // ===================================================

        finally {

          if (submitButton) {

            submitButton.disabled =
              false;

            submitButton.textContent =
              originalButtonText;

          }

        }

      }
    );

  }


  // =========================================================
  // 6. SHOW FIELD ERROR
  // =========================================================

  function showFieldError(
    fieldId,
    message
  ) {

    const group =
      document.getElementById(
        `group-${fieldId}`
      );


    const errorSpan =
      document.getElementById(
        `error-${fieldId}`
      );


    if (group) {

      group.classList.add(
        'has-error'
      );

    }


    if (errorSpan) {

      errorSpan.textContent =
        message;

    }

  }


  // =========================================================
  // 7. CLEAR FIELD ERROR
  // =========================================================

  function clearFieldError(
    fieldId
  ) {

    const group =
      document.getElementById(
        `group-${fieldId}`
      );


    const errorSpan =
      document.getElementById(
        `error-${fieldId}`
      );


    if (group) {

      group.classList.remove(
        'has-error'
      );

    }


    if (errorSpan) {

      errorSpan.textContent =
        '';

    }

  }


  // =========================================================
  // 8. CLEAR ALL ERRORS
  // =========================================================

  function clearAllErrors() {

    document
      .querySelectorAll(
        '.form-group'
      )
      .forEach(
        (group) => {

          group.classList.remove(
            'has-error'
          );

        }
      );


    document
      .querySelectorAll(
        '.error-message'
      )
      .forEach(
        (span) => {

          span.textContent =
            '';

        }
      );

  }


  // =========================================================
  // 9. TOAST
  // =========================================================

  function showToast(
    msg
  ) {

    if (
      !toast ||
      !toastMessage
    ) {

      alert(msg);

      return;

    }


    toastMessage.textContent =
      msg;


    toast.classList.add(
      'show'
    );


    setTimeout(
      () => {

        toast.classList.remove(
          'show'
        );

      },
      3500
    );

  }


  // =========================================================
  // 10. CANCEL BUTTON
  // =========================================================

  if (btnCancel) {

    btnCancel.addEventListener(
      'click',
      () => {

        if (
          confirm(
            'Discard changes?'
          )
        ) {

          petForm.reset();

          clearAllErrors();

          activeTags = [];

          renderTags();


          if (
            btnRemovePhoto
          ) {

            btnRemovePhoto.click();

          }


          updateBreedOptions();

          updateReproductiveStatusOptions();

        }

      }
    );

  }

});