// Initialize Lucide icons
lucide.createIcons();

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
  let vCard = `BEGIN:VCARD
VERSION:3.0
FN:${fullname}
TITLE:${organization.designation}
ROLE:${organization.designation}
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
});
