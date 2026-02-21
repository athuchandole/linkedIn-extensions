chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProfileData") {
        extractProfileData().then(data => {
            sendResponse(data);
        });
        return true;
    }
});

async function extractProfileData() {

    const name =
        document.querySelector("h1")?.innerText?.trim() || null;

    const headline =
        document.querySelector(".text-body-medium")?.innerText?.trim() || null;

    const profileUrl = window.location.href;

    let email = null;
    let phone = null;

    const waitFor = (selector, timeout = 7000) =>
        new Promise((resolve, reject) => {
            const start = Date.now();
            const timer = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(timer);
                    resolve(el);
                }
                if (Date.now() - start > timeout) {
                    clearInterval(timer);
                    reject();
                }
            }, 200);
        });

    const contactBtn = [...document.querySelectorAll("a, button")]
        .find(el => el.innerText?.trim().toLowerCase() === "contact info");

    if (contactBtn) {
        contactBtn.click();

        try {
            await waitFor("section.pv-contact-info__contact-type");

            email =
                document.querySelector("a[href^='mailto:']")?.innerText?.trim() || null;

            phone =
                [...document.querySelectorAll("section")]
                    .find(s => s.querySelector("h3")?.innerText?.toLowerCase().includes("phone"))
                    ?.querySelector("span.t-14")?.innerText?.trim() || null;

            document.querySelector("button[aria-label='Dismiss']")?.click();

        } catch (err) {
            console.log("Contact info not accessible");
        }
    }

    return { name, headline, email, phone, profileUrl };
}