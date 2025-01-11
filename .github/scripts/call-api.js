// .github/scripts/send-api-request.js
const fetch = require("node-fetch");

const apiUrl = process.env.API_URL + "/api/template/refresh";
const apiKey = process.env.API_KEY;
const changes = JSON.parse(process.env.CHANGES);

if (!changes || changes.length === 0) {
  console.log("No changes to send.");
  process.exit(0);
}

fetch(apiUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ changes }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("API Response:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
