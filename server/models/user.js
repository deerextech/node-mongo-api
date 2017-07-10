const {mongoose} = require('../db/mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

//Time to make some middleware for pass hashing & salting.
//http://mongoosejs.com/docs/middleware.html

var UserSchema = new mongoose.Schema({
  username:{
    type:String,
    minlength:5,
    trim:true,
    required:true,
    uniqure:true
  },
  email:{
    type:String,
    required:true,
    minlength:1,
    trim:true,
    unique:true,
    validate: {
      validator: validator.isEmail,
      message:'{VALUE} is not a valid email'
      }
    },
    password: {
      type:String,
      required:true,
      minlength:6
    },
    tokens:[{
      access:{
        type:String,
        required:true
      },
      token:{
        type:String,
        required: true
      }
    }]

});

//determines what is sent back when a mongoose model is converted into JSON value.
UserSchema.methods.toJSON = function(){
  var user = this;
  //toObject takes mongoose var and converts it to obj where only properties specified exist
  var userObject = user.toObject();
  //return the desired (public) properies.
  return _.pick(userObject, ['_id','username', 'email']);
};

//methods = object. Can add instance methods.
UserSchema.methods.generateAuthToken = function(){
  //not using arrow function here for specific reason: arrow functions do not bind 'this' keyword
  // and I need this for this. (haha)
  var user = this; // referencing self. instance methods get called with individual document
  var access = 'auth';
  var token = jwt.sign({_id:user._id.toHexString(), access}, 'MyNameisPrince').toString();
  //now data is generated and need to update users token array.

  user.tokens.push({
    //pushign new obj with access & tokens
    access, //access:access equiv
    token
  });
   //changes made to user model, currently updating local model, but not save
   //save returns a promise. whooooOoo
   return user.save().then(()=>{
     return token; //server file will have access to token .. it will chain on to this returned promise success.
   })
}

UserSchema.methods.removeToken = function(token){
  //$pull mongo operator that removes based on criteria
  var user = this;
    return user.update({
    $pull:{
      tokens:{token}
    }
  });
};

UserSchema.statics.findByToken = function(token){
  var User = this; //model method is this binding.
  var decoded; //undefind. will store values.

  try{
    decoded = jwt.verify(token,'MyNameisPrince');
  }catch(e){
    //if verify fails.
    return Promise.reject();
    //vv equiv of writing it like this:
    // return new Promise((resolve,reject)=>{
    //   reject(); //server will reject promise
    // })
  }
  //success case
 return User.findOne({
   '_id':decoded._id,
   'tokens.token':token,
   'tokens.access':'auth'
 })
 //find associated user. Returns promise, and we return that promise.
}


UserSchema.statics.findByCredentials = function(username, email, password){
    var User = this;

    return User.findOne({username, email}).then((user)=>{
      if(!user){
        return Promise.reject();
      }
      return new Promise((resolve,reject) =>{
        //pass password argument, user.password and callback
        bcrypt.compare(password, user.password, (err,res)=>{
          if(res){
            resolve(user);
          }else{
            reject();
          }
        });
      });
    });
};
//salt & hashes password before document is saved.
//don't forget next argument!!
UserSchema.pre('save', function(next){
  var user = this;
  if(user.isModified('password')){
    bcrypt.genSalt(10,(err,salt)=>{
      //salt the snaaail.
      bcrypt.hash(user.password,salt,(err,hash)=>{
        user.password = hash;
        next();
      })
    })
    //returns bool.

  }else{next();}
});

var User = mongoose.model('User', UserSchema);


// var newUser = new User({
//   username:'Stevie',
//   email: 'stevethedetroitdinosaur@gmail.com',
//   password:'123456'
// });
// newUser.save().then((doc)=>{
//   console.log('user saved', doc);
// },(e)=>{
//   console.log('unable to save because: ', e);
// });

module.exports = {User};
