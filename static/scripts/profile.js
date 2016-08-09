// Should pull this info from the database
var userPosts = [];
var wiki = [];
var msgs = [];
let pGot = false;
let wGot = false;
let mGot = false;
let $selected = null;


function getMessages() {
    if (mGot) {
        renderMessages(); 
        return;
    }
    
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/get-messages',
        data: {id: user.id},
        success: (data) => {
            msgs = data;
            mGot = true;
            renderMessages(); 
        },
        error: (err) => {
            console.log(err);
        }
    });
}

function getPosts() {
    if (pGot) {
        renderPosts(userPosts); 
        return;
    }
    
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/get-posts',
        data: {id: user.id},
        success: (data) => {
            userPosts = data;
            pGot = true;
            renderPosts(userPosts); 
        },
        error: (err) => {
            console.log(err);
        }
    });
}

function getWiki() {
    if (wGot) {
        renderWiki(); 
        return;
    }
    
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/get-wiki',
        data: {id: user.id},
        success: (data) => {
            wiki = data;
            wGot = true;
            renderWiki(); 
        },
        error: (err) => {
            console.log(err);
        }
    });
}

// React classes to be filled in later
let ListingForm;
let AccountInfo;
let WikiNew;
let MessageNew;

var rating_stars = [
	"&#9734;&#9734;&#9734;&#9734;&#9734;",
    "&#9733;&#9734;&#9734;&#9734;&#9734;",
    "&#9733;&#9733;&#9734;&#9734;&#9734;",
    "&#9733;&#9733;&#9733;&#9734;&#9734;",
    "&#9733;&#9733;&#9733;&#9733;&#9734;",
    "&#9733;&#9733;&#9733;&#9733;&#9733;"
];

