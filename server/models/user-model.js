var{mongoose} = require('../db/mongoose');

var User = mongoose.model('Users', {
  username:{
    type:String,
    required:true,
    minlength:5,
    trim:true
  },
  email:{
    type:String,
    required:true,
    minlength:5,
    trim:true
  }
});

module.exports = {User};


// var newUser = new User({
//   username:'Stevie',
//   email: 'stevethedinosaur@gmail.com'
// });
// newUser.save().then((doc)=>{
//   console.log('user saved', doc);
// },(e)=>{
//   console.log('unable to save because: ', e);
// })
