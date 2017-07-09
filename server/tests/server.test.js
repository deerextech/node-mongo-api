const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');
const {User} = require('./../models/user');

beforeEach(populateUsers);

beforeEach(populateTodos);


describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(3);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(3);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123abc')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () =>{
  it('should remove a todo', (done)=>{
    // var hexId = todos[2]._id.toHexString();
    var hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err,res) =>{
        if(err){
          return done(err);
        }
        //query database using findById, it should fail. toNotExist
        //expect(null).toNotExist();
        Todo.findById(hexId).then((todo)=>{
          expect(todo).toNotExist();
          done();
        }).catch((e) =>{ done(e)});
      })
  });
  it('should return 404 if todo not found', (done)=>{
    var hexId = new ObjectID().toHexString();
    request(app)
    .delete(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });
  it('should return 404 if objectID is invalid', (done)=>{
    // var hexId = 'jfdklsa;'
    request(app)
      .delete(`/todos/13sfgsfb12`)
      .expect(404)
      .end(done);
  })
});
describe('PATCH /todos/:id', ()=>{
  it('should update the todo', (done)=>{
    //get id
    var hexId = todos[0]._id.toHexString();
    var text = 'Test Txt';

    request(app)
    .patch(`/todos/${hexId}`)
    .send({
      completed:true,
      text:text,
      })
    .expect(200)
    .expect((res)=>{
      //making sure text matches
      expect(res.body.todo.text).toBe(text);
      expect(res.body.todo.completed).toBe(true);
      expect(res.body.todo.completedAt).toBeA('number');
    })
    .end(done);

  });
  it('should clear completedAt when todo is not completed', (done)=>{
    var hexId = todos[2]._id.toHexString();
    var text = 'Test Txt For clearing completed at case';

    request(app)
    .patch(`/todos/${hexId}`)
    .send({
      completed:false,
      text:text,
      })
    .expect(200)
    .expect((res)=>{
      expect(res.body.todo.text).toBe(text);
      console.log(text);
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toBe(null);
      expect(res.body.todo.completedAt).toNotExist();
    })
    .end(done);
  })
});

describe('GET /users/me', ()=>{
  it('should return user if authenticated', (done) =>{
    //get request. Just needs url
    //then set header. Takes 2 arg: header name & header values
    // so I will need x-auth annnnd then go into users array and access token value.
    request(app)
    .get('/users/me')
    .set('x-auth', users[0].tokens[0].token)
    //now i can make assertions.
    .expect(200)
    .expect((res)=>{
      expect(res.body._id).toBe(users[0]._id.toHexString());
      expect(res.body.email).toBe(users[0].email);
    })
    .end(done);

  });
  it('should return 401 if not auth', (done)=>{
    request(app)
    .get('/users/me')
    .expect(401)
    .expect((res)=>{
      expect(res.body).toEqual({});
    })
    .end(done);
  })
});

describe('POST /users', () =>{
  it('should create a user', (done) =>{
    var username = 'test1';
    var email = 'testemail@test.com';
    var password = 'pass1234';

    request(app)
    .post('/users')
    .send({username,email,password})
    .expect(200)
    .expect((res) =>{
      expect(res.headers['x-auth']).toExist();
      expect(res.body._id).toExist();
      expect(res.body.email).toBe(email);
      expect(res.body.username).toBe(username);
    })
    .end((err) =>{
      if(err){
        //if there is an error
        return done(err);
      }else{
        //find user by email that was inserted.
        User.findOne({email}).then((user)=>{
          //check if inserted user exists
          expect(user).toExist();
          expect(user.username).toEqual(username);
          //makes sure passwords don't match, because if they do it wasn't hashed.
          expect(user.password).toNotBe(password);
          done();
        })
      }
    });
  });
  it('should return validation errors if request invalid', (done) =>{
    var username = ''; //minlength is 5.
    var password = 'k;slaslkflksda';
    var email = 'email@email.com'
    request(app)
    .post('/users')
    .send({username,email,password})
    .expect(400)
    .end(done);
  });
  it('should not create user if email in use', (done) =>{

    request(app)
    .post('/users')
    .send({
      email: users[0].email,
      password:'jkda;fads'
    })
    .expect(400)
    .end(done);
  })
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        username:users[1].username,
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        username: users[1].username,
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
