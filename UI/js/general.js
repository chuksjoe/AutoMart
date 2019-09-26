const toggleClass = (node, classN) => {
  if (node.classList.contains(classN)) node.classList.remove(classN);
  else node.classList.add(classN);
};

/* ============ MAIN LOGICS ========================= */
// Toggle Menubar filter bar when the screen is below 800px
const menuList = document.querySelector('.menu-list');
const menuBtn = document.querySelector('.menu-btn');

menuBtn.onclick = () => {
  const icons = document.querySelectorAll('.menu-btn i');
  icons.forEach((icon) => {
    toggleClass(icon, 'hide');
  });
  menuList.style.display = menuList.style.display === 'block' ? ('none') : ('block');
};

window.addEventListener('resize', () => {
  if (window.innerWidth > 750) {
    menuList.style.display = 'flex';
  } else {
    menuList.style.display = 'none';
    menuBtn.firstChild.classList.remove('hide');
    menuBtn.lastChild.classList.add('hide');
  }
});
