// Helper functions
const toggleScroll = () => {
  const overlays = document.querySelectorAll(".overlay");
  let hasOverlay = false;
  overlays.forEach(overlay => {
    if (overlay.style.display === "block") hasOverlay = true;
  });
  if (hasOverlay) document.body.classList.add("no-scroll");
  else document.body.classList.remove("no-scroll");
};
