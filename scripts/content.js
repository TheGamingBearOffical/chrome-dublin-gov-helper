// scripts/content.js

console.log("Dublin Gov Helper content script loaded for dublin.ca.gov.");

// --- Dublin, CA Specific Data (HARDCODED FOR THIS MVP) ---
// This data needs to be manually collected from https://dublin.ca.gov/
// REPLACE THE PLACEHOLDER URLs, JARGON, AND FORM DETAILS WITH REAL ONES YOU FIND.
const dublinLocalData = {
    links: {
      building: [
        { text: "Building & Safety Division", url: "https://www.dublin.ca.gov/114/Building-Safety" },
        { text: "Building Permits",         url: "https://www.dublin.ca.gov/586/Building-Permits" },
        { text: "Citizen Self-Service CSS", url: "https://www.dublin.ca.gov/CSS" },
        { text: "Master Fee Schedule",      url: "https://www.dublin.ca.gov/1330/Fee-Schedule" },
        { text: "ADU Regulations (PDF)",    url: "https://ca-dublin2.civicplus.com/DocumentCenter/Home/View/831" }
      ],
      business: [
        { text: "Business Licenses",           url: "https://ca-dublin2.civicplus.com/433/Business-Licenses" },
        { text: "Business License Application",url: "https://dublinca-energovweb.tylerhost.net" },
        { text: "Business License Overview",    url: "https://ca-dublin2.civicplus.com/DocumentCenter/View/37505" },
        { text: "Business Resources",           url: "https://ca-dublin2.civicplus.com/439/Business-Resources" },
        { text: "Business Incentives",          url: "https://ca-dublin2.civicplus.com/907/Business-Incentives" }
      ],
      general: [
        { text: "Documents, Forms & Resources", url: "https://ca-dublin2.civicplus.com/169/Documents-Forms-Resources" },
        { text: "Planning Applications",        url: "https://ca-dublin2.civicplus.com/172/Planning-Applications" },
        { text: "Check Zoning on a Property",   url: "https://gis.dublin.ca.gov" },
        { text: "Zoning Map (PDF)",             url: "https://ca-dublin2.civicplus.com/DocumentCenter/View/31440/Zoning-Map-June-2022" },
        { text: "Municipal Zoning Ordinance",   url: "https://www.codepublishing.com/ca/dublin/" }
      ]
    },
    // … jargon and forms mappings unchanged …
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