const updatePriceModal = document.getElementById('update-price-overlay');
const closeUpdateModal = document.getElementById('close-update-modal');
const notificationModal = document.getElementById('notification-overlay');
const closeNotifation = document.querySelector('.close-notification');

const user_id = sessionStorage.getItem('user_id');
const is_loggedin = sessionStorage.getItem('is_loggedin');

const openUpdateModal = (params) => {
	// logic for updating price of an order
};

window.onload = () => {
	// redirect to sign in page if the user is not logged in
  if (!is_loggedin) {
			setTimeout(() => {
			window.location.href = '/api/v1/signin';
		}, 0);
  }

  // fetch the purchase orders from database and populate the purchase history page
   fetch(`/api/v1/order?user_id=${user_id}`)
  .then(res => res.json())
  .then((response) => {
    const res = response;
    const historyList = document.querySelector('.history-list');
    if (res.data.purchase_list.length > 0) {
      res.data.purchase_list.map((order) => {
        const {
          id, car_name, car_body_type, price, owner_name,
          buyer_id, price_offered, created_on, status,
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
																<p class="purchase-info">Actual Price: &#8358 ${price.toLocaleString('en-US')}.
																Owner: ${owner_name}</p>
																<p class="purchase-info">Price Offered: &#8358 ${price_offered.toLocaleString('en-US')}</p>
															</div>`;
				btnGrp.setAttribute('class', 'user-actions p-15');
				updateOrderBtn.setAttribute('class', 'update-p full-btn btn');
				updateOrderBtn.innerHTML = 'Update Price';
				updateOrderBtn.onclick = () => {
					openUpdateModal({
						id, car_name, price, car_body_type, price_offered,
					});
				};
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
  document.location.reload();
};
