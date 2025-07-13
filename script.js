document.addEventListener('DOMContentLoaded', () => {
    // THAY THẾ BẰNG URL WEB APP CỦA BẠN TỪ BƯỚC 1
    const GAS_WEB_APP_URL = 'DÁN_URL_WEB_APP_CỦA_BẠN_VÀO_ĐÂY';

    const generateBtn = document.getElementById('generate-btn');
    const textInput = document.getElementById('text-input');
    const qrContainer = document.getElementById('qrcode-container');
    const statusMessage = document.getElementById('status-message');
    let qrcode = null; // Biến để giữ đối tượng QR code

    generateBtn.addEventListener('click', () => {
        const text = textInput.value.trim();

        if (text === '') {
            alert('Vui lòng nhập nội dung!');
            return;
        }

        // Xóa mã QR cũ và thông báo
        qrContainer.innerHTML = '';
        statusMessage.textContent = 'Đang tạo mã...';

        // Tạo mã QR mới
        if (!qrcode) {
            qrcode = new QRCode(qrContainer, {
                text: text,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            qrcode.makeCode(text);
        }

        // Gửi dữ liệu đến Google Apps Script để ghi log
        logToGoogleSheet(text);
    });

    async function logToGoogleSheet(content) {
        try {
            // Sử dụng fetch để gửi yêu cầu POST
            // mode: 'no-cors' được dùng để tránh lỗi CORS khi gửi từ client,
            // vì GAS không dễ cấu hình CORS cho các yêu cầu đơn giản.
            // Chúng ta chỉ "bắn và quên" mà không cần nhận phản hồi.
            await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: content })
            });

            // Hiển thị thông báo thành công trên giao diện
            statusMessage.textContent = 'Tạo mã thành công và đã lưu log!';
            statusMessage.style.color = 'green';

        } catch (error) {
            console.error('Error logging to Google Sheet:', error);
            statusMessage.textContent = 'Tạo mã thành công nhưng lỗi lưu log!';
            statusMessage.style.color = 'red';
        }
    }
});
