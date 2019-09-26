# Auto-Mart

[![Build Status](https://travis-ci.com/chuksjoe/AutoMart.svg?branch=develop)](https://travis-ci.com/chuksjoe/AutoMart)
[![Heroku](https://img.shields.io/badge/heroku-deployed-green.svg)](https://auto-mart-adc.herokuapp.com)
[![Coverage Status](https://coveralls.io/repos/github/chuksjoe/AutoMart/badge.svg?branch=develop)](https://coveralls.io/github/chuksjoe/AutoMart?branch=develop)
[![Maintainability](https://api.codeclimate.com/v1/badges/1c755fa5581069ff8171/maintainability)](https://codeclimate.com/github/chuksjoe/AutoMart/maintainability)

Auto Mart is an online marketplace for automobiles of diverse make, model or body type. With Auto Mart, users can sell their cars or buy either brand new or used cars from trusted dealerships or private sellers.

This is an Andela Developer Challenge (ADC) project that is divided into 2 parts, the User Interface (UI) which makes up the frontend, built using Vanilla HTML, CSS and Javascript, and the API endpoints with the logics that aid their creation and implementations, all of which make up the backend, which is built using Node.js.

## Description of the frontend.

The frontend comprises of a number of pages for different functionalities as described below:

- [**Index**](https://auto-mart-adc.herokuapp.com/api/v1/index): this is the homepage of the app from where every users can access other pages like the sign in, sign up, doc and marketplace. It also contains descriptive information on what the app is all about.

  [Screenshot of Index Page](https://drive.google.com/open?id=1dzR8JeXaR6hlPUfeYbNHaAsm8gKQjPPQ)

- [**Marketplace**](https://auto-mart-adc.herokuapp.com/api/v1/marketplace): on this page, all the available car ads are popullated from the database for users to view, preview specific car ads, place purchase orders and flag suspicious ads as frauduent. If the user is not signed in, he/she can only view the ads but can not place any order on them or flag them. It also has functionality for filtering the listed car ads such as price range, manufacturer, body type and state.
  This page consumes the following API endpoints:

  - `/api/v1/car?status=Available` : which is a GET request that returns a list of all available car ads. If the list is filtered, the query params are appended to the endpoint.
  - `/api/v1/car/:car_id` : which is a GET request that returns data a specific car ad
  - `/api/v1/order` : which is a POST request that creates a new purchase order on success with the 201 as its status code.

  [Screenshot of Marketplace](https://drive.google.com/open?id=1w_U9DTsJrkOW-oS4Du8RqgiceMOn5LBZ)

  [Screenshot of a previewed car ad](https://drive.google.com/open?id=1FQSZ2oVlf0XV7OZXfg5W459rg48LK_YX)

  [Screenshot of a form for placing a purchase order](https://drive.google.com/open?id=1sREN70HbWJIWjwKe2zygscdW8jYQrOBp)

  [Screenshot of the form for flaging an Ad as fraudulent](https://drive.google.com/open?id=1oCkguWgwJGgnVELEK2LDuNcV9pa1mjOt)

- [**Sign In**](https://auto-mart-adc.herokuapp.com/api/v1/signin): here, users can sign into their accounts. Once a user is signed in, he/she will then have access to post new ads, view all his/her posted ads, view list of his/her purchase or sales order, delete his posted ad, update price of his posted Ad or purchase order, and also update the status of his/her posted ads.
  This page consumes the following API endpoint;

  - `/api/v1/auth/signin` : which is a POST request that returns status code 200 on success with the users data, and 401 on failure with an error message

  [Screenshot of the signin page](https://drive.google.com/open?id=1vKnvAn-gfTlcVPG5jUS2Ff-dg9zMDQi-)

- [**Sign Up**](https://auto-mart-adc.herokuapp.com/api/v1/signup): on this page, a new user can create an account that gives him/her access to fully use the AutoMart platform for buying and selling of cars. In order to sign up successfully, all the required information such as first name, last name, email, password and confirm password must be supplied.
  This page consumes the following API endpoint:

  - `/api/v1/auth/signup` : which a POST request that creates a new user account on success.

  [Screenshot of signup page](https://drive.google.com/open?id=1-6HTcw_U7G5qLVuuaQYFNTYeoc8oanhZ)

- **Post New Ad**: this is used for posting new car ads by users who are registered and are logged in. Every field on the form on this page except the features must be filled before it can be successfully processed and posted.
  This page consumes the following API endpoint:

  - `/api/v1/car` : which is a POST request for creating a new car ad.

  [Screenshot for posting new ad](https://drive.google.com/open?id=1Zb9Ay3qxB6QZ4GNO_DlVGrq8busO2IBo)

- **My Ads**: this page presents to the user a list of all the ads he/she has posted, both sold and unsold, with buttons to either update the price of the ad, mark the Ad as sold, or delete the Ad from the database. Just like the market place, he/she can also can preview a specific car or filter the list of car ads displayed. It can only be accessed when the user had loged in. It consumes the following API endpoint:

  - `/api/v1/car?owner_id=<owner_id>` : which is a GET request that returns a list all the car Ad posted by the user
  - `/api/v1/car/:car_id/price` : which is a PATCH requet for updating the price of a car Ad by the user
  - `/api/v1/car/:car_id/status` : which is a PATCH request for marking a car Ad a sold.
  - `/api/v1/car/:car_id` : which is a DELETE request for deleting a posted car Ad with the specified Id by the owner

  [Screenshot of My Ads page](https://drive.google.com/open?id=1SF5zBMk6HrXGVvS3a7_1cNd37B4uyO0Q)

  [Screenshot of a form for updating the price of a car ad](https://drive.google.com/open?id=1_9XEx38kyB500V5cn7Ubjdx-LIHCNvf4)

- **Purchase History**: this page presents to the user a list of all the purchase order he/she had placed on car ads posted by other users. On this page, he/she can update the price offered if the offer is still pending. It can only be accessed when the user had loged in. This page consumes the following API endpoints:

  - `/api/v1/order?user_id=<user_id>` : which is a GET request that returns the list of orders for the user with the specified id.
  - `/api/v1/order/:order_id/price` : which is a PATCH request for updating the price offered for a car ad.

  [Sreenshot of Purchase History page](https://drive.google.com/open?id=1OxIai-BnZSKkBSyBB0PjOKtEselG3fGt)

  [Screenshot of a form for updating the price offered for an ad](https://drive.google.com/open?id=1FPhhdmwD9CV5W7m8EL1zcocImZKr6vNp)

- **Sales History**: this page presents to the user a list of all the purchase orders placed by other users on any of his/her car ads. On this page, he/she can accept or decline offers made on his ads.
  (image)
- **Admin**: this is the admin page where an admin can view all the posted car Ad whether sold or unsold, and can also delete any of the ads. It consumes the following API endpoints:

  - `/api/v1/car` : which is a GET request that returns all the posted car Ad in the database.
  - `/api/v1/car/:car_id` : which is a DELETE request that deletes a car Ad with the specified Id in the path varible.

## Description of the API endpoints

The API endpoints have been described alongside the pages that consume them, except for some that are not used in the frontend section of this project, but will be consumed in the final ADC project. The list is as follow:

### Car Resource

- `POST /api/v1/car` : for creating a new car ad.
- `GET /api/v1/car` : returns all the posted car Ad in the database.
- `GET /api/v1/car?status=Available` : returns a list of all available car ads. When query parameters are added to this endpoint, the list iis filtered based on the params' values.
- `GET /api/v1/car/:car_id` : returns data for a specific car ad
- `GET /api/v1/car?owner_id=<owner_id>` : returns a list of all the car Ad posted by the user
- `PATCH /api/v1/car/:car_id/price` : for updating the price of a car Ad by the user
- `PATCH /api/v1/car/:car_id/status` : for marking a car Ad a sold.
- `DELETE /api/v1/car/:car_id` : for deleting a posted car Ad by the owner

### Order Resource

- `POST /api/v1/order` : creates a new purchase order.
- `GET /api/v1/order` : returns the list of orders that a logged in user had placed on Ads owned by other users (i.e, his/her purchase list).
- `GET /api/v1/sale` : this endpoint returns the logged in user's sales list, that is, the list of purchase orders other users had placed on his/her posted car ads.
- `PATCH /api/v1/order/:order_id/price` : updating the price offered for a car ad.
- `PATCH /api/v1/order/:order_id/accept` : for a user (seller) to accept a purchase order placed on his/her posted car Ad. This automattically marks the car ad as sold, and takes it off the marketplace.
- `PATCH /api/v1/order/:order_id/reject` : for a user (seller) to reject a purchase order placed on his/her car ad.

### Auth Resource

- `POST /api/v1/auth/signin` : signs in a user with valid email and password.
- `POST /api/v1/auth/signup` : creates a new user account on success.
- `POST /api/v1/user/:email/reset_password` : this is used for resetting a user's password. It's used in 2 scenario. If the user cannot remember his/her password (in this case, it does not require a request body. It will reset the password and sent the new password to the user's email address). And when the user wants to change his/her password (in the case, the user goes to his/her profile page after a successful login, then supplies the current password, and the new password using a form. The new password is still sent to the users email).
- `PATCH /api/v1/user/:email/update_details` : this endpoint is used for updating the users details such as his/her contact details, and could also be used by an admin to raise the status of a user to an admin.

### Flag Resource

- `POST /api/v1/flag` : this endpoint is used for flagging a car Ad by other users on the AutoMart Platform.
- `GET /api/v1/flag/:car_id` : this one is used by an admin to monitor the flags placed on a car Ad to mark them as addressed after the owner of the Ad must have attended to the flagged issue, and to delete them when necessary. It is also used by the car Ad owner to view the issued raised on his/her Ad, so that they can address them and report to the admin who marks them as addressed.
- `PATCH /api/v1/flag/:flag_id/status` : this is used by an admin to mark a flag on a car Ad as addressed.
- `DELETE /api/vi/flag/:flag_id ` : this endpoint is used by an admin to delete a flag placed on a car Ad.

## How to install and Test

### Pre-requisites

The neccesary tools for running this appliction on your local machine are as follow:

- [Node.js v10.15.0 (recommended)](https://nodejs.org/en/) : shouldn't be below version 8
- [npm v6.4.1](https://nodejs.org/en/) : usually comes with Node.js
- [Git bash](https://git-scm.com/downloads) : for your command line interface (cli)

### Setup steps

To install and test this application locally on your computer, first you have to clone this repository into a folder on your computer, then navigate to the root directory using the Git bash cli. Run the following commands at this point:

- `npm install` : this will install all the neccessary packages listed in the package.json file
- `npm test` : this will test all API endpoints to ensure that they are working
- `npm run dev-start` : this will run the app so that you can check it out on your browser. Once its running, note the port the server is listening on, then open a browser on your computer and enter the url `http://localhost:<port>`. This will take you to the homepage of the application.

## Deployment

- The API is deployed to Heroku: [https://auto-mart-adc.herokuapp.com/api/v1](https://auto-mart-adc.herokuapp.com/api/v1/)
- The UI is deployed to gh-pages: [https://chuksjoe.github.io/AutoMart_UI/UI/templates/](https://chuksjoe.github.io/AutoMart_UI/UI/templates/)
- The link to the Documentation:  [https://auto-mart-adc.herokuapp.com/api/v1/api-doc](https://auto-mart-adc.herokuapp.com/api/v1/api-doc)

## Technologies utilized

- HTML, CSS and Javascript (UI interface),
- Node js (Server environment),
- Express (Web application framework),
- Mocha, Chai (Testing framework),
- Babel (Compiler),
- Eslint, Airbnb (Coding style),
- Travis CI (Continuous integration),
- Postman (API Documentation and Testing),
- Coveralls (test coverage),
- Code Climate (Code Analysis)

## Example Usage

For examples of how the endpoints work, you can check out the documentation for the API [here.](https://auto-mart-adc.herokuapp.com/api/v1/api-doc)

You can also check out the application [here for your review](https://auto-mart-adc.herokuapp.com). Your feedback will be so much appreciated.

## Author

Chukwunonso Orjiakor
