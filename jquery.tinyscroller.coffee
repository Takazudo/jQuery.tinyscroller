(($, window, document) -> # encapsulate whole start
  
  ns = {}
  $win = $(window)
  $doc = $(document)

  # we use math here
  
  round = Math.round
  min = Math.min
  abs = Math.abs


  # ============================================================
  # tiny utils
  
  # yOf

  ns.yOf = (el) ->
    y = 0
    while el.offsetParent
      y += el.offsetTop
      el = el.offsetParent
    y

  # isHash - is '#foobar' or not

  ns.isHash = (str) ->
    return /^#.+$/.test str

  # getWhereTo - find where to go

  ns.getWhereTo = (el) ->
    $el = $(el)
    ($el.data 'scrollto') or ($el.attr 'href')

  # calcY - caliculate Y of something

  ns.calcY = (target) ->

    # if target was number, do nothing
    if ($.type target) is 'number'
      return target

    # if target was string, try to find element
    if ($.type target) is 'string'

      # it must be hashval like '#foobar'
      if not ns.isHash target then return false

      # try to get y of the target
      $target = $doc.find target

    # else, it must be element
    else
      $target = $(target)

    if not $target.size() then return null
    y = ns.yOf $target[0]
    y

  # browser thing

  ns.scrollTop = ->
    $doc.scrollTop() or document.documentElement.scrollTop or document.body.scrollTop or window.pageYOffset or 0

  # browser detection

  ns.ua = do ->
    ret = {}
    ua = navigator.userAgent
    evalEach = (keys) ->
      matchesAny = false
      $.each keys, (i, current) ->
        expr = new RegExp current, 'i'
        if (Boolean ua.match(expr))
          ret[current] = true
          matchesAny = true
        else
          ret[current] = false
        true
      matchesAny
    if evalEach ['iPhone', 'iPod', 'iPad']
      ret.appleDevice = true
    evalEach ['Android']
    ret

  console.log ns.ua

  # ============================================================
  # event module

  class ns.Event

    constructor: ->
      @_callbacks = {}

    bind: (ev, callback) ->
      evs = ev.split(' ')
      for name in evs
        @_callbacks[name] or= []
        @_callbacks[name].push(callback)
      @

    one: (ev, callback) ->
      @bind ev, ->
        @unbind(ev, arguments.callee)
        callback.apply(@, arguments)

    trigger: (args...) ->
      ev = args.shift()
      list = @_callbacks?[ev]
      return unless list
      for callback in list
        if callback.apply(@, args) is false
          break
      @

    unbind: (ev, callback) ->
      unless ev
        @_callbacks = {}
        return @

      list = @_callbacks?[ev]
      return this unless list

      unless callback
        delete @_callbacks[ev]
        return this

      for cb, i in list when cb is callback
        list = list.slice()
        list.splice(i, 1)
        @_callbacks[ev] = list
        break
      @


  # ============================================================
  # Scroller

  class ns.Scroller extends ns.Event
    
    options:

      speed : 30 # scrollstep interval
      maxStep: 2000 # max distance(px) per scrollstep
      slowdownRate: 3 # something to define slowdown rate
      changehash: true # change hash after scrolling or not
      userskip: true # skip all scrolling steps if user scrolled manually while scrolling
      selector: 'a[href^=#]:not(.apply-noscroll)' # selector for delegation event binding

    constructor: (options) ->
      if options then @option options
      @_handleMobile()
      super

    _handleMobile: ->
      # iOS's scrollTop is pretty different from desktop browsers.
      # This feature must be false
      if not ns.ua.appleDevice then return @
      @options.userskip = false
      @

    _invokeScroll: ->
      @trigger 'scrollstart', @_endY, @_reservedHash
      @_scrollDefer.then =>
        if @options.changehash and @_reservedHash
          location.hash = @_reservedHash
        @trigger 'scrollend', @_endY, @_reservedHash
      , =>
        @trigger 'scrollcancel', @_endY, @_reservedHash
      .always =>
        if @_reservedHash
          @_reservedHash = null
        @_scrollDefer = null
      @_stepToNext()
      @

    _stepToNext: =>

      top = ns.scrollTop() # current scrollposition
      o = @options

      # if @_prevY and top were not same, it must the user scrolled manually.
      # in such case, skip all scrolling immediately.
      if o.userskip and @_prevY and (top isnt @_prevY)
        window.scrollTo 0, @_endY
        @_scrollDefer?.resolve()
        @_prevY = null
        return @

      # the end point is below the winow
      if @_endY > top

        docH = $doc.height()
        winH = $win.height()

        # try to calc how long the next scrolling go here.
        # this is pretty complicated but is necessary to make it smooth.
        # calc planA and planB, then choose shorter distance.
        planA = round( (docH-top-winH) / o.slowdownRate )
        planB = round( (@_endY-top) / o.slowdownRate )
        endDistance = min(planA, planB)

        # if the distance was too long. normalize it with maxStep
        offset = min( endDistance, o.maxStep )

        # need to move at least 2px
        if offset < 2 then offset = 2

      # the end point is above the winow
      else
        offset = - min(abs(round((@_endY-top) / o.slowdownRate)), o.maxStep)

      # do scroll
      nextY = top + offset
      window.scrollTo 0, nextY
      @_prevY = nextY

      # if cancel was reserved, stop this
      if @_cancelNext
        @_cancelNext = false
        @_scrollDefer?.reject()

      # check whether the scrolling was done or not
      else if (abs(top - self._endY) <= 1) or (ns.scrollTop() is top)
        window.scrollTo 0, @_endY
        @_prevY = null
        @_scrollDefer?.resolve()

      # else, keep going
      else
        setTimeout @_stepToNext, o.speed

      @

    scrollTo: (target) ->

      # if the target was hash, reserve it
      if ns.isHash target
        @_reservedHash = target

      # try to calc endY
      endY = ns.calcY target
      if endY is false then return @
      @_endY = endY

      # this defer tells scroll end
      @_scrollDefer = $.Deferred()

      # start!
      @_invokeScroll()

      # we need deferred to know scrollend
      @_scrollDefer


    stop: ->
      # stop can't stop the scorlling immediately.
      # reserve to stop next one.
      if @_scrollDefer then @_cancelNext = true
      @

    option: (options) ->
      if not options then return @options
      $.extend this.options, options
      @_handleMobile()
      @

    live: (selector) ->
      selector = selector or @options.selector
      self = @
      $doc.on 'click', selector, (e) ->
        e.preventDefault()
        self.scrollTo (ns.getWhereTo @)
      @


  # instancify
  
  $.tinyscroller = new ns.Scroller


  # ============================================================
  # jQuery bridges

  $.fn.tinyscrollable = ->
    @each ->
      $el = $(@)
      if $el.data 'tinyscrollerattached' then return @
      $el.on 'click', (e) ->
        e.preventDefault()
        $.tinyscroller.scrollTo (ns.getWhereTo @)
      $el.data 'tinyscrollerattached', true


  # ============================================================
  
  # globalify
  
  $.TinyscrollerNs = ns
  $.Tinyscroller = ns.Scroller


) jQuery, @, @document # encapsulate whole end
