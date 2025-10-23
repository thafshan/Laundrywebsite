document.addEventListener('DOMContentLoaded', () => {
  const services = document.querySelectorAll('.service-item');
  const cartItemsTBody = document.querySelector('#cart-items-table tbody');
  const totalAmountSpan = document.getElementById('total-amount');
  const confirmationMessage = document.getElementById('confirmationMessage');

  let cart = {};

  function updateCartUI() {
    cartItemsTBody.innerHTML = '';
    const items = Object.values(cart);
    if (items.length === 0) {
      cartItemsTBody.innerHTML = '<tr><td colspan="3">No items added yet.</td></tr>';
      totalAmountSpan.textContent = "0";
      return;
    }
    let total = 0;
    items.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name} (x${item.qty})</td>
        <td>$${(item.price * item.qty).toFixed(2)}</td>
      `;
      cartItemsTBody.appendChild(tr);
      total += item.price * item.qty;
    });
    totalAmountSpan.textContent = total.toFixed(2);
  }

  services.forEach(service => {
    const name = service.getAttribute('data-name');
    const price = parseFloat(service.getAttribute('data-price'));
    const toggleBtn = service.querySelector('.toggle-btn');

    toggleBtn.addEventListener('click', () => {
      if (cart[name]) {
        // Remove from cart
        delete cart[name];
        toggleBtn.textContent = 'Add Item +';
        toggleBtn.classList.remove('remove');
        toggleBtn.classList.add('add');
      } else {
        // Add to cart with qty 1
        cart[name] = { name, price, qty: 1 };
        toggleBtn.textContent = 'Remove Item -';
        toggleBtn.classList.remove('add');
        toggleBtn.classList.add('remove');
      }
      updateCartUI();
    });
  });

  // EmailJS integration
  document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) {
      alert('Please add at least one service to the cart before booking.');
      return;
    }

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const servicesList = Object.values(cart).map(item => `${item.name} (x${item.qty})`).join(', ');
    const totalPrice = totalAmountSpan.textContent;

    // Prepare params for EmailJS
    const templateParams = {
      full_name: fullName,
      user_email: email,
      phone_number: phone,
      booked_services: servicesList,
      total_amount: `$${totalPrice}`
    };

    // Use your EmailJS service ID, template ID, and user ID here
    emailjs.send('service_bk867mj', 'template_chbff8r', templateParams)
      .then(() => {
        confirmationMessage.textContent = 'Thank you For Booking the Service We will get back to you soon!';
        // Reset form and cart
        document.getElementById('bookingForm').reset();
        cart = {};
        services.forEach(service => {
          const toggleBtn = service.querySelector('.toggle-btn');
          toggleBtn.textContent = 'Add Item +';
          toggleBtn.classList.remove('remove');
          toggleBtn.classList.add('add');
        });
        updateCartUI();
      })
      .catch((error) => {
        alert('Failed to send confirmation email. Please try again.');
        console.error('EmailJS error:', error);
      });
  });
});
