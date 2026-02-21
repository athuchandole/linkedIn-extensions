function waitForElement(selector, timeout = 7000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const timer = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(timer);
                resolve(el);
            }
            if (Date.now() - start > timeout) {
                clearInterval(timer);
                reject("Timeout waiting for element: " + selector);
            }
        }, 200);
    });
}

async function getContactInfo() {
    // Find "Contact Info" button
    const contactBtn = [...document.querySelectorAll("a, button")]
        .find(el => el.innerText?.trim().toLowerCase() === "contact info");

    if (!contactBtn) return { email: "Not found", phone: "Not found" };

    // Click to open overlay
    contactBtn.click();

    try {
        await waitForElement("section.pv-contact-info__contact-type");
    } catch (err) {
        return { email: "Not found", phone: "Not found" };
    }

    const email = document.querySelector("a[href^='mailto:']")?.innerText?.trim() || "Not found";
    const phone = [...document.querySelectorAll("section")]
        .find(s => s.querySelector("h3")?.innerText?.toLowerCase().includes("phone"))
        ?.querySelector("span.t-14")?.innerText?.trim() || "Not found";

    // Close overlay
    document.querySelector("button[aria-label='Dismiss']")?.click();

    return { email, phone };
}

async function getProfileData() {
    // Wait for name and headline
    const nameEl = await waitForElement('h1', 5000);
    const headlineEl = await waitForElement('.text-body-medium, .pv-text-details__left-panel .text-body-medium', 5000);

    if (!nameEl && !headlineEl) return null; // Not a profile page

    const name = nameEl?.innerText?.trim() || "Not found";
    const headline = headlineEl?.innerText?.trim() || "Not found";

    const contact = await getContactInfo();

    return {
        name,
        headline,
        email: contact.email,
        phone: contact.phone,
        profileUrl: window.location.href
    };
}

// Listen to popup requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractProfile") {
        getProfileData().then(data => sendResponse(data));
    }
    return true;
});