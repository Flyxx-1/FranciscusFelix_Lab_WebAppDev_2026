const products = [
    {id:1, name:"Keyboard Mekanik", category:"aksesoris", price:450000, stock:12, icon:"keyboard"},
    {id:2, name:"Mouse Wireless", category:"aksesoris", price:185000, stock:30, icon:"mouse"},
    {id:3, name:"Headset Gaming", category:"audio", price:320000, stock:8, icon:"headset"},
    {id:4, name:"Earbuds TWS", category:"audio", price:275000, stock:0, icon:"earbuds"},
    {id:5, name:"Flashdisk 64GB", category:"penyimpanan", price:95000, stock:45, icon:"flashdisk"},
    {id:6, name:"SSD Eksternal 1TB", category:"penyimpanan", price:1150000, stock:5, icon:"ssd"},
    {id:7, name:"Monitor 24 Inci", category:"display", price:1750000, stock:7, icon:"monitor"},
    {id:8, name:"Webcam Full HD", category:"display", price:310000, stock:15, icon:"webcam"},
    {id:9, name:"Mousepad XL", category:"aksesoris", price:65000, stock:50, icon:"mousepad"},
  ];

  const categoryLabels = {
    aksesoris:"Aksesoris", audio:"Audio", penyimpanan:"Penyimpanan",
    display:"Display", elektronik:"Elektronik", atk:"ATK",
    rumah:"Rumah Tangga", dapur:"Dapur"
  };

  const icons = {
    keyboard:'<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="5" y1="10" x2="19" y2="10"/><line x1="5" y1="14" x2="15" y2="14"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="10" y1="10" x2="10" y2="14"/><line x1="14" y1="10" x2="14" y2="14"/><line x1="18" y1="10" x2="18" y2="14"/>',
    mouse:'<rect x="7" y="3" width="10" height="17" rx="5"/><line x1="12" y1="3" x2="12" y2="9"/>',
    headset:'<path d="M4,14 a8,8 0 0,1 16,0"/><rect x="2" y="13" width="4" height="7" rx="1.5"/><rect x="18" y="13" width="4" height="7" rx="1.5"/>',
    earbuds:'<circle cx="7" cy="9" r="2.4"/><circle cx="17" cy="9" r="2.4"/><path d="M7,11.4 v4.5 a2,2 0 0 0 2,2"/><path d="M17,11.4 v4.5 a2,2 0 0 1 -2,2"/>',
    flashdisk:'<rect x="7" y="6" width="10" height="15" rx="2"/><rect x="10" y="2" width="4" height="5"/>',
    ssd:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="16" cy="12" r="1"/>',
    monitor:'<rect x="3" y="4" width="18" height="12" rx="1.5"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/>',
    webcam:'<circle cx="12" cy="10" r="6"/><circle cx="12" cy="10" r="2.2"/><rect x="8" y="18" width="8" height="2.5" rx="1"/>',
    mousepad:'<rect x="3" y="6" width="18" height="12" rx="4"/><circle cx="7.5" cy="10" r="1"/>',
  };

  const FREE_SHIP_THRESHOLD = 300000;
  const SHIPPING_FEE = 15000;
  const VOUCHER_CODE = "DBT25";
  const VOUCHER_DISCOUNT = 0.2;

  let cart = {}; // id -> qty
  let voucherApplied = false;

  const rupiah = n => "Rp" + Math.round(n).toLocaleString("id-ID");

  // ---------- THEME ----------
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
    themeToggle.textContent = isDark ? "🌙" : "☀️";
  });

  // ---------- CATALOG ----------
  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const sortSelect = document.getElementById("sortSelect");
  const productGrid = document.getElementById("productGrid");
  const resultCount = document.getElementById("resultCount");

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    const cat = categorySelect.value;
    let list = products.filter(p =>
      p.name.toLowerCase().includes(q) && (cat === "all" || p.category === cat)
    );
    switch (sortSelect.value) {
      case "harga-asc": list.sort((a,b)=>a.price-b.price); break;
      case "harga-desc": list.sort((a,b)=>b.price-a.price); break;
      case "nama-asc": list.sort((a,b)=>a.name.localeCompare(b.name)); break;
      case "nama-desc": list.sort((a,b)=>b.name.localeCompare(a.name)); break;
      case "stok-desc": list.sort((a,b)=>b.stock-a.stock); break;
    }
    return list;
  }

  function renderProducts() {
    const list = getFiltered();
    resultCount.textContent = `${list.length} produk ditampilkan dari total ${products.length}`;

    if (list.length === 0) {
      productGrid.innerHTML = `<div class="empty-state">Produk tidak ditemukan. Coba kata kunci atau filter lain.</div>`;
      return;
    }

    productGrid.innerHTML = list.map(p => {
      const inCart = cart[p.id] || 0;
      const isOut = p.stock === 0;
      const maxedOut = inCart >= p.stock && !isOut;
      const stockText = isOut ? "Stok habis" : `Stok tersedia: ${p.stock}`;
      return `
        <div class="card">
          <div class="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icons[p.icon]}</svg></div>
          <span class="badge">${categoryLabels[p.category]}</span>
          <h3>${p.name}</h3>
          <p class="price">${rupiah(p.price)}</p>
          <p class="stock ${isOut ? "zero" : ""}">${stockText}</p>
          <button class="add-btn" data-id="${p.id}" ${isOut || maxedOut ? "disabled" : ""}>
            ${isOut ? "Habis" : (maxedOut ? "Stok maksimal" : "Tambah")}
          </button>
        </div>`;
    }).join("");

    productGrid.querySelectorAll(".add-btn").forEach(btn => {
      btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
    });
  }

  [searchInput, categorySelect, sortSelect].forEach(el =>
    el.addEventListener("input", renderProducts)
  );

  // ---------- CART ----------
  const cartEmpty = document.getElementById("cartEmpty");
  const cartItemsEl = document.getElementById("cartItems");
  const shippingText = document.getElementById("shippingText");
  const progressFill = document.getElementById("progressFill");
  const subtotalVal = document.getElementById("subtotalVal");
  const diskonVal = document.getElementById("diskonVal");
  const ongkirVal = document.getElementById("ongkirVal");
  const totalVal = document.getElementById("totalVal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const voucherInput = document.getElementById("voucherInput");
  const voucherBtn = document.getElementById("voucherBtn");
  const voucherMsg = document.getElementById("voucherMsg");
  const orderMsg = document.getElementById("orderMsg");

  function addToCart(id) {
    const p = products.find(x => x.id === id);
    if (!p || p.stock === 0) return;
    const current = cart[id] || 0;
    if (current >= p.stock) return;
    cart[id] = current + 1;
    orderMsg.textContent = "";
    renderProducts();
    renderCart();
  }

  function changeQty(id, delta) {
    const p = products.find(x => x.id === id);
    const next = (cart[id] || 0) + delta;
    if (next <= 0) { delete cart[id]; }
    else if (next > p.stock) { cart[id] = p.stock; }
    else { cart[id] = next; }
    renderProducts();
    renderCart();
  }

  function removeItem(id) {
    delete cart[id];
    renderProducts();
    renderCart();
  }

  function getCartEntries() {
    return Object.entries(cart).map(([id, qty]) => ({
      product: products.find(p => p.id === Number(id)),
      qty
    }));
  }

  function computeTotals() {
    const entries = getCartEntries();
    const subtotal = entries.reduce((s, e) => s + e.product.price * e.qty, 0);
    const diskon = voucherApplied ? subtotal * VOUCHER_DISCOUNT : 0;
    const afterDiskon = subtotal - diskon;
    const ongkir = subtotal === 0 ? 0 : (afterDiskon >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE);
    const total = afterDiskon + ongkir;
    return { subtotal, diskon, ongkir, total, entries };
  }

  function renderCart() {
    const entries = getCartEntries();

    if (entries.length === 0) {
      cartEmpty.style.display = "block";
      cartItemsEl.innerHTML = "";
    } else {
      cartEmpty.style.display = "none";
      cartItemsEl.innerHTML = entries.map(e => `
        <div class="cart-item">
          <div class="ci-info">
            <div class="ci-name">${e.product.name}</div>
            <div class="ci-sub">${rupiah(e.product.price)} x ${e.qty} = ${rupiah(e.product.price * e.qty)}</div>
          </div>
          <div class="qty-controls">
            <button data-act="minus" data-id="${e.product.id}">−</button>
            <span>${e.qty}</span>
            <button data-act="plus" data-id="${e.product.id}">+</button>
            <button class="remove-btn" data-act="remove" data-id="${e.product.id}">Hapus</button>
          </div>
        </div>`).join("");

      cartItemsEl.querySelectorAll("button").forEach(btn => {
        const id = Number(btn.dataset.id);
        const act = btn.dataset.act;
        btn.addEventListener("click", () => {
          if (act === "plus") changeQty(id, 1);
          else if (act === "minus") changeQty(id, -1);
          else if (act === "remove") removeItem(id);
        });
      });
    }

    const { subtotal, diskon, ongkir, total } = computeTotals();

    subtotalVal.textContent = rupiah(subtotal);
    diskonVal.textContent = "-" + rupiah(diskon);
    ongkirVal.textContent = subtotal === 0 ? "Gratis" : (ongkir === 0 ? "Gratis" : rupiah(ongkir));
    totalVal.textContent = rupiah(total);

    if (subtotal === 0) {
      shippingText.textContent = `Belanja ${rupiah(FREE_SHIP_THRESHOLD)} untuk mendapat gratis ongkir.`;
      progressFill.style.width = "0%";
    } else if (subtotal - diskon >= FREE_SHIP_THRESHOLD) {
      shippingText.textContent = "Yeay! Kamu mendapat gratis ongkir.";
      progressFill.style.width = "100%";
    } else {
      const remaining = FREE_SHIP_THRESHOLD - (subtotal - diskon);
      shippingText.textContent = `Belanja ${rupiah(remaining)} lagi untuk gratis ongkir.`;
      progressFill.style.width = Math.min(100, ((subtotal - diskon) / FREE_SHIP_THRESHOLD) * 100) + "%";
    }

    checkoutBtn.disabled = entries.length === 0;
  }

  voucherBtn.addEventListener("click", () => {
    const entries = getCartEntries();
    if (entries.length === 0) {
      voucherMsg.textContent = "Tambahkan produk ke keranjang dulu.";
      voucherMsg.className = "voucher-msg error";
      return;
    }
    const code = voucherInput.value.trim().toUpperCase();
    if (voucherApplied) {
      voucherMsg.textContent = "Voucher sudah digunakan pada pesanan ini.";
      voucherMsg.className = "voucher-msg success";
      return;
    }
    if (code === VOUCHER_CODE) {
      voucherApplied = true;
      voucherMsg.textContent = "Voucher DBT25 berhasil dipakai! Diskon 20% diterapkan.";
      voucherMsg.className = "voucher-msg success";
    } else {
      voucherMsg.textContent = "Kode voucher tidak valid.";
      voucherMsg.className = "voucher-msg error";
    }
    renderCart();
  });

  // ---------- CHECKOUT MODAL ----------
  const checkoutModal = document.getElementById("checkoutModal");
  const modalBody = document.getElementById("modalBody");

  function openCheckoutForm() {
    const { subtotal, diskon, ongkir, total, entries } = computeTotals();
    modalBody.innerHTML = `
      <h3>Detail Pengiriman &amp; Pembayaran</h3>
      <p class="modal-sub">Lengkapi data berikut untuk menyelesaikan pesananmu.</p>

      <label for="ckName">Nama Penerima</label>
      <input type="text" id="ckName" placeholder="Nama lengkap">

      <label for="ckAddress">Alamat Pengiriman</label>
      <textarea id="ckAddress" rows="2" placeholder="Alamat lengkap, kota, kode pos"></textarea>

      <label for="ckPhone">Nomor Telepon</label>
      <input type="text" id="ckPhone" placeholder="08xxxxxxxxxx">

      <label>Metode Pembayaran</label>
      <div class="pay-options">
        <label><input type="radio" name="pay" value="Transfer Bank" checked> Transfer Bank</label>
        <label><input type="radio" name="pay" value="E-Wallet"> E-Wallet</label>
        <label><input type="radio" name="pay" value="Bayar di Tempat (COD)"> Bayar di Tempat (COD)</label>
      </div>

      <div class="modal-summary">
        <div class="summary-row"><span>${entries.length} barang</span><span>${rupiah(subtotal)}</span></div>
        <div class="summary-row"><span>Diskon</span><span>-${rupiah(diskon)}</span></div>
        <div class="summary-row"><span>Ongkir</span><span>${ongkir === 0 ? "Gratis" : rupiah(ongkir)}</span></div>
        <div class="summary-row total"><span>Total Bayar</span><span>${rupiah(total)}</span></div>
      </div>

      <p id="ckError" style="color:var(--danger);font-size:12px;margin:0 0 4px;"></p>
      <div class="modal-actions">
        <button class="btn-cancel" id="ckCancel">Batal</button>
        <button class="btn-confirm" id="ckConfirm">Konfirmasi Pesanan</button>
      </div>
    `;
    document.getElementById("ckCancel").addEventListener("click", closeModal);
    document.getElementById("ckConfirm").addEventListener("click", confirmOrder);
    checkoutModal.classList.remove("hidden");
  }

  function confirmOrder() {
    const name = document.getElementById("ckName").value.trim();
    const address = document.getElementById("ckAddress").value.trim();
    const phone = document.getElementById("ckPhone").value.trim();
    const err = document.getElementById("ckError");
    if (!name || !address || !phone) {
      err.textContent = "Mohon lengkapi semua data sebelum melanjutkan.";
      return;
    }

    const { total, entries } = computeTotals();
    const itemCount = entries.reduce((s, e) => s + e.qty, 0);
    const orderId = "TDBT-" + Math.floor(100000 + Math.random() * 900000);

    modalBody.innerHTML = `
      <div class="success-view">
        <div class="check-circle">✓</div>
        <h3>Pesanan Berhasil Dibuat</h3>
        <p class="order-id">${orderId}</p>
        <p>Terima kasih, ${name}. Pesanan ${itemCount} barang senilai ${rupiah(total)} sedang diproses.</p>
        <p>Pesanan akan dikirim ke: ${address}</p>
        <div class="modal-actions">
          <button class="btn-confirm" id="ckClose" style="flex:1;">Tutup</button>
        </div>
      </div>
    `;
    document.getElementById("ckClose").addEventListener("click", () => {
      closeModal();
      orderMsg.textContent = `Pesanan ${itemCount} barang senilai ${rupiah(total)} berhasil dibuat.`;
      cart = {};
      voucherApplied = false;
      voucherInput.value = "";
      voucherMsg.textContent = "";
      renderProducts();
      renderCart();
    });
  }

  function closeModal() {
    checkoutModal.classList.add("hidden");
  }

  checkoutBtn.addEventListener("click", openCheckoutForm);
  checkoutModal.addEventListener("click", (e) => {
    if (e.target === checkoutModal) closeModal();
  });

  // ---------- INIT ----------
  renderProducts();
  renderCart();
