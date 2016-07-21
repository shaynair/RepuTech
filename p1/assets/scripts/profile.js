var posts = [
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
];

function initialize() {
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

function display_messages() {
    $('.profile-content').empty();
}

/*function display_settings() {
    $('.profile-content').empty();
    // DYNAMICALLY CREATE FORM SIMILAR TO account_info.html
    // GET USER'S DATA AND DISPLAY ON FORM
}*/

function display_create_listing() {
    $('.profile-content').empty();
    // DYNAMICALLY CREATE FORM FOR LISTING
    
}


$(document).ready(initialize);

$('#messages').click(display_messages);
//$('#settings').click(display_settings);
$('#create-listing').click(display_create_listing);
