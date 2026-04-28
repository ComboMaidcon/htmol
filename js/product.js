// js/product.js — Kiến trúc MVC + Document Fragment
// Nhóm 7 — Phiên bản tái cấu trúc

// ================================================================
//  DOM ELEMENTS (dùng chung cho cả 3 tầng)
// ================================================================
const productGrid     = document.getElementById('product-grid-container');
const categoryFilter  = document.getElementById('category-filter');
const priceFilter     = document.getElementById('price-filter');
const brandFilter     = document.getElementById('brand-filter');
const sortSelect      = document.getElementById('sort');
const toggleFilterBtn = document.getElementById('btn-toggle-filter');
const filterSidebar   = document.getElementById('filter-sidebar');
const closeFilterBtn  = document.getElementById('btn-close-filter');

// ================================================================
//  TẦNG MODEL — nguồn sự thật duy nhất, không biết gì về UI
// ================================================================
const ProductModel = {
    products: [],

    setProducts(data) {
        this.products = data;
    },

    getProducts() {
        return this.products;
    },

    shuffleArray(array) {
        const arr = [...array]; // tránh mutate mảng gốc
        let cur = arr.length, rnd;
        while (cur !== 0) {
            rnd = Math.floor(Math.random() * cur--);
            [arr[cur], arr[rnd]] = [arr[rnd], arr[cur]];
        }
        return arr;
    }
};

// ================================================================
//  TẦNG VIEW — chỉ nhận data và vẽ UI, không tính toán nghiệp vụ
// ================================================================
const ProductView = {

    renderProducts(productsToRender) {
        productGrid.innerHTML = '';

        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p class="no-products">Không tìm thấy sản phẩm phù hợp.</p>';
            return;
        }

        // Dùng DocumentFragment: gom toàn bộ thẻ vào bộ nhớ trước
        // → chỉ append vào DOM thật 1 lần duy nhất, tránh Reflow liên tiếp
        const fragment = document.createDocumentFragment();

        productsToRender.forEach(product => {
            const card = document.createElement('div');
            card.className  = 'product-card';
            card.dataset.id = product.id;

            const isAvailable = product.stockStatus === 'Còn hàng';
            const salePrice   = calculateSalePrice(product);

            let priceHTML = `<p class="product-price"><span class="price">${salePrice.toLocaleString('vi-VN')}₫</span></p>`;

            if (salePrice < product.price) {
                priceHTML = `<p class="product-price sale"><span class="price">${salePrice.toLocaleString('vi-VN')}₫</span><del style="color:black; font-size:14px">${product.price.toLocaleString('vi-VN')}₫</del></p>`;
            }

            card.innerHTML = `<a href="product-detail.html?id=${product.id}" class="product-link"><div class="product-image"><img src="${product.image}" alt="${product.name}"></div><div class="product-info"><h3 class="product-name">${product.name}</h3>${priceHTML}</div></a><div class="product-actions"><button class="btn btn-secondary" ${isAvailable ? '' : 'disabled'}>${isAvailable ? 'Thêm vào giỏ' : product.stockStatus}</button></div>`;

            fragment.appendChild(card); // ghi vào RAM, chưa động vào DOM thật
        });

        productGrid.appendChild(fragment); // append vào DOM thật: 1 lần duy nhất
    },

    renderBrandFilter(brands) {
        brands.sort().forEach(brand => {
            const li = document.createElement('li');
            li.innerHTML = `<label><input type="checkbox" name="brand" value="${brand.toLowerCase()}"> ${brand}</label>`;
            brandFilter.appendChild(li);
        });
    }
};

// ================================================================
//  TẦNG CONTROLLER — nhạc trưởng: bắt sự kiện, điều phối M và V
// ================================================================
const ProductController = {

    init() {
        if (!productGrid || !categoryFilter || !priceFilter || !brandFilter || !sortSelect) {
            console.error('Thiếu các thành phần HTML cần thiết cho trang sản phẩm.');
            return;
        }
        this.populateBrands();
        this.bindEvents();
        this.applyFilters();
        this.checkUrlForCategory();
    },

    populateBrands() {
        const brands = [...new Set(allProducts.map(p => p.brand))];
        ProductView.renderBrandFilter(brands);
    },

    applyFilters() {
        // 1) Đọc trạng thái bộ lọc
        const selectedCategory   = categoryFilter.querySelector('a.active').dataset.category;
        const selectedPriceValue = document.querySelector('input[name="price"]:checked').value;
        const selectedBrands     = [...document.querySelectorAll('input[name="brand"]:checked')].map(cb => cb.value);

        // 2) Lọc từ nguồn dữ liệu gốc
        let filtered = allProducts;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }
        if (selectedPriceValue !== 'all') {
            const [minPrice, maxPrice] = selectedPriceValue.split('-').map(parseFloat);
            filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);
        }
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(p => selectedBrands.includes(p.brand.toLowerCase()));
        }

        // 3) Sắp xếp
        const sortBy = sortSelect.value;
        if (sortBy === 'default') {
            filtered = ProductModel.shuffleArray(filtered);
        } else if (sortBy === 'price-asc') {
            filtered = [...filtered].sort((a, b) => calculateSalePrice(a) - calculateSalePrice(b));
        } else if (sortBy === 'price-desc') {
            filtered = [...filtered].sort((a, b) => calculateSalePrice(b) - calculateSalePrice(a));
        }

        // 4) Lưu vào Model rồi ra lệnh View render
        ProductModel.setProducts(filtered);
        ProductView.renderProducts(ProductModel.getProducts());
    },

    checkUrlForCategory() {
        const urlParams       = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');
        if (categoryFromUrl) {
            const targetLink = categoryFilter.querySelector(`a[data-category="${categoryFromUrl}"]`);
            if (targetLink) {
                categoryFilter.querySelector('a.active').classList.remove('active');
                targetLink.classList.add('active');
                this.applyFilters();
            }
        }
    },

    bindEvents() {
        // Bộ lọc danh mục
        categoryFilter.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                categoryFilter.querySelector('a.active').classList.remove('active');
                e.target.classList.add('active');
                this.applyFilters();
            }
        });

        // Sidebar filter — mở / đóng, không trùng lặp
        if (toggleFilterBtn && filterSidebar) {
            toggleFilterBtn.addEventListener('click', () => {
                filterSidebar.classList.add('active');
            });
        }
        if (closeFilterBtn && filterSidebar) {
            closeFilterBtn.addEventListener('click', () => {
                filterSidebar.classList.remove('active');
            });
        }

        // Bộ lọc giá, thương hiệu, sắp xếp
        priceFilter.addEventListener('change', () => this.applyFilters());
        brandFilter.addEventListener('change', () => this.applyFilters());
        sortSelect.addEventListener('change',  () => this.applyFilters());
    }
};

// ================================================================
//  KHỞI ĐỘNG ỨNG DỤNG
// ================================================================
document.addEventListener('productsLoaded', () => {
    ProductController.init();
});
