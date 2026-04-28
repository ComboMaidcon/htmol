// IMPORTS 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile, 
    signOut, 
    sendPasswordResetEmail } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc,
    setDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { showToast } from './toast.js';

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyB9EPdiS8l9pufvZYrW1L-EXE3xCygPUO0",
  authDomain: "bao-film.firebaseapp.com",
  projectId: "bao-film",
  storageBucket: "bao-film.firebasestorage.app",
  messagingSenderId: "62494525428",
  appId: "1:62494525428:web:73407ff99f7b52634a9ba1",
  measurementId: "G-BQP74Z3223"
};

// INIT 
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ---  LOGIC---



// XỬ LÝ ĐĂNG NHẬP
const loginForm = document.querySelector(".form-box.login form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");


if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            showToast("Đăng nhập thành công 🎉");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        } catch (err) {
            console.error(err);
            showToast("Sai email hoặc mật khẩu ❌");
        }
    });
}

const forgotPassword = document.getElementById("forgotpassword");
if (forgotPassword) {
forgotPassword.addEventListener("click", async e => {
    e.preventDefault();

    if (!emailInput.value) {
        showToast("Nhập email trước ❌");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, emailInput.value);
        showToast("Đã gửi email khôi phục 📧");
    } catch (err) {
        console.error(err);
        showToast("Không gửi được email ❌: " + err.message);
    }
});
}

const signupForm = document.querySelector(".form-box.register form");

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const phone = document.getElementById("register-phone").value.trim();
        const password = document.getElementById("register-password").value;

        // Kiểm tra độ dài số điện thoại cơ bản
        if (phone.length < 10) {
            showToast("Số điện thoại không hợp lệ ❌");
            return;
        }

        try {
            // 1. Tạo tài khoản trên Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            //Cập nhật tên hiển thị cho User
            await updateProfile(user, { displayName: username });
            await updateProfile(userCredential.user, { 
                displayName: username,
                photoURL: "https://ui-avatars.com/api/?name=" + username // Tạo avatar mặc định theo tên
            });

            // Lưu thông tin bổ sung vào Firestore
            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,
                phoneNumber: phone,
                createdAt: new Date()
            });

            showToast("Đăng ký thành công 🎉");
            
            // Chuyển hướng sau khi đăng ký xong
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);

        } catch (err) {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                showToast("Email này đã được sử dụng ❌");
            } else if (err.code === "auth/weak-password") {
                showToast("Mật khẩu quá yếu (tối thiểu 6 ký tự) ❌");
            } else {
                showToast("Đăng ký thất bại: " + err.message);
            }
        }
    });
}

export { auth, db, storage};

document.addEventListener('DOMContentLoaded', () => {
    // ===============================================
    // PHẦN LOGIC SLIDER JAVASCRIPT THUẦN (HIỆU ỨNG FADE)
    // ===============================================
    const sliderContainer = document.querySelector('.login-slider');

    if (sliderContainer) {
        const slides = sliderContainer.querySelectorAll('.slide');
        const slideCount = slides.length;
        let currentIndex = 0;
        let autoPlayInterval;

        function goToSlide(index) {
            currentIndex = (index + slideCount) % slideCount;
            slides.forEach(slide => slide.classList.remove('active'));
            slides[currentIndex].classList.add('active');
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 3000);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        if(slideCount > 0) {
            goToSlide(0);
            startAutoPlay();
        }
    }
});