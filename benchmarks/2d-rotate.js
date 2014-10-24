// The following is the benchmark for 2D rotation
// move target from 0deg -> 180deg

var TIME_INTERVAL = 100; 
var DEGREE_MAX = Math.PI * 1;

require.config({ baseUrl: 'js/' });
require({
  paths: {
    benchmark: 'benchmark/benchmark',
    lodash: 'lodash/dist/lodash',
    platform: 'platform/platform',
    famous: 'famous',
    jquery: 'jquery/jquery',
    greensockTweenLite: 'gsap/src/uncompressed/TweenLite',
    benchdata: '../helpers/bench'
  }
},
['benchmark', 'greensockTweenLite', 'jquery', 'benchdata'], function(Benchmark, TweenLite, $, BenchData) {
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
        t.set(DEGREE_MAX, { duration: TIME_INTERVAL, curve: 'linear' }, function() {
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
      name: 'cssRotate',
      defer: true,
      fn: function(deferred) {
        targetBox.className += ' rotated';
        setTimeout(function() {
          deferred.resolve();   
        }, TIME_INTERVAL);
      },
      setup: function() {
        targetBox = document.getElementById('css3-rotate-box');
      },
      teardown: function() {
        targetBox.className = 'box';
      }
    },
    {
      name: 'famous',
      defer: true,
      fn: function(deferred) {
        famousView.animate(deferred);
      },
      teardown: function() {
        famousView.clear();
      }
    }
    /*,{
      name: 'greensock',
      defer: true,
      fn: function(deferred) {
        TweenLite.fromTo(targetBox, TIME_INTERVAL / 1000, {left: '0px', top: '0px'}, {left: X_MAX + 'px', top: Y_MAX + 'px', onComplete: function() { deferred.resolve(); }});
      },
      setup: function() {
        targetBox = document.getElementById('greensock-box');
      },
      teardown: function() {
        TweenLite.to(targetBox, 0, { left: '0px', top: '0px' });
      }
    },{
      name: 'jquery-animate',
      defer: true,
      fn: function(deferred) {
        $targetBox.animate({
          left: X_MAX + 'px',
          top: Y_MAX + 'px'
        }, TIME_INTERVAL, function() {
          deferred.resolve();
        });
      },
      setup: function() {
        var $targetBox = $('#jquery-animate-box');
      },
      teardown: function() {
        $targetBox.css({
          left: '0px',
          top: '0px'
        });
      }
    }*/];
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
