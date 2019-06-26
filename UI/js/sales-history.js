const notificationModal = document.getElementById('notification-overlay');
const closeNotifation = document.querySelector('.close-notification');

const is_loggedin = sessionStorage.getItem('is_loggedin');
const token = sessionStorage.getItem('token');

const accpetOffer = (params) => {

};

const declineOffer = (params) => {

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
  fetch('/api/v1/sale', init)
  .then(res => res.json())
  .then((response) => {
    const res = response;
    const historyList = document.querySelector('.history-list');
    if (res.data.length > 0) {
      res.data.map((order) => {
        const {
          id, car_name, price, buyer_name,
          price_offered, created_on, status,
        } = order;
        const orderCard = document.createElement('li');
        const btnGrp = document.createElement('div');
        const acceptOrderBtn = document.createElement('button');
        const declineOrderBtn = document.createElement('button');

        orderCard.setAttribute('class', 'history-list-item flex-container');
        orderCard.innerHTML = `<div class="purchase-date p-15">
																<p>${created_on}</p>
																<label class="status">${status}</label>
															</div>
															<div class="purchase-details p-15">
																<h3 class="c-details-list">Purchase Order from ${buyer_name}</h3>
																<p class="purchase-info">For ${car_name} @ &#8358 ${parseInt(price, 10).toLocaleString('en-US')}</p>
																<p class="purchase-info">Price Offered: &#8358 ${parseInt(price_offered, 10).toLocaleString('en-US')}</p>
															</div>`;
				btnGrp.setAttribute('class', 'user-actions p-15');
				acceptOrderBtn.setAttribute('class', 'update-p full-btn btn');
				acceptOrderBtn.innerHTML = 'Accept Offer';
				acceptOrderBtn.onclick = () => {
					accpetOffer({
						id, car_name, price, price_offered,
					});
				};
        if (status !== 'pending') {
          acceptOrderBtn.setAttribute('disbled', 'disbled');
        }
				declineOrderBtn.setAttribute('class', 'delete full-btn btn');
				declineOrderBtn.innerHTML = 'Decline Offer';
				declineOrderBtn.onclick = () => {
					declineOffer({
						id, car_name, price, price_offered,
					});
				};
				btnGrp.appendChild(acceptOrderBtn);
				btnGrp.appendChild(declineOrderBtn);

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

closeNotifation.onclick = (e) => {
  e.preventDefault();
  notificationModal.style.display = 'none';
};
