var  {User} = require('./../models/user')
;
//middleware for authentication.
var authenticate = (req,res,next)=>{
  //need token value
  var token = req.header('x-auth');
  //req.header gets value, so you only need key

  User.findByToken(token).then((user)=>{
    //this is taking returned promise from user findbyToken method

    if(!user){
      //if no user
      return Promise.reject();
      //will send to catch and error will state this action is unauthorized.

    }
  req.user = user;
  req.token = token;
  next(); // so get will execute.

  }).catch((e)=>{
    res.status(401).send();
  });
}

module.exports = {
  authenticate
}
