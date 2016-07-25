// Should pull this info from the database;
var data = [
    {
        "firstname": "John",
        "lastname": "Doe",
        "country": "Canada",
		"prov_state": "Ontario",
        "city": "Toronto",
        "phonenum": "111-111-1111",
        "email": "john.doe@email.com"
    }
];

var ListingForm = React.createClass({
    render: function() {
	return (
	    <form method="post" id="listing-form">
		<p>Title:</p>
                <input type="text" id="post-title"/>
		<p>Post Type:</p>
		<input type="radio" name="post-type" value="Searching" checked> Searching for Service<br>
  		<input type="radio" name="post-type" value="Offering"> Offering Service<br>
		<p>Description:</p>
        <input type="text" id="post-description"/>);
        <button type="submit" form="listing-form" value="Submit">Submit</button>
        </form>
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
                        <input type="text" id="firstname" value={user.firstname}/>
                        <p>Last name:</p>
                        <input type="text" id="lastname" value={user.lastname}/>
                        <p>Country:</p>
                        <input type="text" id="country" value={user.country}/>
                        <p>Province/State:</p>
                        <input type="text" id="prov_state" value={user.prov_state}/>
                        <p>City:</p>
                        <input type="text" id="city" value={user.city}/>
                        <p>Phone Number:</p>
                        <input type="text" id="phonenum" value={user.phonenum}/>
                    </fieldset>
                    <fieldset>
                        <legend>Account Information:</legend>
                        <p>Email:</p>
                        <input type="text" id="email" value={user.email} />
                        <p>Current Password (must be entered to make any changes): </p>
                        <input type="password" id="currentpass" />
                        <p>New Password:</p>
                        <input type="password" id="newpass" />
                        <p>Retype New Password (same as above): </p>
                        <input type="password" id="newpass-confirmation" />
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

$('#create-listing').click(render_listing_form);
$('#settings').click(render_settings_form);
