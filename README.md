# Bulk Recalls 🚗🔍

A modern Chrome extension built with **React**, **Vite**, **Tailwind CSS**, and (optionally) **Firebase** for authentication/inventory management. This extension injects a sleek, resizable panel into pages (like [SaferCar VIN Lookup](https://vinrcl.safercar.gov/vin/)) to check VIN recall info and more!

---

## Features 🌟

- **React-powered Panel**: Injects a dynamic UI into the webpage.
- **Tailwind CSS Styling**: Sleek, modern design with dark mode.
- **Resizable Panel**: Drag the handle to adjust panel width.
- **Auto-Parsing**: Auto-updates VIN details when on a results page.
- **Local Storage Persistence**: Saves VIN list & processing state.
- **(Optional) Firebase Integration**: For authentication & inventory data.
- **Easy Toggle**: Click the extension icon to show/hide the panel.

---

## Installation & Setup 🔧

1. **Clone the Repository**
   ```bash
   git clone https://github.com/jelizarovas/bulk-recalls.git
   cd bulk-recalls
   🤩 Clone the repo and enter the project directory!
   ```

Install Dependencies

bash
Copy
npm install
🚀 This installs React, Vite, Tailwind CSS, and all required packages.

Tailwind CSS Setup
Ensure you have a CSS file (e.g. src/index.css) with these directives:

css
Copy
@tailwind base;
@tailwind components;
@tailwind utilities;
If you don’t have a tailwind.config.js, you can generate one with:

bash
Copy
npx tailwindcss init -p
(Optional if using default settings.)

Development & Build 🔨
Development Mode
Start the Dev Server

bash
Copy
npm run dev
🔄 Enjoy hot reloading and live updates during development!

Production Build
Build the Extension

bash
Copy
npm run build
🏗️ This creates a production-ready bundle in the dist/ folder.

Loading the Extension in Chrome 🧩
Open Chrome and go to:
chrome://extensions

Enable Developer Mode (toggle in the top-right corner). 🔧

Click Load unpacked.

Select the dist/ folder from your project.
🎉 Your extension will now be loaded in Chrome!

Using the Extension ⚙️
Navigate to a page matching your content script pattern (e.g. https://vinrcl.safercar.gov/vin/).

Click the extension icon to toggle the panel.

The panel will "squeeze" in from the right, pushing page content left.

Use the draggable handle on the panel's left edge to adjust its width. 📏

Add VINs, start processing, clear data, or download a CSV file of your records!

Publishing on the Chrome Web Store 🚀🛒
Prepare Your Package

Make sure your production build in dist/ is complete.

Zip the contents of the dist/ folder.

Visit the Chrome Developer Dashboard

Sign in with your Google account.

Pay the one-time developer fee (if you haven’t already).

Upload Your Extension

Click Add a new item.

Upload the zipped package.

Fill in all required information (description, screenshots, etc.). 📸

Submit for Review

Click Publish.

Wait for the review process. Your extension will go live once approved!

Contributing 🤝
Contributions are welcome!

Fork the repo, make your changes, and submit a pull request.

Open an issue if you have suggestions or find bugs. 💡

License 📄
This project is licensed under the MIT License. ⚖️
