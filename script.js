document.addEventListener('DOMContentLoaded', () => {
    // THAY THẾ BẰNG URL WEB APP CỦA BẠN TỪ BƯỚC 1
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw98atO4DVVxrEUvvcgNrao_j0jSqCBRk-179yAwmdm8mlJIBSdvXc08BTxJWEtZWlUdA/exec';

    const textInput = document.getElementById('text-input');
    const generateBtn = document.getElementById('generate-btn');
    const qrContainer = document.getElementById('qrcode-container');
    const statusMessage = document.getElementById('status-message');

    function handleGenerateClick() {
        const text = textInput.value.trim();

        // Xóa mã QR cũ và thông báo
        qrContainer.innerHTML = '';
        statusMessage.textContent = '';

        if (text === '') {
            statusMessage.textContent = 'Vui lòng nhập nội dung để tạo mã.';
            statusMessage.style.color = 'red';
            return; // Nếu không có nội dung, dừng lại
        }

        statusMessage.textContent = 'Đang tạo...';
        statusMessage.style.color = 'orange';

        // Tạo mã QR mới
        new QRCode(qrContainer, {
            text: text,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Ghi log ngay sau khi tạo
        logToGoogleSheet(text);
    }

    generateBtn.addEventListener('click', handleGenerateClick);

    async function logToGoogleSheet(content) {
        try {
            await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: content })
            });

            statusMessage.textContent = 'Tạo mã thành công!';
            statusMessage.style.color = 'green';

        } catch (error) {
            console.error('Error logging to Google Sheet:', error);
            statusMessage.textContent = 'Tạo mã thành công nhưng lỗi lưu log!';
            statusMessage.style.color = 'red';
        }
    }
});
