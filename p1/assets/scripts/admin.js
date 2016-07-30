var data = {
    "stats": {
        "registered_users": 24,
        "active_posts": 10,
        "expired_posts": 8,
        "wiki_posts": 1
    },
    "users": [
        {
            "img": "../assets/images/avatar.png",
            "rating": 4,
            "num_followers": 23,
            "name": "John Doe",
            "job": "Smartphone Technician",
            "location": "Toronto, Canada",
            "mood": "Tech-tastic",
            "user_id": 1
        } 
    ],
    "reports": [
        {
            "post_id": 1,
            "reporter": {
                "rating": 4,
                "num_followers": 23,
                "name": "John Doe",
                "job": "Smartphone Technician",
                "location": "Toronto, Canada",
                "user_id": 1
            },
            "accused": {
                "rating": 2,
                "num_followers": 2,
                "name": "Jane D",
                "job": "",
                "location": "Toronto, Canada",
                "user_id": 2
            }
        }
    ]
};

function initialize() {
    
    $(".admin-stats").append($("<p/>", {text: data.stats.registered_users + " Users registered"}));
    $(".admin-stats").append($("<p/>", {text: data.stats.active_posts + " Posts active"}));
    $(".admin-stats").append($("<p/>", {text: data.stats.expired_posts + " Posts expired"}));
    $(".admin-stats").append($("<p/>", {text: data.stats.wiki_posts + " Wiki posts created"}));
    
    for (i = 0; i < data.users.length; i ++) {
        $(".admin-users").append($("<section/>", {class: "admin-user", id: "user-" + i}));
        
        $("#user-" + i).append($("<section/>", {class: "profile-status", id: "status-" + i}));
        if (data.users[i].rating === 1) {
            $("#status-" + i).append($("<p/>", {html: "&#9733;&#9734;&#9734;&#9734;&#9734;"}));
        } else if (data.users[i].rating === 2) {
            $("#status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9734;&#9734;&#9734;"}));
        } else if (data.users[i].rating === 3) {
            $("#status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9733;&#9734;&#9734;"}));
        } else if (data.users[i].rating === 4) {
            $("#status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9733;&#9733;&#9734;"}));
        } else if (data.users[i].rating === 5) {
            $("#status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9733;&#9733;&#9733;"}));
        }
        $("#status-" + i).append($("<p/>", {text: data.users[i].num_followers + " Followers"}));
        
        $("#user-" + i).append($("<section/>", {class: "profile-title", id: "title-" + i}));
        $("#title-" + i).append($("<h3/>", {text: data.users[i].name}));
        $("#title-" + i).append($("<p/>", {text: data.users[i].job}));
        $("#title-" + i).append($("<p/>", {text: data.users[i].location}));
        $("#title-" + i).append($("<p/>", {text: data.users[i].mood}));
        
        $("#user-" + i).append($("<section/>", {class: "profile-menu", id: data.users[i].user_id}));
        var menu_id = "#" + data.users[i].user_id;
        var $button = $("<button/>", {text: "View", class: "view"});
        $(menu_id).append($button);
        $button = $("<button/>", {text: "Delete", class: "delete"});
        $(menu_id).append($button);
        $button = $("<button/>", {text: "Edit", class: "edit"});
        $(menu_id).append($button);
        
        $(".edit").wrap("<a href=\"account_info.html\"></a>");
        $(".view").wrap("<a href=\"profile.html\"></a>");
    }

    
    for (i = 0; i < data.reports.length; i ++) {
        $(".admin-reports").append($("<section/>", {class: "admin-report", id: "report-" + i}));
        
        $("#report-" + i).append($("<section/>", {class: "admin-report-user profile-title", id: "reporter-user-" + i}));
        $("#reporter-user-" + i).append($("<h3/>", {class: "reporter", text: "Reporter: " + data.reports[i].reporter.name, id: data.reports[i].reporter.user_id}));
        $("#reporter-user-" + i).append($("<p/>", {text: data.reports[i].reporter.job}));
        $("#reporter-user-" + i).append($("<p/>", {text: data.reports[i].reporter.location}));
        
        $("#reporter-user-" + i).append($("<section/>", {class: "profile-status", id: "reporter-status-" + i}));
        if (data.reports[i].reporter.rating === 1) {
            $("#reporter-status-" + i).append($("<p/>", {html: "&#9733;&#9734;&#9734;&#9734;&#9734;"}));
        } else if (data.reports[i].reporter.rating === 2) {
            $("#reporter-status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9734;&#9734;&#9734;"}));
        } else if (data.reports[i].reporter.rating === 3) {
            $("#reporter-status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9733;&#9734;&#9734;"}));
        } else if (data.reports[i].reporter.rating === 4) {
            $("#reporter-status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9733;&#9733;&#9734;"}));
        } else if (data.reports[i].reporter.rating === 5) {
            $("#reporter-status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9733;&#9733;&#9733;"}));
        }
        $("#reporter-status-" + i).append($("<p/>", {text: data.reports[i].reporter.num_followers + " Followers"}));
        
        
        $("#report-" + i).append($("<section/>", {class: "admin-report-user profile-title", id: "accused-user-" + i}));
        $("#accused-user-" + i).append($("<h3/>", {class: "accused", text: "Accused: " + data.reports[i].accused.name, id: data.reports[i].accused.user_id}));
        $("#accused-user-" + i).append($("<p/>", {text: data.reports[i].accused.job}));
        $("#accused-user-" + i).append($("<p/>", {text: data.reports[i].accused.location}));
        
        $("#accused-user-" + i).append($("<section/>", {class: "profile-status", id: "accused-status-" + i}));
        if (data.reports[i].accused.rating === 1) {
            $("#accused-status-" + i).append($("<p/>", {html: "&#9733;&#9734;&#9734;&#9734;&#9734;"}));
        } else if (data.reports[i].accused.rating === 2) {
            $("#accused-status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9734;&#9734;&#9734;"}));
        } else if (data.reports[i].accused.rating === 3) {
            $("#accused-status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9733;&#9734;&#9734;"}));
        } else if (data.reports[i].accused.rating === 4) {
            $("#accused-status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9733;&#9733;&#9734;"}));
        } else if (data.reports[i].accused.rating === 5) {
            $("#accused-status-" + i).append($("<p/>", {html: "&#9733;&#9733;&#9733;&#9733;&#9733;"}));
        }
        $("#accused-status-" + i).append($("<p/>", {text: data.reports[i].accused.num_followers + " Followers"}));
        
        $("#report-" + i).append($("<section/>", {class: "profile-menu", id: "report-menu-" + i}));
        var report_menu_id = "#report-menu-" + i;
        var $button = $("<button/>", {text: "View Post", class: "view-post"});
        $(report_menu_id).append($button);
        $button = $("<button/>", {text: "Ban Accused", class: "ban"});
        $(report_menu_id).append($button);
        $button = $("<button/>", {text: "Dismiss", class: "dismiss"});
        $(report_menu_id).append($button);
        
        $(".view-post").wrap("<a href=\"post.html\"></a>");
        
    }
    
    
    $(".delete").click(function() {
        var id = $(this).parent().attr("id");
        delete_user(id);
    });

    $(".ban").click(function() {
        var id = $(this).parent().prev().children(":first").attr("id");
        ban_user(id);
    });
    
    $(".dismiss").click(function() {
        var id = $(this).parent().parent().attr("id");
        dismiss(id);
    });
    
}


function delete_user(id) {
    
    $.ajax({
        type: "POST",
        // SOME URL
        url: "",
        data: id,
        dataType: "text",
        success: function (data) {
            $("#" + id).parent().remove();
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function ban_user(id) {
    
    $.ajax({
        type: "POST",
        // SOME URL
        url: "",
        data: id,
        dataType: "text",
        success: function (data) {
            console.log("User " + id + " has been banned" )
        },
        error: function (err) {
            console.log(err);
        }
    });
    
}

function dismiss(id) {

    $.ajax({
        type: "POST",
        // SOME URL
        url: "",
        data: id,
        dataType: "text",
        success: function (data) {
            $("#" + id).remove();
        },
        error: function (err) {
            console.log(err);
        }
    });
    
}

$(document).ready(initialize);


