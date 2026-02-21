const STORAGE_KEY = "linkedin_profiles";
const tableBody = document.querySelector("#fullTable tbody");

function loadProfiles() {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const profiles = result[STORAGE_KEY] || [];

        tableBody.innerHTML = "";

        // Latest on top
        const sorted = [...profiles].reverse();

        sorted.forEach(profile => {
            const row = document.createElement("tr");

            row.innerHTML = `
        <td>${profile.name || ""}</td>
        <td>${profile.headline || ""}</td>
        <td>${profile.email || ""}</td>
        <td>${profile.phone || ""}</td>
        <td><a href="${profile.profileUrl}" target="_blank">Link</a></td>
        <td><button class="delete-btn">Delete</button></td>
      `;

            // Delete logic
            row.querySelector(".delete-btn").addEventListener("click", () => {
                deleteProfile(profile.profileUrl);
            });

            tableBody.appendChild(row);
        });
    });
}

function deleteProfile(profileUrl) {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        let profiles = result[STORAGE_KEY] || [];

        // Remove matching profile
        profiles = profiles.filter(p => p.profileUrl !== profileUrl);

        chrome.storage.local.set({ [STORAGE_KEY]: profiles }, () => {
            loadProfiles(); // refresh table instantly
        });
    });
}

// Initial load
document.addEventListener("DOMContentLoaded", loadProfiles);