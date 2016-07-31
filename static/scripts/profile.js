// Should pull this info from the database
var posts = [];
var wiki = [];
var msgs = [];
var imgs = [];
var pGot = false;
var wGot = false;
var mGot = false;
var iGot = false;
var $selected = null;


function get_messages() {
    if (mGot) {
        render_messages(); 
        return;
    }
    
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/get-messages',
        data: {id: user.id},
        success: function (data) {
            msgs = data;
            mGot = true;
            render_messages(); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function get_posts() {
    if (pGot) {
        render_posts(); 
        return;
    }
    
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/get-posts',
        data: {id: user.id},
        success: function (data) {
            posts = data;
            pGot = true;
            render_posts(); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function get_wiki() {
    if (wGot) {
        render_wiki(); 
        return;
    }
    
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/get-wiki',
        data: {id: user.id},
        success: function (data) {
            wiki = data;
            wGot = true;
            render_wiki(); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function get_images() {
    if (iGot) {
        render_images(); 
        return;
    }
    
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/get-images',
        data: {id: user.id},
        success: function (data) {
            imgs = data;
            iGot = true;
            render_images();
        },
        error: function (err) {
            console.log(err);
        }
    });
}

// React classes to be filled in later
var ListingForm;
var AccountInfo;
var WikiNew;

var rating_stars = {
    1 : "Rating: &#9733;&#9734;&#9734;&#9734;&#9734;",
    2 : "Rating: &#9733;&#9733;&#9734;&#9734;&#9734;",
    3 : "Rating: &#9733;&#9733;&#9733;&#9734;&#9734;",
    4 : "Rating: &#9733;&#9733;&#9733;&#9733;&#9734;",
    5 : "Rating: &#9733;&#9733;&#9733;&#9733;&#9733;"
};

// NOTE: use second function call after server is set up

function render_general_info() {
    $('.profile-content').empty();
    $('.profile-content').append($('<section/>', {id: 'profile-general'}));
    $('#profile-general').append($('<h3/>', {id: 'name', text: user.firstname + ' ' + user.lastname}));
    $('#profile-general').append($('<p/>', {id: 'profile-status', text: 'Status: ' + user.status}));
    $('#profile-general').append($('<h4/>', {text: 'Reputation:'}));
    
    $('#profile-general').append($("<p/>", {id: 'rating', html: rating_stars[user.rating]}));
    
    $('#profile-general').append($('<p/>', {id: 'followers', text: 'Followers: ' + user.followers}));
    $('#followers').append($('<p/>', {id: 'followers-err', 'class': 'error', text: ''}));
    $('#profile-general').append($('<h4/>', {text: 'Information:'}));
    $('#profile-general').append($('<p/>', {text: 'Specialize in: ' + user.job}));
    $('#profile-general').append($('<p/>', {text: 'Located in: ' + user.city + ', ' + user.state + ', ' + user.country}));
    
}

function render_settings_form() {
//function render_settings_form(data) {
    $('.profile-content').empty();
    ReactDOM.render(<AccountInfo data={data} />,
                    document.getElementById('profile-content')
    );
    
    if (user.user_type != "Normal") {
        $("#passinfo").hide();
    }
    
    $('#update-info').on('submit', function(event) {
        let info = $('#update-info').serialize();
        info.id = user.id;
        
        $("#update-err").fadeOut().text("");
        
        event.preventDefault();
        $.ajax({
            method: "POST",
            url: '/api/change-settings',
            data: info,
            success: function () {
                if (data.status) {
                    user.firstname = $("#firstname").text();
                    user.lastname = $("#lastname").text();
                    user.status = $("#status").text();
                    user.job = $("#job").text();
                    user.city = $("#city").text();
                    user.phone = $("#phone").text();
                    render_general_info();
                } else {
                    $("#update-err").fadeIn().text("An error occurred or the passwords are incorrect.");
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
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

function render_images() {
//function render_messages(msgs) {
    $('.profile-content').empty();
    $('.profile-content').append($('<section/>', {id: 'images'}));
	$('.profile-content').append($('<h3/>', {text: 'My Images'}));
    for (var i = 0; i < imgs.length; i ++) {
        $('.profile-content').append($('<img/>', {src: 'assets/images/avatar/' + imgs[i], alt: 'Image'}));
        
    }
    $("#images").append($("<p/>", {"class": "error", "id": "image-err"}));
    $('#images').append($('<button/>', {id: "select-img", text: "Select"}));
    $('#images').append($('<button/>', {id: "delete-img", text: "Delete"}));
    $('#images').append($('<button/>', {id: "add-new-img", text: "Add New"}));
    
    $('#images img').on("click", function(event) {
        if ($selected != null) {
            $selected.toggleClass('active');
        }
        $(this).addClass("active");
        $selected = $(this);
    });
    $("#delete-img").on("click", function(event) {
        if ($selected == null) {
            $("#image-err").text("Please select an image.").fadeIn();
        } else {
            $("#image-err").text("").fadeOut();
            let srcImg = $selected.attr("src").substr(21);
            $.ajax({
                method: "GET",
                url: '/api/delete-image',
                data: {url: srcImg}, // Strip first path
                success: function () {
                    if (data.status) {
                        if (user.img == $selected.attr("src")) {
                            user.img = '';
                            $("#pic").attr("src", '/assets/images/avatar.png');
                        }
                        $selected.remove();
                        $selected = null;
                    } else {
                        $("#image-err").fadeIn().text("An error occurred");
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
    });
    $("#select-img").on("click", function(event) {
        if ($selected == null) {
            $("#image-err").text("Please select an image.").fadeIn();
        } else {
            $("#image-err").text("").fadeOut();
            let srcImg = $selected.attr("src").substr(21);
            $.ajax({
                method: "GET",
                url: '/api/set-image',
                data: {url: srcImg}, // Strip first path
                success: function () {
                    if (data.status) {
                        user.img = $selected.attr("src");
                        $("#pic").attr("src", $selected.attr("src"));
                    } else {
                        $("#image-err").fadeIn().text("An error occurred");
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
    });
}

function render_posts() {
//function render_posts(data) {
    $('.profile-content').empty();
	$('.profile-content').append($('<h3/>', {text: 'My Posts'}));
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
    
    $('#wiki-form').on('submit', function(event) {
        event.preventDefault();
        $("#wiki-err").text("").fadeOut();
        $.ajax({
            method: "POST",
            url: '/api/add-wiki',
            data: $('#wiki-form').serialize(),
            success: function (data) {
                if (data.status) {
                    wiki.push({title: $("#wiki-title").text(), content: $("#wiki-content").text()});
                    render_wiki();
                } else {
                    $("#wiki-err").text("An error occurred.").fadeIn();
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
}

// Profile loads General Info page by default
$(document).ready(function() {

    // Click functions for each menu item on profile

    var $old; // Holds previously clicked button
    $('#general').click(function() {
        render_general_info();
        if ($old != null) {
            $old.toggleClass('active');
        }
        $(this).toggleClass('active');
        $old = $(this);
    });

    $('#posts').click(function() {
        get_posts();
        $old.toggleClass('active');
        $(this).toggleClass('active');
        $old = $(this);
    });

    $('#messages').click(function() {
        get_messages();
        $old.toggleClass('active');
        $(this).toggleClass('active');
        $old = $(this);
    });

    $('#settings').click(function() {
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
        get_wiki();
        $old.toggleClass('active');
        $(this).toggleClass('active');
        $old = $(this);
    });
    $('#images').click(function() {
        get_images();
        $old.toggleClass('active');
        $(this).toggleClass('active');
        $old = $(this);
    });
    $('#follow').click(function() {
        $("#followers-err").text("").fadeOut();
        $.ajax({
            method: "GET",
            dataType: "json",
            url: '/api/follow',
            data: {id: user.id},
            success: function (data) {
                if (data.status) {
                    user.followers++;
                    $("#followers").text('Followers: ' + user.followers);
                } else {
                    $("#followers-err").fadeIn().text("You've already followed them.");
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
    
    $('#general').click();
    
    ListingForm = React.createClass({
        
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
                    <input type="hidden" name="_csrf" value={csrf}></input>
                    <button type="submit" form="listing-form" value="Submit" id="listing-button">Submit</button>
                </form>
                </div>
            );
        }
    });
    
    AccountInfo = React.createClass({
        render: function() {
            var userNodes = this.props.data.map(function(user) {
                return (
                    <form method="post" id="update-info" class="profile-form">
                        <h3>Update Account Info</h3>
                        <fieldset>
                            <legend>Personal Information:</legend>
                            <p>First name:</p>
                            <input type="text" name="firstname" id="firstname" required defaultValue={user.firstname} pattern="[a-zA-Z]{1,50}" title="This field can only consist of letters."/>
                            <p>Last name:</p>
                            <input type="text" name="lastname" id="lastname" required defaultValue={user.lastname} pattern="[a-zA-Z]{1,50}" title="This field can only consist of letters."/>
                            <p>City:</p>
                            <input type="text" id="city" name="city" required defaultValue={user.city} pattern="[a-zA-Z]{2,50}" title="This field can only consist of letters."/>
                            <p>Phone Number:</p>
                            <input type="text" id="phone" name="phone" required defaultValue={user.phone} pattern="[0-9]{10,12}" title="This field can only consist of numbers."/>
                            <p>Speciality:</p>
                            <input type="text" id="job" name="job" defaultValue={user.job} maxlength="50" pattern="[a-zA-Z ]+" title="This field can only consist of letters."/>
                            <p>Status:</p>
                            <input type="text" id="status" name="status" defaultValue={user.status} maxlength="50" pattern="[a-zA-Z ]+" title="This field can only consist of letters."/>
                        </fieldset>
                        <fieldset id="passinfo">
                            <legend>Account Information:</legend>
                            <p>Current Password (must be entered to make any changes): </p>
                            <input type="password" name="currentpass" id="currentpass"/>
                            <p>New Password:</p>
                            <input type="password" name="newpass" id="newpass" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,15}" title="Password must be between 8-15 characters, and must consist of at least one lower-case letter, one upper-case letter and one digit."/>
                            <p>Retype New Password (same as above): </p>
                            <input type="password" name="newpass2" id="newpass-confirmation" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,15}" title="Password must be between 8-15 characters, and must consist of at least one lower-case letter, one upper-case letter and one digit."/>
                        </fieldset>
                        <input type="hidden" name="_csrf" value={csrf}></input>
                        <p class="error" id="update-err"></p>
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
    
    WikiNew = React.createClass({
        render: function() {
            return (
                <section id="profile-wiki-new">
                    <h3>New Wiki Post</h3>
                    <form data-reactroot="" method="post" id="wiki-form" class="profile-form">
                        <p id="wiki-err" class="error"></p>
                        <p>Title:</p>
                        <input required type="text" name="title" id="wiki-title"></input>
                        <p>Content:</p>
                        <textarea required name="content" form="wiki-form" id="wiki-content" rows="15"></textarea>
                        <input type="hidden" name="_csrf" value={csrf}></input>
                        <button type="submit" form="wiki-form" value="Submit" id="wiki-button">Submit</button>
                    </form>
                </section>
            );
        }
    });
});