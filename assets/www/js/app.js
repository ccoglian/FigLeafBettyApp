function getRemoteBaseURL() {
	//return 'http://10.0.2.2'; // for testing on the emulator
//	return 'http://local.figleafbetty.com';
	return 'http://localhost';
}

$('#indexPage').live('pageinit', function(event) {
	$('#login').click(function(e) {
		e.preventDefault();
		
		var url = getRemoteBaseURL() + '/login';
		
		$.mobile.showPageLoadingMsg();
		
		$.post(url, $('#loginForm').serialize(), function(data) {
			var success = data.success;
			
			$.mobile.hidePageLoadingMsg();
			
			if (success) {
				$.cookie('email', $('#email').val());
				window.location = './home.html';
			} else {
				$('td[id$="_status_box"]').html(''); // ends with
                $.each(data.errors, function(key, value) {
                    $('#' + key + '_status_box').html(getStatusBox($('label[for=' + key + ']').text() + ':', value, 'error'));
                });
			}
		});
	});
	
	document.addEventListener("deviceready", onDeviceReady, false);
	
	var loggedIn = $.cookie('email');
	if (loggedIn != null && loggedIn.length > 0) {
		window.location = './home.html';
	}
});

$('#signupPage').live('pageinit', function(event) {
	$('#signupButton').click(function(e) {
		e.preventDefault();
		
		var url = getRemoteBaseURL() + '/signup';
		
		$.mobile.showPageLoadingMsg();
		
		$.post(url, $('#signupForm').serialize(), function(data) {
			var success = data.success;
			
			$.mobile.hidePageLoadingMsg();
			
			if (success) {
				errorMessageToast('Thanks!');
				$.cookie('email', $('#email').val());
				setTimeout("window.location='./home.html'", 1000);
			} else {
				$('td[id$="_status_box"]').html(''); // ends with
                $.each(data.errors, function(key, value) {
                    $('#' + key + '_status_box').html(getStatusBox($('label[for=' + key + ']').text() + ':', value, 'error'));
                });
			}
		});
	});
	
	document.addEventListener("deviceready", onDeviceReady, false);
});

$('#searchPage').live('pageinit', function(event) {
    $('#searchBox').val(getLocalStorage('lastSearchKey', ''));
	$('#searchButton').click(function(e) {
		e.preventDefault();
		
		var key = $("#searchBox").val();
		
		if (key == "") return;
		
		putLocalStorage('lastSearchKey', key);
		
		$.mobile.showPageLoadingMsg();
		
		var url = getRemoteBaseURL() + '/search/' + key;
		$.getJSON(url, function(data) {
			if (data.length == 0) {
				errorMessageToast('No results found');
			} else {
				var list = $('#searchResultsList');
				
				list.html("");
				$.each(data, function(key, val) {
					var id = val.id;
					var title = val.title;
					
					list.append($(document.createElement('li')).attr('data-theme', 'c').html(
							"<a data-identity='recipe" + id + "' "
							+ "data-url='/recipe.html?id=" + id + "' "
							+ "href='/recipe.html?id=" + id + "'"
							+ ">" + title + "</a>"));
				});
				
				list.listview("destroy").listview();
			}
			
			$.mobile.hidePageLoadingMsg();
		});
	});
});

$('#settingsPage').live('pageinit', function(event) {
	$('#logoutButton').click(function() {
		$.cookie('email', '');
		window.location = '/index.html';
	});
});

$('#makesPage').live('pageshow', function(event) {
	$.mobile.showPageLoadingMsg();
	
	$('.liDeleteButton').remove();
	
	var url = getRemoteBaseURL() + '/makes/' + $.cookie('email');
	$.getJSON(url, function(data) {
		if (data.length == 0) {
			// TODO add a link to the recipe search page
		} else {
			var list = $('#makesList');
			var prevDate = null;
			
			list.html("");
			$.each(data.results, function(key, val) {
				var id = val.recipe_id;
				var title = val.title;
				var scheduled_make_id = val.scheduled_make_id;
				var local_time = new Date(val.local_time);
				var date = $.scroller.formatDate('DD MM d, yy', local_time);
				var time = $.scroller.formatDate('h:ii A', local_time);
				
				if (date != prevDate) {
					list.append('<li data-theme="b" data-role="list-divider" role="heading">' + date + '</li>');
					prevDate = date;
				}
				
				list.append($(document.createElement('li')).attr(
						{'data-theme': 'c', 'scheduled_make_id': scheduled_make_id}).html(
						"<a data-identity='recipe" + id + "' "
						+ "data-url='/recipe.html?id=" + id + "' "
						+ "href='/recipe.html?id=" + id + "'"
						+ ">" + title
						+ '<p class="ui-li-aside ui-li-desc">' + time + '</p>'
						+ "</a>"));
			});
			
			list.listview("destroy").listview();
		}
		
		$.mobile.hidePageLoadingMsg();
	});
});

