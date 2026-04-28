// js/header.js
import { auth } from './login.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

class HeaderComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const brandName = "VP Computer";
        const headerHTML = `
            <div class="mobile-menu-overlay" id="mobile-menu-overlay"></div>
            <header>
                <div class="container">
                    <a href="index.html" class="logo">
                        <img src="img/logo.png" alt="VP Computer Logo">
                    </a>
                    <nav class="main-nav desktop-nav">
                        <ul>
                            <li><a href="index.html">Trang Chủ</a></li>
                            <li><a href="product.html">Sản Phẩm</a></li>
                            <li><a href="builder.html">Xây Dựng Cấu Hình</a></li>
                            <li><a href="promotion.html">Khuyến Mãi</a></li>
                            <li><a href="contact.html">Liên Hệ</a></li>
                        </ul>
                    </nav>
                    <div class="header-actions">
                        <form action="search.html" method="GET" class="search-bar" id="search-form">
                            <input type="text" name="q" placeholder="Tìm kiếm sản phẩm..." required>
                            <button type="submit"><i class="fas fa-search"></i></button>
                        </form>
                        <a href="#" class="action-icon cart-icon">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count">0</span>
                        </a>
                        <div class="user-auth"></div>
                        <button class="hamburger-btn" id="hamburger-btn">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
                <nav class="mobile-side-menu" id="mobile-nav">
                    <div class="mobile-nav-header">
                        <span class="menu-title">${brandName}</span>
                        <button class="close-btn" id="close-btn">×</button>
                    </div>
                    <ul>
                        <li><a href="index.html"><i class="fas fa-home"></i> Trang Chủ</a></li>
                        <li><a href="product.html"><i class="fas fa-box"></i> Sản Phẩm</a></li>
                        <li><a href="builder.html"><i class="fas fa-cogs"></i> Xây Dựng Cấu Hình</a></li>
                        <li><a href="promotion.html"><i class="fas fa-tags"></i> Khuyến Mãi</a></li>
                        <li><a href="contact.html"><i class="fas fa-envelope"></i> Liên Hệ</a></li>
                    </ul>
                    <div class="mobile-user-auth" style="padding: 20px; border-top: 1px solid var(--border-color);"></div>
                </nav>
            </header>
        `;

        const fragment = document.createRange().createContextualFragment(headerHTML);
        this.append(fragment);

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        const navLinks = this.querySelectorAll('.main-nav a, .mobile-side-menu a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop() || 'index.html';
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });

        // Logic UI
        this.setupMenuLogic();
        
        // Logic Auth 
        this.setupAuthListener();
    }

    setupMenuLogic() {
        const hamburgerBtn = this.querySelector('#hamburger-btn');
        const mobileNav = this.querySelector('#mobile-nav');
        const closeBtn = this.querySelector('#close-btn');
        const overlay = this.querySelector('#mobile-menu-overlay');

        const toggleMenu = (isOpen) => {
            mobileNav.classList.toggle('active', isOpen);
            overlay.classList.toggle('active', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        };

        hamburgerBtn.addEventListener('click', () => toggleMenu(true));
        closeBtn.addEventListener('click', () => toggleMenu(false));
        overlay.addEventListener('click', () => toggleMenu(false));
    }

    setupAuthListener() {
        const userAuthContainer = this.querySelector('.user-auth');
        const mobileUserAuth = this.querySelector('.mobile-user-auth');

        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userName = user.displayName || "Người dùng";
                const userPhoto = user.photoURL || `https://ui-avatars.com/api/?name=${userName}&background=random`;

                const htmlContent = `
                    <div class="user-logged">
                        <img src="${userPhoto}" alt="Avatar" class="user-avatar" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
                        <span class="user-name">${userName}</span>
                        <div class="user-dropdown">
                            <a href="profile.html"><i class="fas fa-user-circle"></i> Hồ sơ cá nhân</a>
                            <a href="#" class="btn-logout"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                        </div>
                    </div>
                `;

                const mobileHtmlContent = `
                    <div class="mobile-logged-info" style="display:flex; flex-direction:column; gap:10px;">
                        <a href="profile.html" style="display:flex; align-items:center; gap:10px; color:var(--text-primary);">
                            <img src="${userPhoto}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
                            <span>${userName}</span>
                        </a>
                        <a href="#" class="btn-logout" style="color:var(--accent-color); padding: 5px 0;"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                    </div>
                `;

                if (userAuthContainer) userAuthContainer.innerHTML = htmlContent;
                if (mobileUserAuth) mobileUserAuth.innerHTML = mobileHtmlContent;

                this.querySelectorAll('.btn-logout').forEach(btn => {
                    btn.onclick = (e) => {
                        e.preventDefault();
                        signOut(auth).then(() => {
                            window.location.href = "index.html";
                        }).catch(err => console.error("Lỗi đăng xuất:", err));
                    };
                });

            } else {
                const loginHTML = `<a href="login.html" class="auth-link"><i class="fas fa-user"></i> Đăng nhập / Đăng ký</a>`;
                if (userAuthContainer) userAuthContainer.innerHTML = loginHTML;
                if (mobileUserAuth) mobileUserAuth.innerHTML = loginHTML;
            }
        });
    }
}

customElements.define('header-placeholder', HeaderComponent);