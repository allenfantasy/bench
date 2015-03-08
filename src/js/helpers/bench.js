// Benchmark request helper
var $ = require('jquery');
var BenchData = {};
var baseURL = 'http://localhost:3000/benchmarks';

BenchData.get = function(callback) {
  $.get(baseURL, callback, 'json');
}
BenchData.post = function(data, callback) {
  $.post(baseURL, data, callback, 'json');
};
BenchData.deleteAll = function(callback) {
  $.ajax({
    url: baseURL,
    type: 'DELETE',
    success: callback
  });
};
BenchData.deleteOne = function(id, callback) {
  $.ajax({
    url: baseURL + '/' + id,
    type: 'DELETE',
    success: callback
  });
};

module.exports = BenchData; 
