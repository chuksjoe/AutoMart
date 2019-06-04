const memberNav = document.querySelector('.member-nav');
const visitorNav = document.querySelector('.visitor-nav');

const carPreview = document.getElementById('car-preview-overlay');
const purchaseModal = document.getElementById('purchase-order-overlay');
const fraudModal = document.getElementById('fraudulent-flag-overlay');
const notificationModal = document.getElementById('notification-overlay');
const closeCarPreview = document.getElementById('close-car-preview');
const closePurModal = document.getElementById('close-purchase-modal');
const closeFraudModal = document.getElementById('close-fraud-modal');
const closeNotifation = document.querySelector('.close-notification');

const user_id = sessionStorage.getItem('user_id');
const is_loggedin = sessionStorage.getItem('is_loggedin');

/* ================ Helper funtions ================= */
const toggleNavBar = (is_logged, display = 'flex') => {
  if (is_logged) {
    // display marketplace with nav bar for registered users
    visitorNav.style.display = 'none';
    memberNav.style.display = display;
  } else {
    // display marketplace with nav bar for unregistered users
    memberNav.style.display = 'none';
    visitorNav.style.display = display;
  }
};

const displayNavBar = () => {
  if (window.innerWidth < 750) {
    toggleNavBar(is_loggedin, 'block');
  } else {
    toggleNavBar(is_loggedin);
  }
};

const openPurchaseModal = (params) => {
  const {
    id, name, price, body_type,
  } = params;
  const placeOrderBtn = document.getElementById('place-order');

  document.querySelector('#purchase-order-overlay .c-details-mv').innerHTML = name;
  document.querySelector('#purchase-order-overlay .c-b-type').innerHTML = `(${body_type})`;
  document.querySelector('#purchase-order-overlay .c-price').innerHTML = `&#8358 ${price.toLocaleString('en-US')}`;

  purchaseModal.style.display = 'block';
  toggleScroll();

  placeOrderBtn.onclick = (e) => {
    e.preventDefault();
    let price_offered = document.querySelector('.purchase-order-form .price').value;
    price_offered = price_offered.replace(/\D/g, '');
    
    const data = { car_id: id, buyer_id: user_id, price_offered };
    const init = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    };
    fetch('/api/v1/order', init)
    .then(res => res.json())
    .then((response) => {
      const message = document.querySelector('#notification-overlay .message');
      const res = response;
      if (res.status === 201) {
        message.innerHTML = `You have successfully placed an order for <b>${res.data.car_name}</b>.<br/><br/>
        Actual Price: &#8358 ${res.data.price.toLocaleString('en-US')}<br/>
        Price Offered: &#8358 ${res.data.price_offered.toLocaleString('en-US')}`;
      } else {
        message.innerHTML = `${res.data}!<br/>Please ensure you are logged-in before placing an order.<br/>
        If you don't have an account on AutoMart,<br/><a href='/api/v1/signup'>Click here to Sign-up.</a>`;
      }
      purchaseModal.style.display = 'none';
      notificationModal.style.display = 'block';
    });
  };
};

const openFraudModal = (params) => {
  fraudModal.style.display = 'block';
};

