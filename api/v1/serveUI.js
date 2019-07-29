import path from 'path';
import compression from 'compression';
import express from 'express';

const dirName = '../../UI/template';
const resoursePath = path.join(__dirname, '../../UI');
// debug(`Resource Path: ${resoursePath}`);

export default (app, prefix) => {
	app.use(compression());
	app.use(express.static(resoursePath));
	app.use('/css', express.static(path.join(__dirname, '../../UI/css')));
	app.use('/js', express.static(path.join(__dirname, '../../UI/js')));
	app.use('/images', express.static(path.join(__dirname, '../../UI/images')));

	app.get(`${prefix}`, (req, res) => {
		res.redirect(`${prefix}/index`);
	});

	app.get(`${prefix}/index`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, '/index.html'));
	});

	app.get(`${prefix}/signup`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, '/signup.html'));
	});

	app.get(`${prefix}/signin`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, '/signin.html'));
	});

	app.get(`${prefix}/marketplace`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, '/marketplace.html'));
	});

	app.get(`${prefix}/my-posted-ads`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, '/my-posted-ads.html'));
	});

	app.get(`${prefix}/post-new-ad`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, '/post-new-ad.html'));
	});

	app.get(`${prefix}/purchase-history`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, '/purchase-history.html'));
	});

	app.get(`${prefix}/sales-history`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, '/sales-history.html'));
	});

	app.get(`${prefix}/admin`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, '/admin.html'));
	});

	app.get(`${prefix}/users-list`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, '/users-list.html'));
	});

	app.get(`${prefix}/api-doc`, (req, res) => {
		res.redirect('https://documenter.getpostman.com/view/7607196/S1TYWGgG');
	});

	// default page is set to the index page
	app.get('*', (req, res) => {
		res.redirect(`${prefix}/index`);
	});
};