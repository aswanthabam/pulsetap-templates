// Initialize Lucide icons
lucide.createIcons();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable URL string (strips redundant protocol/trailing slash).
 * Returns "Invalid URL" if the input cannot be parsed.
 */
function getFormattedURL(inputUrl) {
  try {
    if (!/^https?:\/\//i.test(inputUrl)) {
      inputUrl = "http://" + inputUrl;
    }
    const url = new URL(inputUrl);
    const parts = url.hostname.split(".");
    const subdomain =
      parts.length >= 3 ? parts.slice(0, parts.length - 2).join(".") : "";
    const domain =
      parts.length >= 3 ? parts.slice(-2).join(".") : url.hostname;
    const path = url.pathname !== "/" ? url.pathname : "";
    return `${subdomain ? subdomain + "." : ""}${domain}${path}`;
  } catch {
    return "Invalid URL";
  }
}

/**
 * Detects the mobile OS of the current device.
 * Returns "Android", "iOS", or "unknown".
 */
function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(userAgent)) return "Android";
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
  return "unknown";
}

// ---------------------------------------------------------------------------
// vCard
// ---------------------------------------------------------------------------

/** Builds a vCard 3.0 string from the page's profile variables. */
function createVCard() {
  const CRLF = "\r\n";

  // Use the profile website if available, otherwise fall back to current page URL
  const websiteURL = website
    ? !/^https?:\/\//i.test(website)
      ? "http://" + website
      : website
    : window.location.href;

  // N field: Family;Given;Additional;Prefix;Suffix
  const nameParts = fullname.split(" ");
  const firstName = nameParts.slice(0, -1).join(" ");
  const lastName = nameParts.slice(-1)[0] || "";
  const nField = `${lastName};${firstName};;;`;

  // Escape special characters in text fields per RFC 2426
  const escapeText = (str = "") =>
    str
      .replace(/\\/g, "\\\\")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${nField}`,
    `FN:${escapeText(fullname)}`,
    `TITLE:${escapeText(organization.designation)}`,
    `ROLE:${escapeText(organization.designation)}`,
    `ORG:${escapeText(organization.name)}`,
    `TEL;TYPE=CELL:${contact.phone}`,
    `EMAIL;TYPE=INTERNET:${contact.email}`,
    `URL:${websiteURL}`,
  ];

  if (address) {
    const adrField =
      typeof address === "object"
        ? `;;${address.street || ""};${address.city || ""};${address.region || ""};${address.postalCode || ""};${address.country || ""}`
        : `;;${address};;;;`;
    lines.push(`ADR;TYPE=WORK:${adrField}`);
  }

  if (profilePic) {
    lines.push(`PHOTO;VALUE=uri:${profilePic}`);
  }

  if (bio) {
    lines.push(`NOTE:${escapeText(bio)}`);
  }

  for (const social of socials) {
    lines.push(
      `X-SOCIALPROFILE;TYPE=${social.name.toUpperCase()}:${social.url}`
    );
  }

  lines.push("END:VCARD");

  return lines.join(CRLF);
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

/**
 * Ensures the #website-url anchor has a valid href and shows a clean
 * human-readable label as its text content.
 */
function formatAnchorURL() {
  const anchor = document.getElementById("website-url");
  if (!anchor) return;

  let href = website || anchor.getAttribute("href") || anchor.textContent.trim();
  if (!href) return;

  if (!/^https?:\/\//i.test(href)) {
    href = "http://" + href;
  }

  anchor.setAttribute("href", href);
  anchor.textContent = getFormattedURL(href);
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

document.querySelector(".save-contact-btn").addEventListener("click", () => {
  const vcard = createVCard();
  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = window.URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: `${fullname.toLowerCase()}.vcf`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
});

window.addEventListener("DOMContentLoaded", () => {
  const parts = window.location.hostname.split(".");
  let api_base_url;

  if (parts.length === 1) {
    // localhost / bare hostname
    api_base_url = "/";
  } else if (parts.length === 2) {
    api_base_url = `http://api.${parts[1]}`;
  } else {
    // 3 or more parts — works for sub.domain.tld and sub.sub.domain.tld
    api_base_url = `https://api.${parts.slice(1).join(".")}`;
  }

  fetch(`${api_base_url}/api/profile/count-view/${profile_id}`)
    .then((res) => console.log(res))
    .catch((err) => console.error("View count failed:", err));

  formatAnchorURL();
});