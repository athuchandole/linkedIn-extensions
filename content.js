function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
        const interval = 100;
        let elapsed = 0;
        const check = () => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            elapsed += interval;
            if (elapsed >= timeout) return resolve(null);
            setTimeout(check, interval);
        };
        check();
    });
}

async function getProfileData() {
    const nameEl = await waitForElement('h1');
    const headlineEl = await waitForElement('.text-body-medium, .pv-text-details__left-panel .text-body-medium');

    if (!nameEl && !headlineEl) return null; // Not a profile page

    const name = nameEl?.innerText?.trim() || "Not found";
    const headline = headlineEl?.innerText?.trim() || "Not found";

    let email = "Not found";
    let phone = "Not found";
    const pageText = document.body.innerText;

    const emailMatch = pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) email = emailMatch[0];

    const phoneMatch = pageText.match(/(\+?\d[\d\s-]{7,}\d)/);
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
        getProfileData().then(data => sendResponse(data));
    }
    return true;
});