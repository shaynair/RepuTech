var states = {};

// Goes through and validates each field in signup.
function validateEvent(e) {
	e.preventDefault();
	let valid = true;
	$("#sign-up-form input").each((index, elem) => {
		if (!validate($(elem))) {
			valid = false;
		}
	});

	if (valid) {
		submitForm();
	}
}

// Validates a single field. Return true if valid. Displays error messages.
function validate($elem) {
	let $err = $("#" + $elem.attr("id") + "-err");
	if ($elem.val() == "") { // 'Required' message will auto handle
		setBorderColor($elem, "red");
		$err.text("This field is required.").fadeIn();
		return false;
	}
	setBorderColor($elem, "#ccc");
	$err.hide();

	// Use regex to make custom error messages
	let r = new RegExp($elem.attr("pattern"));
	if (!r.test($elem.val())) {
		let prompt = null;
		if ($elem.attr("type") == 'password') {
			prompt = "Password must be between 8-15 characters, " +
				"and must consist of at least one lower-case letter, " +
				"one upper-case letter and one digit.";
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
	// Handle confirmation fields
	if (($elem.attr("id") == "email" || $elem.attr("id") == "pass") &&
		($elem.val() != $("#" + $elem.attr("id") + "2").val())) {

		$err.text("Confirmation fields must be the same.").fadeIn();
		setBorderColor($elem, "red");
		return false;
	}

	return true;
}

function setBorderColor($elem, color) {
	$elem.css("border", "1px solid " + color);
}

// API call for when a country is selected.
function populateStates() {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "/api/get-states",
		data: {
			country: $('#country').val()
		},
		success: (res) => {
			$('#state').empty();

			if (!res) {
				$('#state').append('<option selected disabled>State/Province</option>');
			}
			states = res;
			for (let s of Object.keys(res).sort()) {
				let option = $('<option>');
				option.attr('value', res[s]);
				option.html(s);
				$('#state').append(option);
			}
		},
		error: (err) => {
			console.log(err);
		}
	});
}

// API call to submit the signup form.
function submitForm() {
	$.ajax({
		type: "POST",
		dataType: "json",
		url: "/api/signup-form",
		data: $("#sign-up-form").serialize(),
		success: (res) => {
			if (res.status === "Exists") {
				setBorderColor($("#email"), "red");
				$("#email-err").text(
					"This Email Address is already used. Please use another Email Address."
				).fadeIn();
			} else if (res.status === "Bad") {
				setBorderColor($("#email"), "red");
				$("#email-err").text("An unknown error occurred.").fadeIn();
			} else if (res.status == "Done") {
				$("#sign-up-form, .modal-box button").hide();
				$("#status-text").text("Account registered.").fadeIn();
			} else if (res.status == "OK") {
				$("#sign-up-form, .modal-box button").hide();
				$("#status-text").text("Please check your e-mail for activation.").fadeIn();
			}
		},
		error: (err) => {
			console.log(err);
		}
	});
}