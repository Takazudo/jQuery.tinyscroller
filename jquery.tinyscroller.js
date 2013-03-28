/*! jQuery.tinyscroller (https://github.com/Takazudo/jQuery.tinyscroller)
 * lastupdate: 2013-03-29
 * version: 0.5.1
 * author: 'Takazudo' Takeshi Takatsudo <takazudo@gmail.com>
 * License: MIT */
(function() {
  var __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function($, window, document) {
    var $doc, $win, abs, min, ns, round;
    ns = {};
    $win = $(window);
    $doc = $(document);
    round = Math.round;
    min = Math.min;
    abs = Math.abs;
    ns.yOf = function(el) {
      var y;
      y = 0;
      while (el.offsetParent) {
        y += el.offsetTop;
        el = el.offsetParent;
      }
      return y;
    };
    ns.isHash = function(str) {
      return /^#.+$/.test(str);
    };
    ns.getWhereTo = function(el) {
      var $el;
      $el = $(el);
      return ($el.data('scrollto')) || ($el.attr('href'));
    };
    ns.calcY = function(target) {
      var $target, y;
      if (($.type(target)) === 'number') {
        return target;
      }
      if (($.type(target)) === 'string') {
        if (!ns.isHash(target)) {
          return false;
        }
        $target = $doc.find(target);
      } else {
        $target = $(target);
      }
      if (!$target.size()) {
        return null;
      }
      y = ns.yOf($target[0]);
      return y;
    };
    ns.scrollTop = function() {
      return $doc.scrollTop() || document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset || 0;
    };
    ns.ua = (function() {
      var evalEach, ret, ua;
      ret = {};
      ua = navigator.userAgent;
      evalEach = function(keys) {
        var matchesAny;
        matchesAny = false;
        $.each(keys, function(i, current) {
          var expr;
          expr = new RegExp(current, 'i');
          if (Boolean(ua.match(expr))) {
            ret[current] = true;
            matchesAny = true;
          } else {
            ret[current] = false;
          }
          return true;
        });
        return matchesAny;
      };
      if (evalEach(['iphone', 'ipod', 'ipad'] || evalEach(['android']))) {
        ret.mobile = true;
      }
      return ret;
    })();
    ns.Event = (function() {

      function Event() {}

      Event.prototype.bind = function(ev, callback) {
        var evs, name, _base, _i, _len;
        if (!this._callbacks) {
          this._callbacks = {};
        }
        evs = ev.split(' ');
        for (_i = 0, _len = evs.length; _i < _len; _i++) {
          name = evs[_i];
          (_base = this._callbacks)[name] || (_base[name] = []);
          this._callbacks[name].push(callback);
        }
        return this;
      };

      Event.prototype.one = function(ev, callback) {
        if (!this._callbacks) {
          this._callbacks = {};
        }
        return this.bind(ev, function() {
          this.unbind(ev, arguments.callee);
          return callback.apply(this, arguments);
        });
      };

      Event.prototype.trigger = function() {
        var args, callback, ev, list, _i, _len, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!this._callbacks) {
          this._callbacks = {};
        }
        ev = args.shift();
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
          return;
        }
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          callback = list[_i];
          if (callback.apply(this, args) === false) {
            break;
          }
        }
        return this;
      };

      Event.prototype.unbind = function(ev, callback) {
        var cb, i, list, _i, _len, _ref;
        if (!this._callbacks) {
          this._callbacks = {};
        }
        if (!ev) {
          this._callbacks = {};
          return this;
        }
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
          return this;
        }
        if (!callback) {
          delete this._callbacks[ev];
          return this;
        }
        for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
          cb = list[i];
          if (!(cb === callback)) {
            continue;
          }
          list = list.slice();
          list.splice(i, 1);
          this._callbacks[ev] = list;
          break;
        }
        return this;
      };

      return Event;

    })();
    ns.Scroller = (function(_super) {
      var eventNames;

      __extends(Scroller, _super);

      eventNames = ['scrollstart', 'scrollend', 'scrollcancel'];

      Scroller.prototype.options = {
        speed: 30,
        maxStep: 2000,
        slowdownRate: 3,
        changehash: true,
        userskip: true,
        selector: 'a[href^=#]:not(.apply-noscroll)',
        adjustEndY: false,
        dontAdjustEndYIfSelectorIs: null,
        dontAdjustEndYIfYis: null
      };

      function Scroller(options) {
        this._stepToNext = __bind(this._stepToNext, this);        if (options) {
          this.option(options);
        }
        this._handleMobile();
      }

      Scroller.prototype._handleMobile = function() {
        if (!ns.ua.mobile) {
          return this;
        }
        this.options.userskip = false;
        return this;
      };

      Scroller.prototype._invokeScroll = function() {
        var _this = this;
        this.trigger('scrollstart', this._endY, this._reservedHash);
        this._scrollDefer.then(function() {
          if (_this.options.changehash && _this._reservedHash) {
            location.hash = _this._reservedHash;
          }
          return _this.trigger('scrollend', _this._endY, _this._reservedHash);
        }, function() {
          return _this.trigger('scrollcancel', _this._endY, _this._reservedHash);
        }).always(function() {
          if (_this._reservedHash) {
            _this._reservedHash = null;
          }
          return _this._scrollDefer = null;
        });
        this._stepToNext();
        return this;
      };

      Scroller.prototype._stepToNext = function() {
        var docH, endDistance, nextY, o, offset, planA, planB, top, winH, _ref, _ref1,
          _this = this;
        top = ns.scrollTop();
        o = this.options;
        if (o.userskip && this._prevY && (top !== this._prevY)) {
          window.scrollTo(0, this._endY);
          if ((_ref = this._scrollDefer) != null) {
            _ref.resolve();
          }
          this._prevY = null;
          return this;
        }
        if (this._endY > top) {
          docH = $doc.height();
          winH = $win.height();
          planA = round((docH - top - winH) / o.slowdownRate);
          planB = round((this._endY - top) / o.slowdownRate);
          endDistance = min(planA, planB);
          offset = min(endDistance, o.maxStep);
          if (offset < 2) {
            offset = 2;
          }
        } else {
          offset = -min(abs(round((this._endY - top) / o.slowdownRate)), o.maxStep);
        }
        nextY = top + offset;
        window.scrollTo(0, nextY);
        this._prevY = nextY;
        if (this._cancelNext) {
          this._cancelNext = false;
          if ((_ref1 = this._scrollDefer) != null) {
            _ref1.reject();
          }
          return this;
        }
        setTimeout(function() {
          var _ref2;
          if ((abs(top - _this._endY) <= 1) || (ns.scrollTop() === top)) {
            window.scrollTo(0, _this._endY);
            _this._prevY = null;
            if ((_ref2 = _this._scrollDefer) != null) {
              _ref2.resolve();
            }
            return _this;
          }
          return _this._stepToNext();
        }, o.speed);
        return this;
      };

      Scroller.prototype.scrollTo = function(target, localOptions) {
        var endY, handleAdjustendy;
        handleAdjustendy = true;
        if (this.options.changehash) {
          handleAdjustendy = false;
        }
        if (this.options.adjustEndY === false) {
          handleAdjustendy = false;
        }
        if ((localOptions != null ? localOptions.adjustEndY : void 0) === false) {
          handleAdjustendy = false;
        }
        if (ns.isHash(target)) {
          this._reservedHash = target;
          if (this.options.dontAdjustEndYIfSelectorIs) {
            if ($doc.find(target).is(this.options.dontAdjustEndYIfSelectorIs)) {
              handleAdjustendy = false;
            }
          }
        }
        endY = ns.calcY(target);
        if (endY === false) {
          return this;
        }
        if (($.type(this.options.dontAdjustEndYIfYis)) === 'number') {
          if (endY === this.options.dontAdjustEndYIfYis) {
            handleAdjustendy = false;
          }
        }
        if ((localOptions != null ? localOptions.adjustEndY : void 0) != null) {
          endY += localOptions.adjustEndY;
        } else {
          if (this.options.adjustEndY !== false) {
            endY += this.options.adjustEndY;
          }
        }
        this._endY = endY;
        this._scrollDefer = $.Deferred();
        this._invokeScroll();
        return this._scrollDefer;
      };

      Scroller.prototype.stop = function() {
        var _this = this;
        return $.Deferred(function(defer) {
          if (_this._scrollDefer) {
            _this._cancelNext = true;
            return _this._scrollDefer.fail(function() {
              return defer.resolve();
            });
          } else {
            return defer.resolve();
          }
        });
      };

      Scroller.prototype.option = function(options) {
        var _this = this;
        if (!options) {
          return this.options;
        }
        this.options = $.extend({}, this.options, options);
        this._handleMobile();
        $.each(eventNames, function(i, eventName) {
          if (_this.options[eventName]) {
            _this.bind(eventName, _this.options[eventName]);
          }
          return true;
        });
        return this;
      };

      Scroller.prototype.live = function(selector) {
        var self;
        selector = selector || this.options.selector;
        self = this;
        $doc.delegate(selector, 'click', function(e) {
          e.preventDefault();
          return self.scrollTo(ns.getWhereTo(this));
        });
        return this;
      };

      return Scroller;

    })(ns.Event);
    $.fn.tinyscrollable = function(options) {
      var scroller;
      scroller = new ns.Scroller(options);
      return this.each(function() {
        var $el;
        $el = $(this);
        $el.data('tinyscroller', scroller);
        if ($el.data('tinyscrollerattached')) {
          return this;
        }
        $el.bind('click', function(e) {
          e.preventDefault();
          return scroller.scrollTo(ns.getWhereTo(this));
        });
        return $el.data('tinyscrollerattached', true);
      });
    };
    $.TinyscrollerNs = ns;
    return $.Tinyscroller = ns.Scroller;
  })(jQuery, window, document);

}).call(this);
