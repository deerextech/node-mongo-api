const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
  {
  _id: userOneId,
  username:'deerex1',
  email:'dee@test.com',
  password:'dinosaurs123',
  tokens:[{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access:'auth' }, 'MyNameisPrince').toString()
  }]
},
{
  _id: userTwoId,
  username:'deerex2',
  email:'secondUser@test.com',
  password:'userTwoPass'
}];

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  completed:true,
  completedAt: 12342
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed:true,
  completedAt: 1234
},
{
  _id: new ObjectID(),
  text: 'Third test todo'
}
];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) =>{
  User.remove({}).then(()=>{
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(()=>done());
}

module.exports ={
  todos,
  populateTodos,
  users,
  populateUsers
}
