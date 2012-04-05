
(function($, window, document) {
  var ns, wait;
  ns = $.TinyscrollerNs;
  wait = function(time) {
    return $.Deferred(function(defer) {
      return setTimeout(function() {
        return defer.resolve();
      }, time);
    });
  };
  QUnit.testDone(function() {});
  asyncTest('Event bind/trigger', function() {
    var eventer;
    expect(1);
    eventer = new ns.Event;
    eventer.bind('foo', function() {
      ok(true, 'foo event triggered');
      return start();
    });
    return eventer.trigger('foo');
  });
  asyncTest('Event bind with args', function() {
    var eventer;
    expect(4);
    eventer = new ns.Event;
    eventer.bind('foo', function(arg1, arg2, arg3) {
      ok(true, 'foo event triggered');
      equal(arg1, 1, 'arg was passed');
      equal(arg2, 2, 'arg was passed');
      equal(arg3, 3, 'arg was passed');
      return start();
    });
    return eventer.trigger('foo', 1, 2, 3);
  });
  asyncTest('Event unbind', function() {
    var eventer;
    expect(1);
    eventer = new ns.Event;
    eventer.bind('foo', function() {
      return ok(false, 'event was fired');
    });
    eventer.unbind('foo');
    eventer.trigger('foo');
    return wait(0).done(function() {
      ok(true, 'event was not fired');
      return start();
    });
  });
  asyncTest('Event one', function() {
    var eventer;
    expect(1);
    eventer = new ns.Event;
    eventer.one('foo', function() {
      return ok(true, 'event was fired');
    });
    eventer.trigger('foo');
    eventer.trigger('foo');
    eventer.trigger('foo');
    return wait(0).done(function() {
      return start();
    });
  });
  return $(function() {
    $('<div>x</div>').css({
      height: 5000,
      width: 3,
      background: 'red'
    }).appendTo('body');
    test('yOf', function() {
      var $test1, res, scroller;
      scroller = new ns.Scroller;
      $test1 = $('<div>foo</div>').appendTo('body');
      $test1.css({
        position: 'absolute',
        left: 200,
        top: 400,
        width: 200,
        height: 200,
        background: 'red'
      });
      res = ns.yOf($test1[0]);
      equal(res, 400, "yOf returned " + res);
      return $test1.remove();
    });
    test('calcY', function() {
      var $test1, res;
      $test1 = $('<div id="foo">foo</div>').appendTo('body');
      $test1.css({
        position: 'absolute',
        left: 200,
        top: 400,
        width: 200,
        height: 200,
        background: 'red'
      });
      res = ns.calcY($test1);
      equal(res, 400, "calcY(jQueryObject) " + res);
      res = ns.calcY($test1[0]);
      equal(res, 400, "calcY(rawElement) " + res);
      res = ns.calcY(300);
      equal(res, 300, "calcY(300) " + res);
      res = ns.calcY($('#nothingthere'));
      equal(res, null, "non exsisted element " + res);
      return $test1.remove();
    });
    test('Scroller instance creation', function() {
      var scroller;
      scroller = new ns.Scroller;
      return ok(scroller instanceof ns.Scroller, 'done');
    });
    asyncTest('Scroller scrollTo below', function() {
      var defer, scroller;
      expect(3);
      scroller = new ns.Scroller;
      scroller.one('scrollstart', function() {
        return ok(true, 'scrollstart fired');
      });
      scroller.one('scrollend', function() {
        return ok(true, 'scrollend fired');
      });
      defer = scroller.scrollTo(3000);
      return defer.done(function() {
        ok(true, 'deferred worked');
        return start();
      });
    });
    asyncTest('Scroller scrollTo above', function() {
      var defer, scroller;
      expect(3);
      scroller = new ns.Scroller;
      scroller.one('scrollstart', function() {
        return ok(true, 'scrollstart fired');
      });
      scroller.one('scrollend', function() {
        return ok(true, 'scrollend fired');
      });
      defer = scroller.scrollTo(0);
      return defer.done(function() {
        ok(true, 'deferred worked');
        return start();
      });
    });
    asyncTest('Scroller scrollTo repeat', function() {
      var count, oneDone, scroller;
      expect(8);
      scroller = new ns.Scroller;
      count = 0;
      oneDone = function() {
        return wait(0).done(function() {
          count++;
          if (count === 4) {
            return start();
          } else {
            if (count % 2 === 1) {
              return scroller.scrollTo(0);
            } else {
              return scroller.scrollTo(3000);
            }
          }
        });
      };
      scroller.bind('scrollstart', function() {
        return ok(true, 'scrollstart fired');
      });
      scroller.bind('scrollend', function() {
        ok(true, 'scrollend fired');
        return oneDone();
      });
      return scroller.scrollTo(3000);
    });
    return asyncTest('Scroller stop', function() {
      var defer, scroller;
      expect(3);
      scroller = new ns.Scroller;
      scroller.bind('scrollstart', function() {
        return ok(true, 'scrollstart fired');
      });
      scroller.bind('scrollend', function() {
        return ok(false, 'scrollend fired');
      });
      scroller.bind('scrollcancel', function() {
        return ok(true, 'scrollcancel fired');
      });
      defer = scroller.scrollTo(3000);
      defer.fail(function() {
        ok(true, 'deferred worked');
        window.scrollTo(0, 0);
        return start();
      });
      return wait(100).done(function() {
        return scroller.stop();
      });
    });
  });
})(jQuery, this, this.document);
