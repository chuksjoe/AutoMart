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
