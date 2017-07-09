var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//default mongoose uses callbacks.. but I like promises. Thanks es6!
mongoose.Promise = global.Promise;
//connect to local db
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose, Schema};
