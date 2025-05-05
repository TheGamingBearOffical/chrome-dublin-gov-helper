// scripts/content.js

console.log("Dublin Gov Helper content script loaded for dublin.ca.gov.");

// --- Dublin, CA Specific Data (HARDCODED FOR THIS MVP) ---
// This data needs to be manually collected from https://dublin.ca.gov/
// REPLACE THE PLACEHOLDER URLs, JARGON, AND FORM DETAILS WITH REAL ONES YOU FIND.
const dublinLocalData = {
    links: {
        // Keys here should match the topics returned by getPageTopic()
        "permits": [
            // Example links for Permits/Building/Planning section on dublin.ca.gov
            {"text": "Permits & Inspections Main Page", "url": "https://dublin.ca.gov/permits"},
            {"text": "Building Permit Forms", "url": "https://dublin.ca.gov/permits/building-permits/forms"}, // Find actual page
            {"text": "Planning Division", "url": "https://dublin.ca.gov/planning"},
            {"text": "Zoning Regulations", "url": "https://library.municode.com/ca/dublin/codes/code_of_ordinances?nodeId=TIT17ZO"} // Link to Municipal Code
        ],
        "business": [
            // Example links for the Business/Economic Development section on dublin.ca.gov
            {"text": "Business License Information", "url": "https://dublin.ca.gov/business/license"},
            {"text": "Starting a Business Guide", "url": "https://dublin.ca.gov/business/start-a-business"}, // Find actual page
            {"text": "Economic Development", "url": "https://dublin.ca.gov/economic-development"}
        ],
        "city-services": [
             // Example links for general city services
             {"text": "City Services A-Z", "url": "https://dublin.ca.gov/services"}, // Find actual page
             {"text": "Report a Concern", "url": "https://dublin.ca.gov/concern"}, // Find actual page
             {"text": "City Departments", "url": "https://dublin.ca.gov/departments"} // Find actual page
        ],
        "general": [
            // General helpful links on dublin.ca.gov
            {"text": "City Forms & Applications", "url": "https://dublin.ca.gov/forms"}, // Find actual forms page
            {"text": "Official Municipal Code", "url": "https://library.municode.com/ca/dublin/codes/code_of_ordinances"},
             {"text": "Contact City Hall", "url": "https://dublin.ca.gov/contact"}
        ]
    },
    jargon: {
         // Keys here should match the topics returned by getPageTopic()
        "permits": {
            // Example jargon for Permits/Building/Planning - FIND REAL ONES AND DEFINITIONS on dublin.ca.gov
            "setback": "The minimum required distance between a building, structure, or portion thereof and a property line (refer to Dublin Zoning Ordinance for specifics).",
            "impervious surface": "A surface that does not allow water to penetrate (e.g., concrete, asphalt, rooftops). Check Dublin Municipal Code for full definition.",
            "easement": "A legal right granting limited use or access over a portion of a property for a specific purpose (e.g., utilities, public access)."
        },
        "business": {
            // Example jargon for Business - FIND REAL ONES AND DEFINITIONS on dublin.ca.gov
            "dba": "Doing Business As; a registered name used by a business that is different from its legal name.",
            "business license": "A required permit issued by the City of Dublin to operate a business within city limits.",
            "zoning": "City regulations dividing land into areas for specific uses (residential, commercial, industrial, etc.)."
        },
         "general": {
              // Example general jargon
             "ordinance": "A law enacted by the Dublin City Council."
        }
    },
    forms: {
        // Example Form Mappings - YOU MUST FIND THE REAL URLS AND FIELD SELECTORS from dublin.ca.gov
        // Go to the actual form page on dublin.ca.gov, inspect the HTML source to find selectors (ID is best, then name).
        // Use the full, exact URL of the form page as the key.
        "https://dublin.ca.gov/placeholder-residential-building-permit-app-example": [ // Use actual URL of the form page
            {"selector": "#applicant_name_field_id", "prefillKey": "name", "notes": "Enter the full legal name of the applicant as required by the city."}, // Replace #applicant_name_field_id with actual field selector
            {"selector": "#property_address_id", "prefillKey": "address", "notes": "The street address in Dublin where the construction/work will take place."}, // Replace #property_address_id
            {"selector": "[name='applicantCity']", "prefillKey": "city", "notes": "City should be Dublin."}, // Example using name attribute
            {"selector": "[name='applicantState']", "prefillKey": "state", "notes": "State should be CA."},
            {"selector": "#applicantZip", "prefillKey": "zip"},
            {"selector": "#applicantPhone", "prefillKey": "phone"},
            {"selector": "#applicantEmail", "prefillKey": "email"},
            {"selector": "#projectScope", "notes": "Clearly describe ALL proposed work. Reference applicable codes or plans if known. Check character limits."} // Field without pre-fill
            // Add more field mappings for this specific form found on dublin.ca.gov
        ],
         "https://dublin.ca.gov/placeholder-home-occupation-permit-app-example": [ // Use actual URL of the form page
            {"selector": "#business_legal_name_id", "prefillKey": "name", "notes": "Your registered business name or DBA."},
            {"selector": "#home_address_id", "prefillKey": "address", "notes": "Your residential address in Dublin where the home occupation will occur."},
            {"selector": "[name='contactEmail']", "prefillKey": "email"},
            {"selector": "[name='contactPhone']", "prefillKey": "phone"},
             {"selector": "#description_of_activity", "notes": "Describe the home occupation activity in detail. Refer to Home Occupation Ordinance requirements."}
            // Add more field mappings for this specific form found on dublin.ca.gov
        ]
    }
};
// --- END OF DUBLIN, CA SPECIFIC DATA ---