$('#makesPage .liDeleteButton').live('click', function(event) {
	var li = $(this).closest('li');
	var make_id = li.attr('scheduled_make_id');
	
	li.fadeOut();
	deleteScheduledMake(make_id);
});

$('div[data-role=page]').live('tap', function(event) {
	if ($('.liDeleteButton:visible').length > 0) {
		$('.liDeleteButton').hide("slide", { direction: "right" }, 500);
	}
});

$('.deletable li').live('swipeleft', function(event) {
	var li = $(this);
	li.css('overflow', 'hidden');
	var deleteBtn = $('<a>Delete</a>').attr({
		'class': 'liDeleteButton ui-btn-up-r',
		'style': 'display: none'
	});
	
	// remove all buttons first
	$('.liDeleteButton').remove();
	li.prepend(deleteBtn);
	$('.liDeleteButton').show("slide", { direction: "right" }, 500);
	$('.liDeleteButton').css('margin-top',
			Math.floor((li.innerHeight() - $('.liDeleteButton').outerHeight()) / 2) + "px");
});

// just for testing
$('.deletable li').live('mousedown', function(e) {
	/* Right Mousebutton was clicked! */
    if (e.which === 3) {
    	if ($('.liDeleteButton:visible').length > 0) {
    		$(this).trigger('tap');
    	} else {
    		$(this).trigger('swipeleft');
    	}
    }
});

$('#shoppinglistPage').live('pageinit', function(e) {
	$('#shoppinglistNote').html(getStatusBox('Note', 
			'You can add entire ingredient lists from the individual recipe pages. You can also add other items directly here.', 'info'));
});

$('#shoppinglistPage').live('pageshow', function(e) {
	$.mobile.showPageLoadingMsg();
	
	var url = getRemoteBaseURL() + "/shoppinglist/" + $.cookie('email');
	
	$.getJSON(url, function(data) {
		logAnyErrors(data);
		
		$.mobile.hidePageLoadingMsg();
		
		if (data.success) {
			var thingsToBuy = $('#thingsToBuy');
			var thingsIHave = $('#thingsIHave');
			
			thingsToBuy.html('');
			thingsIHave.html('');
			
			$.each(data.results.extraShoppingListItems, function(key, item) {
				var active = parseInt(item.active);
				var item_name = item.item_name;
				var list = active ? thingsToBuy : thingsIHave;
				var checked = active ? ' ' : 'checked ';
				var extra_shopping_list_item_id = item.extra_shopping_list_item_id;
				var id = "checkbox-extra-" + extra_shopping_list_item_id;
				
				list.append('<input type="checkbox" ' + 'name="' + id + '" ' + 'id="' + id + '" ' 
						+ 'extra_shopping_list_item_id=' + extra_shopping_list_item_id + ' '
						+ checked
						+ 'class="custom">'
						+ '<label for="' + id + '">' + item_name + '</label>');
			});
			
			$.each(data.results.shoppingListItems, function(key, item) {
				var active = parseInt(item.active);
				var item_name = item.item_name;
				var quantity = toFraction(item.quantity);
				var unit_name = item.quantity <= 1 ? item.unit_name : item.unit_name_plural;
				var list = active ? thingsToBuy : thingsIHave;
				var checked = active ? ' ' : 'checked ';
				var shopping_list_item_ids = item.shopping_list_item_ids;
				var id = "checkbox-" + shopping_list_item_ids;
				
				list.append('<input type="checkbox" ' + 'name="' + id + '" ' + 'id="' + id + '" ' 
						+ 'shopping_list_item_ids=' + shopping_list_item_ids + ' '
						+ checked
						+ 'class="custom">'
						+ '<label for="' + id + '">' + item_name + ' (' + quantity + ' ' + unit_name + ')</label>');
			});
			
			$('#shoppinglistPage').trigger('create');
		}
	});
});

