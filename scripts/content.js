// scripts/content.js

console.log("Dublin Gov Helper content script loaded for supported Dublin CA domains.");

// --- Dublin, CA Specific Data (HARDCODED FOR THIS MVP) ---
// This data is manually collected from https://dublin.ca.gov/ and related domains.
// REPLACE THE PLACEHOLDER URLs, JARGON, AND FORM DETAILS WITH REAL ONES YOU FIND.
const dublinLocalData = {
    links: {
        // Keys here should match the topics returned by getPageTopic()
        "building": [
            // Example links for the Building/Planning section - USING YOUR PROVIDED REAL LINKS
            { text: "Building & Safety Division", url: "https://www.dublin.ca.gov/114/Building-Safety" },
            { text: "Building Permits",         url: "https://www.dublin.ca.gov/586/Building-Permits" },
            { text: "Citizen Self-Service CSS (Permits/Licenses)", url: "https://www.dublin.ca.gov/CSS" }, // Link to their system entrance
            { text: "Master Fee Schedule",      url: "https://www.dublin.ca.gov/1330/Fee-Schedule" },
            { text: "ADU Regulations (PDF)",    url: "https://ca-dublin2.civicplus.com/DocumentCenter/Home/View/831" }
        ],
        "business": [
            // Example links for the Business/Economic Development section - USING YOUR PROVIDED REAL LINKS
            { text: "Business Licenses",           url: "https://ca-dublin2.civicplus.com/433/Business-Licenses" },
            { text: "Business License Online Application", url: "https://dublinca-energovweb.tylerhost.net" }, // Link to their EnerGov system
            { text: "Business License Overview (PDF)",    url: "https://ca-dublin2.civicplus.com/DocumentCenter/View/37505" },
            { text: "Business Resources",           url: "https://ca-dublin2.civicplus.com/439/Business-Resources" },
            { text: "Business Incentives",          url: "https://ca-dublin2.civicplus.com/907/Business-Incentives" }
        ],
         "planning": [
              // Add links specific to Planning Department if needed, distinct from 'building'
             { text: "Planning Division", url: "https://www.dublin.ca.gov/planning" },
              { text: "Planning Applications & Forms", url: "https://ca-dublin2.civicplus.com/172/Planning-Applications" }, // Uses CivicPlus Document Center
              { text: "Check Zoning on a Property (GIS Map)", url: "https://gis.dublin.ca.gov" }, // Uses GIS subdomain
              { text: "Zoning Map (PDF)",             url: "https://ca-dublin2.civicplus.com/DocumentCenter/View/31440/Zoning-Map-June-2022" } // Uses CivicPlus Document Center
         ],
        "general": [
            // General helpful links - USING YOUR PROVIDED REAL LINKS + others
            { text: "Documents, Forms & Resources", url: "https://ca-dublin2.civicplus.com/169/Documents-Forms-Resources" }, // Uses CivicPlus Document Center
            { text: "Dublin Municipal Code",   url: "https://www.codepublishing.com/ca/dublin/" }, // Uses external domain
             { text: "City Services A-Z", "url": "https://www.dublin.ca.gov/services"}, // Example from prev version
             { text: "Contact City Hall", "url": "https://www.dublin.ca.gov/contact"}
        ]
        // You might add more topics like "public-works", "parks", etc.
    },
    jargon: {
         // Keys here should match the topics returned by getPageTopic()
        "building": {
            // Example jargon for Building/Planning - FIND REAL ONES AND DEFINITIONS on supported domains
            "setback": "The minimum required distance between a building, structure, or portion thereof and a property line (refer to Dublin Zoning Ordinance for specifics).",
            "impervious surface": "A surface that does not allow water to penetrate (e.g., concrete, asphalt, rooftops). Check Dublin Municipal Code for full definition.",
            "easement": "A legal right granting limited use or access over a portion of a property for a specific purpose (e.g., utilities, public access)."
        },
        "business": {
            // Example jargon for Business - FIND REAL ONES AND DEFINITIONS on supported domains
            "dba": "Doing Business As; a registered name used by a business that is different from its legal name.",
            "business license": "A required permit issued by the City of Dublin to operate a business within city limits.",
            "zoning": "City regulations dividing land into areas for specific uses (residential, commercial, industrial, etc.)."
        },
         "planning": {
              // Jargon specific to planning
              "general plan": "The City's comprehensive, long-term plan for physical development.",
              "variance": "Permission to depart from the strict requirements of the zoning ordinance."
         },
         "general": {
              // Example general jargon
             "ordinance": "A law enacted by the Dublin City Council."
        }
    },
    forms: {
        // Example Form Mappings - YOU MUST FIND THE REAL URLS AND FIELD SELECTORS from supported domains
        // Go to the actual form page on the domain it's hosted on, inspect the HTML source to find selectors (ID is best, then name).
        // Use the full, exact URL of the form page as the key.
        // Example based on a typical EnerGov URL structure - VERIFY THIS URL AND SELECTORS
        "https://dublinca-energovweb.tylerhost.net/apps/SelfService#/permit/apply": [
             {"selector": "#SelfService_entity_name", "prefillKey": "name", "notes": "Enter the applicant's full legal name or business name."}, // Hypothetical selector
             {"selector": "#SelfService_address_street", "prefillKey": "address", "notes": "Property address for the permit."}, // Hypothetical selector
             {"selector": "#SelfService_address_city", "prefillKey": "city"}, // Hypothetical selector
             {"selector": "#SelfService_address_state", "prefillKey": "state"}, // Hypothetical selector
             {"selector": "#SelfService_address_zip", "prefillKey": "zip"}, // Hypothetical selector
             {"selector": "#SelfService_contact_email", "prefillKey": "email"}, // Hypothetical selector
             {"selector": "#SelfService_contact_phone", "prefillKey": "phone"}, // Hypothetical selector
             {"selector": "#SelfService_project_description", "notes": "Describe the project (e.g., 'Install residential fence')."} // Hypothetical selector
             // Add more field mappings for forms on tylerhost.net or other domains
         ],
         // Example of a hypothetical form page URL on the main dublin.ca.gov domain
         "https://www.dublin.ca.gov/placeholder-special-event-permit-form": [
              {"selector": "input[name='EventContactName']", "prefillKey": "name", "notes": "Main contact person for the event."},
              {"selector": "input#ContactEmail", "prefillKey": "email"},
              // Add more for this specific form
         ]
         // Add mappings for other specific form URLs found on dublin.ca.gov or other supported domains
    }
};
// --- END OF DUBLIN, CA SPECIFIC DATA ---


