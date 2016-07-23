

var msgs = [
    [
        ["John Doe", "Hi there!"],
        ["Jane D", "Hello, can you help fix my phone before Friday?"],
        ["John Doe", "I sure can!"]
    ],
    [
        ["A A", "Hello"],
        ["John Doe", "Hi, what can I help you with?"]
    ]
];

var profile = [
    {
        "img": "../assets/images/avatar.png",
        "rating": 4,
        "num_followers": 23,
        "name": "John Doe",
        "job": "Smartphone Technician",
        "location": "Toronto, Canada",
        "mood": "Tech-tastic",
        "posts": [
            {
                "author": "John Doe",
                "title": "Looking to get your smartphone repaired?!",
                "type": "Offering",
                "rating": "4/5",
                "picture": "",
                "contact_info": "111-111-1111",
                "description": "If you're looking to get your smartphone repaired, look no further! I have been repairing smartphone for the past 5 years and I can guarantee that your smartphone will be fixed in less than 5 business days!"
            },
            {
                "author": "Jane D",
                "title": "Looking for someone to fix an iPhone 4",
                "type": "Searching",
                "rating": "4/5",
                "picture": "",
                "contact_info": "416-000-1234",
                "description": "hi, im looking for someone who can fix my iPhone 4 and replace the screen for me. pls msg me if you can help!"
            }
        ]
    }
];


function get_profile() {
    var url = 'profile';
    $.ajax({
        method: "GET",
        dataType: "json",
        url: url,
        success: function (data) {
            render_profile(data); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function get_messages() {
    var url = 'messages';
    $.ajax({
        method: "GET",
        dataType: "json",
        url: url,
        success: function (data) {
            render_messages(data); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}


function render_messages(data) {
    $('.profile-content').empty();
    $('.profile-content').append($('<section/>', {id: 'messages'}));
    for (i = 0; i < msgs.length; i ++) {
        $('.profile-content').append($('<section/>', {class: 'post', id: 'post-' + i}));
        for (j = 0; j < msgs[i].length; j ++) {
            $('#post-' + i).append($('<p/>', {text: msgs[i][j][0] + ": " + msgs[i][j][1]}));
        }
        $('#post-' + i).append($('<button/>', {text: "Reply"}));
    }
}

function render_profile(data) {
    
    $('.profile-pic').empty();
    $('.profile-status').empty();
    $('.profile-title').empty();
    $('.profile-content').empty();
    
    // Renders the sidebar for the profile
    $('.profile-pic').append($('<img/>', {src: data.img, alt: 'Avatar'}));

    if (data.rating === 1) {
        $('.profile-status').append($('<p/>', {text: '&#9733&#9734&#9734&#9734&#9734'}));
    } else if (data.rating === 2) {
        $('.profile-status').append($('<p/>', {text: '&#9733&#9733&#9734&#9734&#9734'}));
    } else if (data.rating === 3) {
        $('.profile-status').append($('<p/>', {text: '&#9733&#9733&#9733&#9734&#9734'}));
    } else if (data.rating === 4) {
        $('.profile-status').append($('<p/>', {text: '&#9733&#9733&#9733&#9733&#9734'}));
    } else if (data.rating === 5) {
        $('.profile-status').append($('<p/>', {text: '&#9733&#9733&#9733&#9733&#9733'}));
    }
    $('.profile-status').append($('<p/>', {text: data.num_followers + ' Followers'}));
    $('.profile-title').append($('<h3/>', {text: data.name}));
    $('.profile-title').append($('<p/>', {text: data.job}));
    $('.profile-title').append($('<p/>', {text: data.location}));
    $('.profile-title').append($('<p/>', {text: data.mood}));
    
    var posts = data.posts;
    // Renders posts for the profile
    for (i = 0; i < posts.length; i ++) {
        $('.profile-content').append($('<article/>', {class: 'post', id: 'post-' + i}));
        var curr_id = '#post-' + i;
        $(curr_id).append($('<a/>', {href: "post.html"}).append($('<h2/>', {class: 'title', text: posts[i].title})));
        $(curr_id).append($('<p/>', {class: 'author', text: 'Posted by: ' + posts[i].author}));
        $(curr_id).append($('<p/>', {class: 'post_type', id: 'type-' + i}));
        if (posts[i].type === 'Searching') {
            $('#type-' + i).text("Searching for service");
			$(curr_id).append($('<p/>', {class: 'post_type', text: "Urgency: " + posts[i].rating}));
        } else {
            $('#type-' + i).text("Offering service");
			$(curr_id).append($('<p/>', {class: 'post_type', text: "Reputation: " + posts[i].rating}));
        }
        if (posts[i].contact_info != '') {
            $(curr_id).append($('<p/>', {class: 'contact-info', text: 'Contact Info: ' + posts[i].contact_info}));
        }
        $(curr_id).append($('<p/>', {class: 'description', text: "Description: " + posts[i].description}));
    }
}

/*function render_settings() {
    $('.profile-content').empty();
    // DYNAMICALLY CREATE FORM SIMILAR TO account_info.html
    // GET USER'S DATA AND DISPLAY ON FORM
}*/

function render_listing_form() {
    $('.profile-content').empty();
    
    
}


$(document).ready(get_profile);

$('#messages').click(get_messages);
$('#settings').click(render_settings);
$('#create-listing').click(render_listing_form);
