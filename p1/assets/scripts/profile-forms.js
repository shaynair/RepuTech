// Should pull this info from the database;
var data = [
    {
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
        "mood": "Tech-tastic"
    }
];

var GeneralInfo = React.createClass({
    render: function() {
        var userNodes = this.props.data.map(function(user) {
            return (
                <div>
                <section id="profile-general">
                    <h3>{user.firstname} {user.lastname}</h3>
                    <p>Rating: {user.rating}</p>
                    <p>Followers: {user.followers}</p>
                    <section class="profile-buttons">
                        <button>Follow</button>
                    </section>
                    <br/>
                    <p>Job: {user.job}</p>
                    <p>Located in: {user.city}, {user.country}</p>
                    <p>Mood: {user.mood}</p>
                </section>
                <section id="gallery"><h3>My Images:</h3></section>
                </div>
            );
        });
        return (
            <div className="GeneralInfo">
                {userNodes}
            </div>
        );
    }
});

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
            <form method="post" id="listing-form">
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
                <button type="submit" form="listing-form" value="Submit">Submit</button>
            </form>
        );
    }
});


var AccountInfo = React.createClass({
    render: function() {
        var userNodes = this.props.data.map(function(user) {
            return (
                <form method="post" id="update-info">
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
                    <button type="submit" form="update-info" value="Update">Update</button>
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

var Wiki = React.createClass({
    render: function() {
        return (
            <section id="profile-wiki">
                <a href="" class="self"><button>New Wiki Post</button></a>
				<h3>Lorem Ipsum</h3>
				<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam molestie sagittis porttitor. Pellentesque ipsum est, scelerisque ultricies vulputate a, dapibus sit amet dolor. Curabitur euismod libero sit amet quam consequat, vitae tempor augue gravida. Praesent sit amet libero sed neque bibendum imperdiet vel quis ligula. Proin interdum porta interdum. Quisque vitae facilisis ex, ac ornare enim. Suspendisse accumsan tellus nec ex auctor tincidunt. Pellentesque placerat dapibus turpis, ac consequat ex sodales vitae. Etiam auctor maximus auctor. Pellentesque gravida, leo nec faucibus posuere, magna metus placerat ex, sed bibendum nibh urna at lectus. Duis nunc mauris, molestie et dui non, auctor dictum urna. Aliquam arcu lacus, faucibus sit amet vestibulum aliquam, tincidunt eget ex. Morbi et sem id ante consequat aliquet. Nulla nibh arcu, aliquet in ultricies lacinia, bibendum a nisl. Pellentesque a finibus neque.
				</p>
            </section>
        );
    }
});


function render_general_info() {
    $('.profile-content').empty();
    
    ReactDOM.render(<GeneralInfo data={data} />,
        document.getElementById('profile-content')
    );
}

function render_settings_form() {
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

function render_wiki() {
    $('.profile-content').empty();

    ReactDOM.render(<Wiki/>,
	   document.getElementById('profile-content')
    );   
}

var $old; // Holds previously clicked button
$('#general').click(function() {
    render_general_info();
    if ($old != null) {
        $old.toggleClass('active');
    }
    $(this).toggleClass('active');
    $old = $(this);
    LoadImageSlider();
});

$('#posts').click(function() {
    render_posts();
    $old.toggleClass('active');
    $(this).toggleClass('active');
    $old = $(this);
});

$('#messages').click(function() {
    render_messages();
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
    render_wiki();
    $old.toggleClass('active');
    $(this).toggleClass('active');
    $old = $(this);
});

$(document).ready($('#general').click());