// --- Feature 1: Contextual Information Retrieval ---
// Function to identify the page topic based on URL on dublin.ca.gov
function getPageTopic(url) {
    const lowerUrl = url.toLowerCase();
    // More specific checks first based on common dublin.ca.gov URL patterns
    if (lowerUrl.includes("/permits") || lowerUrl.includes("/building") || lowerUrl.includes("/planning") || lowerUrl.includes("/community-development")) return "permits"; // Use 'permits' as topic key
    if (lowerUrl.includes("/business-license") || lowerUrl.includes("/businesses") || lowerUrl.includes("/economic-development")) return "business";
     if (lowerUrl.includes("/services")) return "city-services"; // New topic key for services
    if (lowerUrl.includes("/forms") || lowerUrl.includes("/applications") || lowerUrl.includes("/contact")) return "general"; // Keep 'general' for forms, contact, etc.
     // Fallback to general if no specific topic
    return "general";
}

// Function to get form mapping based on URL
function getFormMapping(url) {
    // Check if the current URL matches any known form URLs in the data
    // Exact match is best for forms, but be mindful of URL parameters
    const cleanedUrl = url.split('?')[0].split('#')[0]; // Remove query params/hash
    console.log("Checking for form mapping for URL:", cleanedUrl);
    const mapping = dublinLocalData.forms[cleanedUrl] || null;
    if (mapping) {
        console.log("Form mapping found.");
    } else {
        console.log("No form mapping found.");
    }
    return mapping;
}

// Send data to the popup when it's opened
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageInfo") {
        const currentUrl = window.location.href;
        const topic = getPageTopic(currentUrl);
        const formMapping = getFormMapping(currentUrl); // Get form mapping too

        const dataForPopup = {
            topic: topic,
            // Provide links/jargon for the identified topic, default to empty if topic key doesn't exist
            links: dublinLocalData.links[topic] || dublinLocalData.links["general"] || [], // Fallback to 'general' links if topic has none
            jargon: dublinLocalData.jargon[topic] || dublinLocalData.jargon["general"] || {}, // Fallback to 'general' jargon
            isFormPage: !!formMapping // Indicate if it's a known form page
        };
        console.log("Sending data to popup:", dataForPopup);
        sendResponse(dataForPopup);
    }
});

