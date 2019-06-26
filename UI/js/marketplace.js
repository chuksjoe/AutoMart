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

const userName = document.querySelector('.user-name');
const user_id = sessionStorage.getItem('user_id');
const is_loggedin = sessionStorage.getItem('is_loggedin');
const token = sessionStorage.getItem('token');

/* ================ Helper funtions ================= */
const toggleNavBar = (is_logged, display = 'flex') => {
  if (is_logged) {
    // display marketplace with nav bar for logged in users
    visitorNav.style.display = 'none';
    userName.innerHTML = `${sessionStorage.getItem('first_name')}
      ${sessionStorage.getItem('last_name').charAt(0)}.`;
    memberNav.style.display = display;
  } else {
    // display marketplace with nav bar for a users that is not logged in
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
  document.querySelector('#purchase-order-overlay .c-price')
  .innerHTML = `&#8358 ${parseInt(price, 10).toLocaleString('en-US')}`;

  purchaseModal.style.display = 'block';
  toggleScroll();

  placeOrderBtn.onclick = (e) => {
    e.preventDefault();
    const message = document.querySelector('#notification-overlay .message');
    let price_offered = document.querySelector('.purchase-order-form .price').value;
    price_offered = price_offered.replace(/\D/g, '');
    if (price_offered === '') {
      message.innerHTML = 'The price field cannot be empty!';
      notificationModal.style.display = 'block';
      return 0;
    }

    const data = { car_id: id, price_offered };
    const init = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
    };
    fetch('/api/v1/order', init)
    .then(res => res.json())
    .then((response) => {
      const res = response;
      if (res.status === 201) {
        message.innerHTML = `You have successfully placed an order for <b>${res.data.car_name}</b>.<br/><br/>
        Actual Price: &#8358 ${parseInt(res.data.price, 10).toLocaleString('en-US')}<br/>
        Price Offered: &#8358 ${parseInt(res.data.price_offered, 10).toLocaleString('en-US')}`;
      } if (res.status === 400) {
        message.innerHTML = res.error;
      } else {
        message.innerHTML = `Please ensure you are logged-in before placing an order.<br/>
        If you don't have an account on AutoMart,<br/><a href='/api/v1/signup'>Click here to Sign-up.</a>`;
      }
      purchaseModal.style.display = 'none';
      notificationModal.style.display = 'block';
    });
    return 0;
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
        owner_id, owner_name, price, body_type, fuel_type, mileage,
        color, transmission_type, fuel_cap, created_on, doors,
      } = car;
      const desc = document.querySelector('#car-preview-overlay .car-view-main-desc');
      document.querySelector('#car-preview-overlay .modal-header').innerHTML = name;
      document.querySelector('#car-preview-overlay .added-date').innerHTML = `Added on: ${created_on}`;
      document.querySelector('#car-preview-overlay img').setAttribute('src', img_url);
      desc.innerHTML = `<p class="c-price">Price: &#8358 ${parseInt(price, 10).toLocaleString('en-US')}</p>
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
                <p class="prop"><b>Posted By:</b><br>${(owner_id === parseInt(user_id, 10) ? 'Me' : owner_name)}</p>
                <p class="prop"><b>Doors:</b><br>${doors} doors</p>
              </div>`;
      const btnGrp = document.createElement('div');
      const orderBtn = document.createElement('button');
      const flagBtn = document.createElement('button');
      btnGrp.setAttribute('class', 'btn-group flex-container');
      orderBtn.setAttribute('class', 'half-btn btn');
      orderBtn.onclick = () => {
        openPurchaseModal({
          id, name, price, body_type,
        });
      };
      orderBtn.innerHTML = 'Place Order';
      flagBtn.setAttribute('class', 'half-btn btn');
      flagBtn.onclick = () => {
        openFraudModal({
          id, name, price, body_type,
        });
      };
      flagBtn.innerHTML = 'Flag Fradulent AD';
      if (owner_id === parseInt(user_id, 10)) {
        orderBtn.setAttribute('disabled', 'disabled');
        flagBtn.setAttribute('disabled', 'disabled');
      }
      btnGrp.appendChild(orderBtn);
      btnGrp.appendChild(flagBtn);

      desc.appendChild(btnGrp);
    } else {
      const message = document.querySelector('#notification-overlay .message');
      message.innerHTML = response.error;
      notificationModal.style.display = 'block';
      toggleScroll();
    }
  });
};

