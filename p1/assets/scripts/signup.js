function initialize() {
	$(".error").hide();
	
	$("#submit").on("click", validateEvent);
}

function validateEvent(e) {
	var valid = true;
	$("input").each(function(index, elem) {
		if (!validate($(elem))) {
			valid = false;
		}
	});
		
	if (!valid) {
		e.preventDefault();
	}
}

function validate($elem) {
	var $err = $("#" + $elem.attr("id") + "-err");
	if ($elem.val() == "") { // 'Required' message will auto handle
		setBorderColor($elem, "red");
		$err.text("This field is required.").fadeIn();
		return false;
	}
	setBorderColor($elem, "#ccc");
	$err.hide();
	
	var r = new RegExp($elem.attr("pattern"));
	if (!r.test($elem.val())) {
		var prompt = null;
		if ($elem.attr("type") == 'password') {
			prompt = "Password must be between 8-15 characters, and must consist of at least one lower-case letter, one upper-case letter and one digit.";
		} else if ($elem.attr("type") == 'text') {
			prompt = "This field can only consist of letters.";
		} else if ($elem.attr("type") == 'email') {
			prompt = "E-mail address must be valid.";
		}
		if (prompt != null) {
			$err.text(prompt).fadeIn();
		}
		setBorderColor($elem, "red");
		return false;
	}
	if (($elem.attr("id") == "email" || $elem.attr("id") == "pass")
			&& ($elem.val() != $("#" + $elem.attr("id") + "2").val())) {
				
		$err.text("Confirmation fields must be the same.").fadeIn();
		setBorderColor($elem, "red");
		return false;
	}
	return true;
}

function setBorderColor($elem, color){
	$elem.css("border", "1px solid " + color);
}

$(document).ready(initialize);
