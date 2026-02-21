# LinkedIn Profile Extractor

## Description
The **LinkedIn Profile Extractor** is a lightweight Chrome Extension that allows you to extract visible profile information from any LinkedIn profile page. It captures the user's **name, headline, email, phone number, and profile URL**, and stores them in a local sheet for easy management. The extension supports numeric and alphanumeric usernames, and prevents invalid pages from being added.  

It is perfect for recruiters, sales teams, or anyone who needs to quickly organize LinkedIn contact information.

---
![22](https://github.com/user-attachments/assets/ed607385-7596-4f3e-83ef-b5fad1efcf7b)

<img src="https://github.com/user-attachments/assets/1de24ee9-7b2c-436f-a64b-5275a6592bdb" width="300"/>



## Key Features
- **Automatic Profile Extraction**: Detects valid LinkedIn profiles and extracts profile details.
- **Supports Numeric & Alphanumeric Usernames**: Works with URLs like `/in/Username-b4884628b/`.
- **Local Sheet Storage**: Save profiles in a local table with the latest 3 entries visible.
- **Duplicate Detection**: Alerts if a profile is already added.
- **Open Sheet Button**: Quickly access the full stored data.
- **User-Friendly UI**: Clean popup with profile preview, status messages, and reload button.

---

## How to Install

1. **Clone or download** the repository to your local machine.
2. Open **Google Chrome** and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in top-right corner).
4. Click **Load unpacked** and select the folder where the extension files are located.
5. Navigate to a LinkedIn profile page (`https://www.linkedin.com/in/username`) to see the extension in action.

---

## Usage

- Open a LinkedIn profile page.
- The extension popup automatically shows the profile information.
- If the profile is valid, you can click **Add to Sheet** to save it.
- View the last 3 stored profiles in the popup table or open the full sheet via **Open Sheet**.

---

## Notes

- Only works on valid LinkedIn profile URLs (`/in/` or `/pub/` paths).
- Profiles without a valid URL or opened on non-profile pages are ignored.
- Stored data persists in Chrome local storage and can be accessed anytime via the sheet.

---
