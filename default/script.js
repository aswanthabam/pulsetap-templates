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
ORG:${organization.name}
TEL;TYPE=CELL:${contact.phone}
EMAIL;TYPE=INTERNET:${contact.email}`;

  if (profilePic) {
    vCard += `
PHOTO;VALUE=URI:${profilePic}`;
  }
  if (bio) {
    vCard += `
NOTE:${bio}`;
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
