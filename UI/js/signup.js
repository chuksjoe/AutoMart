const first_name = document.getElementById('first-name');
const last_name = document.getElementById('last-name');
const email = document.getElementById('email');
const password1 = document.getElementById('password1');
const password2 = document.getElementById('password2');
const street = document.getElementById('street');
const city = document.getElementById('city');
const state = document.getElementById('state');
const country = document.getElementById('country');

const errorDiv = document.getElementById('error-div');
const signup = document.getElementById('signupBtn');
const phone = document.getElementById('phone');
const zip = document.getElementById('zip-code');

// Validation function
const validateForm = () => {
	const errorFields = [];
	if (first_name.value === '') errorFields.push('fname');
	if (last_name.value === '') errorFields.push('lname');
	if (email.value === '') errorFields.push('no-email');
	else if (email.value.indexOf('.') < 3 || email.value.indexOf('@') < 1) {
		errorFields.push('bad-email');
	}
	if (password1.value.length < 8) errorFields.push('short-pass');
	else if (password1.value.search(/\d/) < 0) errorFields.push('no-digit-in-pass');
	if (password1.value !== password2.value) errorFields.push('pass-mismatch');
	if (phone.value	!== '') {
		if (phone.value.length < 10) errorFields.push('phone');
	}
	return errorFields;
};

phone.onkeyup = () => {
	phone.value = phone.value.replace(/\D/g, '');
};
zip.onkeyup = () => {
	zip.value = zip.value.replace(/[^0-9][^-]/g, '');
};

signup.onclick = (e) => {
	e.preventDefault();
	errorDiv.classList.add('hide');
	errorDiv.style.backgroundColor = '#a45';
	const errors = validateForm();
	if (errors.length > 0) {
		let errMsg = '';
		errors.map((err) => {
			switch (err) {
				case 'fname':
					errMsg += 'first name cannot be empty<br/>';
					break;
				case 'lname':
					errMsg += 'last name cannot be empty<br/>';
					break;
				case 'no-email':
					errMsg += 'email cannot be empty<br/>';
					break;
				case 'bad-email':
					errMsg += 'your e-mail is badly formed<br/>';
					break;
				case 'short-pass':
					errMsg += 'password should be 8 or more characters<br/>';
					break;
				case 'no-digit-in-pass':
					errMsg += 'password should include at least on digit<br/>';
					break;
				case 'pass-mismatch':
					errMsg += 'your passwords do not match<br/>';
					break;
				case 'phone':
					errMsg += 'phone number should be 10 or more digits<br/>';
					break;
				default: errMsg += 'check if all your entry is correct<br/>';
			}
			errorDiv.classList.remove('hide');
			errorDiv.innerHTML = errMsg;
			return 0;
		});
	} else {
		// process the form
		signup.innerHTML = 'Processing data...';
		signup.disabled = 'disabled';
		const data = {
			first_name: first_name.value,
			last_name: last_name.value,
			email: email.value,
			password: password1.value,
			is_admin: false,
			street: street.value,
			city: city.value,
			state: state.value,
			country: country.value,
			phone: phone.value,
			zip: zip.value,
		};
		const init = {
			body: JSON.stringify(data),
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		};

		fetch('/api/v1/auth/signup', init)
		.then(res => res.json())
		.then((response) => {
			const res = response;
			if (res.status !== 201) {
				errorDiv.innerHTML = res.data;
			} else {
				errorDiv.style.backgroundColor = '#4b5';
				errorDiv.innerHTML = `Congratulations ${res.data.first_name} ${res.data.last_name}, you have successfully
				registered on AutoMart with this e-mail address: ${res.data.email}.<br/>
				click <a href='/api/v1/signin'>here to sign into your account.</a>`;
			}
			errorDiv.classList.remove('hide');
			signup.innerHTML = 'Create Account';
			signup.disabled = null;
		})
		.catch((error) => {
			errorDiv.innerHTML = error;
		});
	}
};
