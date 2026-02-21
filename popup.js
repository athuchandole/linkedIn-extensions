const profileContainer = document.getElementById("profileContainer");
const reloadBtn = document.getElementById("reloadBtn");
const addToSheetBtn = document.getElementById("addToSheetBtn");
const tableBody = document.querySelector("#dataTable tbody");

let currentProfileData = null;

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

function loadProfile() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getProfileData" }, function (response) {
            if (chrome.runtime.lastError || !response) {
                renderError();
                return;
            }

            renderProfile(response);
        });
    });
}

addToSheetBtn.addEventListener("click", () => {
    if (!currentProfileData) return;

    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${currentProfileData.name || ""}</td>
    <td>${currentProfileData.headline || ""}</td>
    <td>${currentProfileData.email || ""}</td>
    <td>${currentProfileData.phone || ""}</td>
    <td><a href="${currentProfileData.profileUrl}" target="_blank">Link</a></td>
  `;

    tableBody.appendChild(row);
});

reloadBtn.addEventListener("click", loadProfile);

document.addEventListener("DOMContentLoaded", loadProfile);