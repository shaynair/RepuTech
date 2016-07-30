function validateEvent(e) {
	var valid = true;
	$("input").each(function(index, elem) {
	     alert($(elem).attr("id"));
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

function populateCountries(){
     $.ajax({
	     type:"GET",
	     dataType: "json",
		 url:"http://127.0.0.1:8080/get_countries",
		 success: function(res){
		             $.each(res,function(index,item){
					      var option = $('<option>');
						  option.attr('value',item.name);
						  option.html(item.name);
					      $('#country').append(option);
					 });					 
		          },
		  error: function(){
			 	     alert("error!!");								                              	   	          
                 }}); 
}

function populateStates(){
    $.ajax({
	     type:"GET",
	     dataType: "json",
		 url:"http://127.0.0.1:8080/get_provinces?country="+$('#country').val(),
		 success: function(res){
		             $('#state').empty();
					 
                     if( res.length == 0 ) 					 
                          $('#state').append('<option selected disabled>State/Province</option>');					 
						  
		             $.each(res,function(index,item){
					      var option = $('<option>');
						  option.attr('value',item.state);
						  option.html(item.state);
					      $('#state').append(option);
					 });					
		          },
		  error: function(){
			 	     alert("error!!");								                              	   	          
                 }}); 
}


function submitForm(){
    $("#busy_sec").css("visibility","visible"); 
    $.ajax({
	     type:"GET",
	     dataType: "json",
		 url:"http://127.0.0.1:8080/store_info?email="+$('#email').val()+"&pass="+$('#pass').val()+"&name="+$('#name').val()+
		                              "&lastname="+$('#lastname').val()+"&country="+$('#country').val()+"&state="+$('#state').val()
									  +"&city="+$('#city').val()+"&phone="+$('#phone').val(),
		 success: function(res){
		             $("#busy_sec").css("visibility","hidden"); 
		             if (res.status === "exists"){
					    setBorderColor($("#email"), "red");
			            $("#email-err").text("This Email Address is Already Used. Please Use Another Email Address.").fadeIn();
					 }else{
					    $("main").empty();    
						$("main").append("<h3>Verification Email Has Been Send to The Email Address You Used to Sign up. Please Verify Your Email As Soon As possible in Order to Activate Your Account.</h3>");
						
					 }
		          },
		 error: function(){
		       alert("error");
         }}); 
}
