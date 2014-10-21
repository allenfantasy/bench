var restify = require('restify')
  , mongoose = require('mongoose')
  , relationship = require('mongoose-relationship');

mongoose.connect('mongodb://localhost/benchmark');

// Model
var Schema = mongoose.Schema;
var BenchmarkSchema = new Schema({
  name: String,
  interval: Number, // ms
  type: String
});

var SuiteSchema = new Schema({
  name: String,
  opsPerSec: Number, // The number of executions per second. hz = 1 / mean
  rme: Number, // relative margin of error 
  moe: Number // margin of error
});

var Benchmark = mongoose.model('Benchmark', BenchmarkSchema);
var Suite = mongoose.model('Suite', SuiteSchema);

var server = restify.createServer({
  name: 'api-server',
  version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

server.get('/benchmarks/:id', function(req, res, next) {
  Message.findById(req.params.id, function(err, message) {
    if (err) {
      res.send(404, {});
      return;
    }
    res.send(200, message);
    //res.send(req.params);
  });
  next();
});

server.get('/benchmarks', function(req, res, next) {
  Message.find({}, function(err, benchmarks) {
    res.send(200, benchmarks);
  });
});

server.post('/benchmarks', function(req, res, next) {
  Message.create({ message: req.params.message, author: req.params.author, date: new Date() }, function(err, message) {
    res.send(201, message);
  });
});

server.put('/benchmarks/:id', function(req, res, next) {
});

server.del('/benchmarks/:id', function remove(req, res, next) {
});

server.listen(3000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
