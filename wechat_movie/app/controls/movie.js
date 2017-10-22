var Movie = require('../models/movie');
var Comment = require('../models/comment');
var Category = require('../models/category');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

exports.detail = function(req, res, next){
	var id = req.params.id;
	Movie.findById(id, function(err, movie){
		if(err) return next(err)

    Movie.update({_id: id}, {$inc:{pv:1}}, function(err){
      if(err) return next(err)
    });
		Comment
		 	.find({movie: id})
		 	.populate('from', 'name')
      .populate('replay.from replay.to', 'name')
		 	.exec(function(err, comments){
				if(err) return next(err)

				console.log(comments);
				res.render('detail', {
					title: '爱电影 ' + movie.title,
					movie: movie,
					comments: comments
				})
			})
	})
}

exports.savePoster =  function(req, res, next){
  var posterData = req.files.uploadPoster;
  var filePath = posterData.path;
  var originalFilename = posterData.originalFilename;
  console.log(filePath);
  if(originalFilename){
    fs.readFile(filePath, function(err, data){
      var timestamp = Date.now();
      var type = posterData.type.split('/')[1];
      var poster = timestamp + '.' + type;
      var newPath = path.join(__dirname, '../../', '/public/upload/' + poster);

      fs.writeFile(newPath, data, function(err){
        req.poster = poster;
        next();
      })
    })
  }else{
    next();
  }
}

exports.save =  function(req, res, next){
	var id = req.body.movie._id
	var movieObj = req.body.movie
	var _movie

  if(req.poster){
    movieObj.poster = req.poster;
  }

	if(id){
		Movie.findById(id, function(err, movie){
			if(err) return next(err)

			_movie = _.extend(movie, movieObj);
			_movie.save(function(err, movie){
				if(err) return next(err)

        if(movieObj.category !== movieObj.oldCategory){
          console.log('category is changed');
          Category.findById(movieObj.oldCategory, function(err, category){
            var index = category.movies.indexOf(movie._id);
            category.movies.splice(index, 1);

            category.save(function(err, category){
              Category.findById(movieObj.category, function(err, category){
                category.movies.push(movie._id);
                category.save(function(err, category){
                  if(err) return next(err)

                  res.redirect('/movie/' + movie._id);          
                });
              })
            })
          })
        }else{
          console.log('category is not changed');
  				res.redirect('/movie/' + _movie._id);        
        }
			})
		})
	}else {
		_movie = new Movie(movieObj);

    var categoryId = movieObj.category;
    var categoryName = movieObj.categoryName;

		_movie.save(function(err, movie){
      if(categoryId){
        Category.findById(categoryId, function(err, category){
          category.movies.push(movie._id);
          category.save(function(err, category){
            if(err) return next(err)

            res.redirect('/movie/' + movie._id);          
          });
        })
      }else if(categoryName){
        var category = new Category({
          name: categoryName,
          movies: [movie._id]
        })
        category.save(function(err, category){
          if(err) return next(err)
          movie.category = category._id;
          movie.save(function(err, movie){
            res.redirect('/movie/' + movie._id);   
          });
        })
      }
		})
	}
}

exports.update = function(req, res, next){
	var id = req.params.id;
	if(id){
		Movie.findById(id, function(err, movie){
      Category.find({},function(err, categories){
        if(err) return next(err) 

  			res.render('admin', {
  				title: '爱电影 后台录入页',
  				movie: movie,
          categories: categories
  			})
      })
		})
	}
}

exports.new = function(req, res, next){
  Category.find({}, function(err, categories){
    if(err) return next(err)

  	res.render('admin', {
  		title: '爱电影 后台录入页',
  		movie: {},
      categories: categories
  	})
  })
}

exports.getList = function(req, res, next){
	Movie.fetch(function(err, movies){
		if(err) return next(err)

		res.render('list', {
			title: '爱电影 列表页',
			movies: movies
		})
	})
}
	
exports.deleteList = function(req, res, next){
	var id = req.query.id;
  var cid = req.query.cid;

	if(id) {
		Movie.remove({_id: id}, function(err, doc){
			if(err) return next(err);

      res.json({success: 1});
      if(cid){
        Category.findById(cid, function(err, category){
          if(err) return next(err);
          var index = category.movies.indexOf(id);
          category.movies.splice(index, 1);

          category.save(function(err, category){
            if(err) return next(err);      
          })
        })  
      }
		})
	}
}