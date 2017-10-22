var User = require('../models/user');
var _ = require('underscore');

exports.showSignup = function(req, res){
	res.render('signup', {
		title: '用户注册页'
	})
}

exports.showSignin = function(req, res){
	res.render('signin', {
		title: '用户登陆页'
	})
}

exports.signup = function(req, res, next){
	var _user = req.body.user;
	User.findOne({name: _user.name}, function(err, doc){
		if(err) return next(err)
		if(doc) {
			return res.redirect('/')
		}else{
			var user = new User(_user);
			user.save(function(err, doc){
				if(err) return next(err)

				res.redirect('/admin/userList');	
			})
		}
	});
}

exports.signin = function(req, res, next){
	var _user = req.body.user;
	var name = _user.name;
	var password = _user.password;

	User.findOne({name: name}, function(err, user){
		if(err) return next(err);

		if(!user) {
			return res.redirect('/');
		}
		user.comparePassword(password, function(err, isMatch){
			if(err) return next(err);

			if(isMatch) {
				req.session.user = user;
				console.log('signin success');
				return res.redirect('/')
			}else{
				console.log('Password is not matched');
			}
		})
	});
}

exports.logout = function(req, res, next){
	delete req.session.user;
	//delete app.locals.user;
	res.redirect('/');
}

exports.userList = function(req, res, next){
	User.fetch(function(err, users){
		if(err) return next(err)

		res.render('userList', {
			title: '爱电影 用户列表',
			users: users
		})
	})
}

//midware for user
exports.signinRequired = function(req, res, next){
	var user = req.session.user;

	if(!user){
		return res.redirect('/signin');
	}

	next();
}

exports.adminRequired = function(req, res, next){
	var user = req.session.user;

	if(user.role <= 10 || user.role == undefined){
		return res.redirect('/signin');
	}

	next();
}