let similar = [];
let maxReviewId = 0;
let maxCommentId = 0;

// API call for getting similar posts
function getSimilars() {
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/get-similar',
        data: {id: post.id},
        success: function (data) {
            similar = data;
            renderSimilar(); 
        },
        error: (err) => {
            console.log(err);
        }
    });
}

function commentClick() {
    $("#comment-err").text("").fadeOut();
    let content = $("#" + $(this).attr("id") + "-text").val();
    if (content == "" || !user) {
        return;
    }
    let to = 0;
    let reply = $(this).attr("id").split("-");
    if (reply.length > 1) {
        to = parseInt(reply[1]);
    }
        
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/comment',
        data: {id: post.id, "content": content, "to": to},
        success: (data) => {
            if (data.status) {
                renderComment({id: maxCommentId + 1, "content": content, name: user.firstname + ' ' + user.lastname, comments: []},
					true, to);
            } else {
                $("#comment-err").fadeIn().text("Please fill in the fields properly.");
            }
        },
        error: (err) => {
            console.log(err);
        }
    });
}

// Renders similar posts.
function renderSimilar() {
    for (var i = 0; i < similar.length; i++) {
        $('.post-similars').append($('<article/>', {class: 'post-similar', id: 'post-similar-' + i}));
        $('#post-similar-' + i).append($('<a/>', {id:'post-link-' + i, href: '/post?id=' + similar[i].id}));
        $('#post-link-' + i).append($('<h4/>', {text: similar[i].title}));
        $('#post-similar-' + i).append($('<p/>', {text: similar[i].firstname + ' ' + similar[i].lastname}));
        $('#post-similar-' + i).append($("<p/>", {id: 'rating', html: "Rating: " + rating_stars[similar[i].rating]}));
        $('#post-similar-' + i).append($('<p/>', {text: similar[i].city + ', ' + similar[i].country}));
    }
}

// Renders a single review.
function renderReview(r) {
	let $parent = $('.post-reviews');
	let newReview = $('<article/>', {class: 'post-review', id: 'post-review-' + r.id});
	if (user) {
		$parent.children("#review-err").before(newReview);
	} else {
		$parent.append(newReview);
	}
    newReview.append($('<h4/>', {text: 'By ' + r.name}));
        
    newReview.append($("<p/>", {id: 'rating', html: "Rating: " + rating_stars[r.rating]}));
        
    newReview.append($('<p/>', {text: r.content}));
    
    if (r.id > maxReviewId) {
        maxReviewId = r.id;
    }
}

// Renders a single comment and its children.
function renderComment(c, isNew = false, parent = 0) {
	$('#post-comment-' + c.id).remove();
	
	let newComment = $('<article/>', {class: 'post-comment', id: 'post-comment-' + c.id});
	let $parent = $('.post-comments');
	if (parent > 0) {
		$parent = $('#post-comment-' + parent);
	}
	if (user) {
		$parent.children("textarea").before(newComment);
	} else {
		$parent.append(newComment);
	}
    newComment.append($('<h4/>', {text: c.name}));
    newComment.append($('<p/>', {text: c.content}));
        
    for (let r of c.comments) {
		newComment.append($('<article/>', {class: 'post-comment', id: 'post-comment-replies-' + r.id}));
        $('#post-comment-replies-' + r.id).append($('<h4/>', {text: r.name}));
        $('#post-comment-replies-' + r.id).append($('<p/>', {text: r.content}));
    }
    if (user && parent == 0) {
        newComment.append($('<textarea/>', {id: 'reply-' + c.id + '-text'}));
		let $button = $('<button/>', {class: 'comment-reply', id: 'reply-' + c.id, text: 'Reply'});
		if (isNew) { // new click handler
			$button.click(commentClick);
		}
		
        newComment.append($button);
    }
    
    if (c.id > maxCommentId) {
        maxCommentId = c.id;
    }
}

// Renders a post in detail.
function renderFullPost() {
    loadImageSlider(post.images, '/assets/images/post/');
	
	// Post type
    if (post.urgency != 0) {
        $('#type').text("Searching for service");
        $('#type').after($('<p/>', {class: 'post_type', text: "Urgency: " + rating_stars[post.urgency]}));
    } else {
        $('#type').text("Offering service");
        $('#type').after($("<p/>", {class: 'post_type', html: "Rating: " + rating_stars[post.rating]}));
	}

    // Comments
    for (let c of post.comments) {
        renderComment(c);
    }
    // Reviews
    for (let r of post.reviews) {
        renderReview(r);
    }
}


$(document).ready(() => {
	// Like button.
    $('#like').click(() => {
        $("#like-err").text("").fadeOut();
        $.ajax({
            method: "GET",
            dataType: "json",
            url: '/api/like',
            data: {id: post.id},
            success: (data) => {
                if (data.status) {
                    post.likes++;
                    $("#likes").text('Likes: ' + post.likes);
                } else {
                    $("#like-err").fadeIn().text("You've already liked it.");
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
    
	// Review button.
    $('#review').click(() => {
        $("#review-err").text("").fadeOut();
        let content = $("#review-text").val();
        let rate = $("#review-rate").val();
        if (content == "" || rate == "" || !user) {
            return;
        }
        $.ajax({
            method: "GET",
            dataType: "json",
            url: '/api/review',
            data: {id: post.id, "content": content, rating: rate},
            success: (data) => {
                if (data.status) {
                    renderReview({id: maxReviewId + 1, rating: rate, "content": content, name: user.firstname + ' ' + user.lastname});
                } else {
                    $("#review-err").fadeIn().text("Please fill in the fields properly. Or you've already made a review.");
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
    
    $('.comment-reply').click(commentClick);
});