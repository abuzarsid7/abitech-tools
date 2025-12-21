// Get DOM elements
const markdownInput = document.getElementById('markdown-input');
const preview = document.getElementById('preview');
const convertBtn = document.getElementById('convert-btn');
const clearBtn = document.getElementById('clear-btn');

// Configure marked options for better formatting
if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false,
        sanitize: false
    });
}

// Update preview
function updatePreview() {
    const text = markdownInput.value;
    
    // Update preview
    if (text.trim()) {
        preview.innerHTML = marked.parse(text);
        preview.classList.remove('text-gray-400', 'italic');
    } else {
        preview.innerHTML = '<p class="text-gray-400 italic">Preview will appear here...</p>';
    }
}

// Convert to PDF
async function convertToPDF() {
    const text = markdownInput.value;
    
    if (!text.trim()) {
        alert('Please enter some Markdown content first!');
        return;
    }
    
    try {
        // Disable button during conversion
        convertBtn.disabled = true;
        convertBtn.textContent = '⏳ Converting...';
        
        // Create a completely isolated iframe for rendering
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
            position: fixed;
            left: -9999px;
            top: -9999px;
            width: 800px;
            height: 1000px;
            border: none;
            visibility: hidden;
            opacity: 0;
            pointer-events: none;
        `;
        
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Write content to iframe
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        font-size: 12pt;
                        line-height: 1.6;
                        color: #333;
                        background: white;
                        padding: 20px;
                        max-width: 800px;
                    }
                    h1 { font-size: 24pt; margin: 20px 0 10px 0; color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
                    h2 { font-size: 20pt; margin: 18px 0 8px 0; color: #2d3748; border-bottom: 1px solid #cbd5e0; padding-bottom: 6px; }
                    h3 { font-size: 16pt; margin: 14px 0 6px 0; color: #374151; }
                    h4 { font-size: 14pt; margin: 12px 0 4px 0; color: #4b5563; }
                    h5 { font-size: 12pt; margin: 10px 0 4px 0; color: #6b7280; }
                    h6 { font-size: 11pt; margin: 8px 0 4px 0; color: #9ca3af; }
                    p { margin: 8px 0; }
                    code { 
                        background: #f3f4f6; 
                        padding: 2px 6px; 
                        border-radius: 3px; 
                        font-family: 'Courier New', Consolas, Monaco, monospace;
                        font-size: 10pt;
                        color: #d63384;
                    }
                    pre { 
                        background: #1f2937; 
                        color: #f9fafb; 
                        padding: 12px; 
                        border-radius: 6px; 
                        overflow-x: auto;
                        margin: 12px 0;
                    }
                    pre code {
                        background: transparent;
                        color: inherit;
                        padding: 0;
                    }
                    blockquote { 
                        border-left: 4px solid #3b82f6; 
                        padding-left: 16px; 
                        margin: 12px 0;
                        color: #4b5563;
                        font-style: italic;
                    }
                    table { 
                        border-collapse: collapse; 
                        width: 100%; 
                        margin: 12px 0;
                    }
                    th, td { 
                        border: 1px solid #d1d5db; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    th { 
                        background: #f3f4f6; 
                        font-weight: 600;
                    }
                    ul, ol { 
                        margin: 8px 0; 
                        padding-left: 24px; 
                    }
                    li { 
                        margin: 4px 0; 
                    }
                    a { 
                        color: #3b82f6; 
                        text-decoration: none; 
                    }
                    img { 
                        max-width: 100%; 
                        height: auto; 
                    }
                    hr { 
                        border: none; 
                        border-top: 2px solid #e5e7eb; 
                        margin: 20px 0; 
                    }
                </style>
            </head>
            <body>${marked.parse(text)}</body>
            </html>
        `);
        iframeDoc.close();
        
        // Wait for iframe to fully load
        await new Promise(resolve => {
            if (iframe.contentWindow.document.readyState === 'complete') {
                resolve();
            } else {
                iframe.onload = resolve;
            }
        });
        
        // Small delay to ensure rendering
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use html2canvas on iframe body
        const canvas = await html2canvas(iframeDoc.body, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 800,
            windowHeight: iframeDoc.body.scrollHeight
        });
        
        // Remove iframe immediately
        document.body.removeChild(iframe);
        
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL('image/png');
        
        // A4 dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        
        // Calculate dimensions to fit
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // Add additional pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `markdown-document-${timestamp}.pdf`;
        
        // Save the PDF (triggers download)
        pdf.save(filename);
        
        // Show success message
        showNotification('✅ PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error converting to PDF:', error);
        showNotification('❌ Error generating PDF. Please try again.', 'error');
    } finally {
        // Re-enable button
        convertBtn.disabled = false;
        convertBtn.textContent = '⬇️ Download PDF';
    }
}

// Clear content
function clearContent() {
    markdownInput.value = '';
    preview.innerHTML = '<p class="text-gray-400 italic">Preview will appear here...</p>';
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-6 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 z-50 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white font-semibold`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event listeners
markdownInput.addEventListener('input', updatePreview);
convertBtn.addEventListener('click', convertToPDF);
clearBtn.addEventListener('click', clearContent);

// Initialize
updatePreview();
