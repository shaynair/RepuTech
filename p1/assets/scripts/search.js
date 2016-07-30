var posts = [
    {
        "firstname": "John",
        "lastname": "Doe",
        "title": "Looking to get your smartphone repaired?!",
        "type": "Offering",
        "rating": 4,
        "img": "",
        "contact_info": "111-111-1111",
        "description": "If you're looking to get your smartphone repaired, look no further! I have been repairing smartphone for the past 5 years and I can guarantee that your smartphone will be fixed in less than 5 business days!"
    }
];

var rating_stars = {
    1 : "Rating: &#9733;&#9734;&#9734;&#9734;&#9734;",
    2 : "Rating: &#9733;&#9733;&#9734;&#9734;&#9734;",
    3 : "Rating: &#9733;&#9733;&#9733;&#9734;&#9734;",
    4 : "Rating: &#9733;&#9733;&#9733;&#9733;&#9734;",
    5 : "Rating: &#9733;&#9733;&#9733;&#9733;&#9733;"
};

function render_posts() {
//function render_posts(data) {
    $('.profile-content').empty();
    // Renders posts for the profile
    for (var i = 0; i < posts.length; i ++) {
        $('.profile-content').append($('<article/>', {class: 'post', id: 'post-' + i}));
        var curr_id = '#post-' + i;
        $(curr_id).append($('<a/>', {href: "post.html"}).append($('<h2/>', {class: 'title', text: posts[i].title})));
        $(curr_id).append($('<p/>', {class: 'author', text: 'Posted by: ' + posts[i].firstname + ' ' + posts[i].lastname}));
        $(curr_id).append($('<p/>', {class: 'post_type', id: 'type-' + i}));
        if (posts[i].type === 'Searching') {
            $('#type-' + i).text("Searching for service");
			$(curr_id).append($('<p/>', {class: 'post_type', text: "Urgency: " + posts[i].rating}));
        } else {
            $('#type-' + i).text("Offering service");
			$(curr_id).append($("<p/>", {class: 'post_type', html: rating_stars[posts[i].rating]}));
        }
        if (posts[i].contact_info != '') {
            $(curr_id).append($('<p/>', {class: 'contact-info', text: 'Contact Info: ' + posts[i].contact_info}));
        }
        $(curr_id).append($('<p/>', {class: 'description', text: "Description: " + posts[i].description}));
    }
}

// Get value from input fields
$('#refine').click(function() {
    var name = $('#name').val();
    var urgency = $('#urgency').val();
    var reputation = $('#reputation').val();
    var city = $('#city').val();
    var country = $('#country').val();
    var service; 
    if ($('#service').is(':checked')) {
        // Is offering service
        service = "Offering";
    } else {
        // Is requesting service
        service = "Requesting";
    }
    
    // Send above information to back-end and search through all posts to return matching ones
    
    render_posts();
});