// used to get details of a car from the database
const getCarDetils = (carId) => {
  fetch(`/api/v1/car/${carId}`)
  .then(res => res.json())
  .then((response) => {
    if (response.status === 200) {
      const car = response.data;
      const {
        id, name, img_url, manufacturer, model, year, state,
        owner_name, price, body_type, fuel_type, mileage,
        color, transmission_type, fuel_cap, created_on,
      } = car;
      const desc = document.querySelector('#car-preview-overlay .car-view-main-desc');
      document.querySelector('#car-preview-overlay .modal-header').innerHTML = name;
      document.querySelector('#car-preview-overlay .added-date').innerHTML = `Added on: ${created_on}`;
      document.querySelector('#car-preview-overlay img').setAttribute('src', img_url);
      desc.innerHTML = `<p class="c-price">Price: &#8358 ${price.toLocaleString('en-US')}</p>
              <div class="prop-list flex-container">
                <p class="prop"><b>Make:</b><br>${manufacturer}</p>
                <p class="prop"><b>Model:</b><br>${model}</p>
                <p class="prop"><b>State:</b><br>${state}</p>
                <p class="prop"><b>Body Type:</b><br>${body_type}</p>
                <p class="prop"><b>Color:</b><br>${color}</p>
                <p class="prop"><b>Year:</b><br>${year}</p>
                <p class="prop"><b>Fuel Type:</b><br>${fuel_type}</p>
                <p class="prop"><b>Fuel Capacity:</b><br>${fuel_cap}L</p>
                <p class="prop"><b>Mileage:</b><br>${mileage.toLocaleString('en-US')}km</p>
                <p class="prop"><b>Transmission:</b><br>${transmission_type}</p>
                <p class="prop"><b>Posted By:</b><br>${owner_name}</p>
                <p><a href="#">Full Details >></a></p>
              </div>`;
      const btnGrp = document.createElement('div');
      const orderBtn = document.createElement('button');
      const flagBtn = document.createElement('button');
      btnGrp.setAttribute('class', 'btn-group flex-container');
      orderBtn.setAttribute('class', 'half-btn btn');
      orderBtn.onclick = () => openPurchaseModal({
        id, name, price, body_type,
      });
      orderBtn.innerHTML = 'Place Order';
      flagBtn.setAttribute('class', 'half-btn btn');
      flagBtn.onclick = () => openFraudModal({
        id, name, price, body_type,
      });
      flagBtn.innerHTML = 'Flag Fradulent AD';

      btnGrp.appendChild(orderBtn);
      btnGrp.appendChild(flagBtn);

      desc.appendChild(btnGrp);
    } else {
      const message = document.querySelector('#notification-overlay .message');
      message.innerHTML = response.data;
      notificationModal.style.display = 'block';
      toggleScroll();
    }
  });
};

/* ==================== MAIN LOGICS ====================== */
window.onload = () => {
  // Setup the right Nav Bar depending on whether the user is registered or not
  displayNavBar();

  // fetch the cars from database and populate the marketplace
   fetch('/api/v1/car?status=available')
  .then(res => res.json())
  .then((response) => {
    const res = response;
    const carList = document.querySelector('.car-list');
    if (res.data.length > 0) {
      res.data.map((car) => {
        const {
          id, name, model, body_type, manufacturer, year, state, price, img_url,
        } = car;
        const carCard = document.createElement('li');
        const carImg = document.createElement('div');
        const carInfo = document.createElement('div');
        const btn = document.createElement('button');
        carCard.classList.add('car-card');
        carCard.setAttribute('data-id', id);
        carImg.classList.add('car-image');
        carImg.onclick = () => {
          getCarDetils(id);
          carPreview.style.display = 'block';
          toggleScroll();
        };
        carInfo.classList.add('car-info');
        btn.classList.add('order', 'full-btn', 'btn');
        btn.onclick = () => openPurchaseModal({
          id, name, price, body_type,
        });
        btn.innerHTML = 'Place Order';
        carImg.innerHTML = `<img src="${img_url}" title="Preview AD">
            <label class="car-state-tag">${state}</label>`;
        carInfo.innerHTML = `<h3 class="c-details-mv">${year} ${manufacturer}<br>${model}</h3>
            <p class="car-price">&#8358 ${price.toLocaleString('en-US')}</p>`;
        carInfo.appendChild(btn);
        carCard.appendChild(carImg);
        carCard.appendChild(carInfo);
        carList.appendChild(carCard);
        return 0;
      });
    } else {
      // the car list is empty
      carList.innerHTML = 'No car ad found!';
    }
  })
  .catch((error) => {
    const message = document.querySelector('#notification-overlay .message');
    message.innerHTML = error;
    notificationModal.style.display = 'block';
    toggleScroll();
  });
};

// if the window is resized, it should check on the nav bar, and make neccesary adjustments
window.addEventListener('resize', () => {
  displayNavBar();
});

closeCarPreview.onclick = () => {
  carPreview.style.display = 'none';
  toggleScroll();
};

// close purchase car form modal view
closePurModal.onclick = (e) => {
  e.preventDefault();
  purchaseModal.style.display = 'none';
  toggleScroll();
};

// close mark post as fraudulent modal view
closeFraudModal.onclick = (e) => {
  e.preventDefault();
  fraudModal.style.display = 'none';
  toggleScroll();
};

closeNotifation.onclick = (e) => {
  e.preventDefault();
  notificationModal.style.display = 'none';
  toggleScroll();
};
