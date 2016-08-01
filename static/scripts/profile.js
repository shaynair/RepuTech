// Should pull this info from the database
var posts = [];
var wiki = [];
var msgs = [];
var pGot = false;
var wGot = false;
var mGot = false;
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

// React classes to be filled in later
var ListingForm;
var AccountInfo;
var WikiNew;
var MessageNew;

var rating_stars = {
    1 : "Rating: &#9733;&#9734;&#9734;&#9734;&#9734;",
    2 : "Rating: &#9733;&#9733;&#9734;&#9734;&#9734;",
    3 : "Rating: &#9733;&#9733;&#9733;&#9734;&#9734;",
    4 : "Rating: &#9733;&#9733;&#9733;&#9733;&#9734;",
    5 : "Rating: &#9733;&#9733;&#9733;&#9733;&#9733;"
};

// NOTE: use second function call after server is set up

function render_general_info() {
    $('.profile-content').stop(true, true).hide().empty();
    $('.profile-content').append($('<section/>', {id: 'profile-general'}));
    $('#profile-general').append($('<h3/>', {id: 'name', text: user.info.firstname + ' ' + user.info.lastname}));
    $('#profile-general').append($('<p/>', {id: 'profile-status', text: 'Status: ' + user.info.status}));
    $('#profile-general').append($('<h4/>', {text: 'Reputation:'}));
    
    $('#profile-general').append($("<p/>", {id: 'rating', html: rating_stars[user.info.rating]}));
    
    $('#profile-general').append($('<p/>', {id: 'followers', text: 'Followers: ' + user.info.followers}));
    $('#followers').append($('<p/>', {id: 'followers-err', 'class': 'error', text: ''}));
    if (user.id != myuser.id) {
        $('#followers').append($('<button/>', {id: "follow", text: "Follow"}));
    }
    $('#profile-general').append($('<h4/>', {text: 'Information:'}));
    $('#profile-general').append($('<p/>', {text: 'Specialize in: ' + user.info.job}));
    $('#profile-general').append($('<p/>', {text: 'Located in: ' + user.info.city + ', ' + user.info.region + ', ' + user.info.country}));
    
    $('.profile-content').fadeIn();
    
    
    $('#follow').click(function() {
        $("#followers-err").text("").fadeOut();
        $.ajax({
            method: "GET",
            dataType: "json",
            url: '/api/follow',
            data: {id: user.id},
            success: function (data) {
                if (data.status) {
                    user.info.followers++;
                    $("#followers").text('Followers: ' + user.info.followers);
                } else {
                    $("#followers-err").fadeIn().text("You've already followed them.");
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
}

function render_settings_form() {
//function render_settings_form(data) {
    $('.profile-content').stop(true, true).hide().empty();
    ReactDOM.render(<AccountInfo data={user} />,
                    document.getElementById('profile-content')
    );
    
    $('.profile-content').fadeIn();
    
    if (user.type != "Normal") {
        $("#passinfo").hide();
    }
    
    $('#update-info').on('submit', function(event) {
        let info = $('#update-info').serialize();
        $("#update-err").fadeOut().text("");
        
        event.preventDefault();
        $.ajax({
            method: "POST",
            url: '/api/change-settings',
            data: info,
            success: function (data) {
                if (data.status) {
                    user.info.firstname = $("#firstname").val();
                    user.info.lastname = $("#lastname").val();
                    user.info.status = $("#status").val();
                    user.info.job = $("#job").val();
                    user.info.city = $("#city").val();
                    user.info.phone = $("#phone").val();
                    
                    $("#general").click();
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
    $('.profile-content').stop(true, true).hide().empty();
    ReactDOM.render(<ListingForm/>,
                    document.getElementById('profile-content')
    );   
    
    $('.profile-content').fadeIn();
    
    $("#post-type-search").on("click", () => {
        if ($("#urgency").length == 0) { 
            $("#privacy").after($('<input type="number" pattern="[1-5]" maxlength="1" minlength="1" name="urgency" id="urgency"></input>'));
            $("#privacy").after($('<p>Urgency (1-5):</p>'));
        }
    });
    $("#post-type-offer").on("click", () => {
        $("#urgency").remove();
    });
    
    $('#listing-form').on('submit', function(event) {
        $("#listing-err").fadeOut().text("");
        
        event.preventDefault();
        $.ajax({
            method: "POST",
            url: '/api/add-post',
            data: $('#listing-form').serialize(),
            success: function (data) {
                if (data.status) {
                    pGot = false;
                    get_posts();
                } else {
                    $("#listing-err").fadeIn().text("Please check your input. All fields are required.");
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
}

function render_messages() {
    function clickEvent(event, form, uid) {
        event.preventDefault();
        
        let box = $("#reply-" + uid);
        if (box.val() == "") {
            return;
        }
        
        $.ajax({
            method: "POST",
            url: '/api/add-message',
            data: {reply: box.val(), to: uid},
            success: function (data) {
                if (data.status) {
                    $('#post-' + uid).append($('<p/>', {text: user.info.firstname + " " + user.info.lastname + ": " + box.val()}));
                    msgs[uid].messages.unshift({sender: user.id, content: box.val()}); // Add to beginning
                    
                    box.text("");
                } else {
                    $('#post-' + uid).append($('<p/>', {text: "An error occurred trying to send that."}));
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
    
//function render_messages(msgs) {
    $('.profile-content').stop(true, true).hide().empty();
    $('.profile-content').append($('<section/>', {id: 'messages'}));
	$('.profile-content').append($('<h3/>', {text: 'My Messages'}));
    for (var uid in msgs) {
        $('.profile-content').append($('<section/>', {class: 'post', id: 'post-' + uid}));
        for (var j = 0; j < msgs[uid].messages.length; j ++) {
            var m = msgs[uid].messages[j];
            var send = user.info.firstname + " " + user.info.lastname;
            if (m.sender != user.id) {
                send = msgs[uid].name;
            }
            $('#post-' + uid).append($('<p/>', {text: send + ": " + m.content}));
        }
        
        var form = $("<form/>", {method: "post"});
        
        $('#post-' + uid).append(form
                        .append('<input type="hidden" name="_csrf" value="' + csrf + '"></input>')
                        .append('<input type="text" name="reply" id="reply-"' + uid + '"></input>')
                        .append($('<button/>', {type: "submit", text: "Reply"}).on("click", (e) => clickEvent(e, form, uid))));
    }
    
    $('.profile-content').fadeIn();
}

function render_images() {
//function render_messages(msgs) {
    $('.profile-content').stop(true, true).hide().empty();
    $('.profile-content').append($('<section/>', {id: 'images-section'}));
	$('.profile-content').append($('<h3/>', {text: 'My Images'}));
    for (var i = 0; i < user.info.images.length; i ++) {
        $('.profile-content').append($('<img/>', {src: '/assets/images/avatar/' + user.info.images[i], alt: 'Image'}));
        
    }
    $("#images-section").append($("<p/>", {"class": "error", "id": "image-err"}));
    $("#images-section").append($("<form/>", {method: "post", action: "/api/new-image", enctype: "multipart/form-data", id: "upload"})
                        .append('<input type="hidden" name="_csrf" value="' + csrf + '"></input>')
                        .append('<input type="file" name="file"></input>')
                        .append($('<button/>', {id: "add-new-img", type: "submit", text: "Add New"})));
    
    $('#images-section').append($('<button/>', {id: "select-img", text: "Select Image"}));
    $('#images-section').append($('<button/>', {id: "delete-img", text: "Delete Image"}));
    
    $('#images-section img').on("click", function(event) {
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
                success: function (data) {
                    if (data.status) {
                        if (user.info.img == $selected.attr("src")) {
                            user.info.img = '';
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
                success: function (data) {
                    if (data.status) {
                        user.info.img = $selected.attr("src");
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
    
    $('.profile-content').fadeIn();
}

function render_posts(filter = null) {
//function render_posts(data) {
    $('.profile-content').stop(true, true).hide().empty();
    // Renders posts for the profile
    for (var i = 0; i < posts.length; i ++) {
        if (filter && !filter(posts[i])) {
            continue;
        }
        
        $('.profile-content').append($('<article/>', {class: 'post', id: 'post-' + i}));
        var curr_id = '#post-' + i;
        $(curr_id).append($('<a/>', {href: "/post?id=" + posts[i].id}).append($('<h2/>', {class: 'title', text: posts[i].title})));
        $(curr_id).append($('<p/>', {class: 'author', text: 'Posted by: ' + posts[i].firstname + ' ' + posts[i].lastname}));
        $(curr_id).append($('<p/>', {class: 'post_type', id: 'type-' + i}));
        if (myuser && user.id == myuser.id) {
            $(curr_id).append($('<p/>', {class: 'post_type', text: 'Privacy setting: ' + posts[i].privacy}));
        }
        if (posts[i].urgency != 0) {
            $('#type-' + i).text("Searching for service");
			$(curr_id).append($('<p/>', {class: 'post_type', text: "Urgency: " + rating_stars[posts[i].urgency]}));
        } else {
            $('#type-' + i).text("Offering service");
            $(curr_id).append($("<p/>", {class: 'post_type', html: rating_stars[posts[i].rating]}));
        }
        
        $(curr_id).append($('<p/>', {class: 'contact-info', text: 'Contact Info: ' + posts[i].phone + ' | ' + posts[i].email}));
        $(curr_id).append($('<p/>', {class: 'contact-info', text: 'Location: ' + posts[i].country + ", " + posts[i].region + ", " + posts[i].city}));
        $(curr_id).append($('<p/>', {class: 'description', text: "Description: " + posts[i].content}));
        
        $(curr_id).append($('<p/>', {class: 'description', text: "Likes: " + posts[i].likes}));
        $(curr_id).append($('<p/>', {class: 'description', text: "Comments: " + posts[i].comments.length}));
    }
    
    $('.profile-content').fadeIn();
}

function render_wiki() {
    $('.profile-content').stop(true, true).hide().empty();
	$('.profile-content').append($('<h3/>', {text: 'My Wiki Posts'}));
    $('.profile-content').append($('<section/>', {id: 'profile-wiki'}));
    $('#profile-wiki').append($('<button/>', {id: 'wiki-new', text: 'New Wiki Post'}));
    for (var i = 0; i < wiki.length; i++) {
        $('#profile-wiki').append($('<h4/>', {text: wiki[i].title}));
        $('#profile-wiki').append($('<p/>', {text: wiki[i].content}));
    }
    if (user.id == myuser.id) {
        // Click to create new wiki form
        $('#wiki-new').click(function() {
            render_wiki_new();
        });
    }
    
    $('.profile-content').fadeIn();
}

function render_wiki_new() {
    $('.profile-content').stop(true, true).hide().empty();
    if (user.id == myuser.id) {
        ReactDOM.render(<WikiNew/>,
                        document.getElementById('profile-content')
        ); 
    }
    $('.profile-content').fadeIn();
    
    $('#wiki-form').on('submit', function(event) {
        event.preventDefault();
        $("#wiki-err").text("").fadeOut();
        $.ajax({
            method: "POST",
            url: '/api/add-wiki',
            data: $('#wiki-form').serialize(),
            success: function (data) {
                if (data.status) {
                    wiki.push({title: $("#wiki-title").val(), content: $("#wiki-content").val()});
                    $("#wiki").click();
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


function render_message_new() {
    $('.profile-content').stop(true, true).hide().empty();
    if (user.id != myuser.id) {
        ReactDOM.render(<WikiNew/>,
                        document.getElementById('profile-content')
        ); 
    }
    $('.profile-content').fadeIn();
    
    $('#message-form').on('submit', function(event) {
        event.preventDefault();
        $("#message-err").text("").fadeOut();
        $.ajax({
            method: "POST",
            url: '/api/add-message',
            data: {reply: $('#message-content').val(), to: user.id},
            success: function (data) {
                if (data.status) {
                    $("#message-err").text("Sent successfully.").fadeIn();
                } else {
                    $("#message-err").text("An error occurred.").fadeIn();
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
        render_images();
        $old.toggleClass('active');
        $(this).toggleClass('active');
        $old = $(this);
    });
    $('#message').click(function() {
        render_message_new();
        $old.toggleClass('active');
        $(this).toggleClass('active');
        $old = $(this);
    });
    $('#ban').click(function() {
        // ADMIN FUNCTION
        $.ajax({
            method: "GET",
            dataType: "json",
            url: '/api/ban',
            data: {id: user.id},
            success: function (data) {
                if (data.status) {
                    window.location.href = "/profile";
                } else {
                    console.log("An error occurred.");
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
    const href = window.location.href;
    const last = href.substr(href.lastIndexOf('/') + 1);
    if (last.startsWith("profile")) {
        if (user && user != null && user.info && user.info.filled) {
            $('#general').click();
        } else {
            $('#settings').click();
            $(".profile-menu button").prop('disabled', true);
        }
    }
        
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
                    <input type="text" name="title" id="post-title"/>
                    <p>Post Type:</p>
                    <div class="radio">
                        <label>
                            <input type="radio" name='posttype' id="post-type-search" value="0" checked={this.state.selectedOption === '0'}
                            onChange={this.handleOptionChange}/>
                            Searching for Service
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name='posttype' id="post-type-offer" value="1" checked={this.state.selectedOption === '1'}
                            onChange={this.handleOptionChange}/>
                            Offering Service
                        </label>
                    </div>
                    <p>Privacy:</p>
                    <select defaultValue="All" name="privacy" id="privacy">
                        <option value="All">Viewable by all</option>
                        <option value="Registered">Viewable by all registered members</option>
                        <option value="Medium">Viewable by reputable members</option>
                        <option value="High">Viewable by highly reputable members</option>
                    </select>
                    <p>Description:</p>
                    <textarea id="post-description" name="content" rows="15"></textarea>
                    <input type="hidden" name="_csrf" value={csrf}></input>
                    
                    <p class="error" id="listing-err"></p>
                    <button type="submit" form="listing-form" value="Submit" id="listing-button">Submit</button>
                </form>
                </div>
            );
        }
    });
    
    AccountInfo = React.createClass({
        render: function() {
            var user = this.props.data;
                return (
                    <form method="post" id="update-info" class="profile-form">
                        <h3>Update Account Info</h3>
                        <fieldset>
                            <legend>Personal Information:</legend>
                            <p>First name:</p>
                            <input type="text" name="firstname" id="firstname" required defaultValue={user.info.firstname} pattern="[a-zA-Z]{1,50}" title="This field can only consist of letters."/>
                            <p>Last name:</p>
                            <input type="text" name="lastname" id="lastname" required defaultValue={user.info.lastname} pattern="[a-zA-Z]{1,50}" title="This field can only consist of letters."/>
                            <p>City:</p>
                            <input type="text" id="city" name="city" required defaultValue={user.info.city} pattern="[a-zA-Z]{2,50}" title="This field can only consist of letters."/>
                            <p>Phone Number:</p>
                            <input type="text" id="phone" name="phone" required defaultValue={user.info.phone} pattern="[0-9]{10,12}" title="This field can only consist of numbers."/>
                            <p>Speciality:</p>
                            <input type="text" id="job" name="job" defaultValue={user.info.job} maxlength="50" pattern="[a-zA-Z ]+" title="This field can only consist of letters."/>
                            <p>Status:</p>
                            <input type="text" id="status" name="status" defaultValue={user.info.status} maxlength="50" pattern="[a-zA-Z ]+" title="This field can only consist of letters."/>
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
                        <input type="hidden" name="id" value={user.id}></input>
                        <input type="hidden" name="_csrf" value={csrf}></input>
                        <p class="error" id="update-err"></p>
                        <button type="submit" form="update-info" value="Update" id="update-button">Update</button>
                    </form>
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
    
    MessageNew = React.createClass({
        render: function() {
            return (
                <section id="profile-message-new">
                    <h3>New Message</h3>
                    <form data-reactroot="" method="post" id="message-form" class="profile-form">
                        <p id="message-err" class="error"></p>
                        <p>Content:</p>
                        <textarea required name="content" form="message-form" id="message-content" rows="15"></textarea>
                        <input type="hidden" name="_csrf" value={csrf}></input>
                        <button type="submit" form="message-form" value="Submit" id="message-button">Submit</button>
                    </form>
                </section>
            );
        }
    });
    
});