const stripe = window.Stripe('pk_test_51Nxxxxxxx...'); // Thay bằng publishable key test của bạn// --- DEMO API giỏ hàng: lấy, cập nhật, xóa, tổng giá ---
const API_BASE = '/api';

function renderCart(items) {
  const container = document.querySelector('.cart__body-list');
  if (!container) return;
  container.innerHTML = '';
  let total = 0;
  items.forEach(item => {
    total += item.quantity * item.Product.price;
    const el = document.createElement('div');
    el.className = 'row cart__body';
    el.innerHTML = `
      <div class="col-6 cart__body-name">
        <div class="cart__body-name-img">
          <img src="${item.Product.thumbnailUrl || 'images1/product/default.jpg'}">
        </div>
        <a href="#" class="cart__body-name-title">${item.Product.name}</a>
      </div>
      <div class="col-3 cart__body-quantity">
        <input type="button" value="-" class="cart__body-quantity-minus" data-id="${item.id}">
        <input type="number" step="1" min="1" max="999" value="${item.quantity}" class="cart__body-quantity-total" data-id="${item.id}">
        <input type="button" value="+" class="cart__body-quantity-plus" data-id="${item.id}">
      </div>
      <div class="col-3 cart__body-price">
        <span>${(item.Product.price * item.quantity).toLocaleString()}đ</span>
        <a href="#" class="cart__body-remove" data-id="${item.id}">Xóa</a>
      </div>
    `;
    container.appendChild(el);
  });
  document.querySelector('.cart__foot-price').innerHTML = total.toLocaleString() + 'đ <br><button class="cart__foot-price-btn">Mua hàng</button>';
}

function fetchCart() {
  const token = localStorage.getItem('jwt');
  fetch(API_BASE + '/cart', {
    headers: token ? { 'Authorization': 'Bearer ' + token } : {}
  })
    .then(res => res.json())
    .then(renderCart);
}


document.addEventListener('DOMContentLoaded', fetchCart);

// Xử lý thanh toán Stripe test
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('cart__foot-price-btn')) {
    const token = localStorage.getItem('jwt');
    fetch(API_BASE + '/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    })
      .then(res => res.json())
      .then(async data => {
        if (!data.clientSecret) return alert('Không thể tạo đơn hàng!');
        alert('Đơn hàng đã tạo, bắt đầu thanh toán thử nghiệm với Stripe.');
        // Stripe.js integration (test)
        if (window.Stripe) {
          const stripe = window.Stripe('pk_test_51Nxxxxxxx...');
          const elements = stripe.elements();
          const card = elements.create('card');
          card.mount('#card-element');
          document.getElementById('pay-btn').style.display = 'block';

          document.getElementById('pay-btn').onclick = async function() {
            const result = await stripe.confirmCardPayment(data.clientSecret, {
              payment_method: { card }
            });
            if (result.error) {
              document.getElementById('card-errors').textContent = result.error.message;
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
              alert('Thanh toán thành công!');
              fetchCart();
            }
          };
        } else {
          alert('Vui lòng tích hợp Stripe.js vào trang để hoàn tất thanh toán.');
        }
      });
  }
});

document.addEventListener('click', function(e) {
  // Xóa sản phẩm khỏi giỏ
  if (e.target.classList.contains('cart__body-remove')) {
    const id = e.target.getAttribute('data-id');
    const token = localStorage.getItem('jwt');
    fetch(API_BASE + '/cart/' + id, {
      method: 'DELETE',
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    })
      .then(res => res.json())
      .then(fetchCart);
  }
  // Tăng/giảm số lượng
  if (e.target.classList.contains('cart__body-quantity-minus') || e.target.classList.contains('cart__body-quantity-plus')) {
    const id = e.target.getAttribute('data-id');
    const input = document.querySelector('.cart__body-quantity-total[data-id="' + id + '"]');
    let qty = parseInt(input.value);
    if (e.target.classList.contains('cart__body-quantity-minus')) qty = Math.max(1, qty - 1);
    if (e.target.classList.contains('cart__body-quantity-plus')) qty = Math.min(999, qty + 1);
    input.value = qty;
    updateCartItem(id, qty);
  }
});

document.addEventListener('change', function(e) {
  if (e.target.classList.contains('cart__body-quantity-total')) {
    const id = e.target.getAttribute('data-id');
    let qty = parseInt(e.target.value);
    qty = Math.max(1, Math.min(999, qty));
    updateCartItem(id, qty);
  }
});

function updateCartItem(id, quantity) {
  const token = localStorage.getItem('jwt');
  fetch(API_BASE + '/cart/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ quantity })
  })
    .then(res => res.json())
    .then(fetchCart);
}
