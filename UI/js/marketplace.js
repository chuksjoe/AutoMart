const memberNav = document.querySelector('.member-nav');
const visitorNav = document.querySelector('.visitor-nav');

const carPreview = document.getElementById('car-preview-overlay');
const purchaseModal = document.getElementById('purchase-order-overlay');
const fraudModal = document.getElementById('fraudulent-flag-overlay');
const closeCarPreview = document.getElementById('close-car-preview');
const closePurModal = document.getElementById('close-purchase-modal');
const closeFraudModal = document.getElementById('close-fraud-modal');

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

const openPurchaseModal = (param) => {
  purchaseModal.style.display = 'block';
  toggleScroll();
};

const openFraudModal = (param) => {
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
        id, name, price, body_type, user_id,
      });
      orderBtn.innerHTML = 'Place Order';
      flagBtn.setAttribute('class', 'half-btn btn');
      flagBtn.onclick = () => openFraudModal({
        id, name, price, body_type, user_id,
      });
      flagBtn.innerHTML = 'Flag Fradulent AD';

      btnGrp.appendChild(orderBtn);
      btnGrp.appendChild(flagBtn);

      desc.appendChild(btnGrp);
    }
  });
};

/* ==================== MAIN LOGICS ====================== */
window.onload = () => {
  // Setup the right Nav Bar depending on whether the user is registered or not
  displayNavBar();

  // fetch the cars from database and populate the marketplace
  const init = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };
  fetch('/api/v1/car?status=available', init)
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
          id, name, price, body_type, user_id,
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
    }
  })
  .catch(error => console.log(error));
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
