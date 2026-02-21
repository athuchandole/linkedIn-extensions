document.getElementById("extractBtn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "extractProfile" }, (response) => {
        if (!response) {
            document.getElementById("output").innerHTML = "No profile data found. Make sure you're on a LinkedIn profile page.";
            return;
        }

        document.getElementById("output").innerHTML = `
            <div><span class="label">Name:</span> ${response.name}</div>
            <div><span class="label">Headline:</span> ${response.headline}</div>
            <div><span class="label">Email:</span> ${response.email}</div>
            <div><span class="label">Phone:</span> ${response.phone}</div>
            <div><span class="label">Profile URL:</span> ${response.profileUrl}</div>
        `;
    });
});