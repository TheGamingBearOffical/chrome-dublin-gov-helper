// scripts/popup.js

document.addEventListener('DOMContentLoaded', () => {
    const pageInfoDiv = document.getElementById('page-info');
    const relevantLinksList = document.getElementById('relevant-links');
    const jargonDefinitionsDiv = document.getElementById('jargon-definitions');
    const loadingStatus = document.getElementById('loading-status');
    const noInfoStatus = document.getElementById('no-info');
    const formPageStatus = document.getElementById('form-page-status');

    const profileSelect = document.getElementById('profile-select');
    const prefillInputs = document.querySelectorAll('#prefill-form input');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const doPrefillBtn = document.getElementById('do-prefill-btn'); // Get the pre-fill button
    const statusMessageDiv = document.getElementById('status-message');

    let userProfiles = {}; // Stores user data for pre-fill
    let currentProfileName = 'Default'; // Name of the currently selected profile

    // --- Profile Management ---

    // Load profiles from storage
    function loadProfiles() {
        chrome.storage.sync.get(['userProfiles', 'currentProfileName'], (result) => {
            userProfiles = result.userProfiles || { 'Default': {} }; // Ensure 'Default' exists
            currentProfileName = result.currentProfileName || 'Default';
            populateProfileSelect();
            selectCurrentProfile(); // Load data for the current profile into fields
        });
    }

    // Save profiles to storage
    function saveProfiles() {
        chrome.storage.sync.set({ userProfiles: userProfiles, currentProfileName: currentProfileName }, () => {
            console.log('User profiles and current profile saved.');
        });
    }

    // Populate the profile dropdown
    function populateProfileSelect() {
        profileSelect.innerHTML = ''; // Clear existing options
        for (const profileName in userProfiles) {
            const option = document.createElement('option');
            option.value = profileName;
            option.textContent = profileName;
            profileSelect.appendChild(option);
        }
         profileSelect.value = currentProfileName; // Set the current selection in the dropdown
    }

    // Select a profile from the dropdown and populate the input fields
    function selectProfile(profileName) {
        currentProfileName = profileName;
        const profileData = userProfiles[profileName] || {}; // Get data for selected profile
        document.getElementById('prefill-name').value = profileData.name || '';
        document.getElementById('prefill-address').value = profileData.address || '';
        document.getElementById('prefill-city').value = profileData.city || '';
        document.getElementById('prefill-state').value = profileData.state || '';
        document.getElementById('prefill-zip').value = profileData.zip || '';
        document.getElementById('prefill-email').value = profileData.email || '';
        document.getElementById('prefill-phone').value = profileData.phone || '';

        // Disable inputs when a profile is selected (unless editing)
        prefillInputs.forEach(input => input.disabled = true);
        editProfileBtn.textContent = 'Edit Selected Profile';

        saveProfiles(); // Save the selected profile name preference
    }

     // Select the currently stored profile or default when popup opens
     function selectCurrentProfile() {
         // Ensure the selected value is in the dropdown after repopulating options
         if (userProfiles[currentProfileName]) {
            profileSelect.value = currentProfileName;
            selectProfile(currentProfileName); // Load its data into fields
         } else if (Object.keys(userProfiles).length > 0) {
             // If current profile was deleted, select the first available
             const firstProfile = Object.keys(userProfiles)[0];
             profileSelect.value = firstProfile;
             selectProfile(firstProfile);
         } else {
             // Fallback: Create and select 'Default' if no profiles exist
             userProfiles = { 'Default': {} };
             currentProfileName = 'Default';
             populateProfileSelect();
             selectProfile(currentProfileName);
         }
     }


    // Event listener for profile dropdown change
    profileSelect.addEventListener('change', (event) => {
        selectProfile(event.target.value);
    });

    // Event listener for Edit button
    editProfileBtn.addEventListener('click', () => {
         const isEditing = editProfileBtn.textContent === 'Save Profile';
         if (isEditing) {
             // --- Save Logic ---
             const profileData = {
                name: document.getElementById('prefill-name').value,
                address: document.getElementById('prefill-address').value,
                city: document.getElementById('prefill-city').value,
                state: document.getElementById('prefill-state').value,
                zip: document.getElementById('prefill-zip').value,
                email: document.getElementById('prefill-email').value,
                phone: document.getElementById('prefill-phone').value
            };
            userProfiles[currentProfileName] = profileData; // Update the profile data
            saveProfiles(); // Save the updated profiles to storage

            // --- Update UI after saving ---
            prefillInputs.forEach(input => input.disabled = true); // Disable inputs
            editProfileBtn.textContent = 'Edit Selected Profile'; // Change button text back
            statusMessageDiv.textContent = `${currentProfileName} profile saved.`;
            statusMessageDiv.style.color = 'green';
            setTimeout(() => { statusMessageDiv.textContent = '', statusMessageDiv.style.color = ''; }, 3000); // Clear status after delay

         } else {
             // --- Edit Logic ---
             // Enable inputs for editing
             prefillInputs.forEach(input => input.disabled = false);
             editProfileBtn.textContent = 'Save Profile'; // Change button text
             statusMessageDiv.textContent = `Editing ${currentProfileName} profile. Click 'Save' when done.`;
             statusMessageDiv.style.color = 'orange';
         }
    });

     // Optional: Implement 'Manage' button functionality (e.g., opens a new tab with profile management UI)
    // const manageProfilesBtn = document.getElementById('manage-profiles-btn');
    // manageProfilesBtn.addEventListener('click', () => {
    //    // Example: open a new tab with a local HTML page for management
    //    chrome.tabs.create({ url: chrome.runtime.getURL('pages/manage_profiles.html') });
    // });


    // --- Get Info from Content Script ---
    // Query the active tab to send a message to its content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
            // Send message to the content script asking for page info
            chrome.tabs.sendMessage(activeTab.id, { action: "getPageInfo" }, (response) => {
                 loadingStatus.style.display = 'none'; // Hide loading message

                 // Check for errors in sending/receiving message
                 if (chrome.runtime.lastError) {
                    console.error("Error sending message to content script:", chrome.runtime.lastError);
                    noInfoStatus.textContent = "Could not get page info. Ensure extension is active and you are on a supported Dublin CA government site (dublin.ca.gov)."; // Updated message
                    noInfoStatus.style.display = 'block';
                    pageInfoDiv.style.display = 'none'; // Hide info area
                    doPrefillBtn.disabled = true; // Disable pre-fill if communication fails
                    return;
                }

                // Check if the response data is valid
                if (response) {
                    console.log("Received response from content script:", response);

                    // Display Form Page Status
                    if (response.isFormPage) {
                        formPageStatus.textContent = "Helper detected a known form on this page. Pre-fill and guidance available!";
                        formPageStatus.style.display = 'block';
                        doPrefillBtn.disabled = false; // Enable pre-fill button if it's a form page
                    } else {
                         formPageStatus.style.display = 'none';
                         doPrefillBtn.disabled = true; // Disable pre-fill button if not a form page
                    }

                    // Display Relevant Links
                    relevantLinksList.innerHTML = ''; // Clear previous links
                    if (response.links && response.links.length > 0) {
                        response.links.forEach(link => {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.href = link.url;
                            a.textContent = link.text;
                            // Open link in a new tab when clicked
                            a.addEventListener('click', (e) => {
                                e.preventDefault(); // Prevent default link behavior
                                chrome.tabs.create({ url: a.href }); // Open in new tab
                            });
                            li.appendChild(a);
                            relevantLinksList.appendChild(li);
                        });
                    } else {
                        const li = document.createElement('li');
                        li.textContent = "No specific links found for this page topic.";
                        relevantLinksList.appendChild(li);
                    }

                    // Display Jargon (simple list)
                    jargonDefinitionsDiv.innerHTML = ''; // Clear previous jargon
                    if (response.jargon && Object.keys(response.jargon).length > 0) {
                        const jargonTitle = document.createElement('h5');
                        jargonTitle.textContent = "Common Terms:";
                        jargonDefinitionsDiv.appendChild(jargonTitle);
                        const jargonList = document.createElement('ul');
                         Object.keys(response.jargon).forEach(term => {
                             const li = document.createElement('li');
                             li.innerHTML = `<strong>${term}:</strong> ${response.jargon[term]}`; // Term: Definition
                             jargonList.appendChild(li);
                         });
                         jargonDefinitionsDiv.appendChild(jargonList);
                    } else {
                         // Optionally hide jargon section if empty
                         // jargonDefinitionsDiv.style.display = 'none';
                    }

                    // Show info area if there's any content, otherwise show "no info" message
                    if (response.isFormPage || (response.links && response.links.length > 0) || (response.jargon && Object.keys(response.jargon).length > 0)) {
                         noInfoStatus.style.display = 'none';
                         pageInfoDiv.style.display = 'block';
                    } else {
                         noInfoStatus.style.display = 'block';
                         pageInfoDiv.style.display = 'none';
                    }


                } else {
                    // If response is null or empty unexpectedly
                    noInfoStatus.textContent = "Received empty response from content script.";
                    noInfoStatus.style.display = 'block';
                    pageInfoDiv.style.display = 'none';
                    doPrefillBtn.disabled = true;
                }
            });
        } else {
             // If could not query active tab
             loadingStatus.style.display = 'none';
             noInfoStatus.textContent = "Could not get tab information. Is the extension enabled and on dublin.ca.gov?"; // Updated message
             noInfoStatus.style.display = 'block';
             pageInfoDiv.style.display = 'none';
             doPrefillBtn.disabled = true;
        }
    });

    // --- Handle Form Pre-fill Action ---
    doPrefillBtn.addEventListener('click', () => {
        // Get data from the currently selected profile in the popup UI
        const profileData = {
             name: document.getElementById('prefill-name').value,
             address: document.getElementById('prefill-address').value,
             city: document.getElementById('prefill-city').value,
             state: document.getElementById('prefill-state').value,
             zip: document.getElementById('prefill-zip').value,
             email: document.getElementById('prefill-email').value,
             phone: document.getElementById('prefill-phone').value
        };

        // Send message to the content script to perform pre-fill on the page
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
             const activeTab = tabs[0];
             if (activeTab && activeTab.id) {
                 chrome.tabs.sendMessage(activeTab.id, { action: "prefillForm", formData: profileData }, (response) => {
                     if (chrome.runtime.lastError) {
                         console.error("Error sending prefill message:", chrome.runtime.lastError);
                         statusMessageDiv.textContent = "Error sending pre-fill command.";
                         statusMessageDiv.style.color = 'red';
                     } else if (response) {
                        // Display message received from content script
                        statusMessageDiv.textContent = response.message || (response.success ? "Form pre-filled (basic fields)." : "Pre-fill failed or no fields matched.");
                        statusMessageDiv.style.color = response.success ? 'green' : 'orange';
                     } else {
                          // Unexpected empty response
                         statusMessageDiv.textContent = "Received empty response for pre-fill command.";
                         statusMessageDiv.style.color = 'orange';
                     }
                     // Clear status message after a few seconds
                     setTimeout(() => { statusMessageDiv.textContent = '', statusMessageDiv.style.color = ''; }, 5000);
                 });
             } else {
                  // Could not query active tab
                 statusMessageDiv.textContent = "Could not find active tab on dublin.ca.gov to pre-fill."; // Updated message
                 statusMessageDiv.style.color = 'red';
                 setTimeout(() => { statusMessageDiv.textContent = '', statusMessageDiv.style.color = ''; }, 5000);
             }
        });
    });

    // Load profiles when popup is opened
    loadProfiles();
});