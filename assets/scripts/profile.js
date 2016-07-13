var posts = [
    {
        "author": "John Doe",
        "title": "Looking to get your smartphone repaired?!",
        "type": "Offering",
        "picture": "",
        "contact_info": "111-111-1111",
        "description": "If you're looking to get your smartphone repaired, look no further! I have been repairing smartphone for the past 5 years and I can guarantee that your smartphone will be fixed in less than 5 business days!",
        "comments": [
            {
                "author": "A A",
                "comment": "How much do you charge to replace the screen on an iPhone 6?"
            },
            {
                "author": "James A",
                "comment": "Can you fix a water damaged phone?"
            }
        ]
    },
    {
        "author": "Jane D",
        "title": "Looking for someone to fix an iPhone 4",
        "type": "Searching",
        "picture": "",
        "contact_info": "416-000-1234",
        "description": "hi, im looking for someone who can fix my iPhone 4 and replace the screen for me. pls msg me if you can help!",
        "comments": [
            {
                "author": "John Doe",
                "comment": "Hi, I am a smartphone technician and I can easily replace the screen on your iPhone. Please feel free to message me for a quote on the repair :)"
            }
        ]
    }
];

function initialize() {
    for (i = 0; i < posts.length; i ++) {
        $('.profile-content').append($('<article/>', {class: 'post', id: 'post-' + i}));
        var curr_id = '#post-' + i;
        $(curr_id).append($('<h2/>', {class: 'title', text: posts[i].title}));
        $(curr_id).append($('<p/>', {class: 'author', text: 'Posted by: ' + posts[i].author}));
        $(curr_id).append($('<p/>', {class: 'post_type', id: 'type-' + i}));
        if (posts[i].type === 'Searching') {
            $('#type-' + i).text("Searching for pet service");
        } else {
            $('#type-' + i).text("Offering pet service");
        }
        if (posts[i].contact_info != '') {
            $(curr_id).append($('<p/>', {class: 'contact-info', text: 'Contact Info: ' + posts[i].contact_info}));
        }
        $(curr_id).append($('<p/>', {class: 'description', text: "Description: " + posts[i].description}));
        $(curr_id).append($('<section/>', {class: 'comments', id: "post-" + i + "-comments"}));
        $("#post-" + i + "-comments").append($('<p/>', {text: "Comments: "}));
        for (j = 0; j < posts[i].comments.length; j ++) {
            $("#post-" + i + "-comments").append($('<hr/>'));
            $("#post-" + i + "-comments").append($('<p/>', {class: 'comment', id: 'comment-' + j + '-author', text: posts[i].comments[j].author + ": "}));
            $("#post-" + i + "-comments").append($('<p/>', {class: 'comment', id: 'comment-' + j + '-comment', text: posts[i].comments[j].comment}));
        }
    }
}



$(document).ready(initialize);