// --- Feature 1: Contextual Information Retrieval ---
// Function to identify the page topic based on URL across supported domains
function getPageTopic(url) {
    const lowerUrl = url.toLowerCase();
    // More specific checks first based on common URL patterns across domains
    if (lowerUrl.includes("/permits") || lowerUrl.includes("/building") || lowerUrl.includes("/building-safety") || lowerUrl.includes("/css")) return "building"; // Use 'building' as topic key
    // Note: Citizen Self-Service (CSS) link often covers both Permits and Business Licenses
    if (lowerUrl.includes("/business-license") || lowerUrl.includes("/businesses") || lowerUrl.includes("/economic-development") || lowerUrl.includes("tylerhost.net")) return "business"; // Include tylerhost.net as it's for business licenses/permits
    if (lowerUrl.includes("/planning")) return "planning"; // Separate topic for Planning
    if (lowerUrl.includes("/services") || lowerUrl.includes("/departments")) return "city-services";
    // Check for document center links which often contain forms/resources
    if (lowerUrl.includes("civicplus.com/documentcenter")) return "general"; // Documents/Forms page on civicplus
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
    // IMPORTANT: sendResponse must be called synchronously unless the listener returns true.
    // Our listener does NOT return true, so sendResponse MUST be called within this block.

    if (request.action === "getPageInfo") {
        const currentUrl = window.location.href;
        const topic = getPageTopic(currentUrl);
        const formMapping = getFormMapping(currentUrl); // Get form mapping too

        const dataForPopup = {
            topic: topic,
            // Provide links/jargon for the identified topic, fallback to 'general' if topic data is missing
            links: dublinLocalData.links[topic] || dublinLocalData.links["general"] || [], // Fallback to 'general' links if topic has none, or empty array
            jargon: dublinLocalData.jargon[topic] || dublinLocalData.jargon["general"] || {}, // Fallback to 'general' jargon, or empty object
            isFormPage: !!formMapping // Indicate if it's a known form page
        };
        console.log("Sending data to popup:", dataForPopup);
        sendResponse(dataForPopup);
         // Return true here if sendResponse was async (e.g., using a promise)
         // return true; // Not needed currently as sendResponse is sync
    }
    // If action is NOT "getPageInfo", the listener implicitly returns undefined,
    // and Chrome knows sendResponse won't be called for this message.
});

// --- Feature 3: Assisted Form Filling & Basic Guidance ---
// Listen for a message from the popup to pre-fill data
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
     // IMPORTANT: sendResponse must be called synchronously unless the listener returns true.
     // Our listener does NOT return true, so sendResponse MUST be called within this block.
    if (request.action === "prefillForm" && request.formData) {
        console.log("Attempting to pre-fill form...");
        const formData = request.formData;
        const currentUrl = window.location.href;
        const formMapping = getFormMapping(currentUrl);

        if (!formMapping) {
            console.warn("Not on a known form page or no form mapping found.");
            sendResponse({ success: false, message: "Not on a recognized form page for pre-fill." });
            return; // Exit the listener
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
         // Return true here if sendResponse was async (e.g., using a promise)
         // return true; // Not needed currently as sendResponse is sync

    }
     // If action is NOT "prefillForm", the listener implicitly returns undefined,
     // and Chrome knows sendResponse won't be called for this message.
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

// --- Inject basic CSS for notes/tooltips ---
// The manifest already injects pages/content.css. No need for inline injection here.