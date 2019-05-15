const carImages = document.querySelectorAll(".car-image");
const carPreview = document.getElementById("car-preview-overlay");
const closeCarPreview = document.getElementById("close-car-preview");

carImages.forEach(carImage => {
  carImage.onclick = () => {
    carPreview.style.display = "block";
    toggleScroll();
  };
});

closeCarPreview.onclick = () => {
  carPreview.style.display = "none";
  toggleScroll();
};

const openPurModalFromCP = document.getElementById("order-from-car-preview");
const openPurModalBtns = document.querySelectorAll(".order");
const purchaseModal = document.getElementById("purchase-order-overlay");
const closePurModal = document.getElementById("close-purchase-modal");

openPurModalBtns.forEach(btn => {
  btn.onclick = () => {
    purchaseModal.style.display = "block";
    toggleScroll();
  };
});

openPurModalFromCP.onclick = () => {
  purchaseModal.style.display = "block";
  toggleScroll();
};

closePurModal.onclick = e => {
  e.preventDefault();
  purchaseModal.style.display = "none";
  toggleScroll();
};

const openFraudModal = document.getElementById("flag-fraud");
const fraudModal = document.getElementById("fraudulent-flag-overlay");
const closeFraudModal = document.getElementById("close-fraud-modal");

openFraudModal.onclick = () => (fraudModal.style.display = "block");

closeFraudModal.onclick = e => {
  e.preventDefault();
  fraudModal.style.display = "none";
  toggleScroll();
};
