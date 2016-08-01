$(document).ready(() => {
    
    const href = window.location.href;
    const last = href.substr(href.lastIndexOf('/') + 1);
    
    if (last == '' || last == 'index') {
        loadImageSlider();
    } else if (last == 'signup' || last == 'admin-signup') {
		// Validation and state population
        $(".error").hide();
        $("#submit").on("click", validateEvent);
        $("#country").on("change", populateStates);
    } else if (last.startsWith("post")) {
        renderFullPost();
        // Make our REST call to get similar posts
        getSimilars();
    }

	// Event for when the login form gets submitted.
    $("#login-form").on("submit", (event) => {
        event.preventDefault();
        
        $("#err").fadeOut().text("");
        $.ajax({
            method: "POST",
            url: '/api/login-form',
            dataType: "json",
            data: $('#login-form').serialize(),
            success: (data) => {
                if (!data.status || data.status == "Bad") {
                    $("#err").fadeIn().text("Unknown email or incorrect password.");
                } else if (data.status == "OK"){
                    window.location.href = "/profile";
                } else if (data.status == "Attempts") {
                    $("#err").fadeIn().text("You've tried to use this too many times. Try again after 30 seconds.");
                } else {
                    $("#err").fadeIn().text("This account is " + data.status + ".");
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });

	// Event for when reset password gets clicked.
    $("#reset-pass").on("click", (event) => {
        event.preventDefault();
        
        $("#err").fadeOut().text("");
        $.ajax({
            method: "POST",
            url: '/api/reset-pass',
            dataType: "json",
            data: $('#login-form').serialize(),
            success: (data) => {
                if (data.status == "Bad") {
                    $("#err").fadeIn().text("Unknown email or inactivated account.");
                } else if (data.status == "OK"){
                    $("#err").fadeIn().text("Check the email address for a new password.");
                } else if (data.status == "Attempts") {
                    $("#err").fadeIn().text("You've tried to use this too many times. Try again after 30 seconds.");
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
    
	// Admin function.
    $("#repopulate").on("click", (event) => {
        $.ajax({
            method: "GET",
            url: '/api/repopulate',
            dataType: "json",
            data: {},
            success: (data) => {
                if (data.status){
					// Database is gone, reload
                    window.location.href = "/";
                } else {
                    console.log("There was an error.");
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
});