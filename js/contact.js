// js/contact.js

document.addEventListener('DOMContentLoaded', () => {
    // Tìm form trong trang liên hệ
    const contactForm = document.querySelector('.contact-form form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Ngăn không cho form gửi đi và load lại trang
            e.preventDefault();

            // Lấy giá trị các ô input (nếu muốn kiểm tra rỗng)
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            // Kiểm tra đơn giản: Nếu đã nhập đủ thông tin
            if (name && email && message) {
                // Hiển thị thông báo theo yêu cầu
                alert("Gửi tin nhắn thành công, vui lòng kiểm tra email của bạn trong 24h tiếp theo");
                
                // Xóa trắng các ô nhập liệu sau khi gửi thành công
                contactForm.reset();
            } else {
                alert("Vui lòng điền đầy đủ thông tin trước khi gửi.");
            }
        });
    }
});