// --- Feature 3: Assisted Form Filling & Basic Guidance ---
// Listen for a message from the popup to pre-fill data
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "prefillForm" && request.formData) {
        console.log("Attempting to pre-fill form...");
        const formData = request.formData;
        const currentUrl = window.location.href;
        const formMapping = getFormMapping(currentUrl);

        if (!formMapping) {
            console.warn("Not on a known form page or no form mapping found.");
            sendResponse({ success: false, message: "Not on a recognized form page for pre-fill." });
            return;
        }

        let fieldsAttempted = 0;
        let fieldsFilled = 0;

        formMapping.forEach(fieldInfo => {
            // Find the element using the selector
            const field = document.querySelector(fieldInfo.selector);

            if (field) {
                 fieldsAttempted++;
                // Handle pre-fill if prefillKey is provided and data exists
                if (fieldInfo.prefillKey && formData[fieldInfo.prefillKey]) {
                     console.log(`Attempting to fill ${fieldInfo.selector} with ${fieldInfo.prefillKey} data.`);
                    // Basic handling for input/textarea/email/tel/url/number types
                    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                         if (['text', 'email', 'tel', 'url', 'number'].includes(field.type)) {
                            field.value = formData[fieldInfo.prefillKey];
                            // Trigger change events - important for dynamic forms
                            field.dispatchEvent(new Event('input', { bubbles: true }));
                            field.dispatchEvent(new Event('change', { bubbles: true }));
                            fieldsFilled++;
                         } else {
                             console.warn(`Field ${fieldInfo.selector} is type ${field.type}, cannot pre-fill directly with basic method.`);
                         }
                    }
                    // TODO: Add handling for other input types (checkbox, radio, select) if needed
                }

                // --- Extra Feature: On-Page Form Guidance ---
                // Inject notes next to form fields based on formMapping.notes
                // Check if notes exist and if they haven't been added already
                if (fieldInfo.notes && !field.dataset.dublinHelperNotesAdded) {
                    const notesElement = document.createElement('div');
                    notesElement.className = 'dublin-helper-notes'; // Use the class defined in content.css
                    notesElement.textContent = fieldInfo.notes;

                    // Insert the notes element after the field
                    // This is a common pattern, but might need adjustments based on the specific form's HTML structure
                    if (field.parentNode) {
                         field.parentNode.insertBefore(notesElement, field.nextSibling);
                    } else {
                         // Fallback if parentNode is null (unlikely for form fields)
                         console.warn(`Could not inject notes for ${fieldInfo.selector}: Parent node not found.`);
                    }

                    field.dataset.dublinHelperNotesAdded = 'true'; // Mark as added to prevent duplicates
                }
            } else {
                console.warn(`Selector not found on page: ${fieldInfo.selector}`);
            }
        });

        // Provide feedback message based on attempt/fill count
        let message = `Form mapping found. Attempted to check ${fieldsAttempted} form fields. ${fieldsFilled} fields pre-filled.`;
         if (Object.keys(formMapping).length > 0 && fieldsAttempted === 0) {
              // This case happens if selectors in your form mapping don't match anything on the actual page
             message = `Form mapping found, but no matching fields found on the page using the configured selectors.`;
         } else if (Object.keys(formMapping).length === 0) {
              message = `No form mapping available for this page.`; // Should be caught by the initial check, but good fallback message
         }

        // Determine success status based on if *any* fields were filled
        const success = fieldsFilled > 0;

        sendResponse({ success: success, message: message });

    }
});


// --- Extra Feature: Jargon Buster UI (Future/Complex) ---
// Implementing a robust on-page jargon buster requires significant DOM
// manipulation, event handling, and potential performance considerations.
// The popup list is the simpler MVP approach.

/*
// Example: Add a listener for text selection (more complex to implement robustly)
document.addEventListener('mouseup', (event) => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 1 && event.target) { // Ignore single characters or empty selection
        // Find the most specific parent element to help with context
        const targetElement = event.target.closest('p, li, div, span, td, th, h1, h2, h3, h4, h5, h6'); // Limit search to common text elements
        if (!targetElement) return; // Not a text-containing element we care about

        console.log("Selected text:", selectedText);
        const currentUrl = window.location.href;
        const topic = getPageTopic(currentUrl); // Get topic based on URL

        // Also consider getting topic based on nearby headings or breadcrumbs if possible (more advanced)

        let definition = null;
        // Check for definition in the specific topic jargon first
        if (topic && dublinLocalData.jargon[topic]) {
             definition = dublinLocalData.jargon[topic][selectedText.toLowerCase()];
        }
        // If not found in topic-specific jargon, check general jargon
        if (!definition && dublinLocalData.jargon["general"]) {
             definition = dublinLocalData.jargon["general"][selectedText.toLowerCase()];
        }


        if (definition) {
            console.log("Definition found:", definition);
            // TODO: Show a tooltip or small popover near the mouse coordinates (event.clientX, event.clientY)
            // This involves creating a new HTML element, positioning it, styling it (use a class from content.css),
            // and handling its removal (e.g., on mouseout, scroll, or clicking elsewhere).
            // Ensure it doesn't interfere with page interaction (pointer-events: none).
        }
    }
});
*/


console.log("Content script fully initialized.");

// --- Optional: Inject basic CSS for notes/tooltips ---
// The manifest already injects pages/content.css, so inline style injection is not strictly needed unless for dynamic styles.
// Keeping the style definition in pages/content.css is better practice.