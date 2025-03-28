// utils/parse.js

/**
 * Parses the VIN lookup results page to extract vehicle info.
 * Assumes that:
 *  - The first <h2> (without .inline) contains Year, Make, Model.
 *  - The second <h2> (with .inline.floatleft) contains "Number of Open Recalls: X".
 */
export function autoParseResults() {
  // Only run on the correct page
  if (!window.location.pathname.includes("vinLookup")) return null;

  let year = "",
    make = "",
    model = "",
    recallCount = "0";

  // Get vehicle info from the first h2 (non-inline)
  const vehicleEl = document.querySelector(
    "div.contentbox.radius h2:not(.inline)"
  );
  if (vehicleEl) {
    const vehicleText = vehicleEl.textContent.trim();
    let match = vehicleText.match(/Year:\s*(\d+)/);
    if (match) year = match[1];

    match = vehicleText.match(/Make:\s*([A-Za-z0-9]+)/);
    if (match) make = match[1];

    match = vehicleText.match(/Model:\s*([\w\s-]+)/);
    if (match) model = match[1].trim();
  }

  // Get recall count from the second h2 (with .inline.floatleft)
  const recallEl = document.querySelector(
    "div.contentbox.radius h2.inline.floatleft"
  );
  if (recallEl) {
    const recallText = recallEl.textContent.trim(); // e.g., "Number of Open Recalls: 1"
    const match = recallText.match(/Number of Open Recalls:\s*(\d+)/);
    if (match) {
      recallCount = match[1];
    }
  }

  return { year, make, model, recallCount };
}
