var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/add', function(req, res, next) {
  User.find({}).count(function(err, doc){
    if(err){
      res.send('err');
      return next();
    }
    var user = new User({
      uid: doc,
      username: 'jim'
    });

    user.save(function(err){
      if(err){
        res.send('err');
        return;
      }
       User.find({}, function(err, doc){
        if(err){
          res.send('err');
          return next();
        }
        res.json(doc);
       });
    });
  });
});
router.param('userId', function(req, res, next, userId){
	req.userId = userId;
	next();
})

router.get('/del/:userId', function(req, res, next) {
  var ob = {
  	"uid": req.userId
  }
  User.remove(ob, function(err, doc){
	  	if(err){
	 		res.send('err');
	 		return next();
	 	}
	 	res.json(doc);
	  });
});

module.exports = router;
