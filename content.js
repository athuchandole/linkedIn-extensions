function getProfileData() {
    const name = document.querySelector('h1')?.innerText || "Not found";
    const headline = document.querySelector('.text-body-medium')?.innerText || "Not found";

    let email = "Not found";
    let phone = "Not found";

    // Try to find email & phone in contact section if visible
    const contactSection = document.body.innerText;

    const emailMatch = contactSection.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) email = emailMatch[0];

    const phoneMatch = contactSection.match(/(\+?\d[\d\s-]{7,}\d)/);
    if (phoneMatch) phone = phoneMatch[0];

    return {
        name,
        headline,
        email,
        phone,
        profileUrl: window.location.href
    };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractProfile") {
        const data = getProfileData();
        sendResponse(data);
    }
});