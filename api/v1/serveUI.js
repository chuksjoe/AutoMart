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

	app.get(`${prefix}/api-doc`, (req, res) => {
		res.redirect('https://documenter.getpostman.com/view/7607196/S1TYWGgG');
	});

	// default page is set to the index page
	app.get('*', (req, res) => {
		res.redirect(`${prefix}/index`);
	});
};
