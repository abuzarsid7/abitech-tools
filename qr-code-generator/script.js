const qrInput = document.getElementById('qr-input');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const qrResult = document.getElementById('qr-result');
const qrCodeContainer = document.getElementById('qr-code');

let qrCode = null;

generateBtn.addEventListener('click', () => {
    const text = qrInput.value.trim();
    
    if (!text) {
        alert('Please enter text or URL');
        return;
    }
    
    // Clear previous QR code
    qrCodeContainer.innerHTML = '';
    qrCode = null;
    
    // Generate new QR code
    qrCode = new QRCode(qrCodeContainer, {
        text: text,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Show result section
    qrResult.classList.remove('hidden');
});

downloadBtn.addEventListener('click', () => {
    const canvas = qrCodeContainer.querySelector('canvas');
    if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = url;
        link.click();
    }
});

// Allow Enter key to generate QR code
qrInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateBtn.click();
    }
});
