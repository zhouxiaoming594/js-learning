var Comment = require('../models/comment');

exports.save = function(req, res, next){
	var _comment = req.body.comment;
	var movieId = _comment.movie;

  if(_comment.cid){
    Comment.findById(_comment.cid, function(err, comment){
      var replay = {
        from: _comment.from,
        to: _comment.tid,
        content: _comment.content
      }
      console.log(replay)
      comment.replay.push(replay)

    	comment.save(function(err, comment){
    		if(err) return next(err)

    		res.redirect('/movie/' + movieId);
    	})
    })
  }else{
    var comment = new Comment(_comment);

    comment.save(function(err, comment){
      if(err) return next(err)

      res.redirect('/movie/' + movieId);
    })
  }
}