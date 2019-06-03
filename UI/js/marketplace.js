// helper funtions
const memberNav = document.querySelector('.member-nav');
const visitorNav = document.querySelector('.visitor-nav');
const is_loggedin = sessionStorage.getItem('is_loggedin');

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

/* =================== MAIN LOGICS ========================= */
const carPreview = document.getElementById('car-preview-overlay');
const purchaseModal = document.getElementById('purchase-order-overlay');
const closeCarPreview = document.getElementById('close-car-preview');

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
          id, model, manufacturer, year, state, price, img_url,
        } = car;
        const carCard = document.createElement('li');
        const carImg = document.createElement('div');
        const carInfo = document.createElement('div');
        const btn = document.createElement('button');
        carCard.classList.add('car-card');
        carCard.setAttribute('data-id', id);
        carImg.classList.add('car-image');
        carImg.onclick = () => {
          carPreview.style.display = 'block';
          toggleScroll();
        };
        carInfo.classList.add('car-info');
        btn.classList.add('order', 'full-btn', 'btn');
        btn.onclick = () => {
          purchaseModal.style.display = 'block';
          toggleScroll();
        };
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

// Purchase car form modal view management
const openPurModalFromCP = document.getElementById('order-from-car-preview');
const closePurModal = document.getElementById('close-purchase-modal');

openPurModalFromCP.onclick = () => {
  purchaseModal.style.display = 'block';
  toggleScroll();
};

closePurModal.onclick = (e) => {
  e.preventDefault();
  purchaseModal.style.display = 'none';
  toggleScroll();
};

// Mark post as fraudulent modal view management
const openFraudModal = document.getElementById('flag-fraud');
const fraudModal = document.getElementById('fraudulent-flag-overlay');
const closeFraudModal = document.getElementById('close-fraud-modal');

openFraudModal.onclick = () => {
  fraudModal.style.display = 'block';
};

closeFraudModal.onclick = (e) => {
  e.preventDefault();
  fraudModal.style.display = 'none';
  toggleScroll();
};
