const profileContainer = document.getElementById("profileContainer");
const reloadBtn = document.getElementById("reloadBtn");
const addToSheetBtn = document.getElementById("addToSheetBtn");
const tableBody = document.querySelector("#dataTable tbody");

let currentProfileData = null;
const STORAGE_KEY = "linkedin_profiles";

function renderProfile(data) {
    profileContainer.innerHTML = `
    <div class="profile-card">
      <div class="profile-name">${data.name || "-"}</div>
      <div class="profile-headline">${data.headline || "-"}</div>
      <div class="profile-field"><strong>Email:</strong> ${data.email || "-"}</div>
      <div class="profile-field"><strong>Phone:</strong> ${data.phone || "-"}</div>
      <div class="profile-field"><strong>Profile URL:</strong> ${data.profileUrl || "-"}</div>
    </div>
  `;

    addToSheetBtn.disabled = false;
    currentProfileData = data;
}

function renderError() {
    profileContainer.innerHTML = `
    <div class="profile-card">
      <p>No profile data found.</p>
      <p>Please open a LinkedIn profile page.</p>
    </div>
  `;
    addToSheetBtn.disabled = true;
}

function addRowToTable(data) {
    const row = document.createElement("tr");

    row.innerHTML = `
    <td>${data.name || ""}</td>
    <td>${data.headline || ""}</td>
    <td>${data.email || ""}</td>
    <td>${data.phone || ""}</td>
    <td><a href="${data.profileUrl}" target="_blank">Link</a></td>
  `;

    tableBody.appendChild(row);
}

function loadStoredProfiles() {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const profiles = result[STORAGE_KEY] || [];

        tableBody.innerHTML = "";
        profiles.forEach(profile => addRowToTable(profile));
    });
}

function saveProfile(profile) {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const profiles = result[STORAGE_KEY] || [];

        // Prevent duplicate (same profile URL)
        const exists = profiles.some(p => p.profileUrl === profile.profileUrl);
        if (exists) {
            alert("Profile already added!");
            return;
        }

        profiles.push(profile);

        chrome.storage.local.set({ [STORAGE_KEY]: profiles }, () => {
            addRowToTable(profile);
        });
    });
}

function loadProfile() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "getProfileData" },
            function (response) {
                if (chrome.runtime.lastError || !response) {
                    renderError();
                    return;
                }

                renderProfile(response);
            }
        );
    });
}

addToSheetBtn.addEventListener("click", () => {
    if (!currentProfileData) return;
    saveProfile(currentProfileData);
});

reloadBtn.addEventListener("click", loadProfile);

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadStoredProfiles();
});