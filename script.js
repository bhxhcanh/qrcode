document.addEventListener('DOMContentLoaded', () => {
    // THAY THẾ BẰNG URL WEB APP CỦA BẠN TỪ BƯỚC 1
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw98atO4DVVxrEUvvcgNrao_j0jSqCBRk-179yAwmdm8mlJIBSdvXc08BTxJWEtZWlUdA/exec';

    const textInput = document.getElementById('text-input');
    const qrContainer = document.getElementById('qrcode-container');
    const statusMessage = document.getElementById('status-message');
    let logDebounceTimer;

    function handleInputChange() {
        const text = textInput.value.trim();

        // Xóa mã QR cũ và thông báo
        qrContainer.innerHTML = '';
        statusMessage.textContent = '';

        if (text === '') {
            return; // Nếu không có nội dung, dừng lại
        }

        // Tạo mã QR mới ngay lập tức
        new QRCode(qrContainer, {
            text: text,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Sử dụng debounce để ghi log sau khi người dùng ngừng nhập
        clearTimeout(logDebounceTimer);
        
        statusMessage.textContent = 'Đang chờ bạn nhập xong để lưu...';
        statusMessage.style.color = '#666';

        logDebounceTimer = setTimeout(() => {
            statusMessage.textContent = 'Đang lưu log...';
            statusMessage.style.color = 'orange';
            logToGoogleSheet(text);
        }, 5000); // Đợi 5 giây sau lần nhập cuối cùng
    }

    textInput.addEventListener('input', handleInputChange);

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

            statusMessage.textContent = 'Tạo mã thành công và đã lưu log!';
            statusMessage.style.color = 'green';

        } catch (error) {
            console.error('Error logging to Google Sheet:', error);
            statusMessage.textContent = 'Tạo mã thành công nhưng lỗi lưu log!';
            statusMessage.style.color = 'red';
        }
    }
});
