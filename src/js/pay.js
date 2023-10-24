const axios = require('axios');
const crypto = require('crypto');
const jsConfetti = new JSConfetti();
const payModal = new bootstrap.Modal('#pay');

console.log("Script started.");

document.getElementById('pay').addEventListener('hidden.bs.modal', (event) => {
    console.log("Payment modal hidden.");
    paymentActive = false;
});

let paymentActive = false;
let paymentRequest;

async function fetchInvoice(amount, comment) {
    console.log("Fetching invoice...");
    const response = await fetch('/invoice', {
        method: 'POST',
        body: JSON.stringify({
            amount: amount,
            comment: comment,
        }),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        console.error("Error fetching invoice:", response.error);
        throw new Error(response.error);
    }

    console.log("Invoice fetched successfully.");
    return response.json();
}

function generateRandomCode(length = 6) {
    console.log("Generating random code...");
    return [...Array(length)].map(() => (Math.random() * 36 | 0).toString(36)).join('');
}

function generateMd5(username, refId) {
    console.log("Generating MD5 hash...");
    const apiKey = "469652fc9fa1e669";
    const dataToHash = username + apiKey + refId;
    return crypto.createHash('md5').update(dataToHash).digest('hex');
}

async function sendApiRequest(customerId) {
    console.log("Sending API request...");
    const username = "081366725136";
    const refId = "order" + generateRandomCode();
    const productCode = "go1";
    const sign = generateMd5(username, refId);

    const url = "https://prepaid.iak.id/api/top-up";
    const payload = {
        username: username,
        customer_id: customerId,
        ref_id: refId,
        product_code: productCode,
        sign: sign
    };

    const response = await axios.post(url, payload, {
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (response.status === 200) {
        console.log("Response code:", response.data.response_code);
        console.log(response.data);
    } else {
        console.error("Failed to make the POST request.");
    }
}

function success() {
    console.log("Payment successful.");
    jsConfetti.addConfetti({
        emojis: ['🌈', '⚡️', '💥', '✨', '💫', '🌸'],
    });

    const customerId = document.getElementById('noPonsel').value;
    console.log("Phone number retrieved:", customerId);

    sendApiRequest(customerId);
}

console.log("Script loaded.");
