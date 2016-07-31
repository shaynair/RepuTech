$(document).ready(() => {
    
    const href = window.location.href;
    const last = href.substr(href.lastIndexOf('/') + 1);
    
    if (last == '' || last == 'index') {
        loadImageSlider();
    } else if (last == 'signup') {
        $(".error").hide();
        $("#submit").on("click", validateEvent);
        $("#country").on("change", populateStates);
    }

    $(".search-form").on("submit", (event) => {
        $.ajax({
            method: "POST",
            url: '',
            dataType: "json",
            data: $('.search-form').serialize(),
            success: (data) => {
                window.location.href("search.html");
                render_search_data(data);
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
    
    $(".search-user").on("submit", (event) => {
        $.ajax({
            method: "POST",
            url: '',
            dataType: "json",
            data: $('.search-user').serialize(),
            success: (data) => {
                window.location.href("search.html");
                render_search_data(data);
            },
            error: (err) => {
                console.log(err);
            }
        });
    });

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
});