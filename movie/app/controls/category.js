var Category = require('../models/category');
var _ = require('underscore');

exports.save =  function(req, res, next){
  var _category = req.body.category;
  var category = new Category(_category);
  console.log(_category);
  category.save(function(err, categories){
    if(err) return next(err);
    console.log(categories);
    res.redirect('/admin/category/list');
  });
}

exports.update = function(req, res, next){
}

exports.list = function(req, res, next){
    Category.fetch(function(err, categories){
    if(err) return next(err)
    console.log(categories);
    res.render('categoryList', {
      title: '爱电影 分类列表页',
      categories: categories
    })
  })
}

exports.new = function(req, res){
  res.render('categoryAdmin', {
    title: '爱电影 后台分类录入页',
    category: {
      name: ''
    }
  })
}
