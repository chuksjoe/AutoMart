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
