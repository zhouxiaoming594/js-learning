var Index = require('../app/controls/index');
var Movie = require('../app/controls/movie');
var User = require('../app/controls/user');
var Comment = require('../app/controls/comment');
var Category = require('../app/controls/category');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports = function(app){
	app.use(function(req, res, next){
		var _user = req.session.user;

	    res.locals.user = _user;

	    next();
	})
	//Index
	app.get('/', Index.index);
	//User
	app.get('/signup', User.showSignup);
	app.get('/signin', User.showSignin);
	app.post('/user/signup', User.signup);
	app.post('/user/signin', User.signin);
	app.get('/logout', User.logout);
	app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.userList);
	//Movie
	app.get('/movie/:id', Movie.detail);
	app.post('/admin/movie/new', multipartMiddleware, User.signinRequired, User.adminRequired, Movie.savePoster, Movie.save);
	app.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update);
	app.get('/admin/movie', User.signinRequired, User.adminRequired, Movie.new);
	app.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.getList);
	app.delete('/admin/movie/list?', User.signinRequired, User.adminRequired, Movie.deleteList);
	//comment
	app.post('/user/comment', User.signinRequired, Comment.save);
  //category
  app.get('/admin/category', User.signinRequired, User.adminRequired, Category.new);
  app.post('/admin/category/new', User.signinRequired, User.adminRequired, Category.save);
  app.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list);
  //result
  app.get('/result', Index.search);
}