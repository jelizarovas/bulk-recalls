/************************************************
 * 1. Local Storage Persistence Helpers
 ************************************************/
function loadVinList() {
  const list = localStorage.getItem("vinList");
  return list ? JSON.parse(list) : [];
}

function saveVinList(list) {
  localStorage.setItem("vinList", JSON.stringify(list));
}

function loadCurrentIndex() {
  const idx = localStorage.getItem("currentVinIndex");
  return idx ? parseInt(idx, 10) : 0;
}

function saveCurrentIndex(idx) {
  localStorage.setItem("currentVinIndex", idx.toString());
}

/************************************************
 * 2. Create the Panel (Dark Mode)
 ************************************************/
function createPanel() {
  let panel = document.getElementById("vin-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "vin-panel";
    Object.assign(panel.style, {
      position: "fixed",
      top: "0",
      right: "0",
      width: "350px", // must match marginRight we use in togglePanel
      height: "100vh",
      backgroundColor: "#1e1e1e", // Dark background
      color: "#ffffff", // White text
      borderLeft: "1px solid #333",
      boxShadow: "-2px 0 5px rgba(0,0,0,0.5)",
      overflowY: "auto",
      zIndex: "10000",
      padding: "10px",
      fontFamily: "Arial, sans-serif",
      display: "none", // start hidden
    });

    // Panel inner HTML (dark mode styling)
    panel.innerHTML = `
        <h2 style="margin-top:0; color:#fff;">VIN Recall Checker</h2>
        <div id="vin-list-container">
          <table id="vin-table" style="width:100%; border-collapse: collapse; font-size: 14px; color:#fff;">
            <thead>
              <tr>
                <th style="border-bottom: 1px solid #555; text-align:left; width:55%;">VIN</th>
                <th style="border-bottom: 1px solid #555; text-align:left;">Status</th>
              </tr>
            </thead>
            <tbody id="vin-table-body"></tbody>
          </table>
        </div>
        <input
          type="text"
          id="vin-input"
          placeholder="Enter VIN"
          style="width: 100%; margin:10px 0; padding:5px; color:#000;"
        />
        <button id="add-vin-button" style="width: 100%; padding:8px; margin-bottom:10px; cursor:pointer;">Add VIN</button>
        <button id="start-process-button" style="width: 100%; padding:8px; margin-bottom:10px; cursor:pointer;">Start Processing</button>
        <button id="clear-all-button" style="width: 100%; padding:8px; margin-bottom:10px; cursor:pointer;">Clear All</button>
        <button id="download-csv-button" style="width: 100%; padding:8px; margin-bottom:10px; cursor:pointer;">Download CSV</button>
      `;

    document.body.appendChild(panel);

    // Set up event listeners
    document
      .getElementById("add-vin-button")
      .addEventListener("click", addVinToList);
    document
      .getElementById("start-process-button")
      .addEventListener("click", startProcessing);
    document
      .getElementById("clear-all-button")
      .addEventListener("click", clearAllVins);
    document
      .getElementById("download-csv-button")
      .addEventListener("click", downloadCsv);
  }

  // Update table
  updatePanelTable();
  return panel;
}

/************************************************
 * 3. Update the Table (Dark Mode)
 ************************************************/
function updatePanelTable() {
  const vinList = loadVinList();
  const tbody = document.getElementById("vin-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  vinList.forEach((item, index) => {
    // VIN cell (plus year/make/model if known)
    let vinCell = `<strong>${item.vin}</strong>`;
    if (item.year || item.make || item.model) {
      vinCell += `<br>${item.year || ""} ${item.make || ""} ${
        item.model || ""
      }`.trim();
    }

    // Status cell
    let statusCell = item.status || "Pending";
    if (item.status === "Processed") {
      const rec = item.recallCount !== undefined ? item.recallCount : "0";
      statusCell = `<strong>Processed</strong><br>Recalls: ${rec}`;
    }

    // Remove button
    statusCell += `<br><button class="remove-vin-button" data-index="${index}" style="margin-top:5px; cursor:pointer;">Remove</button>`;

    const row = document.createElement("tr");
    row.innerHTML = `
        <td style="padding:4px 0; vertical-align:top; border-bottom:1px solid #333;">${vinCell}</td>
        <td style="padding:4px 0; vertical-align:top; border-bottom:1px solid #333;">${statusCell}</td>
      `;
    tbody.appendChild(row);
  });

  // Attach remove handlers
  tbody.querySelectorAll(".remove-vin-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.getAttribute("data-index"), 10);
      removeVinAtIndex(index);
    });
  });
}

/************************************************
 * 4. Add VIN
 ************************************************/
function addVinToList() {
  const vinInput = document.getElementById("vin-input");
  const vin = vinInput.value.trim();
  if (!vin) return;

  const vinList = loadVinList();
  vinList.push({ vin, status: "Pending" });
  saveVinList(vinList);
  updatePanelTable();
  vinInput.value = "";
}

/************************************************
 * 5. Remove VIN (individual)
 ************************************************/
function removeVinAtIndex(index) {
  const vinList = loadVinList();
  vinList.splice(index, 1);
  saveVinList(vinList);

  // Adjust currentVinIndex if necessary
  let currentIndex = loadCurrentIndex();
  if (index < currentIndex) {
    currentIndex--;
    if (currentIndex < 0) currentIndex = 0;
    saveCurrentIndex(currentIndex);
  } else if (currentIndex >= vinList.length) {
    saveCurrentIndex(vinList.length - 1 < 0 ? 0 : vinList.length - 1);
  }

  updatePanelTable();
}

