// Initialize Lucide icons
lucide.createIcons();

// function to get formatted url
function getFormattedURL(inputUrl) {
  try {
    // Ensure the URL has a protocol; required for parsing
    if (!/^https?:\/\//i.test(inputUrl)) {
      inputUrl = "http://" + inputUrl;
    }

    const url = new URL(inputUrl);

    // Split hostname into parts
    const parts = url.hostname.split(".");
    let domain = "";
    let subdomain = "";

    if (parts.length >= 3) {
      subdomain = parts.slice(0, parts.length - 2).join(".");
      domain = parts.slice(-2).join(".");
    } else {
      domain = url.hostname;
    }

    const readable = `${subdomain ? subdomain + "." : ""}${domain}${
      url.pathname !== "/" ? url.pathname : ""
    }`;
    return readable;
  } catch (error) {
    return "Invalid URL";
  }
}

// Function to detect mobile OS
function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS";
  }

  return "unknown";
}

// Function to create vCard data
function createVCard() {
  const os = getMobileOperatingSystem();
  let vCard = `BEGIN:VCARD
VERSION:3.0
N:${fullname}
FN:${fullname}
TITLE:${organization.designation}
ROLE:${organization.designation}`;
  //   if (os === "Android") {
  //     vCard += `
  // TITLE:${organization.designation}
  // ROLE:${organization.designation}
  // `;
  //   } else if (os === "iOS") {
  //     vCard += `
  // TITLE:${organization.designation}
  // ROLE:${organization.designation}
  // `;
  //   }
  vCard += `
ORG:${organization.name}
TEL;TYPE=CELL:${contact.phone}
EMAIL;TYPE=INTERNET:${contact.email}
URL:${window.location.href}
ADR;TYPE=WORK:${address}`;

  if (profilePic) {
    vCard += `
PHOTO;VALUE#URI;TYPE#JPG:${profilePic}`;
  }
  if (bio) {
    vCard += `
NOTE:${bio}`;
  }

  for (let social of socials) {
    vCard += `
X-SOCIALPROFILE;TYPE=${social.name.toUpperCase()}:${social.url}`;
  }
  vCard += `
END:VCARD`;

  return vCard;
}

function formatAnchorURL() {
  const anchor = document.getElementById("website-url");
  if (!anchor) return;

  // Fix href to include protocol if missing
  let href = anchor.getAttribute("href") || "";
  if (!/^https?:\/\//i.test(href)) {
    href = "http://" + href;
    anchor.setAttribute("href", href);
  }

  // Get text content and format it using your function
  const text = anchor.textContent.trim();
  const formatted = getFormattedURL(text);

  // Update anchor text with formatted URL
  anchor.textContent = formatted;
}

// Add click handler for save contact button
document.querySelector(".save-contact-btn").addEventListener("click", () => {
  const vcard = createVCard();
  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fullname.toLowerCase() + ".vcf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  // }
});

window.addEventListener("DOMContentLoaded", () => {
  const hostname = window.location.hostname;

  const parts = hostname.split(".");
  var api_base_url = "/";
  if (parts.length === 2) {
    const domain = parts[1];
    api_base_url = `http://api.${domain}`;
  } else if (parts.length === 3) {
    const domain = parts.slice(1).join(".");
    api_base_url = `https://api.${domain}`;
  } else if (parts.length === 4) {
    const domain = parts.slice(1).join(".");
    api_base_url = `https://api.${domain}`;
  } else {
    console.error("Unexpected hostname format");
  }
  fetch(api_base_url + "/api/profile/count-view/" + profile_id)
    .then((res) => {
      console.log(res);
    })
    .catch((res) => {
      console.log(res);
    });
  formatAnchorURL();
});
