# jQuery.tinyscroller - changelog

## v.0.3.0

allowed plural options for scrolling.  
In previous version, basically scrolling options are shared with all anchors.  
But for this, APIs were changed.

## v.0.2.3

userskip was bugged in iOS. This was caused by iOS's scrollTop mechanism was different from desktop browser.  
forced `userskip:false` if iOS or Android.

## v.0.2.2

Added "userskip" feature.  
With this, user's manually scroll while auto scrolling skips all scroll steps then finishes auto scrolling immediately.

## v.0.2.1

BugFix: deferred.resolve was called unexpectedly.  
This raised error.

## v.0.2.0

refactored with CoffeeScript

## v.0.1.0

release

