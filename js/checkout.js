// js/checkout.js - Phiên bản Final

document.addEventListener('DOMContentLoaded', () => {
    // ===============================================
    // PHẦN 1: KHAI BÁO CÁC BIẾN DOM
    // ===============================================
    // Các phần hiển thị đơn hàng
    const summaryItemsContainer = document.getElementById('summary-items');
    const summaryTotalPriceEl = document.getElementById('summary-total-price');
    const checkoutForm = document.getElementById('checkout-form');

    // Các phần hiển thị thông tin ngân hàng
    const bankInfoBox = document.getElementById('bank-transfer-info');
    const transferAmountEl = document.getElementById('transfer-amount');     // Số tiền màu xanh
    const instructionAmountEl = document.getElementById('instruction-amount'); // Số tiền trong hướng dẫn
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const btnCopy = document.getElementById('btn-copy-acc');

    // Lấy giỏ hàng từ LocalStorage
    const cart = JSON.parse(localStorage.getItem('vpcomputer_cart')) || [];
    let subtotal = 0;

    // Kiểm tra và xử lý lỗi nếu thiếu element quan trọng
    if (!summaryItemsContainer || !summaryTotalPriceEl || !checkoutForm) {
        console.error("Thiếu các thành phần HTML chính cho trang checkout.");
        return;
    }

    // ===============================================
    // PHẦN 2: CÁC HÀM CHỨC NĂNG
    // ===============================================

    // --- Hàm render tóm tắt đơn hàng & Cập nhật giá tiền ---
    function renderOrderSummary() {
        if (cart.length > 0) {
            summaryItemsContainer.innerHTML = ''; // Xóa nội dung cũ (nếu có)
            subtotal = 0; // Reset tổng tiền

            cart.forEach(item => {
                const itemSubtotal = item.price * item.quantity;
                const itemHTML = `
                    <div class="summary-item">
                        <div class="item-thumbnail">
                            <img src="${item.image}" alt="${item.name}">
                            <span class="item-quantity">${item.quantity}</span>
                        </div>
                        <div class="item-details">
                            <span class="item-name">${item.name}</span>
                            <span class="item-unit-price">${item.quantity} x ${item.price.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <div class="item-subtotal">${itemSubtotal.toLocaleString('vi-VN')}₫</div>
                    </div>
                `;
                summaryItemsContainer.innerHTML += itemHTML;
                subtotal += itemSubtotal;
            });

            // --- CẬP NHẬT TỔNG TIỀN Ở CÁC VỊ TRÍ ---
            const formattedTotal = `${subtotal.toLocaleString('vi-VN')}₫`;
            
            // 1. Cập nhật ở cột bên phải (Tổng cộng)
            summaryTotalPriceEl.textContent = formattedTotal;

            // 2. Cập nhật ở phần Chuyển khoản (QUAN TRỌNG)
            if (transferAmountEl) transferAmountEl.textContent = formattedTotal;
            if (instructionAmountEl) instructionAmountEl.textContent = formattedTotal;

        } else {
            summaryItemsContainer.innerHTML = '<p class="empty-summary">Giỏ hàng của bạn đang trống.</p>';
            if(document.querySelector('.btn-place-order')) {
                document.querySelector('.btn-place-order').disabled = true;
            }
        }
    }

    // --- Hàm xử lý ẩn/hiện khung chuyển khoản ---
    function handlePaymentChange() {
        // Tìm radio đang được check
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        if (selectedPayment && selectedPayment.value === 'bank') {
            if (bankInfoBox) bankInfoBox.style.display = 'block';
        } else {
            if (bankInfoBox) bankInfoBox.style.display = 'none';
        }
    }

    // --- Hàm xử lý nút Copy số tài khoản ---
    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            const accNum = document.getElementById('bank-account-number').innerText;
            navigator.clipboard.writeText(accNum).then(() => {
                const originalText = btnCopy.innerHTML;
                btnCopy.innerHTML = '<i class="fas fa-check"></i> Đã chép';
                btnCopy.style.backgroundColor = '#28a745';
                setTimeout(() => {
                    btnCopy.innerHTML = originalText;
                    btnCopy.style.backgroundColor = ''; 
                }, 2000);
            }).catch(err => console.error('Lỗi copy:', err));
        });
    }

    // --- Hàm tạo hóa đơn PDF (Giữ nguyên logic cũ) ---
    function generateInvoice(customerData, cartData, total) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'pt' });
        const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 40;
        let yPosition = 60;

        // Header
        doc.setFontSize(20); doc.setFont('helvetica', 'bold');
        doc.text(removeAccents("HOA DON BAN HANG"), pageWidth / 2, yPosition, { align: 'center', charSpace: 2 });
        yPosition += 20;
        doc.setFontSize(14); doc.setFont('helvetica', 'normal');
        doc.text("VP Computer", pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;

        // Ngày giờ
        const now = new Date();
        const fullDateTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
        doc.setFontSize(10);
        doc.text(removeAccents(`Ma don hang: VPC-${Math.floor(Date.now() / 1000)}`), margin, yPosition);
        doc.text(removeAccents(`Ngay: ${fullDateTime}`), pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 15; doc.line(margin, yPosition, pageWidth - margin, yPosition); yPosition += 25;

        // Khách hàng
        doc.setFontSize(12); doc.setFont('helvetica', 'bold');
        doc.text(removeAccents("Thong tin khach hang:"), margin, yPosition); yPosition += 20;
        doc.setFont('helvetica', 'normal');
        doc.text(removeAccents(`Ten: ${customerData.fullname}`), margin + 10, yPosition); yPosition += 18;
        doc.text(`Email: ${customerData.email}`, margin + 10, yPosition); yPosition += 18;
        doc.text(removeAccents(`SDT: ${customerData.phone}`), margin + 10, yPosition); yPosition += 18;
        doc.text(removeAccents(`Dia chi: ${customerData.address}`), margin + 10, yPosition); yPosition += 25;

        // Bảng sản phẩm
        doc.setFont('helvetica', 'bold');
        doc.text("STT", margin, yPosition);
        doc.text(removeAccents("Ten san pham"), margin + 40, yPosition);
        doc.text(removeAccents("Thanh tien"), pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 15; doc.line(margin, yPosition, pageWidth - margin, yPosition); yPosition += 20;
        
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        cartData.forEach((item, index) => {
            const itemText = removeAccents(`${item.quantity} x ${item.name}`);
            const itemLines = doc.splitTextToSize(itemText, 300);
            doc.text(`${index + 1}.`, margin, yPosition);
            doc.text(itemLines, margin + 40, yPosition);
            const itemSub = (item.quantity * item.price).toLocaleString('vi-VN') + 'd';
            doc.text(itemSub, pageWidth - margin, yPosition, { align: 'right' });
            yPosition += (itemLines.length * 12) + 10;
        });

        // Tổng cộng
        yPosition += 15; doc.line(pageWidth / 2, yPosition, pageWidth - margin, yPosition); yPosition += 20;
        doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.text(removeAccents("Tong Cong:"), pageWidth - margin - 100, yPosition, { align: 'right' });
        doc.text(`${total.toLocaleString('vi-VN')}d`, pageWidth - margin, yPosition, { align: 'right' });

        // Save
        const fileName = `HoaDon_VPComputer-${now.getDate()}${now.getMonth()+1}${now.getFullYear()}.pdf`;
        doc.save(fileName);
    }

    // ===============================================
    // PHẦN 3: GẮN SỰ KIỆN VÀ KHỞI TẠO
    // ===============================================

    // 1. Gắn sự kiện chuyển đổi radio button (COD / Banking)
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', handlePaymentChange);
    });

    // 2. Gắn sự kiện Submit Form
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const customerData = {
            fullname: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
        };
        generateInvoice(customerData, cart, subtotal);
        localStorage.removeItem('vpcomputer_cart');
        alert("Đặt hàng thành công! Hóa đơn đang được tải xuống.");
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    });

    // 3. Khởi tạo
    renderOrderSummary(); // Tính tiền và điền vào các ô
    handlePaymentChange(); // Kiểm tra xem có cần hiện bank info không
});
