const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb");

const {app} = require("./../server");
const {Todo} = require("./../models/todo");

const todos = [{
  _id: new ObjectID(),
  text: "Первый тест задачи"
}, {
  _id: new ObjectID(),
  text: "Второй тест задачи"
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe("POST /todos", () => {
  it("создаст новую задачу", (done) => {
    var text = "Текст на пробу";
    request(app)
    .post("/todos")
    .send({text})
    .expect(200)
    .expect((res)=> {
      expect(res.body.text).toBe(text);
    })
    .end((err, res) => {
      if(err){
        return done(err);
      }

      Todo.find({text}).then((todos)=> {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch((e) => done(e));
    });
  });
  it("с кривыми данными создать новую задачу не выйдет", (done) => {
    request(app)
    .post("/todos")
    .send({})
    .expect(400)
    .end((err, res) => {
      if(err){
        return done(err);
      }
      Todo.find().then((todos)=>{
        expect(todos.length).toBe(2);
        done();
      }).catch((e) => done(e));
    });
  });
});
describe("GET /todos", () => {
  it("получит все задачи", (done) => {
    request(app)
    .get("/todos")
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2);
    })
    .end(done);
  });
});
describe("GET /todos/:id", ()=>{
  it("вернет doc задачи", (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res)=>{
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });
  it("вернет 404, если не найдется задача", (done) => {
      var hexId = new ObjectID().toHexString();

      request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });
  it("вернет 404 id", (done) => {
    request(app)
    .get("/todos/123abc")
    . expect(404)
    .end(done);
  });
});
