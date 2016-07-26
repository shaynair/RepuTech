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
                <textarea id="post-description" rows="7"></textarea>
                <button type="submit" form="listing-form" value="Submit">Submit</button>
            </form>
            );
    }
});


var AccountInfo = React.createClass({
    
    handleChange: function(event) {
        user.setState({
            firstname: event.target.value
        });
    },
    
    render: function() {
        var userNodes = this.props.data.map(function(user) {
            return (
                <form method="post" id="update-info">
                    <fieldset>
                        <legend>Personal Information:</legend>
                        <p>First name:</p>
                        <input type="text" id="firstname" defaultValue={user.firstname}/>
                        <p>Last name:</p>
                        <input type="text" id="lastname" defaultValue={user.lastname}/>
                        <p>Country:</p>
                        <select id="country" required name="country">
				            <option selected>{user.country}</option>
				        </select>
				        <p>Province/State:</p>
				        <select id="state" required name="state">
                            <option selected>{user.prov_state}</option>
				        </select>
                        <p>City:</p>
                        <input type="text" id="city" defaultValue={user.city}/>
                        <p>Phone Number:</p>
                        <input type="text" id="phonenum" defaultValue={user.phonenum}/>
                    </fieldset>
                    <fieldset>
                        <legend>Account Information:</legend>
                        <p>Email:</p>
                        <input type="text" id="email" defaultValue={user.email} />
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
