var restify = require('restify')
  , mongoose = require('mongoose')
  , relationship = require('mongoose-relationship');

mongoose.connect('mongodb://localhost/benchmark');

// Model
var Schema = mongoose.Schema;

var SuiteSchema = new Schema({
  name: String,
  opsPerSec: Number, // The number of executions per second. hz = 1 / mean
  rme: Number, // relative margin of error 
  moe: Number, // margin of error
  benchmark: { type: Schema.ObjectId, ref: 'Benchmark', childPath: 'suites' }
});
var BenchmarkSchema = new Schema({
  name: String,
  interval: Number, // ms
  type: String,
  timestamp: { type: Date, default: Date.now }, 
  suites: [SuiteSchema]
});
var Benchmark = mongoose.model('Benchmark', BenchmarkSchema);

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
  Benchmark.findById(req.params.id, function(err, benchmark) {
    if (err) {
      res.send(404, {});
      return;
    }
    res.send(200, benchmark);
  });
  next();
});

server.get('/benchmarks', function(req, res, next) {
  Benchmark.find({}, function(err, benchmarks) {
    res.send(200, benchmarks);
  });
});

server.post('/benchmarks', function(req, res, next) {
  Benchmark.create({ 
    name: req.params.name,
    inteval: req.params.interval,
    type: req.params.type,
    suites: req.params.suites
  }, function(err, benchmark) {
    if (err) {
      console.log('something fucked up');
      console.log(err);
      res.send(500, {});
    } else {
      res.send(201, benchmark);
    }
  });
});

server.put('/benchmarks/:id', function(req, res, next) {
  // TODO
});

server.del('/benchmarks/:id', function(req, res, next) {
  Benchmark.remove({ _id: req.params.id }, function(err) {
    if (err) {
      console.log(err);
      res.send(500, err);
    }
    else {
      res.send(200);
    }
  });
});

server.del('/benchmarks', function() {
  Benchmark.collection.remove(function(err) {
    if (err) {
      console.log(err);
      res.send(500);
    }
    else {
      res.send(200);
    }
  });
});

server.listen(3000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
