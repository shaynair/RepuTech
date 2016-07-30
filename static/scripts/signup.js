function validateEvent(e) {
	var valid = true;
	$("input").each(function(index, elem) {
		if($(elem).attr("id") != "search"){ 
		  if ( !validate($(elem)) ){
			valid = false;
	      }
	    }
	});
		
	if (!valid) {
		e.preventDefault();
	} else {
   	  submitForm();
	}  
}

function validate($elem) {
	var $err = $("#" + $elem.attr("id") + "-err");
	if ($elem.val() == "") { // 'Required' message will auto handle
		setBorderColor($elem, "red");
		$err.text("This field is required.").fadeIn();
		return false;
	}
	setBorderColor($elem, "#ccc");
	$err.hide();
	
    // Use regex to make custom error messages
	var r = new RegExp($elem.attr("pattern"));
	if (!r.test($elem.val())) {
		var prompt = null;
		if ($elem.attr("type") == 'password') {
			prompt = "Password must be between 8-15 characters, and must consist of at least one lower-case letter, one upper-case letter and one digit.";
		} else if ($elem.attr("type") == 'text') {
			prompt = "This field can only consist of letters.";
		} else if ($elem.attr("type") == 'email') {
			prompt = "E-mail address must be valid.";
		}
		if (prompt != null) {
			$err.text(prompt).fadeIn();
		}
		setBorderColor($elem, "red");
		return false;
	}
    // Handle confirmation fields
	if (($elem.attr("id") == "email" || $elem.attr("id") == "pass")
			&& ($elem.val() != $("#" + $elem.attr("id") + "2").val())) {
				
		$err.text("Confirmation fields must be the same.").fadeIn();
		setBorderColor($elem, "red");
		return false;
	}
	
	return true;
}

function setBorderColor($elem, color){
	$elem.css("border", "1px solid " + color);
}

function populateStates(){
    $.ajax({
	     type:"GET",
	     dataType: "json",
		 url:"/api/get_states",
         data: {country: $('#country').val()},
		 success: (res) => {
		             $('#state').empty();
					 
                     if( res.length == 0 ) {			 
                          $('#state').append('<option selected disabled>State/Province</option>');					 
                     }
                     for (let s in Object.keys(res).sort()) {
					      let option = $('<option>');
						  option.attr('value', res[s]);
						  option.html(s);
					      $('#state').append(option);				
                     }
		          },
		  error: (err) => {
			 	     console.log(err);								                              	   	          
                 }
    }); 
}


function submitForm(){
    $.ajax({
	     type:"POST",
	     dataType: "json",
		 url: "signup-form",
         data: $("#sign-up-form").serialize(),
		 success: function(res){
		    if (res.status === "exists"){
			    setBorderColor($("#email"), "red");
			    $("#email-err").text("This Email Address is Already Used. Please Use Another Email Address.").fadeIn();
			} else {
                $("main").empty();    
				$("main").append($("<h3>").text());	
            }
		 },
		 error: function(err){
		    console.log(err);
         }
    }); 
}
