let similar = [];

function get_similars() {
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/get-similar',
        data: {id: post.id},
        success: function (data) {
            similar = data;
            render_similar(); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function render_similar() {
    for (var i = 0; i < similar.length; i++) {
        $('.post-similars').append($('<article/>', {class: 'post-similar', id: 'post-similar-' + i}));
        $('#post-similar-' + i).append($('<a/>', {id:'post-link-' + i, href: '/post?id=' + similar[i].id}));
        $('#post-link-' + i).append($('<h4/>', {text: similar[i].title}));
        $('#post-similar-' + i).append($('<p/>', {text: similar[i].firstname + ' ' + similar[i].lastname}));
        $('#post-similar-' + i).append($("<p/>", {id: 'rating', html: rating_stars[similar[i].rating]}));
        $('#post-similar-' + i).append($('<p/>', {text: similar[i].city + ', ' + similar[i].country}));
    }
}

function render_review(r) {
    $('.post-reviews').append($('<article/>', {class: 'post-review', id: 'post-review-' + r.id}));
    $('#post-review-' + r.id).append($('<h4/>', {text: 'By ' + r.name}));
        
    $('#post-review-' + r.id).append($("<p/>", {id: 'rating', html: rating_stars[r.rating]}));
        
    $('#post-review-' + r.id).append($('<p/>', {text: r.content}));
}

function render_comment(c) {
    $('.post-comments').append($('<article/>', {class: 'post-comment', id: 'post-comment-' + c.id}));
    $('#post-comment-' + c.id).append($('<h4/>', {text: c.name}));
    $('#post-comment-' + c.id).append($('<p/>', {text: c.content}));
        
    for (let r of c.comments) {
        $('#post-comment-' + c.id).append($('<article/>', {class: 'post-comment', id: 'post-comment-replies-' + c.id}));
        $('#post-comment-replies-' + c.id).append($('<h4/>', {text: r.name}));
        $('#post-comment-replies-' + c.id).append($('<p/>', {text: r.content}));
    }
    if (user) {
        $('#post-comment-' + c.id).append($('<textarea/>', {id: 'reply-' + c.id + '-text'}));
        $('#post-comment-' + c.id).append($('<button/>', {class: 'comment-reply', id: 'reply-' + c.id, text: 'Reply'}));
    }
}

function render_post_full() {
    $('.post-content').empty();
    $('.post-content').append($('<section/>', {class: 'post-full'}));
    
    // Post info
    $('.post-full').append($('<section/>', {id: "gallery"}));
    
    loadImageSlider(post.images);
    
    $('.post-full').append($('<h2/>', {text: post.title}));
    $('.post-full').append($('<p/>', {class: 'post-author', text: 'Author: ' + post.firstname + ' ' + post.lastname}));
    $('.post-author').append($('<a/>', {href: '/profile?id=' + post.poster}).append($('<button/>', {text: 'View Profile'})));
    
    $('.post-full').append($('<p/>', {class: 'post_type', id: 'type'}));
    if (post.urgency != 0) {
        $('#type').text("Searching for service");
        $('.post-full').append($('<p/>', {class: 'post_type', text: "Urgency: " + rating_stars[posts[i].urgency]}));
    } else {
        $('#type').text("Offering service");
        $('.post-full').append($("<p/>", {class: 'post_type', html: rating_stars[posts[i].rating]}));
    }
        
    $('.post-full').append($('<p/>', {text: 'Contact: ' + post.phone + ' | ' + post.email}));
    $('.post-full').append($('<p/>', {text: 'Location: ' + posts[i].country + ", " + posts[i].region + ", " + posts[i].city}));
    $('.post-full').append($('<p/>', {text: post.content}));
    
    $('.post-full').append($('<p/>', {id: 'likes', text: "Likes: " + post.likes}));
    if (user) {
        $('.post-full').append($('<p/>', {class: 'error', id: 'like-err'}));
        $('.post-full').append($('<button/>', {id: 'like', text: 'Like'}));
    }
    // Comments
    $('.post-content').append($('<section/>', {class: 'post-comments'}));
    $('.post-comments').append($('<h3/>', {text: 'Comments'}));
    
    for (let c of post.comments) {
        render_comment(c);
    }
    if (user) {
        $('.post-comments').append($('<p/>', {class: 'error', id: 'comment-err'}));
        $('.post-comments').append($('<textarea/>', {id: 'reply-text'}));
        $('.post-comments').append($('<button/>', {class: 'comment-reply', id: 'reply', text: 'Reply'}));
    }
    
    // Reviews
    $('.post-content').append($('<section/>', {class: 'post-reviews'}));
    $('.post-reviews').append($('<h3/>', {text: 'Reviews'}));
    
    for (let r of post.reviews) {
        render_review(r);
    }
    if (user) {
        $('.post-reviews').append($('<p/>', {class: 'error', id: 'review-err'}));
        $('.post-reviews').append($('<input/>', {id: 'review-rate', type: 'number'}));
        $('.post-reviews').append($('<textarea/>', {id: 'review-text'}));
        $('.post-reviews').append($('<button/>', {id: 'review', text: 'Leave a Review'}));
    }
    // Similar posts
    $('.post-content').append($('<section/>', {class: 'post-similars'}));
    $('.post-similars').append($('<h3/>', {text: 'Similar Posts'}));
    render_similar();
}


$(document).ready(() => {
    render_post_full();
    
    $('#like').click(function() {
        $("#like-err").text("").fadeOut();
        $.ajax({
            method: "GET",
            dataType: "json",
            url: '/api/like',
            data: {id: post.id},
            success: function (data) {
                if (data.status) {
                    post.likes++;
                    $("#likes").text('Likes: ' + post.likes);
                } else {
                    $("#like-err").fadeIn().text("You've already followed them.");
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
    
    // Make our REST call
    get_similars();
});