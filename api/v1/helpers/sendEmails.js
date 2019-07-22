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
};
