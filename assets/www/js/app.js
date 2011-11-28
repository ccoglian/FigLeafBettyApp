$('#indexPage').live('pageinit', function(event) {
	$('#login').click(function() {
		window.location = "./search.html";	
	});
	
	document.addEventListener("deviceready", onDeviceReady, false);
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
					
					list.append($(document.createElement('li')).attr('data-theme', 'c').html(
//							"<a data-identity='recipe" + id + "' data-url='?id=" + id + "' href='javascript:void(0);'>" + title + "</a>"));
							"<a data-identity='recipe" + id + "' "
							+ "data-url='/recipe.html?id=" + id + "' "
							+ "href='/recipe.html?id=" + id + "'"
//							+ "data-ajax='false' "
							+ ">" + title + "</a>"));
				});
				
				list.listview("destroy").listview();
			}
			
			$.mobile.hidePageLoadingMsg();
		});
	});
});

//load recipe for selected id
$('div[data-url*="/recipe.html?id"]').live("pageinit", function() {
	var dataurl = $(this).attr("data-url");
	var id = getParameterByName("id", dataurl);
	
	loadRecipe(id); // once the page is loaded, go load the recipe content and set it into the page

	$('#setreminders').click(function() {
		window.history.go(-1);
	});
});

// load a recipe in JSON format from the remote web server
function loadRecipe(id) {
	$.mobile.showPageLoadingMsg();
	
	// this would just be another page in the recipe.html page but then we can't load 
	// recipe.html using ajax and the nice transitions so we pre-load it here and cache
	// it in the DOM
	$.mobile.loadPage('/makeit.html', {showLoadMsg: false});
		
//	var url = 'http://10.0.2.2/recipe/' + id; // for testing on the emulator
	var url = 'http://local.figleafbetty.com/recipe/' + id;
	$.getJSON(url, function(data) {
		var recipe = data.recipe;
		var title = recipe.title;
		var image_url = recipe.image_url;
		var description = recipe.description;
		var recipe_items = data.recipe_items;
		var instructions = recipe.instructions;
		var instruction_list = $.trim(instructions).split(/\n+/);
		var serves = recipe.serves;
		var recipe_reminders = data.recipe_reminders;
		
		$('#recipe_title').html(title);
		$('#recipe_description').html('<img alt="' + title + '" src="' + image_url
				+ '" style="display: block; margin-left: auto; margin-right: auto; width=\'300\'"><br/>' + description);
		$.each(recipe_items, function(key, item) {
			var quantity = toFraction(item.quantity);
			var unit_name = item.quantity <= 1 ? item.unit.unit_name : item.unit.unit_name_plural;
			var item_name = item.item_name;
			var comments = hidenull(item.comments);
			
			$('#recipe_items').append('<tr><td><strong>'
					+ quantity + " " + unit_name + " " + item_name + '</strong> ' + comments + '</td></tr>');
		});
		$.each(instruction_list, function(key, item) {
			if ($.trim(item) != "")
				$('#recipe_instructions').append('<li>' + item + '</li>');
		});
		$('#recipe_serves').html(serves);
		
		// create makeit page
		var now = new Date();
		var earliest_date = now;
		var i = 1;
		
		$('#recipe_reminders').html(
				'<tr>'
		  			+ '<td style="border-bottom: solid 2px #060; padding-bottom: 20px;" id="date0_cell">'
		  				+ '<label for="date0" id="makeit_when" style="display: inline"></label><br/>'
	  				+ '</td>'
               	+ '</tr>');
		
		$.each(recipe_reminders, function(key, item) {
			var description = item.description;
			var hours_ahead = item.hours_ahead;
			var reminder_time = '';
			
			earliest_date = new Date(Math.max(earliest_date.getTime(), now.getTime() + (1000 * 60 * 60 * hours_ahead)));
			
			$('#recipe_reminders').append('<tr><td' + (i == 1 ? ' style="padding-top: 20px;"' : '') + '>'
					+ '<label for="date' + i + '" style="display: inline;">' + description + '</label><br/>'
					+ '<input type="text" name="date' + i + '" id="date' + i + '" class="mobiscroll" '
					+ 'hours_ahead="' + hours_ahead + '" value="' + reminder_time + '" />'
					+ '</td></tr>');
			i++;
		});
		
		// round up to nearest 7pm
		earliest_date.setHours(19);
		earliest_date.setMinutes(0);
		earliest_date.setSeconds(0);
		earliest_date.setMilliseconds(0);
		earliest_date = $.scroller.formatDate('D M d, yy h:ii A', earliest_date);
		
		$('#makeit_when').html("I'm going to make my " + title + " on");
		$('#date0_cell').append('<input onchange="updateReminderTimes();" type="text" name="date0" id="date0" class="mobiscroll" style="min-width: 200px" value="' + earliest_date + '" />');
		
		// add jQuery Mobile styling to dynamically inserted content
		$('#makeitPage').trigger('create');
		
		updateReminderTimes();
		$.mobile.hidePageLoadingMsg();
	});
}

$('#makeitPage').live('pageshow', function(event) {
	var currYear = (new Date()).getFullYear();
	var datePickerOptions = { preset: 'datetime', theme: 'ios', mode: 'scroller',
		setText: 'Done', startYear: currYear, endYear: currYear + 1, hourText: 'Hour', minuteText: 'Minute',
		dateFormat: 'D M d, yy', timeFormat: 'h:ii A' }; 

	// all inputs containing the class mobiscroll should get set up as datepickers
	$('input[class~="mobiscroll"]').scroller(datePickerOptions);
});

function updateReminderTimes() {
	var makeit = new Date($('#date0').val());
	
	$('input[hours_ahead]').each(function(input) {
		var hours_ahead = $(this).attr('hours_ahead');
		var reminder_time = new Date(makeit.getTime() - (1000 * 60 * 60 * hours_ahead));
		
		$(this).val($.scroller.formatDate('D M d, yy h:ii A', reminder_time));
	});
}

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

function toFraction(decimal) {
	var i;
	var epsilon = .00001;
	var MaxDen = 16;
	
	if (decimal == 0) {
		return 0;
	}
	
	for (i = 1; i <= MaxDen; i++) {
		if (Math.abs(Math.round(i * decimal) - (i * decimal)) < epsilon) {
			var whole = Math.floor(decimal);
			var frac = Math.round((decimal - whole) * i) + "/" + i;
			
			return $.trim((whole == 0 ? "" : whole + " ") + (decimal - whole == 0 ? "" : frac));
		}
	}
	
	return decimal;
}

function hidenull(str) {
	return str == null ? "" : str;
}

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
