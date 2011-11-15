$('#indexPage').live('pageinit', function(event) {
	$('#login').click(function() {
		window.location = "./search.html";	
	});
	
	//					$.getJSON('http://api.alternativeto.net/software/'
	//							+$('#searchBox').val()+'/?count=15', 
	//						function(data) {
	//							var items = data.Items;
	//							var list = $('#list');
	//							list.html("");
	//							$.each(items, function(key, val) {
	//								list.append($(document.createElement('li')).html(val.Name));
	//							});
	//							list.listview("destroy").listview()
	//						});
	document.addEventListener("deviceready", onDeviceReady, false);
});

$('#searchPage').live('pageinit', function(event) {
	$('#searchButton').click(function() {
		//$.getJSON('http://api.alternativeto.net/software/'
		//		+$('#searchBox').val()+'/?count=15', 
		//	function(data) {
		//		var items = data.Items;
				var list = $('#list');
				list.html("");
				//$.each(items, function(key, val) {
				list.append($(document.createElement('li')).attr('data-theme', 'c').html('<a href="#recipePage">Kale Salad</a>'));
				list.append($(document.createElement('li')).attr('data-theme', 'c').html('<a href="#recipePage">Red Kale Salad</a>'));
				list.append($(document.createElement('li')).attr('data-theme', 'c').html('<a href="#recipePage">Kale and White Bean Soup</a>'));
				//});
				list.listview("destroy").listview();
	});
});

$('#makeitPage').live('pageinit', function(event) {
	var currYear = (new Date()).getFullYear();
	var datePickerOptions = { preset: 'datetime', theme: 'ios', mode: 'scroller',
		setText: 'Done', startYear: currYear, endYear: currYear + 1, hourText: 'Hour', minuteText: 'Minute',
		dateFormat: 'D M d, yy', timeFormat: 'h:ii A' }; 
	$('#date0').scroller(datePickerOptions);
    $('#date1').scroller(datePickerOptions);
    $('#date2').scroller(datePickerOptions);
    $('#date3').scroller(datePickerOptions);
	$('#setreminders').click(function() {
		$.mobile.changePage("#recipePage", {
			transition: "slide",
			reverse: true,
			changeHash: true
		});	
	});
});

function reachableCallback(reachability) {
	// There is no consistency on the format of reachability
	var networkState = reachability.code || reachability;
	var states = {};
	states[NetworkStatus.NOT_REACHABLE]                      = 'No network connection';
	states[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 'Carrier data connection';
	states[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK]         = 'WiFi connection';
	alert('Connection type: ' + states[networkState]);
}

// PhoneGap is loaded and it is now safe to make calls PhoneGap methods
function onDeviceReady() {
	navigator.network.isReachable('phonegap.com', reachableCallback);
}
