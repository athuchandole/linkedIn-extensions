const profileContainer = document.getElementById("profileContainer");
const reloadBtn = document.getElementById("reloadBtn");
const addToSheetBtn = document.getElementById("addToSheetBtn");
const openSheetBtn = document.getElementById("openSheetBtn");
const tableBody = document.querySelector("#dataTable tbody");

let currentProfileData = null;
const STORAGE_KEY = "linkedin_profiles";

/* ---------- STRONG PROFILE URL CHECK ---------- */

function isValidProfilePage(url) {
    if (!url) return false;

    try {
        const parsed = new URL(url);

        if (!parsed.hostname.includes("linkedin.com")) return false;

        // Match /in/username OR /pub/username
        const profileRegex = /^\/(in|pub)\/[a-zA-Z0-9\-_%]+\/?$/;

        return profileRegex.test(parsed.pathname);
    } catch {
        return false;
    }
}

/* ---------- RENDER PROFILE ---------- */

function renderProfile(data) {
    profileContainer.innerHTML = `
    <div class="profile-card">
      <div class="profile-name">${data.name || "-"}</div>
      <div class="profile-headline">${data.headline || "-"}</div>
      <div><strong>Email:</strong> ${data.email || "-"}</div>
      <div><strong>Phone:</strong> ${data.phone || "-"}</div>
      <div><strong>Profile URL:</strong> ${data.profileUrl || "-"}</div>
    </div>
  `;

    addToSheetBtn.style.display = "block";
    addToSheetBtn.disabled = false;
    currentProfileData = data;
}

/* ---------- ERROR ---------- */

function renderError() {
    profileContainer.innerHTML = `
    <div class="profile-card">
      <p>Not a LinkedIn profile page.</p>
      <p>Please open a valid profile like /in/username</p>
    </div>
  `;

    addToSheetBtn.style.display = "none";
    currentProfileData = null;
}

/* ---------- TABLE ---------- */

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

        const latestThree = profiles.slice(-3).reverse();
        latestThree.forEach(profile => addRowToTable(profile));
    });
}

/* ---------- SAVE PROFILE ---------- */

function saveProfile(profile) {
    if (!profile || !profile.profileUrl || !profile.name) {
        alert("Invalid profile data.");
        return;
    }

    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const profiles = result[STORAGE_KEY] || [];

        const exists = profiles.some(p => p.profileUrl === profile.profileUrl);
        if (exists) {
            alert("Profile already added!");
            return;
        }

        profiles.push(profile);

        chrome.storage.local.set({ [STORAGE_KEY]: profiles }, () => {
            loadStoredProfiles();
        });
    });
}

/* ---------- LOAD PROFILE ---------- */

function loadProfile() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentUrl = tabs[0]?.url;

        if (!isValidProfilePage(currentUrl)) {
            renderError();
            return;
        }

        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "getProfileData" },
            function (response) {
                if (chrome.runtime.lastError || !response || !response.name) {
                    renderError();
                    return;
                }

                renderProfile(response);
            }
        );
    });
}

/* ---------- EVENTS ---------- */

addToSheetBtn.addEventListener("click", () => {
    if (!currentProfileData) return;
    saveProfile(currentProfileData);
});

reloadBtn.addEventListener("click", loadProfile);

openSheetBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("sheet.html") });
});

document.addEventListener("DOMContentLoaded", () => {
    addToSheetBtn.style.display = "none";
    loadProfile();
    loadStoredProfiles();
});