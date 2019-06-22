const updatePriceModal = document.getElementById('update-price-overlay');
const closeUpdateModal = document.getElementById('close-update-modal');
const notificationModal = document.getElementById('notification-overlay');
const closeNotifation = document.querySelector('.close-notification');

const user_id = sessionStorage.getItem('user_id');
const is_loggedin = sessionStorage.getItem('is_loggedin');
const token = sessionStorage.getItem('token');

const openUpdateModal = (params) => {
	const {
    id, car_name, price, car_body_type, price_offered,
  } = params;
  const updatePriceBtn = document.getElementById('update-price');

  document.querySelector('#update-price-overlay .c-details-mv').innerHTML = car_name;
  document.querySelector('#update-price-overlay .c-b-type').innerHTML = `(${car_body_type})`;
  document.querySelector('#update-price-overlay .c-price')
  .innerHTML = `Price: &#8358 ${parseInt(price, 10).toLocaleString('en-US')}`;
  document.querySelector('#update-price-overlay .c-c-o-price')
  .innerHTML = `Current Price Offered:<br>&#8358 ${parseInt(price_offered, 10).toLocaleString('en-US')}`;

  updatePriceModal.style.display = 'block';
  toggleScroll();

  updatePriceBtn.onclick = (e) => {
    e.preventDefault();
    const message = document.querySelector('#notification-overlay .message');
    let new_price = document.querySelector('.update-order-form .price').value;
    new_price = new_price.replace(/\D/g, '');
    if (new_price === '') {
      message.innerHTML = 'The price field cannot be empty!';
      notificationModal.style.display = 'block';
      return 0;
    }
    const init = {
      method: 'PATCH',
      body: JSON.stringify({ new_price }),
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
    };
    fetch(`/api/v1/order/${id}/price`, init)
    .then(res => res.json())
    .then((response) => {
      const res = response;
      if (res.status === 200) {
        const { old_price_offered, new_price_offered } = res.data;
        message.innerHTML = `You have successfully updated the price you offered for <b>${res.data.car_name}.</b><br/><br/>
        Actual Price: &#8358 ${parseInt(res.data.price, 10).toLocaleString('en-US')}<br/>
        Old Price Offered: &#8358 ${parseInt(old_price_offered, 10).toLocaleString('en-US')}<br/>
        New Price Offered: &#8358 ${parseInt(new_price_offered, 10).toLocaleString('en-US')}`;
      } else {
        message.innerHTML = `${res.error}<br/>Please ensure you are logged-in before placing an order.<br/>
        If you don't have an account on AutoMart,<br/><a href='/api/v1/signup'>Click here to Sign-up.</a>`;
      }
      updatePriceModal.style.display = 'none';
      notificationModal.style.display = 'block';
    });
    setTimeout(() => {
      document.location.reload();
    }, 2500);
    return 0;
  };
};

window.onload = () => {
	// redirect to sign in page if the user is not logged in
  if (!is_loggedin) {
    window.location.href = '/api/v1/signin';
	}

  const userName = document.querySelector('.user-name');

  userName.innerHTML = `${sessionStorage.getItem('first_name')}
   ${sessionStorage.getItem('last_name').charAt(0)}.`;

  // fetch the purchase orders from database and populate the purchase history page
  const init = {
    method: 'GET',
    headers: { authorization: `Bearer ${token}` },
  };   
  fetch('/api/v1/order', init)
  .then(res => res.json())
  .then((response) => {
    const res = response;
    const historyList = document.querySelector('.history-list');
    if (res.data.length > 0) {
      res.data.map((order) => {
        const {
          id, car_name, car_body_type, price, owner_name,
          price_offered, created_on, status,
        } = order;
        const orderCard = document.createElement('li');
        const btnGrp = document.createElement('div');
        const updateOrderBtn = document.createElement('button');
        const cancelOrderBtn = document.createElement('button');

        orderCard.setAttribute('class', 'history-list-item flex-container');
        orderCard.innerHTML = `<div class="purchase-date p-15">
																<p>${created_on}</p>
																<label class="status">${status}</label>
															</div>
															<div class="purchase-details p-15">
																<h3 class="c-details-list">Purchase Order for ${car_name}</h3>
																<p class="purchase-info">Actual Price: &#8358 ${parseInt(price, 10).toLocaleString('en-US')}.
																Owner: ${owner_name}</p>
																<p class="purchase-info">Price Offered: &#8358 ${parseInt(price_offered, 10).toLocaleString('en-US')}</p>
															</div>`;
				btnGrp.setAttribute('class', 'user-actions p-15');
				updateOrderBtn.setAttribute('class', 'update-p full-btn btn');
				updateOrderBtn.innerHTML = 'Update Price';
				updateOrderBtn.onclick = () => {
					openUpdateModal({
						id, car_name, price, car_body_type, price_offered,
					});
				};
        if (status !== 'pending') {
          updateOrderBtn.setAttribute('disbled', 'disbled');
        }
				cancelOrderBtn.setAttribute('class', 'delete full-btn btn');
				cancelOrderBtn.innerHTML = 'Cancel Purchase';

				btnGrp.appendChild(updateOrderBtn);
				btnGrp.appendChild(cancelOrderBtn);

				orderCard.appendChild(btnGrp);
				historyList.appendChild(orderCard);
				return 0;
      });
    } else {
      // the car list is empty
      historyList.style.textAlign = 'center';
      historyList.innerHTML = 'You have not placed any order yet!';
    }
  })
  .catch((error) => {
    const message = document.querySelector('#notification-overlay .message');
    message.innerHTML = error;
    notificationModal.style.display = 'block';
    toggleScroll();
  });
};

closeUpdateModal.onclick = (e) => {
  e.preventDefault();
  updatePriceModal.style.display = 'none';
  toggleScroll();
};

closeNotifation.onclick = (e) => {
  e.preventDefault();
  notificationModal.style.display = 'none';
};