$("#shoppinglistPage input[type=checkbox]").live('change', function(e) {
	var checkbox = $(this)
	var label = checkbox.next();
	var div = checkbox.parent();
	var shopping_list_item_ids = checkbox.attr('shopping_list_item_ids');
	var path = "/shoppinglist/toggleactive/";
	
	if (!shopping_list_item_ids || shopping_list_item_ids.length == 0) {
		shopping_list_item_ids = checkbox.attr('extra_shopping_list_item_id');
		path = "/shoppinglist/toggleactive/extra/";
	}
	
	$.each(shopping_list_item_ids.split(','), function(key, id) {
		var url = getRemoteBaseURL() + path + id;
		$.post(url, logAnyErrors);
	});
	
	div.appendTo(checkbox.is(':checked') ? '#thingsIHave' : '#thingsToBuy');
});

$('#clearShoppingListButton').live('click', function(e) {
	$.mobile.showPageLoadingMsg();
	var url = getRemoteBaseURL() + "/shoppinglist/clear/" + $.cookie('email');
	$.post(url, function(data) {
		if (interactiveCallback(data)) {
			var thingsToBuy = $('#thingsToBuy');
			var thingsIHave = $('#thingsIHave');
			
			thingsToBuy.html('');
			thingsIHave.html('');
		}
	});
});

$('#addExtraToShoppingListButton').live('click', function(e) {
	e.preventDefault();
	var item_name = $('#extraItem').val();
	
	if (!item_name || item_name.length == 0) return;
	
	var url = getRemoteBaseURL() + "/shoppinglist/addextra/";
	$.post(url, {email: $.cookie('email'), 'item_name': item_name}, function(data) {
		if (logAnyErrors(data)) {
			var list = $('#thingsToBuy');
			var extra_shopping_list_item_id = data.results[0].extra_shopping_list_item_id;
			var id = "checkbox-extra-" + extra_shopping_list_item_id;
			
//			$('#thingsToBuy label[for^=checkbox-extra]').last().closest('div').after(
			list.prepend(
					'<input type="checkbox" ' + 'name="' + id + '" ' + 'id="' + id + '" ' 
					+ 'extra_shopping_list_item_id=' + extra_shopping_list_item_id + ' '
					+ 'class="custom">'
					+ '<label for="' + id + '">' + item_name + '</label>');
			$('#shoppinglistPage').trigger('create');
			$('#extraItem').val('');
		}
	});
});

//load recipe for selected id
$('div[data-url*="/recipe.html?id"]').live("pageinit", function() {
	var dataurl = $(this).attr("data-url");
	var id = getParameterByName("id", dataurl);
	
	loadRecipe(id); // once the page is loaded, go load the recipe content and set it into the page
});

