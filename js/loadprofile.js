// Import các thư viện và biến cần thiết
// Lưu ý: Đảm bảo đường dẫn './login.js' và './toast.js' là chính xác trong dự án của bạn
import { auth, db } from './login.js';
import { showToast } from './toast.js'; // Nếu bạn chưa có file này, hãy xem code bên dưới
import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. KHAI BÁO CÁC DOM ELEMENTS ---
    
    // Trang Profile
    const profileForm = document.getElementById('profile-form');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    const profilePhotoUrl = document.getElementById('profile-photo-url');
    const profileImg = document.getElementById('profile-img');

    // Các trang khác (Để auto-fill)
    const contactForm = document.getElementById('contact_form');         // Trang Liên hệ
    const applyForm = document.getElementById('recruitment-form');       // Trang Tuyển dụng
    const checkoutForm = document.getElementById('checkout-form');       // Trang Thanh toán

    // --- 2. HÀM XỬ LÝ HIỂN THỊ DỮ LIỆU USER ---
    
    // Hàm này sẽ chạy mỗi khi trạng thái đăng nhập thay đổi (F5, login, logout)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // A. LẤY DỮ LIỆU CƠ BẢN TỪ AUTH
            const email = user.email || "";
            const displayName = user.displayName || "";
            const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${displayName || email}&background=random`;
            
            // B. LẤY DỮ LIỆU MỞ RỘNG TỪ FIRESTORE (Số điện thoại)
            let phoneNumber = "";
            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    phoneNumber = data.phoneNumber || "";
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu Firestore:", error);
            }

            // C. ĐIỀN DỮ LIỆU VÀO TRANG PROFILE (Nếu đang ở trang Profile)
            if (profileForm) {
                if (profileEmail) profileEmail.value = email;
                if (profileName) profileName.value = displayName;
                if (profilePhone) profilePhone.value = phoneNumber;
                if (profilePhotoUrl) profilePhotoUrl.value = user.photoURL || "";
                if (profileImg) profileImg.src = photoURL;
            }

            // D. AUTO-FILL CHO TRANG LIÊN HỆ
            if (contactForm) {
                const cName = document.getElementById('name');
                const cEmail = document.getElementById('email');
                if (cName) cName.value = displayName;
                if (cEmail) cEmail.value = email;
            }

            // E. AUTO-FILL CHO TRANG TUYỂN DỤNG
            if (applyForm) {
                const aName = document.getElementById('app-name');
                const aEmail = document.getElementById('app-email');
                const aPhone = document.getElementById('app-phone');
                
                if (aName) aName.value = displayName;
                if (aEmail) aEmail.value = email;
                if (aPhone) aPhone.value = phoneNumber;
            }

            // F. AUTO-FILL CHO TRANG THANH TOÁN
            if (checkoutForm) {
                const ckName = document.getElementById('fullname');
                const ckEmail = document.getElementById('email');
                const ckPhone = document.getElementById('phone');

                if (ckName) ckName.value = displayName;
                if (ckEmail) ckEmail.value = email;
                if (ckPhone) ckPhone.value = phoneNumber;
            }

        } else {
            // NGƯỜI DÙNG CHƯA ĐĂNG NHẬP
            // Nếu đang ở trang Profile thì đá về login
            if (profileForm) {
                window.location.href = "login.html";
            }
            // Ở các trang khác thì không làm gì (để form trống)
        }
    });

    // --- 3. XỬ LÝ CẬP NHẬT THÔNG TIN (CHỈ Ở TRANG PROFILE) ---
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = auth.currentUser;
            if (!user) return;

            // Lấy giá trị từ form
            const newName = profileName.value.trim();
            const newPhone = profilePhone.value.trim();
            const newPhoto = profilePhotoUrl.value.trim();

            try {
                // 1. Cập nhật Firebase Auth (Display Name & Photo URL)
                await updateProfile(user, {
                    displayName: newName,
                    photoURL: newPhoto
                });

                // 2. Cập nhật Firestore (Username & Phone Number)
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    username: newName,
                    phoneNumber: newPhone,
                    photoURL: newPhoto,
                    updatedAt: new Date()
                }, { merge: true }); // merge: true để không ghi đè mất dữ liệu cũ khác

                // 3. Cập nhật UI ngay lập tức
                if (newPhoto && profileImg) profileImg.src = newPhoto;

                // 4. Thông báo thành công
                if (typeof showToast === 'function') {
                    showToast("Cập nhật hồ sơ thành công! 🎉", "success");
                } else {
                    alert("Cập nhật hồ sơ thành công!");
                }
                
                // Reload nhẹ để header cập nhật hiển thị (nếu cần)
                // setTimeout(() => window.location.reload(), 1000); 

            } catch (error) {
                console.error("Lỗi cập nhật:", error);
                if (typeof showToast === 'function') {
                    showToast("Cập nhật thất bại: " + error.message, "error");
                } else {
                    alert("Lỗi: " + error.message);
                }
            }
        });
    }
});
