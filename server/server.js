var {env} = require('./config/config');

const _ = require('lodash');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user-model');


// mongoose.connect('mongodb://localhost:27017/TodoList');

var app = express();
var port = process.env.PORT || env;

app.use(bodyParser.json());

app.post('/todos', (req,res)=>{
  var todo = new Todo({
    text: req.body.text,
  });
  todo.save().then((doc)=>{
    res.send(doc);
  }, (e) =>{
    // console.log('shit when wrong', e);
    res.status(400).send(e);
  })
});
app.get('/todos', (req, res) =>{
  Todo.find().then((todos)=>{
    res.send({
      todos
    })
  }, (e)=>{
    res.status(400).send(e);
  })
});

app.get('/todos/:id', (req, res)=> {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Todo.findById(id).then((todo)=>{
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', (req,res) =>{
  //get id.
  var id = req.params.id;

  //validate id
  if(!ObjectID.isValid(id)){
    //if id is not valid: 404 error. Not Found.
    return res.status(404).send();
  }
  //remove by Id
  Todo.findByIdAndRemove(id).then((todo)=>{
    if(!todo){
      //if no to do, set status to not found.
      return res.status(404).send();
    }
    //if found, send response.
    res.send({todo});
  }).catch((e) =>{
    //respond with not found.
    res.status(400).send();
  })

});

// app.update('/todos/:id',)
app.patch('/todos/:id', (req,res)=>{
  var id = req.params.id;
  //make body variable to get subset of thigns passed so user can't update anything they choose.
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }
  if(_.isBoolean(body.completed) && body.completed){
    //true
    body.completedAt = new Date().getTime(); //returns JS timestamp.
  }else{
    //notbool or not true
    body.completed = false;
    body.completedAt = null;
  }
  Todo.findByIdAndUpdate(id,{$set:body},{new: true}).then((todo)=>{
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e)=>{
    res.status(400).sned();
  })
})

app.listen(port, ()=>{
  console.log(`started on port:${port}`);
});

module.exports = {app};
