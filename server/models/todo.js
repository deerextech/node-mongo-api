var{mongoose, Schema} = require('../db/mongoose');


var Todo = mongoose.model('Todo', {
  text:{
    type: String,
    required:true,
    minlength:1,
    trim: true
  },
  completed:{
    type:Boolean,
    default: false
  },
  completedAt:{
    type:Number,
    default: null
  }
});

module.exports = {Todo};

//
//
//
// var newTodoItem = new Todo({
//   text:'New Item',
//   completed:true,
//   completedAt: 0123
// });
//
// //save returns promise
// newTodoItem.save().then((doc)=>{
//   console.log('Saved todo', doc);
// },(e)=>{
//   console.log('unable to save todo', e)
// });


//could or, i guess would move this to another file normally.
// but, this is an example of an alternative validation for mongoose.
// var toDoSchema = new Schema({
//   text:{
//     type: String,
//     required:true,
//     minlength:1,
//     trim: true
//   },
//   completed:{
//     type:Boolean,
//     default: false
//   },
//   completedAt:{
//     type:Number,
//     default: null
//   }
// });
//
// //data model for todo list
// var Todo = mongoose.model('Todo', toDoSchema);
