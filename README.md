# Dublin Gov Helper (for Dublin, CA - dublin.ca.gov)

## Project Name

Dublin Gov Helper

## Problem Description

Navigating the official City of Dublin, CA website (`dublin.ca.gov`) to find local laws, regulations, forms, and understand jargon can be a frustrating and time-consuming process for residents, small businesses, and other individuals. Information is often buried deep within the site, regulations are complex, and locating the correct, current forms is challenging.

## Solution Idea (Scaled-Down Chrome Extension MVP)

The "Dublin Gov Helper" is a Chrome extension designed to provide contextual assistance directly within the user's browser when they are visiting the official City of Dublin, CA government website (`https://dublin.ca.gov/`) and its subdomains.

This MVP aims to provide tangible help by:

1.  **Contextual Resources:** Identifying the topic of the page the user is on and providing quick links to relevant city forms, municipal code sections, or related departmental pages on `dublin.ca.gov`.
2.  **Jargon Buster:** Offering simple explanations for complex terms commonly found on `dublin.ca.gov` pages.
3.  **Assisted Form Filling & Guidance:** On recognized forms found on `dublin.ca.gov`, the extension can highlight fields, provide specific notes extracted from relevant regulations (e.g., required dimensions, materials), and allow secure pre-filling of common personal/business information from user-saved profiles.

This initial version focuses *only* on `dublin.ca.gov` and relies on manually curated data about its structure, forms, and key regulations.

## Target Consumer

Anyone needing to interact with the local government in Dublin, CA via their official website (`dublin.ca.gov`), who is not a professional already familiar with the processes. This includes:

*   **Dublin Residents:** Applying for building permits (sheds, fences, remodels), researching zoning laws, looking up property regulations, accessing resident services forms found on `dublin.ca.gov`.
*   **Small Business Owners in Dublin:** Applying for business licenses, researching local business regulations and permits, finding forms related to commercial property on `dublin.ca.gov`.
*   **Property Owners/Managers in Dublin:** Dealing with permits, regulations, or forms related to residential or commercial properties listed on `dublin.ca.gov`.
*   **General Public in Dublin:** Anyone seeking specific information, forms, or definitions on the official city website (`dublin.ca.gov`) for various purposes.

The focus is on providing utility to non-experts navigating Dublin, CA's specific local governmental online resources at `dublin.ca.gov`.

## Features

**Current (MVP Scope):**

*   Activates only on `dublin.ca.gov` and its subdomains.
*   Attempts to identify the general topic of the page based on URL patterns (e.g., "permits", "business", "planning").
*   Displays relevant quick links and definitions for the identified topic in the extension popup (Data must be collected and placed in the code).
*   Indicates in the popup if the current page is a recognized city form.
*   Allows saving multiple user profiles (e.g., 'Home Address', 'My Business') for pre-fill data securely in Chrome storage.
*   Basic pre-filling of common form fields (name, address, contact) on recognized forms using data from the selected profile.
*   Injects simple guidance notes (e.g., extracted rules, tips) directly next to form fields on recognized forms.
*   Provides basic status messages in the popup (e.g., "Form pre-filled").

**Future Expansion Ideas:**

*   **Improved Jargon Buster UI:** On-page tooltips when hovering over jargon.
*   **More Advanced Form Handling:** Support for checkboxes, radio buttons, dropdowns, multi-page forms, and basic client-side validation based on regulations.
*   **Dynamic Data Loading:** Fetch data from external JSON files or a simple backend to allow updates without extension re-installation.
*   **Search within Dublin Data:** Allow users to search the curated links and jargon from the popup.
*   **Adding More Jurisdictions:** Structure the data to easily add neighboring cities (e.g., Pleasanton, San Ramon) or Alameda County.
*   **Account Management UI:** A dedicated page within the extension settings to easily add, edit, rename, or delete pre-fill profiles.

## Data Collection Requirement for dublin.ca.gov

**IMPORTANT:** The extension's usefulness relies entirely on the accuracy and completeness of the Dublin, CA specific data it uses (relevant links, jargon/definitions, form URLs, and form field selectors/notes) collected from **`https://dublin.ca.gov/`**.

**In this MVP version, this data is embedded directly within the `scripts/content.js` file for simplicity.**

**To make the extension functional for *your* needs on `dublin.ca.gov`, you MUST:**

1.  Browse `https://dublin.ca.gov/` and identify the specific pages, links, and forms you frequently use or find important.
2.  For relevant pages/topics, note down the exact URLs and descriptive link text.
3.  Identify confusing terms (jargon) on these pages and find their definitions (often found in glossaries, municipal code definitions sections, or accompanying guides on the site).
4.  For specific forms you want to automate, navigate to the *exact* form page URL on `dublin.ca.gov`. Inspect its HTML source (using browser developer tools) to find unique identifiers (`id` or `name` attributes are best) for the input fields you want to pre-fill or add notes to. Note the form page URL and the selector for each field.
5.  Add this collected data to the `dublinLocalData` object directly within the `scripts/content.js` file, following the existing structure. **Replace the placeholder examples provided in the code with your real data.**

This initial data collection is manual but provides the specific, real-world content for your local helper focused on `dublin.ca.gov`.

## Getting Started

To install and run the Dublin Gov Helper extension:

1.  **Clone or Download:** Get the project files (`dublin-gov-helper` folder) to your local machine.
2.  **Open Chrome Extensions Page:** In your Chrome browser, navigate to `chrome://extensions/`.
3.  **Enable Developer Mode:** Toggle the "Developer mode" switch, usually in the top right corner.
4.  **Load Unpacked:** Click the "Load unpacked" button in the top left.
5.  **Select Folder:** Choose the `dublin-gov-helper` folder (the one containing `manifest.json`).
6.  The extension should now appear in your list of extensions. Pin it to your toolbar for easy access.

## How to Use

1.  **Navigate:** Go to any page on the official City of Dublin, CA website (`https://dublin.ca.gov/`).
2.  **Click Icon:** Click the "Dublin Gov Helper" extension icon in your browser toolbar.
3.  **View Info:** The popup window will appear. It will show relevant links and jargon based on the page's topic (using the data you've added from `dublin.ca.gov`).
4.  **Form Page?** If you are on a recognized form page (based on the URLs you added to the data), the popup will indicate this, and the pre-fill button will be enabled.
5.  **Manage Pre-fill Profiles:** Use the "Profile" section in the popup. The input fields display the data for the selected profile. Click "Edit Selected Profile" to enable the inputs and change the data. Click "Save Profile" when done. This data is saved locally by Chrome.
6.  **Pre-fill a Form:** Go to a recognized form page on `dublin.ca.gov`. Select the desired profile in the popup. Click the "Pre-fill Form" button. The extension will attempt to fill in the fields that match the data you've provided in the code for that form. Look for injected notes next to form fields for guidance.

## Project Structure

See the folder structure outlined at the beginning of this README.

## License

This project is licensed under the MIT License.