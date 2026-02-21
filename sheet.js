const STORAGE_KEY = "linkedin_profiles";
const tableBody = document.querySelector("#fullTable tbody");

let profilesData = [];
let filteredData = [];

document.addEventListener("DOMContentLoaded", () => {

    loadProfiles();

    // Filters
    document.getElementById("filterType").addEventListener("change", renderTable);
    document.getElementById("searchName").addEventListener("input", renderTable);
    document.getElementById("searchDomain").addEventListener("input", renderTable);
    document.getElementById("sortType").addEventListener("change", renderTable);

    document.getElementById("selectAll").addEventListener("change", (e) => {
        document.querySelectorAll(".rowCheckbox")
            .forEach(cb => cb.checked = e.target.checked);
    });

    // Buttons
    document.getElementById("btnCSV").addEventListener("click", exportCSV);
    document.getElementById("btnExcel").addEventListener("click", exportExcel);
    document.getElementById("btnJSON").addEventListener("click", exportJSON);
    document.getElementById("btnPDF").addEventListener("click", exportPDF);
    document.getElementById("btnCopy").addEventListener("click", copyAll);
    document.getElementById("btnDeleteSelected").addEventListener("click", deleteSelected);
    document.getElementById("btnDeleteAll").addEventListener("click", deleteAll);
});

function loadProfiles() {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        profilesData = result[STORAGE_KEY] || [];
        renderTable();
    });
}

function renderTable() {
    tableBody.innerHTML = "";
    let data = [...profilesData];

    const filter = document.getElementById("filterType").value;
    const nameSearch = document.getElementById("searchName").value.toLowerCase();
    const domainSearch = document.getElementById("searchDomain").value.toLowerCase();
    const sort = document.getElementById("sortType").value;

    // Filter
    data = data.filter(p => {
        if (filter === "email" && !p.email) return false;
        if (filter === "phone" && !p.phone) return false;
        if (filter === "both" && !(p.email && p.phone)) return false;
        if (filter === "none" && (p.email || p.phone)) return false;

        if (nameSearch && !p.name?.toLowerCase().includes(nameSearch)) return false;
        if (domainSearch && !p.email?.toLowerCase().includes(domainSearch)) return false;

        return true;
    });

    // Sort
    switch (sort) {
        case "latest": data.reverse(); break;
        case "az": data.sort((a, b) => a.name.localeCompare(b.name)); break;
        case "za": data.sort((a, b) => b.name.localeCompare(a.name)); break;
        case "emailFirst": data.sort((a, b) => (b.email ? 1 : 0) - (a.email ? 1 : 0)); break;
        case "phoneFirst": data.sort((a, b) => (b.phone ? 1 : 0) - (a.phone ? 1 : 0)); break;
        case "bothFirst": data.sort((a, b) => (b.email && b.phone ? 1 : 0) - (a.email && a.phone ? 1 : 0)); break;
    }

    filteredData = data;

    data.forEach(profile => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" class="rowCheckbox" data-url="${profile.profileUrl}"></td>
            <td>${profile.name || ""}</td>
            <td>${profile.headline || ""}</td>
            <td>${profile.email || ""}</td>
            <td>${profile.phone || ""}</td>
            <td><a href="${profile.profileUrl}" target="_blank">Open</a></td>
        `;
        tableBody.appendChild(row);
    });

    updateStats();
}

function updateStats() {
    const total = profilesData.length;
    const email = profilesData.filter(p => p.email).length;
    const phone = profilesData.filter(p => p.phone).length;
    const both = profilesData.filter(p => p.email && p.phone).length;

    document.getElementById("stats").innerText =
        `Total: ${total} | With Email: ${email} | With Phone: ${phone} | With Both: ${both}`;
}

function getSelected() {
    const selectedUrls = [...document.querySelectorAll(".rowCheckbox:checked")]
        .map(cb => cb.dataset.url);

    if (selectedUrls.length === 0) return filteredData;

    return profilesData.filter(p => selectedUrls.includes(p.profileUrl));
}

/* ================= EXPORT ================= */

function exportCSV() {
    const data = getSelected();
    if (!data.length) return alert("No data selected");

    const csv = convertToCSV(data);
    downloadFile(csv, "profiles.csv", "text/csv");
}

function exportExcel() {
    const data = getSelected();
    if (!data.length) return alert("No data selected");

    const csv = convertToCSV(data);
    downloadFile(csv, "profiles.xls", "application/vnd.ms-excel");
}

function exportJSON() {
    const data = getSelected();
    if (!data.length) return alert("No data selected");

    downloadFile(JSON.stringify(data, null, 2), "profiles.json", "application/json");
}

function exportPDF() {
    if (!filteredData.length) return alert("No data");
    window.print();
}

function copyAll() {
    const data = getSelected();
    if (!data.length) return alert("No data selected");

    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("Copied successfully");
}

/* ================= DELETE ================= */

function deleteSelected() {
    const selected = getSelected();
    if (!selected.length) return alert("No rows selected");

    profilesData = profilesData.filter(p =>
        !selected.some(s => s.profileUrl === p.profileUrl)
    );

    chrome.storage.local.set({ [STORAGE_KEY]: profilesData }, loadProfiles);
}

function deleteAll() {
    if (!confirm("Delete all profiles?")) return;

    profilesData = [];
    chrome.storage.local.set({ [STORAGE_KEY]: [] }, loadProfiles);
}

/* ================= HELPERS ================= */

function convertToCSV(data) {
    const header = ["Name", "Headline", "Email", "Phone", "Profile URL"];
    const rows = data.map(p => [
        p.name, p.headline, p.email, p.phone, p.profileUrl
    ]);

    return [header, ...rows]
        .map(r => r.map(v => `"${v || ""}"`).join(","))
        .join("\n");
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}