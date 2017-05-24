var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var{mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user-model');


// mongoose.connect('mongodb://localhost:27017/TodoList');

var app = express();
var port = process.env.PORT || 3000;

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
  // res.send(req.params);
});

app.listen(port, ()=>{
  console.log(`started on port:${port}`);
});
