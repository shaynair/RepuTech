// Should pull this info from the database
var posts = [
    {
        "firstname": "John",
        "lastname": "Doe",
        "country": "Canada",
        "city": "Toronto",
        "title": "Looking to get your smartphone repaired?!",
        "type": "Offering",
        "rating": 4,
        "img": "../assets/images/repairing.jpg",
        "contact_info": "111-111-1111",
        "description": "If you're looking to get your smartphone repaired, look no further! I have been repairing smartphone for the past 5 years and I can guarantee that your smartphone will be fixed in less than 5 business days!",
        "replies": [
            {
                "firstname": "A",
                "lastname": "A",
                "comment": "How much do you charge to replace the screen on an iPhone 6?"
            },
            {
                "firstname": "John",
                "lastname": "Doe",
                "comment": "Name your price ;)"
            },
            {
                "firstname": "James",
                "lastname": "A",
                "comment": "Can you fix a water damaged phone?"
            }
        ],
        "reviews": [
            {
                "firstname": "Jane",
                "lastname": "D",
                "rating": 5,
                "comment": "He fixed my iPhone 6 and then he also upgraded it to iPhone 7 free of charge!! Best tech support ever!!!"
            }
        ],
        "similar_posts": [
            {
                "link": "post.html",
                "title": "Want a tune-up for your device?",
                "firstname": "A",
                "lastname": "A",
                "rating": 5,
                "country": "Canada",
                "city": "Vancouver",
            },
            {
                "link": "post.html",
                "title": "Fixing desktop computers.",
                "firstname": "James",
                "lastname": "A",
                "rating": 3,
                "country": "Canada",
                "city": "Ottawa",
            }
        ]
    },
    {
        "firstname": "Jane",
        "lastname": "D",
        "country": "Canada",
        "city": "Toronto",
        "title": "Looking for someone to fix an iPhone 4",
        "type": "Request",
        "rating": 4,
        "img": "",
        "contact_info": "416-000-1234",
        "description": "hi, im looking for someone who can fix my iPhone 4 and replace the screen for me. pls msg me if you can help!",
        "replies": [],
        "reviews": [],
        "similar_posts": []
    }
];

var rating_stars = {
    1 : "Rating: &#9733;&#9734;&#9734;&#9734;&#9734;",
    2 : "Rating: &#9733;&#9733;&#9734;&#9734;&#9734;",
    3 : "Rating: &#9733;&#9733;&#9733;&#9734;&#9734;",
    4 : "Rating: &#9733;&#9733;&#9733;&#9733;&#9734;",
    5 : "Rating: &#9733;&#9733;&#9733;&#9733;&#9733;"
};

function render_post_full() {
    $('.post-content').empty();
    $('.post-content').append($('<section/>', {class: 'post-full'}));
    
    // Post info
    var post = posts[0];
    $('.post-full').append($('<img/>', {class: 'post-img', src: post.img, alt: 'Repair service'}));
    $('.post-full').append($('<h2/>', {text: post.title}));
    $('.post-full').append($('<p/>', {class: 'post-author', text: 'Author: ' + post.firstname + ' ' + post.lastname}));
    $('.post-author').append($('<button/>', {text: 'View Profile'}));
    
    $('.post-full').append($("<p/>", {id: 'rating', html: rating_stars[post.rating]}));
    
    $('.post-full').append($('<p/>', {text: post.type + ' service'}));
    $('.post-full').append($('<p/>', {text: 'Contact: ' + post.contact_info}));
    $('.post-full').append($('<p/>', {text: post.description}));
    
    // Comments
    $('.post-content').append($('<section/>', {class: 'post-comments'}));
    $('.post-comments').append($('<h3/>', {text: 'Comments'}));
    
    for (var i = 0; i < post.replies.length; i++) {
        $('.post-comments').append($('<article/>', {class: 'post-comment', id: 'post-comment-' + i}));
        $('#post-comment-' + i).append($('<h4/>', {text: post.replies[i].firstname + ' ' + post.replies[i].lastname}));
        $('#post-comment-' + i).append($('<p/>', {text: post.replies[i].comment}));
    }
    $('.post-comments').append($('<button/>', {text: 'Reply'}));
    
    // Reviews
    $('.post-content').append($('<section/>', {class: 'post-reviews'}));
    $('.post-reviews').append($('<h3/>', {text: 'Reviews'}));
    
    for (var i = 0; i < post.reviews.length; i++) {
        $('.post-reviews').append($('<article/>', {class: 'post-review', id: 'post-review-' + i}));
        $('#post-review-' + i).append($('<h4/>', {text: 'By ' + post.reviews[i].firstname + ' ' + post.reviews[i].lastname}));
        
        $('#post-review-' + i).append($("<p/>", {id: 'rating', html: rating_stars[post.reviews[i].rating]}));
        
        $('#post-review-' + i).append($('<p/>', {text: post.reviews[i].comment}));
    }
    $('.post-reviews').append($('<button/>', {text: 'Leave a Review'}));
    
    // Similar posts
    $('.post-content').append($('<section/>', {class: 'post-similars'}));
    $('.post-similars').append($('<h3/>', {text: 'Similar Posts'}));
    
    for (var i = 0; i < post.similar_posts.length; i++) {
        $('.post-similars').append($('<article/>', {class: 'post-similar', id: 'post-similar-' + i}));
        $('#post-similar-' + i).append($('<a/>', {id:'post-link-' + i, href: post.similar_posts[i].link}));
        $('#post-link-' + i).append($('<h4/>', {text: post.similar_posts[i].title}));
        $('#post-similar-' + i).append($('<p/>', {text: post.similar_posts[i].firstname + ' ' + post.similar_posts[i].lastname}));
        $('#post-similar-' + i).append($("<p/>", {id: 'rating', html: rating_stars[post.similar_posts[i].rating]}));
        $('#post-similar-' + i).append($('<p/>', {text: post.similar_posts[i].city + ', ' + post.similar_posts[i].country}));
    }
}


$(document).ready(render_post_full);
