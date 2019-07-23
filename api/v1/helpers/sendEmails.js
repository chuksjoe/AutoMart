import utils from './utils';

export default {
	sendSignupMessage(params) {
		const { email, first_name, last_name } = params;
		const mailOption = {
			from: '"AutoMart Help" <automart.help@gmail.com>',
			to: email,
			subject: `Welcome to AutoMart ${first_name}`,
			html: `<h3>Welcome to AutoMart, ${first_name} ${last_name}</h3>
			<p>Hi ${first_name},</p>
			<p>You are warmly welcome to AutoMart platform.</p>
			<p>A swift, secure and reliable online marketplace where you can buy your dream<br/>
			car and sell both brand new and fairly used cars.</p>
			<p>You can post your cars and lookout for other users place orders on them which<br/>
			you can either accept or reject depending on whether it meets your demand.</p>
			<p>You can also place orders on other users posted car Ads and wait for them to<br/>
			respond to it.</p>
			<p>Feel free to contact via this email (automart.help@gmail.com) for any form of help.</p><br/>
			<p>Wish you happy buying and selling.</p>`,
		};
		utils.sendMail(mailOption);
	},
	sendPasswordResetMessage(params) {
		const {
			email, first_name, last_name, new_pass,
		} = params;
		const mailOption = {
			from: '"AutoMart Help" <automart.help@gmail.com>',
			to: email,
			subject: 'AutoMart Password Reset',
			html: `<h3>AutoMart Password Reset Successful!</h3>
			<p>Hi ${first_name} ${last_name}, you have successfully reset your password.</p>
			<p>Your new password is: ${new_pass}</p>
			<p>Note: if the password is auto-generated, you can reset it to your desired password by changing the password in your profile.</p>`,
		};
		utils.sendMail(mailOption);
	},
	sendFlagMessage(params) {
		const {
			car, reason, description,
		} = params;
		const mailOption = {
			from: '"AutoMart Help" <automart.help@gmail.com>',
			to: car.email,
			subject: `AutoMart - Your AD (${car.name}) has been flagged`,
			html: `<h3>Your AD (${car.name}) has been flagged</h3>
			<p>Hi ${car.owner},</p>
			<p>your car ad posted on ${car.created_on} has been flagged for reason bothering on ${reason}.</p>
			<p>Details of the flag is as follow:</p><hr>
			<h4>Reason: ${reason}</h4>
			<p>Description:</br>
			${description}</p><hr><hr>
			<p>Kindly review the affected ad and address the issue, then notify us to mark the report as addressed.</p>`,
		};
		utils.sendMail(mailOption);
	},
	sendAddressedFlagMessage(params) {
		const {
			flag, reason, description,
		} = params;
		const mailOption = {
			from: '"AutoMart Help" <automart.help@gmail.com>',
			to: flag.owner_email,
			subject: `AutoMart - Flag on ${flag.car_name} has been Addressed`,
			html: `<h3>Flag on ${flag.car_name} has been Addressed</h3>
			<p>Hi ${flag.owner},</p>
			<p>be notified that the flag placed on your above named car ad on AutoMart has been addressed.</p>
			<p>Details of the flag is as follow:</p><hr>
			<h4>Reason: ${reason}</h4>
			<p>Description:</br>
			${description}</p><hr><hr>`,
		};
		utils.sendMail(mailOption);
	},
};
