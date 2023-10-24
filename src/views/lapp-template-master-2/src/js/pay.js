const jsConfetti = new JSConfetti();
const payModal = new bootstrap.Modal('#pay');

document.getElementById('pay').addEventListener('hidden.bs.modal', (event) => {
    paymentActive = false;
});

let paymentActive = false;
let paymentRequest;

async function fetchInvoice(amount, comment, phoneNumber) {
    const response = await fetch('/invoice', {
        method: 'POST',
        body: JSON.stringify({
            amount: amount,
            comment: comment,
            phoneNumber: phoneNumber
        }),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error(response.error);
    }

    return response.json();
}

async function requestPayment(amount, comment, onSuccess) { 
    const phoneNumber = document.getElementById('noPonsel').value;

    if(!phoneNumber) {
        alert("Please enter a phone number.");
        return;
    }

    if(paymentActive) return;

    paymentActive = true;

    const result = await fetchInvoice(amount, comment, phoneNumber);

    paymentRequest = result.payment_request;

    document.querySelector('#pay .loading-text').textContent = "Waiting for your payment...";
    document.querySelector('#pay .qr-container').classList.remove('d-none');
    document.querySelector('#pay .qr-link').href = "lightning:" + result.payment_request;
    document.querySelector('#pay .qr').src = result.qrCode;

    if (window.webln) {
        document.querySelector('#pay .webln-button').classList.remove('d-none');
    } 

    startPollingPayment(result.payment_hash, 1000, function () {
        payModal.hide();
        paymentActive = false;

        onSuccess();
    });
}

async function startWebLNPayment() {
    try {
        await window.webln.enable();
        await window.webln.sendPayment(paymentRequest);
    }
    catch(e) {
        alert("An error happened during the payment.");
    }    
}

async function isPaid(payment_hash) {
    const response = await fetch('/invoice/' + payment_hash);
    const result = await response.json();
    return result.paid;
}

function startPollingPayment(payment_hash, timeout, onSuccess) {
    if(!paymentActive) return;

    setTimeout(async function () {
        const result = await isPaid(payment_hash);

        if (!result) {
            startPollingPayment(payment_hash, timeout, onSuccess);
        } else {
            onSuccess();
        }
    }, timeout);
}

function success() {
    jsConfetti.addConfetti({
        emojis: ['🌈', '⚡️', '💥', '✨', '💫', '🌸'],
    });
}
