// The following is the benchmark for 2D rotation
// move target from 0deg -> 180deg, then reset back to 0deg

var TIME_INTERVAL = 100; 
var DEGREE_MAX_RAD = Math.PI * 1;
var DEGREE_MAX = 180;

require.config({ baseUrl: 'js/' });
require({
  paths: {
    benchmark: 'benchmark/benchmark',
    lodash: 'lodash/dist/lodash',
    platform: 'platform/platform',
    famous: 'famous',
    jquery: 'jquery/jquery',
    greensockTweenMax: 'gsap/src/uncompressed/TweenMax',
    benchdata: '../helpers/bench'
  }
},
['benchmark', 'greensockTweenMax', 'jquery', 'benchdata'], function(Benchmark, TweenMax, $, BenchData) {
  var suite = new Benchmark.Suite;
  var support = Benchmark.support;
  var testResults = [];
  var targetBox;
  var outputElem = document.getElementById('benchmark-output');

  var famousView;
  define('famous-view', function(require, exports, module) {
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Transitionable = require('famous/transitions/Transitionable');

    var t = new Transitionable(0);

    var mainContext = Engine.createContext(document.getElementById('famous-box'));
    var surface = new Surface({
      content: 'famous',
      size: [100, 100],
      properties: {
        backgroundColor: 'blue'
      }
    });
    var mod = new Modifier({
      transform: function() {
        return Transform.rotateZ(t.get());
      }
    });
    mainContext.add(new Modifier({
      origin: [.5,.5],
      align: [.5,.5]
    })).add(mod).add(surface);

    module.exports = {
      animate: function(deferred) {
        t.set(DEGREE_MAX_RAD, { duration: TIME_INTERVAL, curve: 'linear' }, function() {
          t.set(0, { duration: 0 });
          if (deferred) deferred.resolve();
        });
      },
      clear: function() {
        t.set(0, { duration: 0 });
      }
    };
  });
  require(['famous-view'], function(view) {
    famousView = view;
  });

  function clearAll() {
    // Do nothing yeah.
  }

  /*** Testcases' definitions ***/
  var testCases = [
    {
      name: 'CSS3 Transition + CSS3 Rotate',
      defer: true,
      fn: function(deferred) {
        targetBox.className += ' rotated';
        setTimeout(function() {
          deferred.resolve();   
          targetBox.className = 'box';
        }, TIME_INTERVAL);
      },
      setup: function() {
        targetBox = document.getElementById('css3-rotate-box');
      },
      teardown: function() {}
    },
    {
      name: 'famous',
      defer: true,
      fn: function(deferred) {
        famousView.animate(deferred);
      },
      teardown: function() {}
    }
    ,{
      name: 'greensock',
      defer: true,
      fn: function(deferred) {
        TweenMax.fromTo(targetBox, TIME_INTERVAL / 1000, 
                         {css: {rotation: 0}},
                         {css: {rotation: DEGREE_MAX}, onComplete: function() {
                           TweenMax.to(targetBox, 0, {css: {rotation: 0}});
                           deferred.resolve();
                         }});
      },
      setup: function() {
        targetBox = document.getElementById('greensock-box');
      },
      teardown: function() {}
    },{
      name: 'pureJS + CSS3 Rotate',
      defer: true,
      fn: function(deferred) {
        var startTime = new Date();
        function step() {
          var timestamp = new Date();
          var progress = timestamp - startTime;
          var degree = Math.min(progress*DEGREE_MAX/TIME_INTERVAL, DEGREE_MAX)
          targetBox.style['-webkit-transform'] = 'rotate(' + degree + 'deg)';
          targetBox.style['-moz-transform'] = 'rotate(' + degree + 'deg)';
          if (progress < TIME_INTERVAL) {
            requestAnimationFrame(step);
          }
          else {
            targetBox.style['-webkit-transform'] = 'rotate(0deg)';
            targetBox.style['-moz-transform'] = 'rotate(0deg)';
            deferred.resolve();
          }
        }
        requestAnimationFrame(step);
      },
      setup: function() {
        targetBox = document.getElementById('js-animate-box');
      },
      teardown: function() {}
    }];
  /*** End of testcases' definitions ***/

  /*** suite's definitions ***/
  testCases.forEach(function(testCase) {
    suite.add(testCase);
  })
  suite.on('cycle', function(event) {
    var bench = event.target;
    testResults.push({
      name: bench.name,
      opsPerSec: Benchmark.formatNumber(bench.hz.toFixed(bench.hz < 100 ? 2 : 0)),
      rme: (support.java ? '+/-' : '\xb1') + bench.stats.rme.toFixed(2),
      size: bench.stats.sample.length,
      bench: {
        name: bench.name,
        opsPerSec: bench.hz.toFixed(2),
        rme: bench.stats.rme.toFixed(2),
        moe: (bench.stats.moe*100).toFixed(2)
      }
    });
    outputElem.innerHTML += '<br />testCase ' + bench.name + ' finished';
    //console.log(bench);
  })
  .on('complete', function() {
    var html = '';
    testResults.forEach(function(testcase) {
      var caseHTML = '<b class="case-name">' + testcase.name + ':</b> ' + testcase.opsPerSec + ' ops/sec ' + testcase.rme + '% ' + '(' + testcase.size + ' run' + (testcase.size == 1 ? '' : 's') + ' sampled)';  
      html += caseHTML + '<br /><br />'; 
    });
    html += 'Fastest is ' + '<span style="color:blue;">' + this.filter('fastest').pluck('name') + '</span>';
    outputElem.innerHTML = html;
    var data = {
      name: 'bench',
      interval: TIME_INTERVAL,
      type: '2d-rotate',
      suites: testResults.map(function(testcase) {
        return testcase.bench; 
      })
    };
    BenchData.post(data, function() {
      console.log('done');
    });
    testResults = [];
    clearAll();
  });
  /*** End of suites definitions ***/

  /*** test controlling ***/
  var $run = $('#run');
  var $history = $('#history');
  var $clear = $('#clear');
  var $deleteOne = $('#delete-one');
  $run.on('click', function() {
    $('#benchmark-output').html('running...');
    suite.run({ async: true });
  });
  $history.on('click', function() {
    BenchData.get(function(data) {
      console.log(data);
    });
  });
  $clear.on('click', function() {
    BenchData.deleteAll(function(result) {
      console.log(result);
      console.log('deleted all');
    });
  });
  $deleteOne.on('click', function() {
    var id = prompt('Which id to delete?');
    if (id !== null) {
      BenchData.deleteOne(id, function() {
        console.log('delete successful');
      });
    }

  });
  /*** End of test controlling ***/

});
