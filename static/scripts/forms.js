$(document).ready(() => {

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

    $(".sign-up-form").on("submit", function(event) {
        $.ajax({
            method: "POST",
            url: '',
            data: $('.sign-up-form').serialize(),
            success: function (data) {
                window.location.href("profile.html");
            },
            error: function (err) {
                console.log(err);
            }
        });
    });   
});

function render_search_data(data) {
        
}