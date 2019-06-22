const carPreview = document.getElementById('car-preview-overlay');
const notificationModal = document.getElementById('notification-overlay');
const closeCarPreview = document.getElementById('close-car-preview');
const closeNotifation = document.querySelector('.close-notification');

const is_loggedin = sessionStorage.getItem('is_loggedin');
const is_admin = sessionStorage.getItem('is_admin');
const token = sessionStorage.getItem('token');

/* ================ Helper funtions ================= */
const deleteAd = (car_id) => {
  const init = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
  };
  fetch(`/api/v1/car/${car_id}`, init)
  .then(res => res.json())
  .then((response) => {
    const message = document.querySelector('#notification-overlay .message');
    if (response.status === 200) {
      message.innerHTML = response.message;
    } else {
      message.innerHTML = response.error;
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
      desc.innerHTML = `<p class="c-price">Price: &#8358 ${parseInt(price, 10).toLocaleString('en-US')}</p>
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
      message.innerHTML = response.error;
      notificationModal.style.display = 'block';
      toggleScroll();
    }
  });
};

const fetchCarAds = (url, msgIfEmpty) => {
  const carList = document.querySelector('.car-list');
  carList.innerHTML = null;
  fetch(url)
  .then(res => res.json())
  .then((response) => {
    const res = response;
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
                            <p class="car-price">&#8358 ${parseInt(price, 10).toLocaleString('en-US')}</p>
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
      carList.innerHTML = msgIfEmpty;
    }
  })
  .catch((error) => {
    const message = document.querySelector('#notification-overlay .message');
    message.innerHTML = error;
    notificationModal.style.display = 'block';
    toggleScroll();
  });
};

/* ==================== MAIN LOGICS ====================== */
window.onload = () => {
  // redirect to sign in page if the user is not logged in
  if (!(is_loggedin || is_admin)) {
    window.location.href = '/api/v1/signin';
  }
  const userName = document.querySelector('.user-name');

  userName.innerHTML = `${sessionStorage.getItem('first_name')}
   ${sessionStorage.getItem('last_name').charAt(0)}.`;

  // fetch the cars from database and populate the marketplace
  fetchCarAds('/api/v1/car', 'No car sale ad has been posted.');
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

/* ============= MANAGE FILTER LOGICS HERE ============= */
const filterSelectors = document.querySelectorAll('.common-seletor');
const variables = {
  min_price: null,
  max_price: null,
  manufacturer: null,
  body_type: null,
  state: null,
  status: null,
};

filterSelectors.forEach((selector) => {
  const sel = selector;
  sel.onchange = () => {
    let url = '/api/v1/car?';

    if (sel.classList.contains('min-price')) {
      const val = sel.value.replace(/\D/g, '');
      variables.min_price = isNaN(parseFloat(val)) ? null : parseFloat(val);
    } else if (sel.classList.contains('max-price')) {
      const val = sel.value.replace(/\D/g, '');
      variables.max_price = isNaN(parseFloat(val)) ? null : parseFloat(val);
    } else if (sel.classList.contains('manufacturer')) {
      if (sel.checked) {
        variables.manufacturer = sel.value === 'on' ? null : sel.value;
      }
    } else if (sel.classList.contains('body-type')) {
      if (sel.checked) {
        variables.body_type = sel.value === 'on' ? null : sel.value;
      }
    } else if (sel.classList.contains('state')) {
      if (sel.checked) {
        variables.state = sel.value === 'on' ? null : sel.value;
      }
    } else if (sel.classList.contains('status')) {
      if (sel.checked) {
        variables.status = sel.value === 'on' ? null : sel.value;
      }
    }
    Object.keys(variables).forEach((key) => {
      if (variables[key] !== null) {
        url += `&${key}=${variables[key]}`;
      }
    });
    fetchCarAds(url, 'No car AD matches the filter parameter.');
  };
  return 0;
});
