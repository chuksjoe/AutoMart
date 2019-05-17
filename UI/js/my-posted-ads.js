const previewAdBtns = document.querySelectorAll(".car-image");
const carPreview = document.getElementById("car-preview-overlay");
const closeCarPreview = document.getElementById("close-car-preview");

previewAdBtns.forEach(btn => {
  btn.onclick = () => {
    carPreview.style.display = "block";
    toggleScroll();
  };
});

closeCarPreview.onclick = () => {
  carPreview.style.display = "none";
  toggleScroll();
};

const openUpdateModalBtns = document.querySelectorAll(".update-p");
const updatePriceModal = document.getElementById("update-price-overlay");
const closeUpdateModal = document.getElementById("close-update-modal");

openUpdateModalBtns.forEach(btn => {
  btn.onclick = () => {
    updatePriceModal.style.display = "block";
    toggleScroll();
  };
});

closeUpdateModal.onclick = e => {
  e.preventDefault();
  updatePriceModal.style.display = "none";
  toggleScroll();
};
