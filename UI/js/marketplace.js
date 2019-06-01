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
// Setup the right Nav Bar depending on whether the user is registered or not
window.onload = () => {
  displayNavBar();
};

window.addEventListener('resize', () => {
  displayNavBar();
});

//  Car Ad preview modal management
const carImages = document.querySelectorAll('.car-image');
const carPreview = document.getElementById('car-preview-overlay');
const closeCarPreview = document.getElementById('close-car-preview');

carImages.forEach((carImage) => {
  carImage.onclick = () => {
    carPreview.style.display = 'block';
    toggleScroll();
  };
});

closeCarPreview.onclick = () => {
  carPreview.style.display = 'none';
  toggleScroll();
};

// Purchase car form modal view management
const openPurModalFromCP = document.getElementById('order-from-car-preview');
const openPurModalBtns = document.querySelectorAll('.order');
const purchaseModal = document.getElementById('purchase-order-overlay');
const closePurModal = document.getElementById('close-purchase-modal');

openPurModalBtns.forEach((btn) => {
  btn.onclick = () => {
    purchaseModal.style.display = 'block';
    toggleScroll();
  };
});

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
