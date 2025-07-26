window.onload = () => {
    const qrCodeEl = document.getElementById('qrcode');
    const linkButton = document.getElementById('button');

    fetch(`/api/sign-in`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch API data');
            }
        })
        .then(data => {
            
            const sessionId = data.sessionId;

            
            generateQrCode(qrCodeEl, data);
            qrCodeEl.style.display = 'block';

            
            const encodedRequest = btoa(JSON.stringify(data));
            linkButton.href = `https://wallet.privado.id/#i_m=${encodedRequest}`;
            linkButton.style.display = 'block';

            
            pollVerification(sessionId);
        })
        .catch(error => console.error('Error fetching data from API:', error));
};

function pollVerification(sessionId) {
    fetch(`/api/status?sessionId=${sessionId}`)
        .then(res => res.json())
        .then(data => {
            if (data.verified) {
                window.location.href = `/verified.html?name=${encodeURIComponent(data.name)}&programName=${encodeURIComponent(data.programName)}`;
            } else {
                setTimeout(() => pollVerification(sessionId), 2000);
            }
        });
}

function generateQrCode(element, data) {
    new QRCode(element, {
        text: JSON.stringify(data),
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.Q
    });
}