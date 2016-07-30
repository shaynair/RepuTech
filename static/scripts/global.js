$(document).ready(() => {
    
    const href = window.location.href;
    const last = href.substr(href.lastIndexOf('/') + 1);
    
    if (last == '' || last == 'index') {
        loadImageSlider();
    } else if (last == 'signup') {
        $(".error").hide();
        populateCountries();
        $("#submit").on("click", validateEvent);
    }

    $(".search-form").on("submit", function(event) {
        $.ajax({
            method: "POST",
            url: '',
            data: $('.search-form').serialize(),
            success: function (data) {
                window.location.href("search.html");
                render_search_data(data);
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
    
    $(".search-user").on("submit", function(event) {
        $.ajax({
            method: "POST",
            url: '',
            data: $('.search-user').serialize(),
            success: function (data) {
                window.location.href("search.html");
                render_search_data(data);
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    $(".login-form").on("submit", function(event) {
        $.ajax({
            method: "POST",
            url: '',
            data: $('.login-form').serialize(),
            success: function (data) {
                window.location.href("profile.html");
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
});