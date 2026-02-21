const STORAGE_KEY = "linkedin_profiles";
const tableBody = document.querySelector("#fullTable tbody");

chrome.storage.local.get([STORAGE_KEY], (result) => {
    const profiles = result[STORAGE_KEY] || [];

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
    `;
        tableBody.appendChild(row);
    });
});