/************************************************
 * 6. Clear All
 ************************************************/
function clearAllVins() {
  localStorage.removeItem("vinList");
  localStorage.removeItem("currentVinIndex");
  updatePanelTable();
}

/************************************************
 * 7. Start Processing
 ************************************************/
function startProcessing() {
  const vinList = loadVinList();
  let currentIndex = loadCurrentIndex();

  if (currentIndex < vinList.length) {
    vinList[currentIndex].status = "Awaiting submission";
    saveVinList(vinList);
    updatePanelTable();

    // Fill page's VIN input
    const vinInputPage = document.getElementById("VIN");
    if (vinInputPage) {
      vinInputPage.value = vinList[currentIndex].vin;
      vinInputPage.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } else {
    console.log("No VIN to process or we're at the end of the list.");
  }
}

/************************************************
 * 8. Auto-Parse if on vinLookup Page
 ************************************************/
function autoParseIfOnResultsPage() {
  if (!window.location.pathname.includes("vinLookup")) return;

  const vinList = loadVinList();
  let currentIndex = loadCurrentIndex();
  if (currentIndex >= vinList.length) return;

  // Grab year/make/model from the first <h2> (non-inline)
  const vehicleEl = document.querySelector(
    "div.contentbox.radius h2:not(.inline)"
  );
  let year = "",
    make = "",
    model = "";

  if (vehicleEl) {
    const vehicleText = vehicleEl.textContent.trim();
    // e.g. "VIN: KNAGM4A76F5637294 Year: 2015 Make: Kia Model: OPTIMA LX 4CYL AUTO"
    let match = vehicleText.match(/Year:\s*(\d+)/);
    if (match) year = match[1];

    match = vehicleText.match(/Make:\s*([A-Za-z0-9]+)/);
    if (match) make = match[1];

    match = vehicleText.match(/Model:\s*([\w\s-]+)/);
    if (match) model = match[1].trim();
  }

  // Grab recall count from the second <h2> with .inline.floatleft
  const recallEl = document.querySelector(
    "div.contentbox.radius h2.inline.floatleft"
  );
  let recallCount = "0";
  if (recallEl) {
    const text = recallEl.textContent.trim(); // e.g. "Number of Open Recalls: 1"
    const match = text.match(/Number of Open Recalls:\s*(\d+)/);
    if (match) {
      recallCount = match[1];
    }
  }

  // Update current VIN
  vinList[currentIndex].status = "Processed";
  vinList[currentIndex].year = year;
  vinList[currentIndex].make = make;
  vinList[currentIndex].model = model;
  vinList[currentIndex].recallCount = recallCount;
  saveVinList(vinList);
  updatePanelTable();

  // Move on to the next
  currentIndex++;
  saveCurrentIndex(currentIndex);

  if (currentIndex < vinList.length) {
    vinList[currentIndex].status = "Awaiting submission";
    saveVinList(vinList);
    // Fill next VIN
    const nextVinInput = document.getElementById("VIN");
    if (nextVinInput) {
      nextVinInput.value = vinList[currentIndex].vin;
      nextVinInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } else {
    console.log("All VINs processed!");
  }
}

/************************************************
 * 9. Download CSV
 ************************************************/
function downloadCsv() {
  const vinList = loadVinList();
  let csv = "vin,year,make,model,status,recallCount\n";
  vinList.forEach((item) => {
    const vin = item.vin || "";
    const year = item.year || "";
    const make = item.make || "";
    const model = item.model || "";
    const status = item.status || "";
    const recallCount = item.recallCount !== undefined ? item.recallCount : "";
    csv += `${vin},${year},${make},${model},${status},${recallCount}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vin_data.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/************************************************
/************************************************
 * Toggle Panel & Persist State
 ************************************************/
function togglePanel() {
  const panel = createPanel();
  console.log("togglePanel() called. Current display:", panel.style.display);
  // If panel is hidden or its display property is empty, show it.
  if (panel.style.display === "none" || panel.style.display === "") {
    panel.style.display = "block";
    document.body.style.marginRight = "350px"; // panel width
    localStorage.setItem("panelVisible", "true");
    console.log("Panel set to visible.");
  } else {
    panel.style.display = "none";
    document.body.style.marginRight = "";
    localStorage.setItem("panelVisible", "false");
    console.log("Panel set to hidden.");
  }
}

/************************************************
 * Initialization on Page Load
 ************************************************/
(function init() {
  const panel = createPanel();
  // Check saved state; default to visible if none stored.
  let storedState = localStorage.getItem("panelVisible");
  console.log("Stored panel state:", storedState);
  if (storedState === null) {
    // No state stored; default to visible.
    panel.style.display = "block";
    document.body.style.marginRight = "350px";
    localStorage.setItem("panelVisible", "true");
    console.log("No stored state; defaulting to visible.");
  } else if (storedState === "true") {
    panel.style.display = "block";
    document.body.style.marginRight = "350px";
    console.log("Restoring panel as visible.");
  } else {
    panel.style.display = "none";
    document.body.style.marginRight = "";
    console.log("Restoring panel as hidden.");
  }
  // Also run auto-parse if on results page
  autoParseIfOnResultsPage();
})();
