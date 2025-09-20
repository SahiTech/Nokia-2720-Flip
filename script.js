const App = {
  config: { 
    basePrice: 3650, // Nokia 2720 Flip-এর অফার মূল্য
    shipping: { insideDhaka: 80, outsideDhaka: 130 }, // শিপিং চার্জ
    maxQuantity: 10 // সর্বোচ্চ পরিমাণ
  },

  quantities: { black: 1, gray: 1 }, // কালার: কালো এবং গ্রে
  shipping: 130, // ডিফল্ট শিপিং: ঢাকার বাইরে
  selectedProduct: 'black', // ডিফল্ট সিলেক্টেড কালার: কালো
  isSubmitting: false,

  init() {
    // কালার স্টক কন্ট্রোল
    this.stock = {
      black: true, // কালো উপলব্ধ
      gray: true   // গ্রে উপলব্ধ
    };

    // অনুপলব্ধ কালার ডিসেবল করা
    Object.keys(this.stock).forEach(color => {
      const productEl = document.getElementById(`product-${color}`);
      const radioEl = document.getElementById(`radio-${color}`);
      if (!this.stock[color]) {
        productEl.classList.add('disabled');
        if (radioEl) radioEl.disabled = true;
      }
    });

    this.bindEvents();

    // প্রথম উপলব্ধ কালার সিলেক্ট করা
    const firstAvailable = Object.keys(this.stock).find(c => this.stock[c]);
    this.selectProduct(firstAvailable);

    this.setupBackToTop();
  },

  bindEvents() {
    // ফর্ম সাবমিশন
    document.getElementById('order-form').addEventListener('submit', e => {
      e.preventDefault();
      if (this.validateForm()) {
        this.updateTotals();
        e.target.submit();
      }
    });

    // প্রোডাক্ট সিলেকশন
    document.querySelector('.form-container').addEventListener('click', e => {
      const product = e.target.closest('.product');
      if (product) {
        let color = product.id.includes('black') ? 'black' : 'gray';
        if (!this.stock[color]) return;
        this.selectProduct(color);
      }
    });

    // পরিমাণ পরিবর্তন
    document.querySelectorAll('.quantity button').forEach(btn => {
      btn.addEventListener('click', () => {
        let color = btn.id.includes('black') ? 'black' : 'gray';
        const delta = btn.id.includes('minus') ? -1 : 1;
        this.changeQty(color, delta);
      });
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // শিপিং পরিবর্তন
    document.querySelectorAll('input[name="shipping"]').forEach(input => {
      input.addEventListener('change', () => this.updateShipping(parseInt(input.value)));
    });

    this.updateButtonsState();
  },

  selectProduct(color) {
    this.selectedProduct = color;
    ['black', 'gray'].forEach(c => {
      const productEl = document.getElementById(`product-${c}`);
      const radioEl = document.getElementById(`radio-${c}`);
      if (!radioEl.disabled) {
        radioEl.checked = color === c;
      }
      document.getElementById(`qty-${c}-box`).style.display = color === c ? 'flex' : 'none';
      productEl.classList.toggle('selected', color === c);
      productEl.setAttribute('aria-checked', color === c);
    });

    this.updateTotals();
    this.updateButtonsState();
  },

  changeQty(color, delta) {
    if (color !== this.selectedProduct || this.isSubmitting) return;
    const newQty = this.quantities[color] + delta;
    if (newQty < 1 || newQty > this.config.maxQuantity) {
      const message = newQty < 1 
        ? 'পরিমাণ ১ এর কম হতে পারে না' 
        : `পরিমাণ ${this.config.maxQuantity} এর বেশি হতে পারে না`;
      const errEl = document.getElementById('qty-error');
      errEl.style.display = 'block';
      errEl.innerText = message;
      setTimeout(() => { errEl.style.display = 'none'; }, 3000);
      return;
    }
    this.quantities[color] = newQty;
    document.getElementById(`qty-${color}`).value = newQty;
    this.updateTotals();
    this.updateButtonsState();
  },

  updateShipping(amount) {
    this.shipping = amount;
    this.updateTotals();
  },

  updateTotals() {
    const subtotal = this.config.basePrice * this.quantities[this.selectedProduct];
    const total = subtotal + this.shipping;
    document.getElementById('subtotal').innerText = `৳${subtotal.toLocaleString('bn-BD')}`;
    document.getElementById('total').innerText = `৳${total.toLocaleString('bn-BD')}`;
    document.getElementById('hiddenSubtotal').value = subtotal;
    document.getElementById('hiddenTotal').value = total;

    const productNames = {
      black: 'Nokia 2720 Flip (Black)',
      gray: 'Nokia 2720 Flip (Gray)'
    };
    document.getElementById('hiddenProduct').value = productNames[this.selectedProduct];
    document.getElementById('hiddenQuantity').value = this.quantities[this.selectedProduct];
  },

  updateButtonsState() {
    const color = this.selectedProduct;
    document.getElementById(`btn-minus-${color}`).disabled = this.quantities[color] <= 1;
  },

  validateForm() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    const nameRegex = /^[A-Za-z\s\u0980-\u09FF]+$/;
    const phoneRegex = /^01[3-9][0-9]{8}$/;
    let valid = true;

    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');

    if (!nameRegex.test(name) || name.length === 0) {
      document.getElementById('name-error').style.display = 'block';
      valid = false;
    }
    if (!phoneRegex.test(phone)) {
      document.getElementById('phone-error').style.display = 'block';
      valid = false;
    }
    if (address === '') {
      document.getElementById('address-error').style.display = 'block';
      valid = false;
    }

    return valid;
  },

  setupBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    window.addEventListener('scroll', () => {
      backToTop.style.display = window.scrollY > 1500 ? 'block' : 'none';
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },
};

window.onload = () => App.init();