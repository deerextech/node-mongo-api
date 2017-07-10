var env = process.env.NODE_ENV || 'development';

if(env === 'development' || env === 'test'){
    var config = require('./config.json');
    //need extention because it's not js extention.
    var envConfig = config[env]; //accessing variable property with bracket notation

    Object.keys(envConfig).forEach((key)=>{
      process.env[key] = envConfig[key];
    })
}
