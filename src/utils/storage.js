// utils/storage.js
export function loadVinList() {
  const list = localStorage.getItem("vinList");
  return list ? JSON.parse(list) : [];
}

export function saveVinList(list) {
  localStorage.setItem("vinList", JSON.stringify(list));
}

export function addVin(vin) {
  const list = loadVinList();
  list.push({ vin, status: "Pending" });
  saveVinList(list);
}

export function removeVin(index) {
  const list = loadVinList();
  list.splice(index, 1);
  saveVinList(list);
}

export function clearAll() {
  localStorage.removeItem("vinList");
  localStorage.removeItem("currentVinIndex");
}

export function loadCurrentIndex() {
  const idx = localStorage.getItem("currentVinIndex");
  return idx ? parseInt(idx, 10) : 0;
}

export function saveCurrentIndex(idx) {
  localStorage.setItem("currentVinIndex", idx.toString());
}

// Dummy startProcessing function - you'll integrate your page injection logic here.
export function startProcessing() {
  const list = loadVinList();
  const currentIndex = loadCurrentIndex();
  if (currentIndex < list.length) {
    list[currentIndex].status = "Awaiting submission";
    saveVinList(list);
    // Fill the page's VIN input here if needed.
    // e.g., document.getElementById("VIN").value = list[currentIndex].vin;
  }
}

export function downloadCsv() {
  const list = loadVinList();
  let csv = "vin,year,make,model,status,recallCount\n";
  list.forEach((item) => {
    const {
      vin,
      year = "",
      make = "",
      model = "",
      status = "",
      recallCount = "",
    } = item;
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
