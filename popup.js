function showProfile(data) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = `
        <div class="profile-name">${data.name}</div>
        <div class="profile-headline">${data.headline}</div>
        <div class="profile-info"><span class="label">Email:</span> ${data.email}</div>
        <div class="profile-info"><span class="label">Phone:</span> ${data.phone}</div>
        <div class="profile-info"><span class="label">Profile URL:</span> <a href="${data.profileUrl}" target="_blank">${data.profileUrl}</a></div>
    `;
    outputDiv.classList.remove("hidden");
    document.getElementById("message").classList.add("hidden");
}

function showMessage() {
    document.getElementById("output").classList.add("hidden");
    document.getElementById("message").classList.remove("hidden");
}

function fetchProfile() {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { action: "extractProfile" }, (response) => {
            if (!response) {
                showMessage();
            } else {
                showProfile(response);
            }
        });
    });
}

// Reload button
document.getElementById("reloadBtn").addEventListener("click", fetchProfile);

// Auto-fetch on popup open
fetchProfile();