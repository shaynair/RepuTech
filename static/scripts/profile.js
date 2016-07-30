// Should pull this info from the database
var data = [
    {
        "img": "../assets/images/avatar.png",
        "firstname": "John",
        "lastname": "Doe",
        "country": "Canada",
		"prov_state": "Ontario",
        "city": "Toronto",
        "phonenum": "1234567890",
        "email": "john.doe@email.com",
        "rating": 4,
        "followers": 23,
        "job": "Smartphone Technician",
        "status": "Feeling tech-tastic",
        "posts": [
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
        ],
        "wiki": [
            {
                "title": "Lorem Ipsum",
                "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam molestie sagittis porttitor. Pellentesque ipsum est, scelerisque ultricies vulputate a, dapibus sit amet dolor. Curabitur euismod libero sit amet quam consequat, vitae tempor augue gravida. Praesent sit amet libero sed neque bibendum imperdiet vel quis ligula. Proin interdum porta interdum. Quisque vitae facilisis ex, ac ornare enim. Suspendisse accumsan tellus nec ex auctor tincidunt. Pellentesque placerat dapibus turpis, ac consequat ex sodales vitae. Etiam auctor maximus auctor. Pellentesque gravida, leo nec faucibus posuere, magna metus placerat ex, sed bibendum nibh urna at lectus. Duis nunc mauris, molestie et dui non, auctor dictum urna. Aliquam arcu lacus, faucibus sit amet vestibulum aliquam, tincidunt eget ex. Morbi et sem id ante consequat aliquet. Nulla nibh arcu, aliquet in ultricies lacinia, bibendum a nisl. Pellentesque a finibus neque."
            },
            {
                "title": "Lorem Ipsum 2",
                "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam molestie sagittis porttitor. Pellentesque ipsum est, scelerisque ultricies vulputate a, dapibus sit amet dolor. Curabitur euismod libero sit amet quam consequat, vitae tempor augue gravida. Praesent sit amet libero sed neque bibendum imperdiet vel quis ligula. Proin interdum porta interdum. Quisque vitae facilisis ex, ac ornare enim. Suspendisse accumsan tellus nec ex auctor tincidunt. Pellentesque placerat dapibus turpis, ac consequat ex sodales vitae. Etiam auctor maximus auctor. Pellentesque gravida, leo nec faucibus posuere, magna metus placerat ex, sed bibendum nibh urna at lectus. Duis nunc mauris, molestie et dui non, auctor dictum urna. Aliquam arcu lacus, faucibus sit amet vestibulum aliquam, tincidunt eget ex. Morbi et sem id ante consequat aliquet. Nulla nibh arcu, aliquet in ultricies lacinia, bibendum a nisl. Pellentesque a finibus neque."
            }
        ]
    }
];

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
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '',
        success: function (data) {
            render_messages(data); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function get_general_info() {
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '',
        success: function (data) {
            render_general_info(data); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function get_settings_form() {
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '',
        success: function (data) {
            render_settings_form(data); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function get_posts() {
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '',
        success: function (data) {
            render_posts(data); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}

var ListingForm = React.createClass({
    
    getInitialState: function() {
        return {
            selectedOption: "Searching"
        };
    },
    
    handleOptionChange: function (changeEvent) {
        this.setState({
            selectedOption: changeEvent.target.value
        });
    },
    
    render: function() {
        return (
			<div>
            <h3>Create Listing</h3>
            <form method="post" id="listing-form" class="profile-form">
                <p>Title:</p>
                <input type="text" id="post-title"/>
                <p>Post Type:</p>
                <div class="radio">
                    <label>
                        <input type="radio" name='post-type' value="Searching" checked={this.state.selectedOption === 'Searching'}
                        onChange={this.handleOptionChange}/>
                        Searching for Service
                    </label>
                </div>
                <div class="radio">
                    <label>
                        <input type="radio" name='post-type' value="Offering" checked={this.state.selectedOption === 'Offering'}
                        onChange={this.handleOptionChange}/>
                        Offering Service
                    </label>
                </div>
                <p>Description:</p>
                <textarea id="post-description" rows="15"></textarea>
                <button type="submit" form="listing-form" value="Submit" id="listing-button">Submit</button>
            </form>
			</div>
        );
    }
});


var AccountInfo = React.createClass({
    render: function() {
        var userNodes = this.props.data.map(function(user) {
            return (
                <form method="post" id="update-info" class="profile-form">
					<h3>Update Account Info</h3>
                    <fieldset>
                        <legend>Personal Information:</legend>
                        <p>First name:</p>
                        <input type="text" id="firstname" defaultValue={user.firstname} pattern="[a-zA-Z]+" title="This field can only consist of letters."/>
                        <p>Last name:</p>
                        <input type="text" id="lastname" defaultValue={user.lastname} pattern="[a-zA-Z]+" title="This field can only consist of letters."/>
                        <p>Country:</p>
                        <select id="country" required name="country">
				            <option selected>{user.country}</option>
				        </select>
				        <p>Province/State:</p>
				        <select id="state" required name="state">
                            <option selected>{user.prov_state}</option>
				        </select>
                        <p>City:</p>
                        <input type="text" id="city" defaultValue={user.city} pattern="[a-zA-Z]{2,}" title="This field can only consist of letters."/>
                        <p>Phone Number:</p>
                        <input type="text" id="phonenum" defaultValue={user.phonenum} pattern="[0-9]{10,12}" title="This field can only consist of numbers."/>
                    </fieldset>
                    <fieldset>
                        <legend>Account Information:</legend>
                        <p>Email:</p>
                        <input type="text" id="email" defaultValue={user.email} pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}" title="E-mail address must be valid."/>
                        <p>Current Password (must be entered to make any changes): </p>
                        <input type="password" id="currentpass"/>
                        <p>New Password:</p>
                        <input type="password" id="newpass" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,15}" title="Password must be between 8-15 characters, and must consist of at least one lower-case letter, one upper-case letter and one digit."/>
                        <p>Retype New Password (same as above): </p>
                        <input type="password" id="newpass-confirmation" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,15}" title="Password must be between 8-15 characters, and must consist of at least one lower-case letter, one upper-case letter and one digit."/>
                    </fieldset>
                    <button type="submit" form="update-info" value="Update" id="update-button">Update</button>
                </form>
            );
        });
        return (
            <div className="AccountInfo">
                {userNodes}
            </div>
        );
    }
});

var WikiNew = React.createClass({
    render: function() {
        return (
            <section id="profile-wiki-new">
				<h3>New Wiki Post</h3>
                <form data-reactroot="" method="post" id="wiki-form" class="profile-form">
                    <p>Title:</p>
                    <input type="text" id="wiki-title"></input>
                    <p>Content:</p>
                    <textarea id="wiki-content" rows="15"></textarea>
                    <button type="submit" form="wiki-form" value="Submit" id="wiki-button">Submit</button>
                </form>
            </section>
        );
    }
});

var rating_stars = {
    1 : "Rating: &#9733;&#9734;&#9734;&#9734;&#9734;",
    2 : "Rating: &#9733;&#9733;&#9734;&#9734;&#9734;",
    3 : "Rating: &#9733;&#9733;&#9733;&#9734;&#9734;",
    4 : "Rating: &#9733;&#9733;&#9733;&#9733;&#9734;",
    5 : "Rating: &#9733;&#9733;&#9733;&#9733;&#9733;"
};

// NOTE: use second function call after server is set up

function render_general_info() {
//function render_general_info(data) {
    $('.profile-content').empty();
    $('.profile-content').append($('<section/>', {id: 'profile-general'}));
    var user = data[0];
    $('#profile-general').append($('<h3/>', {id: 'name', text: user.firstname + ' ' + user.lastname}));
    $('#profile-general').append($('<p/>', {id: 'profile-status', text: 'Status: ' + user.status}));
    $('#profile-general').append($('<h4/>', {text: 'Reputation:'}));
    
    $('#profile-general').append($("<p/>", {id: 'rating', html: rating_stars[user.rating]}));
    
    $('#profile-general').append($('<p/>', {id: 'followers', text: 'Followers: ' + user.followers}));
    $('#followers').append($('<button/>', {id: 'follow', text: 'Follow'}));
    $('#profile-general').append($('<h4/>', {text: 'Information:'}));
    $('#profile-general').append($('<p/>', {text: 'Specialize in: ' + user.job}));
    $('#profile-general').append($('<p/>', {text: 'Located in: ' + user.city + ', ' + user.country}));
    $('#profile-general').append($('<section/>', {id: 'gallery'}));
    $('#gallery').append($('<h4/>', {text: 'My images:'}));
    
}

function render_settings_form() {
//function render_settings_form(data) {
    $('.profile-content').empty();
    ReactDOM.render(<AccountInfo data={data} />,
                    document.getElementById('profile-content')
    );
}

function render_listing_form() {
    $('.profile-content').empty();
    ReactDOM.render(<ListingForm/>,
                    document.getElementById('profile-content')
    );   
}

function render_messages() {
//function render_messages(msgs) {
    $('.profile-content').empty();
    $('.profile-content').append($('<section/>', {id: 'messages'}));
	$('.profile-content').append($('<h3/>', {text: 'My Messages'}));
    for (var i = 0; i < msgs.length; i ++) {
        $('.profile-content').append($('<section/>', {class: 'post', id: 'post-' + i}));
        for (var j = 0; j < msgs[i].length; j ++) {
            $('#post-' + i).append($('<p/>', {text: msgs[i][j][0] + ": " + msgs[i][j][1]}));
        }
        $('#post-' + i).append($('<button/>', {text: "Reply"}));
    }
}

function render_posts() {
//function render_posts(data) {
    $('.profile-content').empty();
	$('.profile-content').append($('<h3/>', {text: 'My Posts'}));
    var posts = data[0].posts;
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

function render_wiki() {
    $('.profile-content').empty();
	$('.profile-content').append($('<h3/>', {text: 'My Wiki Posts'}));
    var wiki = data[0].wiki;
    $('.profile-content').append($('<section/>', {id: 'profile-wiki'}));
    $('#profile-wiki').append($('<button/>', {id: 'wiki-new', text: 'New Wiki Post'}));
    for (var i = 0; i < wiki.length; i++) {
        $('#profile-wiki').append($('<h4/>', {text: wiki[i].title}));
        $('#profile-wiki').append($('<p/>', {text: wiki[i].content}));
    }
    // Click to create new wiki form
    $('#wiki-new').click(function() {
        render_wiki_new();
    });
}

function render_wiki_new() {
    $('.profile-content').empty();
    ReactDOM.render(<WikiNew/>,
                    document.getElementById('profile-content')
    ); 
}


// Click functions for each menu item on profile

// NOTE: use get_general_info(); instead of render_general_info();
// after server is set up (same for all the other calls)

var $old; // Holds previously clicked button
$('#general').click(function() {
    //get_general_info();
    render_general_info();
    if ($old != null) {
        $old.toggleClass('active');
    }
    $(this).toggleClass('active');
    $old = $(this);
    LoadImageSlider();
});

$('#posts').click(function() {
    //get_posts();
    render_posts();
    $old.toggleClass('active');
    $(this).toggleClass('active');
    $old = $(this);
});

$('#messages').click(function() {
    //get_messages();
    render_messages();
    $old.toggleClass('active');
    $(this).toggleClass('active');
    $old = $(this);
});

$('#settings').click(function() {
    //get_settings_form();
    render_settings_form();
    $old.toggleClass('active');
    $(this).toggleClass('active');
    $old = $(this);
});

$('#create-listing').click(function() {
    render_listing_form();
    $old.toggleClass('active');
    $(this).toggleClass('active');
    $old = $(this);
});

$('#wiki').click(function() {
    render_wiki();
    $old.toggleClass('active');
    $(this).toggleClass('active');
    $old = $(this);
});

$('.follow').click(function() {
    // NOT SURE WHAT TO SEND SINCE WE DONT HAVE BOTH USERS IDs
});

$('.profile-form').on('submit', function(event) {
    $.ajax({
        method: "POST",
        url: '',
        data: $('form').serialize(),
        success: function () {
            // DO SOMETHING HERE!
        },
        error: function (err) {
            console.log(err);
        }
    });
});

// Profile loads General Info page by default
$(document).ready(function() {
    
    // Check if user has a profile pic, else use default avatar
    if (data[0].img != "") {
        $('.profile-pic').append($('<img>', {alt: "avatar", src: data[0].img}));
    } else {
        $('.profile-pic').append($('<img>', {alt: "avatar", src: "/assets/images/avatar.png"}));
    }
    
    $('#general').click();
});