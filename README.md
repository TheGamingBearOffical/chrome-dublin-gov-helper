# Dublin Gov Helper (for Dublin, CA - dublin.ca.gov + related domains)

## Project Name

Dublin Gov Helper

## Problem Description

Interacting with the official City of Dublin, CA online resources, including their main website (`dublin.ca.gov`) and related service portals (like those hosted on `civicplus.com` or `tylerhost.net`), can be challenging. Users struggle to quickly find relevant local laws, understand specific city regulations, locate the correct, current forms, and accurately complete the required paperwork across these various online properties.

## Solution Idea (Scaled-Down Chrome Extension MVP)

The "Dublin Gov Helper" is a Chrome extension designed to provide contextual assistance and streamline interactions specifically when the user is visiting official online resources used by the City of Dublin, CA.

This MVP aims to provide tangible help by:

1.  **Contextual Resources:** Identifying the topic of the page the user is on and providing quick links to relevant city forms, municipal code sections, or related departmental pages, even if they are hosted on different domains used by the city.
2.  **Jargon Buster:** Offering simple explanations for complex terms commonly found on Dublin's government online properties.
3.  **Assisted Form Filling & Guidance:** On recognized forms found on supported domains, the extension can highlight fields, provide specific notes extracted from relevant regulations, and allow secure pre-filling of common personal/business information from user-saved profiles.

This initial version targets `dublin.ca.gov` and other key domains known to be used by the City of Dublin for official purposes.

## Target Consumer

Anyone needing to interact with the local government in Dublin, CA via their official online resources, who is not a professional already familiar with the processes. This includes:

*   **Dublin Residents:** Applying for building permits, researching zoning laws, looking up property regulations, accessing resident services forms across Dublin's supported websites.
*   **Small Business Owners in Dublin:** Applying for business licenses, researching local business regulations and permits, finding forms related to commercial property on Dublin's supported websites.
*   **Property Owners/Managers in Dublin:** Dealing with permits, regulations, or forms related to residential or commercial properties listed on Dublin's supported websites.
*   **General Public in Dublin:** Anyone seeking specific information, forms, or definitions on the official online properties used by the City of Dublin.

The focus is on providing utility to non-experts navigating Dublin, CA's specific local governmental online resources.

## Features

**Current (MVP Scope):**

*   Activates on `dublin.ca.gov` and other specified domains (e.g., `civicplus.com` used by Dublin, `tylerhost.net` used by Dublin).
*   Attempts to identify the general topic of the page based on URL patterns (e.g., "permits", "business", "planning").
*   Displays relevant quick links and definitions for the identified topic in the extension popup (Data must be collected and placed in the code).
*   Indicates in the popup if the current page is a recognized city form hosted on a supported domain.
*   Allows saving multiple user profiles (e.g., 'Home Address', 'My Business') for pre-fill data securely in Chrome storage.
*   Basic pre-filling of common form fields (name, address, contact) on recognized forms using data from the selected profile.
*   Injects simple guidance notes (e.g., extracted rules, tips) directly next to form fields on recognized forms.
*   Provides basic status messages in the popup (e.g., "Form pre-filled").

**Future Expansion Ideas:**

*   **Improved Jargon Buster UI:** On-page tooltips when hovering over jargon.
*   **More Advanced Form Handling:** Support for checkboxes, radio buttons, dropdowns, multi-page forms, and basic client-side validation based on regulations.
*   **Dynamic Data Loading:** Fetch data from external JSON files or a simple backend to allow updates without extension re-installation.
*   **Search within Dublin Data:** Allow users to search the curated links and jargon from the popup.
*   **Adding More Jurisdictions:** Structure the data to easily add data for other cities or counties.
*   **Account Management UI:** A dedicated page within the extension settings to easily add, edit, rename, or delete pre-fill profiles.

## Data Collection Requirement for Dublin, CA Online Resources

**IMPORTANT:** The extension's usefulness relies entirely on the accuracy and completeness of the Dublin, CA specific data it uses (relevant links, jargon/definitions, form URLs, and form field selectors/notes) collected from the City of Dublin's official online resources (`dublin.ca.gov` and other domains they use).

**In this MVP version, this data is embedded directly within the `scripts/content.js` file for simplicity.**

**To make the extension functional for *your* needs, you MUST:**

1.  Browse the City of Dublin's various online properties (`dublin.ca.gov`, `ca-dublin2.civicplus.com`, `dublinca-energovweb.tylerhost.net`, `gis.dublin.ca.gov`, etc.) and identify the specific pages, links, and forms you frequently use or find important.
2.  **Note the Exact Domain(s):** Identify *all* domains the City uses for important resources.
3.  For relevant pages/topics on these domains, note down the exact URLs and descriptive link text.
4.  Identify confusing terms (jargon) on these pages and find their definitions (often found in glossaries, municipal code definitions sections, or accompanying guides across the various sites).
5.  For specific forms you want to automate, navigate to the *exact* form page URL on the domain it's hosted on. Inspect its HTML source (using browser developer tools) to find unique identifiers (`id` or `name` attributes are best) for the input fields you want to pre-fill or add notes to. Note the form page URL and the selector for each field.
6.  **Add the relevant domains to the `host_permissions` and `content_scripts.matches` arrays in `manifest.json`.**
7.  Add the collected data (links, jargon, form mappings with correct domains and selectors) to the `dublinLocalData` object directly within the `scripts/content.js` file, following the existing structure. **Replace the placeholder examples provided in the code with your real data.**

This initial data collection is manual but provides the specific, real-world content for your local helper focused on Dublin, CA.

## Getting Started

To install and run the Dublin Gov Helper extension:

1.  **Clone or Download:** Get the project files (`dublin-gov-helper` folder) to your local machine.
2.  **Open Chrome Extensions Page:** In your Chrome browser, navigate to `chrome://extensions/`.
3.  **Enable Developer Mode:** Toggle the "Developer mode" switch, usually in the top right corner.
4.  **Load Unpacked:** Click the "Load unpacked" button in the top left.
5.  **Select Folder:** Choose the `dublin-gov-helper` folder (the one containing `manifest.json`).
6.  The extension should now appear in your list of extensions. Pin it to your toolbar for easy access.

## How to Use

1.  **Navigate:** Go to any supported online resource used by the City of Dublin, CA (e.g., `https://dublin.ca.gov/`, `https://ca-dublin2.civicplus.com/`, `https://dublinca-energovweb.tylerhost.net/`).
2.  **Click Icon:** Click the "Dublin Gov Helper" extension icon in your browser toolbar.
3.  **View Info:** The popup window will appear. It will show relevant links and jargon based on the page's topic (using the data you've added).
4.  **Form Page?** If you are on a recognized form page (based on the URLs you added to the data), the popup will indicate this, and the pre-fill button will be enabled.
5.  **Manage Pre-fill Profiles:** Use the "Profile" section in the popup. The input fields display the data for the selected profile. Click "Edit Selected Profile" to enable the inputs and change the data. Click "Save Profile" when done. This data is saved locally by Chrome.
6.  **Pre-fill a Form:** Go to a recognized form page on a supported Dublin domain. Select the desired profile in the popup. Click the "Pre-fill Form" button. The extension will attempt to fill in the fields that match the data you've provided in the code for that form. Look for injected notes next to form fields for guidance.

## Project Structure

See the folder structure outlined at the beginning of this README.

## License

This project is licensed under the MIT License.