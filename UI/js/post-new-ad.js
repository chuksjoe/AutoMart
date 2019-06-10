const manufacturer = document.getElementById('manufacturer');
const model = document.getElementById('model');
const body_type = document.getElementById('body-type');
const year = document.getElementById('year');
const price = document.getElementById('price');
const state = document.getElementById('state');
const color = document.getElementById('color');
const mileage = document.getElementById('mileage');
const transmission_type = document.getElementById('transmission');
const fuel_type = document.getElementById('fuel-type');
const fuel_cap = document.getElementById('fuel-cap');
const doors = document.getElementById('doors');
const img_url = document.getElementById('upload-image');
const description = document.getElementById('description');

const ac = document.querySelector('input[value="ac"]');
const arm_rest = document.querySelector('input[value="arm_rest"]');
const fm_radio = document.querySelector('input[value="fm_radio"]');
const dvd_player = document.querySelector('input[value="dvd_player"]');
const tinted_windows = document.querySelector('input[value="tinted_windows"]');
const air_bag = document.querySelector('input[value="air_bag"]');

const previewBox = document.getElementById('preview-upload-image');

const form = document.querySelector('form');

const errorDiv = document.getElementById('error-div');
const postAdBtn = document.querySelector('.post-new-ad');

const user_id = sessionStorage.getItem('user_id');
const is_loggedin = sessionStorage.getItem('is_loggedin');
const token = sessionStorage.getItem('token');

window.onload = () => {
  // redirect to sign in page if the user is not logged in
  if (!is_loggedin) {
		window.location.href = '/api/v1/signin';
  }
};

// Helpers Functions
function previewImage(fieldId, previewB) {
	while (previewB.firstChild) previewB.removeChild(previewB.firstChild);
	const { files } = document.getElementById(fieldId);
	const total_file = files.length;
	for (let i = 0; i < total_file; i += 1) {
		const img = document.createElement('img');
		img.src = URL.createObjectURL(files[i]);
		previewB.appendChild(img);
	}
}

img_url.onchange = () => previewImage('upload-image', previewBox);

// Validation function
const validateForm = () => {
	const errorFields = [];
	if (manufacturer.value === '--') errorFields.push('manufacturer');
	if (model.value === '') errorFields.push('model');
	if (body_type.value === '--') errorFields.push('body_type');
	if (year.value === '--') errorFields.push('year');
	if (price.value === '') errorFields.push('price');
	if (state.value === '--') errorFields.push('state');
	if (color.value === '--') errorFields.push('color');
	if (mileage.value === '') errorFields.push('mileage');
	if (transmission_type.value === '--') errorFields.push('transmission');
	if (fuel_type.value === '--') errorFields.push('fuel_type');
	if (fuel_cap.value === '') errorFields.push('fuel_cap');
	if (doors.value === '') errorFields.push('doors');
	if (img_url.value === '') errorFields.push('img_url');
	if (description.value === '') errorFields.push('description');

	return errorFields;
};

postAdBtn.onclick = (e) => {
	e.preventDefault();
	errorDiv.classList.add('hide');
	errorDiv.style.backgroundColor = '#a45';

	const errors = validateForm();
	if (errors.length > 0) {
		let errMsg = '';
		errors.map((err) => {
			switch (err) {
				case 'manufacturer':
					errMsg += 'manufacturer name cannot be empty<br/>';
					break;
				case 'model':
					errMsg += 'model name cannot be empty<br/>';
					break;
				case 'body_type':
					errMsg += 'body type cannot be empty<br/>';
					break;
				case 'year':
					errMsg += 'year cannot be empty<br/>';
					break;
				case 'price':
					errMsg += 'price cannot be empty<br/>';
					break;
				case 'state':
					errMsg += 'state cannot be empty<br/>';
					break;
				case 'color':
					errMsg += 'color cannot be empty<br/>';
					break;
				case 'mileage':
					errMsg += 'mileage cannot be empty<br/>';
					break;
				case 'transmission':
					errMsg += 'transmission type cannot be empty<br/>';
					break;
				case 'fuel_type':
					errMsg += 'fuel type cannot be empty<br/>';
					break;
				case 'fuel_cap':
					errMsg += 'fuel capacity cannot be empty<br/>';
					break;
				case 'doors':
					errMsg += 'number of doors cannot be empty<br/>';
					break;
				case 'img_url':
					errMsg += 'the image cannot be empty<br/>';
					break;
				case 'description':
					errMsg += 'description cannot be empty<br/>';
					break;
				default: errMsg += 'check if all your entries are correct<br/>';
			}
			errorDiv.classList.remove('hide');
			errorDiv.innerHTML = errMsg;
			return 0;
		});
	} else {
		// process the form
		postAdBtn.innerHTML = 'Processing data...';
		postAdBtn.disabled = 'disabled';
		
		const formData = new FormData(form);
		formData.append('owner_id', user_id);
		formData.set('ac', ac.checked.toString());
		formData.set('fm_radio', fm_radio.checked.toString());
		formData.set('arm_rest', arm_rest.checked.toString());
		formData.set('dvd_player', dvd_player.checked.toString());
		formData.set('tinted_windows', tinted_windows.checked.toString());
		formData.set('air_bag', air_bag.checked.toString());
		const init = {
			body: formData,
			method: 'POST',
			headers: { authorization: `Bearer ${token}` },
		};
		fetch('/api/v1/car', init)
		.then(res => res.json())
		.then((response) => {
			const res = response;
			if (res.status !== 201) {
				errorDiv.innerHTML = res.error;
			} else {
				errorDiv.style.backgroundColor = '#4b5';
				errorDiv.innerHTML = `You have successfully posted a new car ad.<br>Name: ${res.data.name}<br>
				Price: &#8358 ${res.data.price.toLocaleString('en-US')}, Body type: ${res.data.body_type}<br>
				click <a href='/api/v1/marketplace'>here to check it out on marketplace.</a>`;
			}
			errorDiv.classList.remove('hide');
			postAdBtn.innerHTML = 'Post New AD';
			postAdBtn.disabled = null;
		})
		.catch((error) => {
			errorDiv.innerHTML = error;
		});
	}
};
