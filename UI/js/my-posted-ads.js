const carPreview = document.getElementById('car-preview-overlay');
const notificationModal = document.getElementById('notification-overlay');
const closeCarPreview = document.getElementById('close-car-preview');
const closeNotifation = document.querySelector('.close-notification');

const user_id = sessionStorage.getItem('user_id');
const is_loggedin = sessionStorage.getItem('is_loggedin');

/* ================ Helper funtions ================= */
// used to get details of a car from the database
const getCarDetils = (carId) => {
  fetch(`/api/v1/car/${carId}`)
  .then(res => res.json())
  .then((response) => {
    if (response.status === 200) {
      const car = response.data;
      const {
        id, name, img_url, manufacturer, model, year, state,
        price, body_type, fuel_type, mileage, status,
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
                <p class="prop"><b>Posted By:</b><br>Me</p>
                <p><a href="#">Full Details >></a></p>
              </div>`;
      const btnGrp = document.createElement('div');
      const markSoldBtn = document.createElement('button');
      const deleteAdBtn = document.createElement('button');

      markSoldBtn.setAttribute('class', 'half-btn btn');
      markSoldBtn.innerHTML = 'Mark Sold';
      deleteAdBtn.setAttribute('class', 'delete half-btn btn');
      deleteAdBtn.innerHTML = 'Delete Ad';
      if (status === 'sold') {
        markSoldBtn.setAttribute('disabled', 'disabled');
      }

      btnGrp.setAttribute('class', 'btn-group flex-container');
      btnGrp.appendChild(markSoldBtn);
      btnGrp.appendChild(deleteAdBtn);
      desc.appendChild(btnGrp);
    } else {
      const message = document.querySelector('#notification-overlay .message');
      message.innerHTML = response.data;
      notificationModal.style.display = 'block';
      toggleScroll();
    }
  });
};

/* ==================== MAIN LOGICS ====================== */
window.onload = () => {
  // redirect to sign in page if the user is not logged in
  if (!is_loggedin) {
      setTimeout(() => {
      window.location.href = '/api/v1/signin';
    }, 0);
  }

  // fetch the cars from database and populate the marketplace
   fetch(`/api/v1/car?owner_id=${user_id}`)
  .then(res => res.json())
  .then((response) => {
    const res = response;
    const carList = document.querySelector('.car-list');
    if (res.data.length > 0) {
      res.data.map((car) => {
        const {
          id, name, body_type, state, status, price, img_url, created_on,
        } = car;
        const carCard = document.createElement('li');
        const carImg = document.createElement('div');
        const carInfo = document.createElement('div');
        const btnGrp = document.createElement('div');
        const updatePriceBtn = document.createElement('button');
        const markSoldBtn = document.createElement('button');
        const deleteAdBtn = document.createElement('button');

        carCard.setAttribute('class', 'car-card flex-container');
        carImg.classList.add('car-image');
        carImg.innerHTML = `<img src="${img_url}" title="Preview AD">
            <label class="car-state-tag">${state}</label>`;
        carImg.onclick = () => {
          getCarDetils(id);
          carPreview.style.display = 'block';
          toggleScroll();
        };
        
        carInfo.classList.add('car-info');
        carInfo.innerHTML = `<h3 class="c-details-list">${name}</h3>
                            <label class="car-status-tag">${status}</label>
                            <p class="car-price">&#8358 ${price.toLocaleString('en-US')}</p>
                            <p><b>Body type:</b> ${body_type}</p>
                            <p>Posted on: ${created_on}</p>`;
        
        updatePriceBtn.setAttribute('class', 'update-p full-btn btn');
        updatePriceBtn.innerHTML = 'Update Price';
        markSoldBtn.setAttribute('class', 'mark-sold full-btn btn');
        markSoldBtn.innerHTML = 'Mark Sold';
        if (status === 'sold') {
          updatePriceBtn.setAttribute('disabled', 'disabled');
          markSoldBtn.setAttribute('disabled', 'disabled');
        }
        deleteAdBtn.setAttribute('class', 'delete full-btn btn');
        deleteAdBtn.innerHTML = 'Delete Ad';
        btnGrp.setAttribute('class', 'user-actions');
        btnGrp.appendChild(updatePriceBtn);
        btnGrp.appendChild(markSoldBtn);
        btnGrp.appendChild(deleteAdBtn);

        carCard.appendChild(carImg);
        carCard.appendChild(carInfo);
        carCard.appendChild(btnGrp);
        carList.appendChild(carCard);
        return 0;
      });
    } else {
      // the car list is empty
      carList.style.textAlign = 'center';
      carList.innerHTML = 'You have not posted any car sales ad!';
    }
  })
  .catch((error) => {
    const message = document.querySelector('#notification-overlay .message');
    message.innerHTML = error;
    notificationModal.style.display = 'block';
    toggleScroll();
  });
};

closeCarPreview.onclick = () => {
  carPreview.style.display = 'none';
  toggleScroll();
};

closeNotifation.onclick = (e) => {
  e.preventDefault();
  notificationModal.style.display = 'none';
  toggleScroll();
};
