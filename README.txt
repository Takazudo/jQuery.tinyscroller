what this is:

jQuery plugin.
enable smooth scroll.


demo:

http://dl.dropbox.com/u/268240/gitHubDemos/jQuery.tinyscroller/test-basic.html
http://dl.dropbox.com/u/268240/gitHubDemos/jQuery.tinyscroller/test-liveEventify.html
http://dl.dropbox.com/u/268240/gitHubDemos/jQuery.tinyscroller/test-options.html
http://dl.dropbox.com/u/268240/gitHubDemos/jQuery.tinyscroller/test-callbacks.html
http://dl.dropbox.com/u/268240/gitHubDemos/jQuery.tinyscroller/test-callApiDirectly.html


usage:

$(function(){
	$('a[href^=#]').tinyscrollable();
});

// or

$.tinyscroller.scrollTo(3000);

// or

$.tinyscroller.liveEventify();

// see demo pages for more detail


depends on:

jQuery 1.4.4