const fetchCarAds = (url, msgIfEmpty) => {
  const carList = document.querySelector('.car-list');
  carList.innerHTML = null;
  fetch(url)
  .then(res => res.json())
  .then((response) => {
    const res = response;
    if (res.data.length > 0) {
      res.data.map((car) => {
        const {
          id, name, model, body_type, manufacturer, year, state, price, img_url, owner_id,
        } = car;
        const carCard = document.createElement('li');
        const carImg = document.createElement('div');
        const carInfo = document.createElement('div');
        const orderBtn = document.createElement('button');
        carCard.classList.add('car-card');
        carCard.setAttribute('data-id', id);
        carImg.classList.add('car-image');
        carImg.onclick = () => {
          getCarDetils(id);
          carPreview.style.display = 'block';
          toggleScroll();
        };
        carInfo.classList.add('car-info');
        orderBtn.classList.add('order', 'full-btn', 'btn');
        orderBtn.onclick = () => openPurchaseModal({
          id, name, price, body_type,
        });
        orderBtn.innerHTML = 'Place Order';
        if (owner_id === parseInt(user_id, 10)) {
          orderBtn.setAttribute('disabled', 'disabled');
        }
        carImg.innerHTML = `<img src="${img_url}" title="Preview AD">
            <label class="car-state-tag">${state}</label>`;
        carInfo.innerHTML = `<h3 class="c-details-mv">${year} ${manufacturer}<br>${model}</h3>
            <p class="car-price">&#8358 ${parseInt(price, 10).toLocaleString('en-US')}</p>`;
        carInfo.appendChild(orderBtn);
        carCard.appendChild(carImg);
        carCard.appendChild(carInfo);
        carList.appendChild(carCard);
        return 0;
      });
    } else {
      // the car list is empty
      carList.innerHTML = msgIfEmpty;
    }
  })
  .catch((error) => {
    const message = document.querySelector('#notification-overlay .message');
    message.innerHTML = error;
    notificationModal.style.display = 'block';
    toggleScroll();
  });
};

/* ==================== MAIN LOGICS ====================== */
window.onload = () => {
  // Setup the right Nav Bar depending on whether the user is registered or not
  displayNavBar();

  // fetch the cars from database and populate the marketplace
   fetchCarAds('/api/v1/car?status=Available', 'No car ad found!');
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

/* ============= MANAGE FILTER LOGICS HERE ============= */
const filterSelectors = document.querySelectorAll('.common-seletor');
const variables = {
  min_price: null,
  max_price: null,
  manufacturer: null,
  body_type: null,
  state: null,
};

filterSelectors.forEach((selector) => {
  const sel = selector;
  sel.onchange = () => {
    let url = '/api/v1/car?status=Available';

    if (sel.classList.contains('min-price')) {
      const val = sel.value.replace(/\D/g, '');
      variables.min_price = isNaN(parseFloat(val)) ? null : parseFloat(val);
    } else if (sel.classList.contains('max-price')) {
      const val = sel.value.replace(/\D/g, '');
      variables.max_price = isNaN(parseFloat(val)) ? null : parseFloat(val);
    } else if (sel.classList.contains('manufacturer')) {
      if (sel.checked) {
        variables.manufacturer = sel.value === 'on' ? null : sel.value;
      }
    } else if (sel.classList.contains('body-type')) {
      if (sel.checked) {
        variables.body_type = sel.value === 'on' ? null : sel.value;
      }
    } else if (sel.classList.contains('state')) {
      if (sel.checked) {
        variables.state = sel.value === 'on' ? null : sel.value;
      }
    }
    Object.keys(variables).forEach((key) => {
      if (variables[key] !== null) {
        url += `&${key}=${variables[key]}`;
      }
    });
    fetchCarAds(url, 'No car AD matches the filter parameter.');
  };
  return 0;
});
