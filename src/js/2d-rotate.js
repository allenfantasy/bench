// The following is the benchmark for 2D rotation
// move target from 0deg -> 180deg, then reset back to 0deg

var TIME_INTERVAL = 100; 
var DEGREE_MAX_RAD = Math.PI * 2;
var DEGREE_MAX = 360;

require('famous-polyfills');

var Benchmark = require('benchmark');
var greensockTweenMax = require('../../node_modules/gsap/src/uncompressed/TweenMax');
var $ = require('jquery');
var BenchData = require('./helpers/bench');

var suite = new Benchmark.Suite;
var support = Benchmark.support;
var testResults = [];
var targetBox;
var doc = document;
var outputElem = doc.getElementById('benchmark-output');

var famousView = (function() {
  var Engine = require('famous/core/Engine');
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var Transform = require('famous/core/Transform');
  var Transitionable = require('famous/transitions/Transitionable');

  var t = new Transitionable(0);

  var mainContext = Engine.createContext(doc.getElementById('famous-box'));
  var surface = new Surface({
    content: 'famous',
    size: [100, 100]
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
  
  return {
    animate: function(deferred) {
      t.set(DEGREE_MAX_RAD, { duration: TIME_INTERVAL, curve: 'linear' }, function() {
        t.set(0, { duration: 0 });
        //t.set(0, { duration: 0 });
        if (deferred) deferred.resolve();
      });
    },
    clear: function() {
      t.set(0, { duration: 0 });
    }
  }
})();

function clearAll() {
  // Do nothing yeah.
}

/*** Testcases' definitions ***/
var testCases = {
  cssTransition: {
    name: 'css3 transition + css3 rotate',
    defer: true,
    fn: function(deferred) {
      targetbox.className += ' rotated';
      setTimeout(function() {
        deferred.resolve();   
        targetbox.className = 'box';
      }, TIME_INTERVAL);
    },
    setup: function() {
      targetbox = doc.getElementById('css3-rotate-box');
    },
    teardown: function() {}
  },
  famous: {
    name: 'famous',
    defer: true,
    fn: function(deferred) {
      famousView.animate(deferred);
    },
    teardown: function() {}
  },
  greensock: {
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
      targetBox = doc.getElementById('greensock-box');
    },
    teardown: function() {}
  },
  pureJS: {
    name: 'pureJS + CSS3 Rotate',
    defer: true,
    fn: function(deferred) {
      var startTime = new Date();
      function step(DEGREE_MAX, TIME_INTERVAL, targetBox, deferred) {
        var timestamp = new Date();
        var progress = timestamp - startTime;
        var degree = Math.min(progress*DEGREE_MAX/TIME_INTERVAL, DEGREE_MAX)
        targetBox.style['-webkit-transform'] = 'rotate(' + degree + 'deg)';
        targetBox.style['-moz-transform'] = 'rotate(' + degree + 'deg)';
        if (progress < TIME_INTERVAL) {
          requestAnimationFrame(step.bind(this, DEGREE_MAX, TIME_INTERVAL, targetBox, deferred));
        }
        else {
          targetBox.style['-webkit-transform'] = 'rotate(0deg)';
          targetBox.style['-moz-transform'] = 'rotate(0deg)';
          deferred.resolve();
        }
      }
      requestAnimationFrame(step.bind(this, DEGREE_MAX, TIME_INTERVAL, targetBox, deferred));
    },
    setup: function() {
      targetBox = doc.getElementById('js-animate-box');
    },
    teardown: function() {}
  }
};
/*** End of testcases' definitions ***/

/*** suite's definitions ***/
suite.add(testCases.cssTransition);
suite.add(testCases.famous);
suite.add(testCases.greensock);
suite.add(testCases.pureJS);

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
}); $history.on('click', function() {
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
