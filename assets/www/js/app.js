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

function getParameterByName(name, inputstring) {
    var ips;
    
    if (inputstring.length == 0)
        ips = window.location;
    else
        ips = inputstring;
    
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(ips);
    
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function errorMessageToast(msg) {
	$("<div id='notification' class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>"+msg+"</h1></div>")
		.css({"display": "block", "opacity": 0.96, "top": $(window).scrollTop() + 100})
		.appendTo($.mobile.pageContainer)
		.delay(800) 
		.fadeOut(800, function() { $(this).remove(); });
}

// load a recipe in JSON format from the remote web server
function loadRecipe(id) {
	$.mobile.showPageLoadingMsg();
	
//	var url = 'http://10.0.2.2/recipe/' + id; // for testing on the emulator
	var url = 'http://local.figleafbetty.com/recipe/' + id;
	$.getJSON(url, function(data) {
		var title = data.title;
		var body = data.body;
		
		$('#recipe_title').html(title);
		$('#recipe_body').html(body);
		$.mobile.hidePageLoadingMsg();
	});
}

// make the search results take you to the specific recipe page
$('div[id="searchPage"] ul[data-role="listview"] a').live("click", function() {
	var dataurl = $(this).attr("data-url");
	if (dataurl != null) {
		var id = getParameterByName("id", dataurl);
		var opts = {'data-url': "/recipe.html?id=" + id};
		
		$.mobile.changePage("/recipe.html?id=" + id, opts); // go to the data url of the link
	}
});

//load recipe for selected id
$('div[data-url*="/recipe.html?id"]').live("pageinit", function() {
	var dataurl = $(this).attr("data-url");
	var id = getParameterByName("id", dataurl);
	
	loadRecipe(id); // once the page is loaded, go load the recipe content and set it into the page
});

$('#searchPage').live('pageinit', function(event) {
	$('#searchButton').click(function() {
		var key = $("#searchBox").val();
		
		if (key == "") return;
		
		$.mobile.showPageLoadingMsg();
		
	//	var url = 'http://10.0.2.2/recipe/' + id; // for testing on the emulator
		var url = 'http://local.figleafbetty.com/search/' + key;
		$.getJSON(url, function(data) {
			if (data.length == 0) {
				errorMessageToast('No results found');
			} else {
				var list = $('#list');
				
				list.html("");
				$.each(data, function(key, val) {
					var id = val.id;
					var title = val.title;
					
					list.append($(document.createElement('li')).attr('data-theme', 'c').html("<a data-identity='recipe" + id + "' data-url='?id=" + id + "' href='javascript:void(0);'>" + title + "</a>"));
				});
				
				list.listview("destroy").listview();
			}
			
			$.mobile.hidePageLoadingMsg();
		});
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
		window.history.go(-1);
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