// Renders main page.
function renderProfileInfo() {
    $('#profile-content').stop(true, true).hide().empty();
    $('#profile-content').append($('<section/>', {id: 'profile-general'}));
    $('#profile-general').append($('<h3/>', {id: 'name', text: (user.is_admin ? '[Staff] ' : '') + user.firstname + ' ' + user.lastname}));
    $('#profile-general').append($('<p/>', {id: 'profile-status', text: 'Status: ' + user.info.status}));
    $('#profile-general').append($('<h4/>', {text: 'Reputation:'}));
    
    $('#profile-general').append($("<p/>", {id: 'rating', html: "Rating: " + rating_stars[user.is_admin ? 5 : user.info.rating]}));
    
    $('#profile-general').append($('<p/>', {id: 'followers', text: 'Followers: ' + user.info.followers}));
    $('#followers').append($('<p/>', {id: 'followers-err', 'class': 'error', text: ''}));
    if (myuser && user.id != myuser.id) {
        $('#followers').append($('<button/>', {id: "follow", text: "Follow"}));
    }
    $('#profile-general').append($('<h4/>', {text: 'Information:'}));
    $('#profile-general').append($('<p/>', {text: 'Specialize in: ' + user.info.job}));
    $('#profile-general').append($('<p/>', {text: 'Located in: ' + user.info.city + ', ' + user.info.region + ', ' + user.info.country}));
    
    $('#profile-content').fadeIn();
    
    
    $('#follow').click(() => {
        $("#followers-err").text("").fadeOut();
        $.ajax({
            method: "GET",
            dataType: "json",
            url: '/api/follow',
            data: {id: user.id},
            success: (data) => {
                if (data.status) {
                    user.info.followers++;
                    $("#followers").text('Followers: ' + user.info.followers);
                } else {
                    $("#followers-err").fadeIn().text("You've already followed them.");
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
}

// Renders settings page.
function renderSettings() {
    $('#profile-content').stop(true, true).hide().empty();
    ReactDOM.render(<AccountInfo />,
                    document.getElementById('profile-content')
    );
    
	// Populate states & countries
    $("#country").empty();
    for (let c of Object.keys(countries).sort()) {
        let count = $('<option value="' + countries[c] + '">' + c + '</option>');
        if (countries[c] == user.info.country) {
            count.prop("selected", true);
        }
        $("#country").append(count);
    } 
    populateStates();
    $("#country").on("change", populateStates);
    
    $('#profile-content').fadeIn();
    
    if (user.type != "Normal") {
        $("#passinfo").hide(); // No passwords for third-party logins
    }
    
	// When submitting
    $('#update-info').on('submit', (event) => {
        let info = $('#update-info').serialize();
        $("#update-err").fadeOut().text("");
        
        event.preventDefault();
        $.ajax({
            method: "POST",
            url: '/api/change-settings',
            data: info,
            success: (data) => {
                if (data.status) {
                    user.firstname = $("#firstname").val();
                    user.lastname = $("#lastname").val();
                    user.info.status = $("#status").val();
                    user.info.job = $("#job").val();
                    user.info.city = $("#city").val();
                    user.info.phone = $("#phone").val();
                    user.info.country = countries[$("#country").val()];
                    user.info.filled = true;
                    // Re-enable the buttons
                    $(".profile-menu button").prop('disabled', false);
                    $("#general").click();
                } else {
                    $("#update-err").fadeIn().text("An error occurred or the passwords are incorrect.");
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
}

// Renders page for creating a new listing.
function renderNewListingForm() {
    $('#profile-content').stop(true, true).hide().empty();
    ReactDOM.render(<ListingForm/>,
                    document.getElementById('profile-content')
    );   
    
    $('#profile-content').fadeIn();
    
    $("#post-type-search").on("click", () => {
        if ($("#urgency").length == 0) { 
            $("#privacy").after($('<input type="number" pattern="[1-5]" maxlength="1" minlength="1" name="urgency" id="urgency"></input>'));
            $("#privacy").after($('<p id="urgency-prompt">Urgency (1-5):</p>'));
        }
    });
    $("#post-type-offer").on("click", () => {
        $("#urgency").remove();
		$("#urgency-prompt").remove();
    });
    
    $('#listing-form').on('submit', function(event) {
        $("#listing-err").fadeOut().text("");
        
        event.preventDefault();
        $.ajax({
            method: "POST",
            url: '/api/add-post',
            data: $('#listing-form').serialize(),
            success: (data) => {
                if (data.status) {
                    pGot = false;
                    $("#posts").click();
                } else {
                    $("#listing-err").fadeIn().text("Please check your input. All fields are required.");
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
}

function renderMessages() {
    function clickEvent(event, form, uid) {
        event.preventDefault();
        
        let $box = $("#reply-" + uid);
        if ($box.val() == "") {
            return;
        }
        $.ajax({
            method: "POST",
            url: '/api/add-message',
            data: {reply: $box.val(), "_csrf": csrf, to: uid},
            success: (data) => {
                if (data.status) {
                    $('#post-' + uid + ' h4').after($('<p/>', {text: user.firstname + " " + user.lastname + ": " + $box.val()}));
                    msgs[uid].messages.unshift({sender: user.id, content: $box.val()}); // Add to beginning
                    
                    $box.text("");
                } else {
                    $('#post-' + uid).append($('<p/>', {text: "An error occurred trying to send that."}));
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    }
    
    $('#profile-content').stop(true, true).hide().empty();
    $('#profile-content').append($('<section/>', {id: 'messages-section'}));
	$('#messages-section').append($('<h3/>', {text: 'My Messages'}));
	
    for (let uid in msgs) {
        $('#messages-section').append($('<section/>', {class: 'post', id: 'post-' + uid}));
		$('#post-' + uid).append($('<h4/>', {text: msgs[uid].name}));
        for (let m of msgs[uid].messages) {
            var send = user.firstname + " " + user.lastname;
            if (m.sender != user.id) {
                send = msgs[uid].name;
            }
            $('#post-' + uid).append($('<p/>', {text: send + ": " + m.content}));
        }
        
        var form = $("<form/>", {method: "post"});
        
        $('#post-' + uid).append(form
                        .append('<input type="hidden" name="_csrf" value="' + csrf + '"></input>')
                        .append('<input type="text" name="reply" id="reply-' + uid + '"></input>')
                        .append($('<button/>', {type: "submit", text: "Reply"}).on("click", (e) => clickEvent(e, form, uid))));
    }
    
    $('#profile-content').fadeIn();
}

function renderImages() {
    $('#profile-content').stop(true, true).hide().empty();
    $('#profile-content').append($('<section/>', {id: 'images-section'}));
	$('#images-section').append($('<h3/>', {text: 'My Images'}));
	$('#images-section').append($('<section/>', {id: 'images-inner', class: 'flexbox flexbox-column'}));
    for (let i of user.info.images) {
        $('#images-inner').append($('<img/>', {src: '/assets/images/avatar/' + i, alt: 'Image'}));
        
    }
    $("#images-section").append($("<p/>", {"class": "error", "id": "image-err"}));
    
    
    // Create a form to accept images
    $("#images-section").append($("<form/>", {method: "post", action: "/api/new-image?_csrf=" + csrf, enctype: "multipart/form-data", id: "upload"})
                       //.append('<input type="hidden" name="_csrf" value="' + csrf + '"></input>')
                        .append('<input type="file" name="file" accept="image/*"></input>')
                        .append($('<button/>', {id: "add-new-img", type: "submit", text: "Add New"})));
    
    $('#images-section').append($('<button/>', {id: "select-img", text: "Select Image"}));
    $('#images-section').append($('<button/>', {id: "delete-img", text: "Delete Image"}));
    
    $('#images-section img').on("click", function(event) {
        if ($selected != null) {
            $selected.toggleClass('active-img');
        }
        $(this).addClass("active-img");
        $selected = $(this);
    });
	// Delete image is clicked
    $("#delete-img").on("click", (event) => {
        if ($selected == null) {
            $("#image-err").text("Please select an image.").fadeIn();
        } else {
            $("#image-err").text("").fadeOut();
            let srcImg = $selected.attr("src").substr(22);
            $.ajax({
                method: "GET",
                url: '/api/delete-image',
                data: {url: srcImg}, // Strip first path
                success: (data) => {
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
                error: (err) => {
                    console.log(err);
                }
            });
        }
    });
	// Select image is clicked
    $("#select-img").on("click", (event) => {
        if ($selected == null) {
            $("#image-err").text("Please select an image.").fadeIn();
        } else {
            $("#image-err").text("").fadeOut();
            let srcImg = $selected.attr("src").substr(22);
            $.ajax({
                method: "GET",
                url: '/api/set-image',
                data: {url: srcImg}, // Strip first path
                success: (data) => {
                    if (data.status) {
                        user.info.img = $selected.attr("src");
                        $("#pic").attr("src", $selected.attr("src"));
                    } else {
                        $("#image-err").fadeIn().text("An error occurred");
                    }
                },
                error: (err) => {
                    console.log(err);
                }
            });
        }
    });
    
    $('#profile-content').fadeIn();
}

function renderPosts(posts, filter = null) {
//function renderPosts(data) {
    $('#profile-content').stop(true, true).hide().empty();
    if (filter == null) { // profile
        $('#profile-content').append($('<h3/>', {text: 'My Posts'}));
    }
    
    // Renders posts for the profile
    for (let p of posts) {
        if (filter && !filter(p)) {
            continue;
        }
        
        $('#profile-content').append($('<article/>', {class: 'post', id: 'post-' + p.id}));
        let curr_id = '#post-' + p.id;
        $(curr_id).append($('<a/>', {href: "/post?id=" + p.id}).append($('<h2/>', {class: 'title', text: p.title})));
		if (filter != null) {// only search
			$(curr_id).append($('<p/>', {class: 'author', text: 'Posted by: ' + p.firstname + ' ' + p.lastname}));
		}
        $(curr_id).append($('<p/>', {class: 'post_type', id: 'type-' + p.id}));
        if (!filter && myuser && user.id == myuser.id) {
            $(curr_id).append($('<p/>', {class: 'post_type', text: 'Privacy setting: ' + p.privacy}));
        }
        if (p.urgency != 0) {
            $('#type-' + p.id).text("Searching for service");
			$(curr_id).append($('<p/>', {class: 'post_type', html: "Urgency: " + rating_stars[p.urgency]}));
        } else {
            $('#type-' + p.id).text("Offering service");
            $(curr_id).append($("<p/>", {class: 'post_type', html: "Rating: " + rating_stars[p.rating]}));
        }
        
        $(curr_id).append($('<p/>', {class: 'contact-info', text: 'Contact Info: ' + p.phone + ' | ' + p.email}));
		if (filter != null) {// only search
			$(curr_id).append($('<p/>', {class: 'contact-info', text: 'Location: ' + p.country + ", " + p.region + ", " + p.city}));
		}
        $(curr_id).append($('<p/>', {class: 'description', text: "Description: " + p.content}));
        
        $(curr_id).append($('<p/>', {class: 'description', text: "Likes: " + p.likes}));
        $(curr_id).append($('<p/>', {class: 'description', text: "Comments: " + p.comments.length}));
    }
    
    $('#profile-content').fadeIn();
}

function renderWiki() {
    $('#profile-content').stop(true, true).hide().empty();
	$('#profile-content').append($('<h3/>', {text: 'Wiki Posts'}));
    $('#profile-content').append($('<section/>', {id: 'profile-wiki'}));
	if (user.id == myuser.id) {
		$('#profile-wiki').append($('<button/>', {id: 'wiki-new', text: 'New Wiki Post'}));
    
        // Click to create new wiki form
        $('#wiki-new').click(function() {
            renderNewWikiForm();
        });
    }
    
    for (let w of wiki) {
        $('#profile-wiki').append($('<h4/>', {text: w.title}));
        $('#profile-wiki').append($('<p/>', {text: w.content}));
    }

    $('#profile-content').fadeIn();
}

function renderNewWikiForm() {
    $('#profile-content').stop(true, true).hide().empty();
    if (user.id == myuser.id) {
        ReactDOM.render(<WikiNew/>,
                        document.getElementById('profile-content')
        ); 
    }
    $('#profile-content').fadeIn();
    
    $('#wiki-form').on('submit', function(event) {
        event.preventDefault();
        $("#wiki-err").text("").fadeOut();
        $.ajax({
            method: "POST",
            url: '/api/add-wiki',
            data: $('#wiki-form').serialize(),
            success: (data) => {
                if (data.status) {
                    wiki.push({title: $("#wiki-title").val(), content: $("#wiki-content").val()});
                    $("#wiki").click();
                } else {
                    $("#wiki-err").text("An error occurred.").fadeIn();
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
}


function renderNewMessageForm() {
    $('#profile-content').stop(true, true).hide().empty();
    if (user.id != myuser.id) {
        ReactDOM.render(<MessageNew/>,
                        document.getElementById('profile-content')
        ); 
    }
    $('#profile-content').fadeIn();
    
    $('#message-form').on('submit', (event) => {
        event.preventDefault();
        $("#message-err").text("").fadeOut();
        $.ajax({
            method: "POST",
            url: '/api/add-message',
            data: {reply: $('#message-content').val(), "_csrf": csrf, to: user.id},
            success: (data) => {
                if (data.status) {
                    $("#message-err").text("Sent successfully.").fadeIn();
                } else {
                    $("#message-err").text("An error occurred.").fadeIn();
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
}

// Profile loads General Info page by default
$(document).ready(function() {

    // Click functions for each menu item on profile

    let $old = null; // Holds previously clicked button
    $('#general').click(function() {
        renderProfileInfo();
        if ($old != null) {
            $old.toggleClass('active');
        }
        $(this).toggleClass('active');
        $old = $(this);
    });

    $('#posts').click(function() {
        getPosts();
        if ($old != null) {
            $old.toggleClass('active');
        }
        $(this).toggleClass('active');
        $old = $(this);
    });

    $('#messages').click(function() {
        getMessages();
        if ($old != null) {
            $old.toggleClass('active');
        }
        $(this).toggleClass('active');
        $old = $(this);
    });

    $('#settings').click(function() {
        renderSettings();
        if ($old != null) {
            $old.toggleClass('active');
        }
        $(this).toggleClass('active');
        $old = $(this);
    });

    $('#create-listing').click(function() {
        renderNewListingForm();
        if ($old != null) {
            $old.toggleClass('active');
        }
        $(this).toggleClass('active');
        $old = $(this);
    });

    $('#wiki').click(function() {
        getWiki();
        if ($old != null) {
            $old.toggleClass('active');
        }
        $(this).toggleClass('active');
        $old = $(this);
    });
    $('#images').click(function() {
        renderImages();
        if ($old != null) {
            $old.toggleClass('active');
        }
        $(this).toggleClass('active');
        $old = $(this);
    });
    $('#message').click(function() {
        renderNewMessageForm();
        if ($old != null) {
            $old.toggleClass('active');
        }
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
            success: (data) => {
                if (data.status) {
                    window.location.href = "/profile";
                } else {
                    console.log("An error occurred.");
                }
            },
            error: (err) => {
                console.log(err);
            }
        });
    });
        
    ListingForm = React.createClass({
        
        getInitialState: function() {
            return {
                selectedOption: "1"
            };
        },
        
        handleOptionChange: function (changeEvent) {
            this.setState({
                selectedOption: changeEvent.target.value
            });
        },
        
        render: function() {
            return (
                <section id="profile-listing-new">
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
				</section>
            );
        }
    });
    
	// Account settings form
    AccountInfo = React.createClass({
        render: function() {
                return (
					<section id="profile-settings">
						<h3>Update Account Info</h3>
						<form method="post" id="update-info" class="profile-form">
							<fieldset id="personalinfo">
								<legend>Personal Information:</legend>
								<p>First name:</p>
								<input type="text" name="firstname" id="firstname" required defaultValue={user.firstname} pattern="[a-zA-Z]{1,50}" title="This field can only consist of letters."/>
								<p>Last name:</p>
								<input type="text" name="lastname" id="lastname" required defaultValue={user.lastname} pattern="[a-zA-Z]{1,50}" title="This field can only consist of letters."/>
								<p>City:</p>
								<input type="text" id="city" name="city" required defaultValue={user.info.city} pattern="[a-zA-Z]{2,50}" title="This field can only consist of letters."/>
								<p>Phone Number:</p>
								<input type="text" id="phone" name="phone" required defaultValue={user.info.phone} pattern="[0-9]{10,12}" title="This field can only consist of numbers."/>
								<p>Speciality:</p>
								<input type="text" id="job" name="job" defaultValue={user.info.job} maxlength="50" pattern="[a-zA-Z ]+" title="This field can only consist of letters."/>
								<p>Status:</p>
								<input type="text" id="status" name="status" defaultValue={user.info.status} maxlength="50" pattern="[a-zA-Z ]+" title="This field can only consist of letters."/>
								<p>Country:</p>
								<select id="country" defaultValue="0" required name="country">
									<option value="0">Country</option>
								</select>
								<p>State/Province:</p>
								<select id="state" defaultValue="0" required name="state">
								  <option value="0">State/Province</option>
								</select>
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
					</section>
                );
        }
    });
    
	// New wiki form
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
    
	// New message form (on other profiles)
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
    
    const href = window.location.href;
    const last = href.substr(href.lastIndexOf('/') + 1);
    if (last.startsWith("profile")) {
        if (user && user != null && user.info && user.info.filled) {
            $('#general').click();
        } else {
            $('#settings').click(); // Force them to input settings
            $(".profile-menu button").prop('disabled', true);
        }
        
    }
});