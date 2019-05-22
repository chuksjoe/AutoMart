'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('server:debug');

var app = (0, _express2.default)();

app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));

var port = _config2.default.get('port');

app.get('*', function (req, res) {
	return res.status(200).send({ message: 'Welcome on Board: AutoMart API.' });
});

app.listen(port, function () {
	debug('AutoMart Server is running on port ' + port + ' and in ' + _config2.default.get('mode') + ' mode...');
	console.log('AutoMart Server is running on port ' + port + ' and in ' + _config2.default.get('mode') + ' mode...');
});
//# sourceMappingURL=index.js.map