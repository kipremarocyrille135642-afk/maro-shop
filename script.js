// script.js — gère produits, panier, et auth (localStorage)
// IMPORTANT: demo only — ne pas utiliser tel quel en production côté sécurité.

(() => {
  // ---------- Données produits (mock) ----------
  const PRODUCTS = [
    {
      id: "p1",
      name: "Casque Bluetooth Pro",
      price: 69.99,
      images: [
        "https://picsum.photos/600/400?1",
        "https://picsum.photos/600/400?11",
        "https://picsum.photos/600/400?12"
      ],
      short: "Casque sans fil, 30h d'autonomie, micro intégré.",
      desc: "Casque Bluetooth avec isolation sonore, confort longue durée, connexion multipoint, et son riche. Garantie 2 ans."
    },
    {
      id: "p2",
      name: "Montre Connectée Active",
      price: 119.00,
      images: [
        "https://picsum.photos/600/400?2",
        "https://picsum.photos/600/400?21",
        "https://picsum.photos/600/400?22"
      ],
      short: "Suivi santé, notifications, 7 jours d'autonomie.",
      desc: "Montre connectée avec suivi cardiaque, suivi du sommeil, entraînements et étanchéité 5ATM."
    },
    {
      id: "p3",
      name: "Clavier Mécanique Compact",
      price: 79.5,
      images: [
        "https://picsum.photos/600/400?3",
        "https://picsum.photos/600/400?31"
      ],
      short: "Clavier mécanique, switches tactiles, rétroéclairage.",
      desc: "Clavier compact 65% pour une frappe précise, keycaps PBT, construction durable."
    },
    {
      id: "p4",
      name: "Enceinte Portable Étanche",
      price: 49.0,
      images: [
        "https://picsum.photos/600/400?4",
        "https://picsum.photos/600/400?41"
      ],
      short: "IPX7, son puissant, 12h d'autonomie.",
      desc: "Petite enceinte robuste, parfaite pour la plage, la douche ou les randos."
    }
  ];

  // ---------- Helpers ----------
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const formatPrice = v => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  // ---------- Local Storage keys ----------
  const LS_CART = "demo_shop_cart_v1";
  const LS_USERS = "demo_shop_users_v1";
  const LS_SESSION = "demo_shop_session_v1";

  // ---------- Cart helpers ----------
  function loadCart() {
    try {
      const s = localStorage.getItem(LS_CART);
      return s ? JSON.parse(s) : [];
    } catch (e) { return []; }
  }
  function saveCart(cart) { localStorage.setItem(LS_CART, JSON.stringify(cart)); updateCartCount(); }
  function updateCartCount() {
    const count = loadCart().reduce((a,b) => a + (b.qty || 1), 0);
    $$('#cart-count').forEach(el => el.textContent = count);
  }

  // ---------- Auth helpers ----------
  function loadUsers() {
    try {
      const s = localStorage.getItem(LS_USERS);
      return s ? JSON.parse(s) : [];
    } catch(e){ return []; }
  }
  function saveUsers(users) { localStorage.setItem(LS_USERS, JSON.stringify(users)); }
  function saveSession(email) { localStorage.setItem(LS_SESSION, JSON.stringify({ email })); updateAuthUI(); }
  function clearSession() { localStorage.removeItem(LS_SESSION); updateAuthUI(); }
  function getSession() {
    try { return JSON.parse(localStorage.getItem(LS_SESSION)); } catch(e){ return null; }
  }
  function getUserByEmail(email) { return loadUsers().find(u => u.email === email); }

  function updateAuthUI(){
    const session = getSession();
    const authLink = $('#auth-link');
    if (authLink) {
      if (session && session.email) {
        const user = getUserByEmail(session.email);
        authLink.textContent = `Bonjour ${user?.name?.split(' ')[0] || 'Membre'}`;
        authLink.href = "#";
        authLink.onclick = (e) => {
          e.preventDefault();
          // small menu replacement: logout prompt
          if (confirm("Se déconnecter ?")) {
            clearSession();
            alert("Déconnecté.");
            location.reload();
          }
        };
      } else {
        authLink.textContent = "Se connecter";
        authLink.href = "login.html";
        authLink.onclick = null;
      }
    }
  }

  // ---------- Page renderers ----------
  function renderIndex() {
    const grid = $('#product-grid');
    if (!grid) return;
    grid.innerHTML = '';
    PRODUCTS.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card product-card';
      card.innerHTML = `
        <div class="product-thumb"><img loading="lazy" src="${p.images[0]}" alt="${p.name}"></div>
        <div class="product-info">
          <h3>${p.name}</h3>
          <p class="muted">${p.short}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
            <div class="price">${formatPrice(p.price)}</div>
            <div style="display:flex;gap:8px">
              <a class="btn outline" href="product.html?id=${p.id}">Détails</a>
              <button class="btn add-btn" data-id="${p.id}">Ajouter</button>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // add listeners
    $$('.add-btn').forEach(btn => btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      addToCart(id, 1);
      btn.textContent = "Ajouté ✓";
      setTimeout(()=> btn.textContent = "Ajouter", 900);
    }));
  }

  function renderProductDetail() {
    const container = $('#product-detail');
    if (!container) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const prod = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
    container.innerHTML = `
      <div class="gallery card">
        <div class="gallery-main"><img id="main-img" src="${prod.images[0]}" alt="${prod.name}" style="width:100%;height:100%;object-fit:cover"></div>
        <div class="gallery-thumbs">
          ${prod.images.map(src => `<img src="${src}" alt="${prod.name}">`).join('')}
        </div>
      </div>

      <div class="card">
        <h2>${prod.name}</h2>
        <p class="muted">${prod.short}</p>
        <div style="margin:10px 0" class="price">${formatPrice(prod.price)}</div>
        <p>${prod.desc}</p>

        <div class="detail-actions">
          <label>Quantité
            <input id="qty" class="qty-input" type="number" min="1" value="1" />
          </label>
          <button id="add-cart" class="btn">Ajouter au panier</button>
          <a class="btn outline" href="cart.html">Voir le panier</a>
        </div>
      </div>
    `;

    // thumb clicks
    $$('.gallery-thumbs img').forEach(img => img.addEventListener('click', e => {
      $('#main-img').src = e.currentTarget.src;
    }));

    $('#add-cart').addEventListener('click', () => {
      const q = Math.max(1, parseInt($('#qty').value || "1", 10));
      addToCart(prod.id, q);
      alert(`${q} × ${prod.name} ajouté au panier`);
    });
  }

  function renderCartPage() {
    const view = $('#cart-view');
    if (!view) return;
    const cart = loadCart();
    if (!cart.length) {
      view.innerHTML = `<div class="card"><p>Ton panier est vide. <a href="index.html">Voir nos produits</a></p></div>`;
      hideCheckout();
      return;
    }

    // build rows
    let html = `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <strong>Articles</strong><strong>Sous-total</strong></div>`;
    let total = 0;
    cart.forEach(item => {
      const prod = PRODUCTS.find(p => p.id === item.id) || { name: "Produit inconnu", price: 0, images: ["https://picsum.photos/80/60"] };
      const subtotal = prod.price * item.qty;
      total += subtotal;
      html += `
        <div class="cart-row">
          <div class="cart-thumb"><img src="${prod.images[0]}" alt="${prod.name}"></div>
          <div>
            <div style="font-weight:700">${prod.name}</div>
            <div class="muted">${formatPrice(prod.price)} × <input data-id="${item.id}" class="qty-input cart-qty" type="number" min="1" value="${item.qty}"></div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:700">${formatPrice(subtotal)}</div>
            <div style="margin-top:8px">
              <button class="btn outline remove-item" data-id="${item.id}">Supprimer</button>
            </div>
          </div>
        </div>
      `;
    });

    html += `<div style="padding-top:12px;text-align:right;font-size:18px"><strong>Total : ${formatPrice(total)}</strong></div>`;
    html += `<div style="display:flex;gap:10px;margin-top:12px"><button id="continue" class="btn outline">Continuer mes achats</button><button id="to-checkout" class="btn">Passer au paiement</button></div>`;
    html += `</div>`;
    view.innerHTML = html;

    // listeners
    $$('#continue').forEach(b => b.addEventListener('click', () => location.href = 'index.html'));
    $('#to-checkout').addEventListener('click', () => showCheckout());

    $$('.remove-item').forEach(b => b.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      removeFromCart(id);
      renderCartPage();
    }));
    $$('.cart-qty').forEach(inp => inp.addEventListener('change', e => {
      const id = e.currentTarget.dataset.id;
      const q = Math.max(1, parseInt(e.currentTarget.value || "1", 10));
      updateQty(id, q);
      renderCartPage();
    }));
  }

  function showCheckout(){
    const ch = $('#checkout');
    if(!ch) return;
    ch.classList.remove('hidden'); ch.setAttribute('aria-hidden','false');
    ch.scrollIntoView({behavior:'smooth'});
  }
  function hideCheckout(){
    const ch = $('#checkout');
    if(!ch) return;
    ch.classList.add('hidden'); ch.setAttribute('aria-hidden','true');
  }

  // ---------- Cart operations ----------
  function addToCart(id, qty=1) {
    const cart = loadCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx >= 0) cart[idx].qty = (cart[idx].qty || 1) + qty;
    else cart.push({ id, qty });
    saveCart(cart);
  }
  function updateQty(id, qty) {
    const cart = loadCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx >= 0) {
      cart[idx].qty = qty;
      saveCart(cart);
    }
  }
  function removeFromCart(id) {
    let cart = loadCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
  }
  function clearCart() { localStorage.removeItem(LS_CART); updateCartCount(); }

  // ---------- Auth operations ----------
  function handleAuthPage() {
    const loginForm = $('#login-form');
    const regForm = $('#register-form');
    const msg = $('#auth-msg');

    if (loginForm) {
      loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = $('#login-email').value.trim().toLowerCase();
        const pass = $('#login-pass').value;
        const user = getUserByEmail(email);
        if (!user || user.password !== pass) {
          msg.textContent = "Identifiants incorrects.";
          msg.style.color = "crimson";
          return;
        }
        saveSession(email);
        msg.textContent = "Connecté ✓";
        msg.style.color = "green";
        setTimeout(()=> location.href = "index.html", 900);
      });
    }

    if (regForm) {
      regForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = $('#reg-name').value.trim();
        const email = $('#reg-email').value.trim().toLowerCase();
        const pass = $('#reg-pass').value;
        if (getUserByEmail(email)) {
          msg.textContent = "Cet email est déjà utilisé.";
          msg.style.color = "crimson";
          return;
        }
        const users = loadUsers();
        users.push({ name, email, password: pass });
        saveUsers(users);
        saveSession(email);
        msg.textContent = "Compte créé et connecté ✓";
        msg.style.color = "green";
        setTimeout(()=> location.href = "index.html", 900);
      });
    }
  }

  // ---------- Checkout handling ----------
  function handleCheckout() {
    const form = $('#checkout-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const cart = loadCart();
      if (!cart.length) { alert("Panier vide."); return; }
      // simulate payment
      clearCart();
      hideCheckout();
      alert("Paiement simulé — Merci pour votre commande !");
      location.href = "index.html";
    });
  }

  // ---------- Common init ----------
  function commonInit() {
    // set year
    $$('#year').forEach(el => el.textContent = new Date().getFullYear());

    // update cart count
    updateCartCount();

    // auth UI
    updateAuthUI();

    // attach cart link fallback
    $$('#cart-link').forEach(el => el.setAttribute('href', 'cart.html'));
  }

  // ---------- Router ----------
  function init() {
    commonInit();
    const page = document.body.dataset.page;
    if (page === 'index') {
      renderIndex();
    } else if (page === 'product') {
      renderProductDetail();
    } else if (page === 'cart') {
      renderCartPage();
      handleCheckout();
    } else if (page === 'auth') {
      handleAuthPage();
    }

    // global: allow adding product with data attribute on any page
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add-to-cart]');
      if (btn) {
        const id = btn.datasetAddToCart || btn.dataset.addToCart;
        addToCart(id, 1);
        updateCartCount();
      }
    });

    // small performance: update cart count on storage events (tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === LS_CART) updateCartCount();
    });
  }

  // run init on DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

