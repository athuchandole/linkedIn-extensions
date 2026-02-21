const profileContainer = document.getElementById("profileContainer");
const reloadBtn = document.getElementById("reloadBtn");
const addToSheetBtn = document.getElementById("addToSheetBtn");
const openSheetBtn = document.getElementById("openSheetBtn");
const tableBody = document.querySelector("#dataTable tbody");
const tableWrapper = document.getElementById("tableWrapper");
const statusMessage = document.getElementById("statusMessage");

let currentProfileData = null;
const STORAGE_KEY = "linkedin_profiles";

/* ---------- PROFILE URL CHECK ---------- */

function isValidProfilePage(url) {
    if (!url) return false;

    try {
        const parsed = new URL(url);

        if (!parsed.hostname.includes("linkedin.com")) return false;

        const path = parsed.pathname.replace(/\/$/, "");
        const profileRegex = /^\/(in|pub)\/[a-zA-Z0-9\-_%]+$/;

        return profileRegex.test(path);
    } catch (error) {
        return false;
    }
}

/* ---------- CHECK EXISTENCE ---------- */

function checkIfAlreadyAdded(profileUrl) {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const profiles = result[STORAGE_KEY] || [];
        const exists = profiles.some(p => p.profileUrl === profileUrl);

        if (exists) {
            statusMessage.textContent = "Added in Sheet";
            statusMessage.classList.add("success");
            addToSheetBtn.disabled = true;
        } else {
            statusMessage.textContent = "";
            statusMessage.classList.remove("success");
            addToSheetBtn.disabled = false;
        }
    });
}

/* ---------- RENDER PROFILE ---------- */

function renderProfile(data) {
    profileContainer.innerHTML = `
        <div class="profile-card">
            <div class="profile-name">${data.name || "-"}</div>
            <div class="profile-headline">${data.headline || "-"}</div>

            <div class="contact-info">
                <div class="contact-label">Email</div>
                <div class="contact-value">${data.email || "-"}</div>

                <div class="contact-label">Phone</div>
                <div class="contact-value">${data.phone || "-"}</div>
            </div>

            <div class="profile-url">
                ${data.profileUrl || "-"}
            </div>
        </div>
    `;

    addToSheetBtn.style.display = "block";
    currentProfileData = data;
    checkIfAlreadyAdded(data.profileUrl);
}

/* ---------- ERROR ---------- */

function renderError() {
    profileContainer.innerHTML = `
        <div class="profile-card">
            <p><strong>Not a LinkedIn profile page.</strong></p>
            <p>Please open a valid profile like /in/username</p>
        </div>
    `;

    addToSheetBtn.style.display = "none";
    statusMessage.textContent = "";
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

/* ---------- SAVE ---------- */

function saveProfile(profile) {
    if (!profile || !profile.profileUrl || !profile.name) return;

    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const profiles = result[STORAGE_KEY] || [];
        const exists = profiles.some(p => p.profileUrl === profile.profileUrl);
        if (exists) return;

        profiles.push(profile);

        chrome.storage.local.set({ [STORAGE_KEY]: profiles }, () => {
            tableWrapper.style.display = "block";
            loadStoredProfiles();
            checkIfAlreadyAdded(profile.profileUrl);
        });
    });
}

/* ---------- LOAD PROFILE ---------- */

function loadProfile() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        const tab = tabs[0];
        const currentUrl = tab?.url;

        if (!isValidProfilePage(currentUrl)) {
            renderError();
            return;
        }

        chrome.tabs.sendMessage(
            tab.id,
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
    tableWrapper.style.display = "none";
    loadProfile();
});