$.ajaxSetup({
	cache: false,
});

var testing = false;

// Where do we get our data from (e.g. recipes, etc.)
function getRemoteBaseURL() {
	if (testing) {
		if (navigator.camera) {
			return 'http://192.168.1.100'; // for testing on the phone or the emulator
	//		return 'http://10.0.2.2'; // for testing on the emulator
		}
	//	return 'http://local.figleafbetty.com';
		return 'http://localhost';
	}
	
	return 'http://rest.figleafbetty.com';
}

document.addEventListener("deviceready", myDeviceReadyListener, false);

function myDeviceReadyListener() {
//	alert('ready');
	
//	var url = getRemoteBaseURL() + "/units";
//	syncGetJSON(url, {}, function(data) {
//		console.log('got results');
//		logAnyErrors(data);
//		
//		$.each(data.results, function(key, value) {
//			console.log(value.unit_id + " " + value.unit_name + " " + value.unit_name_plural);
//		});
//	});
	
//	$.mobile.changePage('/getpicture.html');
	
}

////
// List Item Delete Button
////
// Show a delete button in the list item when you swipe to the left
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

// Hide the delete button when you tap anywhere on the page
//$('div[data-role=page]').live('tap', function(event) {
//	if ($('.liDeleteButton:visible').length > 0) {
//		$('.liDeleteButton').hide("slide", { direction: "right" }, 500);
//	}
//});

// TEST for testing in a browser 
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

// Buttons in the footer should not have rounded corners
$('*').live('pageshow', function() {
	$('div[data-role="footer"] .ui-btn-corner-all').removeClass('ui-btn-corner-all');
});

// Change the text on a button after it's been enhanced by jQuery Mobile
function changeButtonText(selector, text) {
	$(selector).prev('.ui-btn-inner').children('.ui-btn-text').html(text);
}

function deleteScheduledMake(id) {
	$.mobile.showPageLoadingMsg();
	var url = getRemoteBaseURL() + '/deletemake/' + id;
	$.post(url, interactiveCallback);
}

function deleteRecipe(id) {
	$.mobile.showPageLoadingMsg();
	var url = getRemoteBaseURL() + '/recipe/delete/' + id;
	$.post(url, interactiveCallback);
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

function showMessageToast(msg) {
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

function showFormErrors(errors) {
	$('td[id$="_status_box"]:visible').empty(); // ends with
    $.each(errors, function(key, value) {
        $('[id=' + key + '_status_box]:visible').html(getStatusBox($('label[for=' + key + ']:visible').text() + ':', value, 'error'));
    });
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
		showMessageToast('Success!');
	} else {
		showMessageToast('Something went wrong. Sorry. :( ' + data.errors[0]);
	}
	
	return data.success;
}

////
// Ajax Helpers
////
function syncGetJSON(url, data, success) {
	$.ajax({
		url: url,
		dataType: 'json',
		async: false,
		data: data,
		success: success,
	});
}

function syncPost(url, postData, success) {
	$.ajax({
		type: 'POST',
		url: url,
		async: false,
		data: postData,
		success: success,
	});
}

////
// Keep track of who's currently logged in
////
function getUserId() {
	return getLocalStorage('user_id');
}

function setUserId(user_id) {
	return putLocalStorage('user_id', user_id);
}

function isLoggedIn() {
	return getUserId() > 0;
}

function logOut() {
	setUserId(-1);
}

function getRecipeId() {
	return getLocalStorage('recipe_id');
}

function setRecipeId(id) {
	putLocalStorage('recipe_id', id);
}

function clearRecipeId() {
	deleteLocalStorage('recipe_id');
}

////
// Persistent Storage
////
function getLocalStorage(key, defaultValue) {
    var value = window.localStorage.getItem(key);
    
    return value ? value : defaultValue;
}

function putLocalStorage(key, value) {
	window.localStorage.setItem(key, value);
}

function deleteLocalStorage(key) {
	window.localStorage.removeItem(key);
}

////
// Decimal to Fraction and Fraction to Decimal
////
// Recipe amounts are stored as decimals so we need to be able
// to convert decimals to fractions. We assume there's never a
// denominator greater than a 32nd.
function toDecimal(fraction) {
	if (fraction == "") return "";
	if (fraction == 0) return 0;
	
	return parseFloat(eval(fraction.trim().replace(' ', '+')));
}

function toFraction(decimal) {
	var i;
	var epsilon = .00001;
	var MaxDen = 32;
	
	if (decimal == "") return "";
	if (decimal == 0) return 0;
	
	for (i = 1; i <= MaxDen; i++) {
		if (Math.abs(Math.round(i * decimal) - (i * decimal)) < epsilon) {
			var whole = Math.floor(decimal);
			var frac = Math.round((decimal - whole) * i) + "/" + i;
			
			return $.trim((whole == 0 ? "" : whole + " ") + (decimal - whole == 0 ? "" : frac));
		}
	}
	
	return decimal;
}
