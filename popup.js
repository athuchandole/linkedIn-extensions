document.getElementById("extractBtn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "extractProfile" }, (response) => {
        if (!response) {
            alert("No profile data found. Make sure you're on a LinkedIn profile page.");
            return;
        }

        const outputDiv = document.getElementById("output");
        outputDiv.innerHTML = `
            <div class="profile-name">${response.name}</div>
            <div class="profile-headline">${response.headline}</div>
            <div class="profile-info"><span class="label">Email:</span> ${response.email}</div>
            <div class="profile-info"><span class="label">Phone:</span> ${response.phone}</div>
            <div class="profile-info"><span class="label">Profile URL:</span> <a href="${response.profileUrl}" target="_blank">${response.profileUrl}</a></div>
        `;

        document.getElementById("placeholder").classList.add("hidden");
        outputDiv.classList.remove("hidden");
    });
});