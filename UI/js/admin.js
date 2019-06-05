const carPreview = document.getElementById('car-preview-overlay');
const notificationModal = document.getElementById('notification-overlay');
const updatePriceModal = document.getElementById('update-price-overlay');
const closeCarPreview = document.getElementById('close-car-preview');
const closeNotifation = document.querySelector('.close-notification');

const is_loggedin = sessionStorage.getItem('is_loggedin');
const is_admin = sessionStorage.getItem('is_admin');

/* ================ Helper funtions ================= */
const deleteAd = (car_id) => {
  const init = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  };
  fetch(`/api/v1/car/${car_id}`, init)
  .then(res => res.json())
  .then((response) => {
    const message = document.querySelector('#notification-overlay .message');
    if (response.status === 200) {
      message.innerHTML = response.message;
    } else {
      message.innerHTML = response.data;
    }
    notificationModal.style.display = 'block';
  });
};

const getCarDetils = (carId) => {
  fetch(`/api/v1/car/${carId}`)
  .then(res => res.json())
  .then((response) => {
    if (response.status === 200) {
      const car = response.data;
      const {
        id, name, img_url, manufacturer, model, year, status,
        price, body_type, fuel_type, mileage, state, owner_name,
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
                <p class="prop"><b>Status:</b><br>${status}</p>
                <p class="prop"><b>State:</b><br>${state}</p>
                <p class="prop"><b>Body Type:</b><br>${body_type}</p>
                <p class="prop"><b>Color:</b><br>${color}</p>
                <p class="prop"><b>Year:</b><br>${year}</p>
                <p class="prop"><b>Fuel Type:</b><br>${fuel_type}</p>
                <p class="prop"><b>Fuel Capacity:</b><br>${fuel_cap}L</p>
                <p class="prop"><b>Mileage:</b><br>${mileage.toLocaleString('en-US')}km</p>
                <p class="prop"><b>Transmission:</b><br>${transmission_type}</p>
                <p class="prop"><b>Posted By:</b><br>${owner_name}</p>
              </div>`;
      const btnGrp = document.createElement('div');
      const viewFlagsBtn = document.createElement('button');
      const deleteAdBtn = document.createElement('button');

      viewFlagsBtn.setAttribute('class', 'view-reports half-btn btn');
      viewFlagsBtn.innerHTML = 'View Flags';
      deleteAdBtn.setAttribute('class', 'delete half-btn btn');
      deleteAdBtn.innerHTML = 'Delete Ad';
      deleteAdBtn.onclick = () => {
        deleteAd(id);
      };
      btnGrp.setAttribute('class', 'btn-group flex-container');
      btnGrp.appendChild(viewFlagsBtn);
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
  if (!(is_loggedin || is_admin)) {
      setTimeout(() => {
      window.location.href = '/api/v1/signin';
    }, 0);
  }

  // fetch the cars from database and populate the marketplace
   fetch('/api/v1/car')
  .then(res => res.json())
  .then((response) => {
    const res = response;
    const carList = document.querySelector('.car-list');
    if (res.data.length > 0) {
      res.data.map((car) => {
        const {
          id, name, owner_name, body_type, state, status, price, img_url, created_on,
        } = car;
        const carCard = document.createElement('li');
        const carImg = document.createElement('div');
        const carInfo = document.createElement('div');
        const btnGrp = document.createElement('div');
        const viewFlagsBtn = document.createElement('button');
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
                            <p>Posted by ${owner_name}, on: ${created_on}</p>`;
        
        viewFlagsBtn.setAttribute('class', 'view-reports full-btn btn');
        viewFlagsBtn.innerHTML = 'View Flags';
        deleteAdBtn.setAttribute('class', 'delete full-btn btn');
        deleteAdBtn.innerHTML = 'Delete Ad';
        deleteAdBtn.onclick = () => {
          deleteAd(id);
        };
        btnGrp.setAttribute('class', 'admin-actions');
        btnGrp.appendChild(viewFlagsBtn);
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
      carList.innerHTML = 'No car sale ad has been posted.';
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
  document.location.reload();
};
