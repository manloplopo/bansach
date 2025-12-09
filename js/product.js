
// --- DEMO API sản phẩm, lọc, thêm giỏ hàng ---
const API_BASE = '/api';

// Hiển thị danh sách sản phẩm (demo)
function renderProducts(products) {
    const container = document.querySelector('.product__love .row.bg-white');
    if (!container) return;
    container.innerHTML = '';
    products.forEach(p => {
        const el = document.createElement('div');
        el.className = 'product__panel-item col-lg-2 col-md-3 col-sm-6';
        el.innerHTML = `
            <div class="product__panel-img-wrap">
                <img src="${p.thumbnailUrl || 'images1/product/default.jpg'}" alt="" class="product__panel-img">
            </div>
            <h3 class="product__panel-heading">
                <a href="#" class="product__panel-link">${p.name}</a>
            </h3>
            <div class="product__panel-rate-wrap">
                <i class="fas fa-star product__panel-rate"></i>
                <i class="fas fa-star product__panel-rate"></i>
                <i class="fas fa-star product__panel-rate"></i>
                <i class="fas fa-star product__panel-rate"></i>
                <i class="fas fa-star product__panel-rate"></i>
            </div>
            <div class="product__panel-price">
                <span class="product__panel-price-current">${p.price.toLocaleString()}đ</span>
            </div>
            <button class="add-to-cart-btn" data-id="${p.id}">Thêm vào giỏ</button>
        `;
        container.appendChild(el);
    });
}

// Lấy sản phẩm từ API
function fetchProducts(filters = {}) {
    let url = API_BASE + '/products?';
    Object.keys(filters).forEach(k => url += `${k}=${encodeURIComponent(filters[k])}&`);
    fetch(url)
        .then(res => res.json())
        .then(renderProducts);
}


// Lọc sản phẩm theo danh mục/thương hiệu/giá (realtime)
const searchInput = document.querySelector('.header__search-input');
const searchSelect = document.querySelector('.header__search-select');
let searchTimeout;

function doSearchRealtime() {
    const category = searchSelect.value;
    const q = searchInput.value;
    let catSlug = '';
    if (category === '1') catSlug = 'sach-tieng-viet';
    if (category === '2') catSlug = 'sach-nuoc-ngoai';
    if (category === '3') catSlug = 'manga-comic';
    fetchProducts({ category: catSlug, q });
}

searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(doSearchRealtime, 300);
});
searchSelect.addEventListener('change', doSearchRealtime);

// Tải sản phẩm khi vào trang
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
});

// Thêm vào giỏ hàng qua API
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const productId = e.target.getAttribute('data-id');
        // Lấy JWT từ localStorage nếu có
        const token = localStorage.getItem('jwt');
        fetch(API_BASE + '/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': 'Bearer ' + token } : {})
            },
            body: JSON.stringify({ productId, quantity: 1 })
        })
        .then(res => res.json())
        .then(data => {
            alert('Đã thêm vào giỏ hàng!');
            // Cập nhật số lượng giỏ hàng
            let cartInfo = document.getElementsByClassName('header__notice')[0];
            let currentCount = Number(cartInfo.textContent);
            cartInfo.textContent = currentCount + 1;
        });
    }
});

/* let minusBtn = document.getElementsByClassName('product__main-info-cart-quantity-minus')[0];
let plusBtn = document.getElementsByClassName('product__main-info-cart-quantity-plus')[0];
var valueBtn = document.getElementsByClassName('product__main-info-cart-quantity-total')[0].value

minusBtn.onclick() = function(){

    valueBtn.textContent=  valueBtn--;
}
plusBtn.onclick() = function(){
    valueBtn.textContent=  valueBtn++;
}*/

// Phần gửi kiểm tra form 

let submitBtn = document.getElementById("formgroupcomment")
submitBtn.onsubmit= function(event){
    event.preventDefault();
    let nameIn = document.getElementById('form-name')
    let commentIn = document.getElementById('pwd')
   let contentIn=document.getElementById("formcontent")

   //kiểm tra xem có đủ 100 ký tự hay k
  
if (  $('textarea#formcontent').val().length < 100 ){
    alert("Bạn phải nhập  trên 100 ký tự");
    return;
}
else{

// kiểm tra từ cấm
let bWord= [ "xấu" , " hư " , " lỗi" ,"đểu"]
for ( i= 0 ; i < bWord.length; i++){
    if ( $('textarea#formcontent').val().toLowerCase().indexOf(bWord[i]) > -1){
        alert('Có tồn tại từ cấm')
        return;
    }
}
}

// lấy giờ
var currentdate = new Date();
var datetime = currentdate.getFullYear() + "-" + currentdate.getMonth() +'-'+ currentdate.getDate()+" " +currentdate.getHours() + ":" 
+ currentdate.getMinutes() + ":" + currentdate.getSeconds();

// thêm nội dung vào trang web 

let reviewer= document.getElementsByClassName(' item-reviewer')[0];
var ul =document.createElement('ul');
ul.innerHTML =`
<ul class = item-reviewer>
<div class="comment-item-user">
    <img src="images/img/1.png" alt="" class="comment-item-user-img">
    
    <li><b> ${nameIn.value} </b></li> 
 </div>

<br>
<li>${datetime}</li>
<li>
   <h4> ${contentIn.value}</h4>
</li>
</ul> `
reviewer.prepend(ul);
}