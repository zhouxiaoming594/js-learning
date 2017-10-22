var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
	name: {
		unique: true,
		type: String
	},
	password: String,
	//0: nomal user
	//1: verified user
	//2: professonal user
	// >10: admin
	role: {
		type: Number,
		default: 20
	},
	meta: {
		createAt: {
			type:Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
});

UserSchema.pre('save', function(next){
	var user = this;
	//更新时间
	if(this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else{
		this.meta.updateAt = Date.now()
	}
	//密码加盐
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
		if (err) return next(err)
		bcrypt.hash(user.password, salt, function(err, hash){
			if (err) return next(err);

			user.password = hash;
			next();
		});
	});
});

UserSchema.methods = {
	comparePassword: function(_password, cb){
		console.log('?',this.password);
		bcrypt.compare(_password, this.password, function(err, isMatch){
			if(err) return cb(err, null);

			cb(null, isMatch);
		})
	}
}

UserSchema.statics = {
	fetch: function(cb){
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb)
	}
}

module.exports = UserSchema;