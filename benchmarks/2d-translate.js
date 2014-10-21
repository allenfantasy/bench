// The following is the benchmark for 2D translation
// move x from 0 -> X_MAX
// move y from 0 -> Y_MAX

var TIME_INTERVAL = 100; 
var X_MAX = 100;
var Y_MAX = 100;

require.config({ baseUrl: 'js/' });
require({
  paths: {
    benchmark: 'benchmark/benchmark',
    lodash: 'lodash/dist/lodash',
    platform: 'platform/platform',
    famous: 'famous',
    jquery: 'jquery/jquery',
    greensockTweenLite: 'gsap/src/uncompressed/TweenLite',
  }
},
['benchmark', 'greensockTweenLite', 'jquery'], function(Benchmark, TweenLite, $) {
  var suite = new Benchmark.Suite;
  var support = Benchmark.support;
  var testResults = [];
  var targetBox;

  var famousView;
  define('famous-view', function(require, exports, module) {
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    //var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Transitionable = require('famous/transitions/Transitionable');

    var t = new Transitionable([0,0]);

    var mainContext = Engine.createContext(document.getElementById('famous-box'));
    var surface = new Surface({
      content: 'famous',
      size: [100, 100],
      properties: {
        backgroundColor: 'blue'
      }
    });
    //var mod = new StateModifier({
      //transform: Transform.translate(0,0,0)
    //});
    var mod = new Modifier({
      transform: function() {
        return Transform.translate(t.get()[0], t.get()[1], 0);
      }
    });
    mainContext.add(mod).add(surface);

    module.exports = {
      animate: function(deferred) {
        //mod.setTransform(Transform.translate(X_MAX, Y_MAX, 0), { duration: TIME_INTERVAL, curve: 'linear' }, function() {
          //deferred.resolve();
        //});
        t.set([X_MAX, Y_MAX], { duration: TIME_INTERVAL, curve: 'linear' }, function() {
          deferred.resolve();
        });
      },
      clear: function() {
        //mod.setTransform(Transform.translate(0,0,0), { duration: 0 });
        t.set([0,0], { duration: 0 });
      }
    };
  });
  require(['famous-view'], function(view) {
    famousView = view;
  });

  function clearAll() {
    //TODO: clear all thus we can do more runs
  }

  /*** Testcases' definitions ***/
  var testCases = [
    {
      name: 'jsTopLeft',
      defer: true,
      fn: function(deferred) {
        var start = new Date();
        function step() {
          var timestamp = new Date();
          var progress = timestamp - start;
          targetBox.style.left = Math.min(progress*X_MAX/TIME_INTERVAL, X_MAX) + 'px';
          targetBox.style.top = Math.min(progress*Y_MAX/TIME_INTERVAL, Y_MAX) + 'px';
          if (progress < TIME_INTERVAL) {
            requestAnimationFrame(step);
          }
          else {
            deferred.resolve();
          }
        }
        requestAnimationFrame(step);  
      },
      setup: function() {
        targetBox = document.getElementById('topleft-box');
        targetBox.className += ' absolute';
        targetBox.style.top = '0px';
        targetBox.style.left = '0px';
      },
      teardown: function() {
        targetBox.style.top = '0px';
        targetBox.style.left = '0px';
      },
      onComplete: function() {
        document.getElementById('topleft-box').className = 'box';
      }
    },{
      name: 'jsTranslate3d',
      defer: true,
      fn: function(deferred) {
        targetBox.className += ' translate3d';
        setTimeout(function() {
          deferred.resolve();   
        }, TIME_INTERVAL);
      },
      setup: function() {
        targetBox = document.getElementById('translate3d-box');
      },
      teardown: function() {
        targetBox.className = 'box';
      }
    },{
      name: 'famous',
      defer: true,
      fn: function(deferred) {
        famousView.animate(deferred);
      },
      teardown: function() {
        famousView.clear();
      }
    },{
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
      size: bench.stats.sample.length
    });
    console.log('testCase ' + bench.name + ' finished');
    console.log(bench);
  })
  .on('complete', function() {
    var html = '';
    testResults.forEach(function(testcase) {
      var caseHTML = '<b class="case-name">' + testcase.name + ':</b> ' + testcase.opsPerSec + ' ops/sec ' + testcase.rme + '% ' + '(' + testcase.size + ' run' + (testcase.size == 1 ? '' : 's') + ' sampled)';  
      html += caseHTML + '<br /><br />'; 
    });
    html += 'Fastest is ' + '<span style="color:blue;">' + this.filter('fastest').pluck('name') + '</span>';
    document.getElementById('benchmark-output').innerHTML = html;
    testResults = [];
    clearAll();
  });
  /*** End of suites definitions ***/

  /*** test controlling ***/
  var run = document.getElementById('run');
  run.addEventListener('click', function() {
    document.getElementById('benchmark-output').innerHTML = 'running...';
    suite.run({ async: true });
  });
  /*** End of test controlling ***/

});
