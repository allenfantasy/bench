function anonymous(t1425969366233) {
  var d1425969366233 = this
    , deferred = d1425969366233
    , m1425969366233 = d1425969366233.benchmark._original
    , f1425969366233 = m1425969366233.fn
    , su1425969366233 = m1425969366233.setup
    , td1425969366233 = m1425969366233.teardown;
  if(!d1425969366233.cycles){
    d1425969366233.fn = function(){
      var deferred=d1425969366233;
      if(typeof f1425969366233=="function") {
        try{
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
        } catch(e1425969366233) {
          f1425969366233(d1425969366233)
        }
      } else {
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
      }
    };
    d1425969366233.teardown = function() { 
      d1425969366233.cycles=0;
      if(typeof td1425969366233=="function") {
        try {
        } catch(e1425969366233) {
          td1425969366233()
        }
      } else {
      }
    };
    if(typeof su1425969366233=="function") { 
      try {
        targetBox = doc.getElementById('js-animate-box');
      }catch(e1425969366233) {
        su1425969366233()
      }
    } else {
      targetBox = doc.getElementById('js-animate-box');
    };
    t1425969366233.start(d1425969366233);
  }
  d1425969366233.fn();
  return{
  }
}