// load a recipe in JSON format from the remote web server
function loadRecipe(id) {
	$.mobile.showPageLoadingMsg();
	
	putLocalStorage('recipe_id', id);
	
	// this would just be another page in the recipe.html page but then we can't load 
	// recipe.html using ajax and the nice transitions so we pre-load it here and cache
	// it in the DOM
	$.mobile.loadPage('/makeit.html', {showLoadMsg: false});
	
	var url = getRemoteBaseURL() + '/recipe/' + id;
	$.getJSON(url, {email: $.cookie('email')}, function(data) {
		var recipe = data.recipe;
		var title = recipe.title;
		var image_url = recipe.image_url;
		var description = recipe.description;
		var recipe_items = data.recipe_items;
		var instructions = recipe.instructions;
		var instruction_list = $.trim(instructions).split(/\n+/);
		var serves = recipe.serves;
		var default_reminders = data.default_reminders;
		var scheduled_make = data.scheduled_make;
		
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
				'<tr><td id="currentMakeCell" style="padding: 10px 0 20px 0;"></td></tr>'
				+ '<tr>'
		  			+ '<td style="border-bottom: solid 2px #060; padding-bottom: 20px;" id="date0_cell">'
		  				+ '<label for="date0" id="makeit_when" style="display: inline"></label><br/>'
	  				+ '</td>'
               	+ '</tr>');
		
		$.each(default_reminders, function(key, item) {
			var recipe_reminder_id = item.recipe_reminder_id;
			var description = item.description;
			var hours_ahead = item.hours_ahead;
			var reminder_time = '';
			
			earliest_date = new Date(Math.max(earliest_date.getTime(), now.getTime() + (1000 * 60 * 60 * hours_ahead)));
			
			$('#recipe_reminders').append('<tr><td' + (i == 1 ? ' style="padding-top: 20px;"' : '') + '>'
					+ '<label for="date' + i + '" style="display: inline;">' + description + '</label><br/>'
					+ '<input type="text" name="date' + i + '" id="date' + i + '" class="mobiscroll" '
					+ 'hours_ahead="' + hours_ahead + '" recipe_reminder_id="' + recipe_reminder_id + '" ' 
					+ 'value="' + reminder_time + '" />'
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
		
		if (scheduled_make && scheduled_make.make) {
			$('#date0').val($.scroller.formatDate('D M d, yy h:ii A', new Date(scheduled_make.make.local_time)));
			$.each(scheduled_make.reminders, function(key, item) {
				elem = $('input[recipe_reminder_id=' + item.recipe_reminder_id + ']');
				elem.attr('scheduled_reminder_id', item.scheduled_reminder_id);
				elem.val($.scroller.formatDate('D M d, yy h:ii A', new Date(item.local_time)));
			});
			
			setScheduledMake(scheduled_make.make.scheduled_make_id, scheduled_make.make.local_time);
		} else {
			setScheduledMake();
			updateReminderTimes();
		}
		
		// add jQuery Mobile styling to dynamically inserted content
		$('#makeitPage').trigger('create');
		setTimeout("$('div[data-role=page]').trigger('updatelayout');", 300);
		
		$.mobile.hidePageLoadingMsg();
	});
}

function setScheduledMake(scheduled_make_id, local_time) {
	if (scheduled_make_id) {
		putLocalStorage('scheduled_make_id', scheduled_make_id);
		updateCurrentMakeCell(local_time);
		changeButtonText('#setremindersButton', 'Update Reminders');
		$('#deleteMakeButton').css('display', '');
	} else {
		deleteLocalStorage('scheduled_make_id');
		updateCurrentMakeCell();
		changeButtonText('#setremindersButton', 'Set Reminders');
		$('#deleteMakeButton').css('display', 'none');
	}
}

$('#makeitPage').live('pageshow', function(event) {
	var currYear = (new Date()).getFullYear();
	var datePickerOptions = { preset: 'datetime', theme: 'ios', mode: 'scroller',
		setText: 'Done', startYear: currYear, endYear: currYear + 1, hourText: 'Hour', minuteText: 'Minute',
		dateFormat: 'D M d, yy', timeFormat: 'h:ii A' }; 

	// all inputs containing the class mobiscroll should get set up as datepickers
	$('input[class~="mobiscroll"]').scroller(datePickerOptions);

	// make sure only one instance of this click function is registered at a time
	$('#setremindersButton').unbind("click").click(function() {
		$.mobile.showPageLoadingMsg();
		
		var postData = {email: $.cookie('email')};
		var make_time = $('#date0').val();
		var reminders = [];
		var scheduled_make_id = getLocalStorage('scheduled_make_id', 0);
		
		postData['scheduled_make_id'] = scheduled_make_id;
		postData['recipe_id'] = getLocalStorage('recipe_id');
		postData['local_time'] = make_time;
		postData['server_time'] = new Date(make_time).toUTCString();
		
		$('input[id^=date]').each(function(input) {
			var recipe_reminder_id = $(this).attr('recipe_reminder_id');
			var scheduled_reminder_id = $(this).attr('scheduled_reminder_id');
			var local_time = $(this).val();
			
			if (recipe_reminder_id >= 1) {
				reminders[reminders.length] = {
						recipe_reminder_id: recipe_reminder_id,
						scheduled_make_id: scheduled_make_id,
						scheduled_reminder_id: scheduled_reminder_id || 0,
						local_time: local_time,
						server_time: new Date(local_time).toUTCString()
				};
			}
		});
		
		postData['reminders'] = reminders;
		
		var url = getRemoteBaseURL() + '/makeit';
		$.post(url, postData, function(data) {
			interactiveCallback(data);
			setTimeout("window.history.go(-1);", 1000);
		});
	});
	
	$('#deleteMakeButton').unbind('click').click(function() {
		deleteScheduledMake(getLocalStorage('scheduled_make_id'));
		window.history.go(-1);
	});
});

$('#addToShoppingListButton').live('click', function() {
	$.mobile.showPageLoadingMsg();
	var url = getRemoteBaseURL() + '/shoppinglist/add/' + getLocalStorage('recipe_id');
	$.post(url, {email: $.cookie('email')}, interactiveCallback);
});

$('*').live('pageshow', function() {
	$('div[data-role="footer"] .ui-btn-corner-all').removeClass('ui-btn-corner-all');
});

function updateReminderTimes() {
	var makeit = new Date($('#date0').val());
	
	$('input[hours_ahead]').each(function(input) {
		var hours_ahead = $(this).attr('hours_ahead');
		var reminder_time = new Date(makeit.getTime() - (1000 * 60 * 60 * hours_ahead));
		
		$(this).val($.scroller.formatDate('D M d, yy h:ii A', reminder_time));
	});
}

function updateCurrentMakeCell(timeStr) {
	var html = '';
	
	if (timeStr) {
		var html = getStatusBox('Note',
				"You are currently scheduled to make this on "
				+ $.scroller.formatDate("DD MM d, yy 'at' h:ii A", new Date(timeStr))
				+ ".", 'info');
	}
	
	$('#currentMakeCell').html(html);
}

function deleteScheduledMake(id) {
	$.mobile.showPageLoadingMsg();
	
	var url = getRemoteBaseURL() + '/deletemake/' + id;
	$.post(url, function(data) {
		var success = data.success;
		
		$.mobile.hidePageLoadingMsg();
		
		if (success) {
		} else {
			$.each(data.errors, function(key, value) {
                console.log(key + ": " + value);
            });
		}
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

function getStatusBox(title, msg, type) {
    var icon = 'ui-icon-info';
    var ui_state = 'ui-state-highlight';
    var theme = 'd';
    
    if (type == 'error') {
        icon = 'ui-icon-alert';
        ui_state = 'ui-state-error';
        theme = 'e';
    }

    return "<div class='ui-body ui-body-" + theme + " ui-widget ui-corner-all' style='padding: 6px;'>"
            + "<div class='" + ui_state + "'>"
                    + "<p style='margin: 0;'><span class='ui-icon " + icon + "' style='float: left; margin-right: .3em;'></span>"
                    + "<strong>" + title + "</strong> " + msg + "</p>"
            + "</div>"
    + "</div>";
}

function changeButtonText(selector, text) {
	$(selector).prev('.ui-btn-inner').children('.ui-btn-text').html(text);
}

function logAnyErrors(data) {
	if (!data.success) {
		$.each(data.errors, function(key, value) { console.log(key + ": " + value); });
	}
	
	return data.success;
}

function interactiveCallback(data) {
	$.mobile.hidePageLoadingMsg();
	logAnyErrors(data);
	
	if (data.success) {
		errorMessageToast('Success!');
	} else {
		errorMessageToast('Something went wrong. Sorry. :( ' + data.errors[0]);
	}
	
	return data.success;
}

// load up our persistent storage
var store = Lawnchair({name:'localStorage'}, function(store) {});
//store.nuke(); // uncomment for testing

function getLocalStorage(key, defaultValue) {
    var value = defaultValue;
    
    store.get(key, function(item) {if (item) value = item.value});
    
    return value;
}

function putLocalStorage(key, value) {
    store.get(key, function(item) {
    	if (item) {
    		store.remove({key: item.key}); // avoid _index_ from having dupes
    	}
    	
    	store.save({key: key, value: value});
	});
}

function deleteLocalStorage(key) {
	store.remove({key: key});
}
