var Movie = require('../models/movie');
var Category = require('../models/category');

exports.index = function(req, res, next){
	console.log(req.session.user);

  Category
    .find({})
    .populate({path: 'movies', options:{limit:6}})
    .exec(function(err, categories){
  		if(err) return next(err)

  		res.render('index', {
  			title: '爱电影 首页',
  			categories: categories
  		})
    })
}

exports.search = function(req, res, next){
  var catId = req.query.cat;
  var q = req.query.q;
  var page = parseInt(req.query.p, 10) || 0;
  const count = 3;
  var index = parseInt(page * count);

  if(catId){
    Category
    .find({_id: catId})
    .populate({path: 'movies'})
    .exec(function(err, categories){
      if(err) return next(err)
     
      var category = categories[0] || {}
      var movies = category.movies || []
      var result = movies.slice(index, index + count);

      res.render('result', {
        title: '爱电影 搜索结果页',
        keyword: category.name,
        currentPage: (page + 1),
        query: 'cat=' + catId,
        totalPage: Math.ceil(movies.length / count),
        categories: result
      })
    })
  }else{
    Movie
      .find({title: new RegExp(q + '.*', 'i')})
      .exec(function(err, movies){
      if(err) return next(err)

      var result = movies.slice(index, index + count);
      console.log(result);
      res.render('result', {
        title: '爱电影 搜索结果页',
        keyword: q,
        currentPage: (page + 1),
        query: 'q=' + q,
        totalPage: Math.ceil(movies.length / count),
        categories: result
      })
    })
  }
}
