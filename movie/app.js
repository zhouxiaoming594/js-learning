var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var port = process.env.PORT || 8081
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var mongoStore = require('connect-mongo')(expressSession);
var logger = require('morgan');
var serveStatic = require('serve-static');
var fs = require('fs');

var dbUrl = 'mongodb://localhost/imooc';
mongoose.connect(dbUrl);

var models_path = __dirname + '/app/models';
var walk = function(path){
	fs
		.readdirSync(path)
		.forEach(function(file){
			var newPath = path + '/' + file;
			var stat = fs.statSync(newPath);

			if(stat.isFile()){
				if(/(.*)\.(js|coffee)/.test(file)){
					require(newPath);
				}
			}else if(stat.isDirectory){
				walk(newPath);
			}
		})
}
walk(models_path);

app.set('views', __dirname + '/app/views/pages');
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressSession({
	secret: 'imooc',
	resave: false,
	saveUninitialized: true,
	store: new mongoStore({
		url: dbUrl,
		collection: 'sessions' 
	})
}));

var env = process.env.NODE_ENV || 'development'
if('development' === env){
	app.set('showStackError', true);
	app.use(logger(':method :url :status'));
	app.locals.pretty = true;
	mongoose.set('debug', true);
}
require('./config/routes')(app);

app.use(serveStatic(path.join(__dirname, 'public')))
app.locals.moment = require('moment');

app.listen(port);
console.log('project start on port:' + port);