function validate(){

      var valid = 1;  
	  var regx = /^[=`{|}~/_a-z0-9A-Z!#$%&'*+-]+([\.][=`{|}~/_a-z0-9A-Z!#$%&'*+-]+)*@[a-z0-9A-Z]+[-]?[a-z0-9A-Z]+([\.]([a-z0-9A-Z]+[-]?[a-z0-9A-Z]+))+$/;
	  var pass_regx = /(?=((.)*[a-z]))(?=((.)*[A-Z]))(?=((.)*[0-9])){8,}/;
	  var text_regx = /^[a-zA-Z]+$/;
      if( document.getElementById("email").value == '' ){
	         setBorderColor(document.getElementById("email"),'red','red');
	         document.getElementById("email_err").innerHTML = 'This Field Is Required.';
			 valid = -1;
	  } else {	  
	         if ( !regx.test(document.getElementById("email").value) ) {
			     valid = -1;
			     setBorderColor(document.getElementById("email"),'red','red'); 
			     document.getElementById("email_err").innerHTML = 'Please Enter a Valid Email Address.';
			 }else{
			            setBorderColor(document.getElementById("email"),'#80b3ff','lightgrey'); 
					    document.getElementById("email_err").innerHTML = '';
				  }
	  }
	  
	  if( document.getElementById("email2").value == '' ){
	         setBorderColor(document.getElementById("email2"),'red','red');
	         document.getElementById("email2_err").innerHTML = 'This Field Is Required.';
			 valid = -1;
	  }else{
             if ( !regx.test(document.getElementById("email2").value) ) {
			     valid = -1;
			     setBorderColor(document.getElementById("email2"),'red','red');
			     document.getElementById("email2_err").innerHTML = 'Please Enter a Valid Email Address.';
				 
			 }else  if( !(document.getElementById("email2").value == document.getElementById("email").value) ){
			 
			            setBorderColor(document.getElementById("email2"),'red','red');
	                    document.getElementById("email2_err").innerHTML = 'Two Email Addresses Must be Same.';
	            		valid = -1;
	                }else{
					    setBorderColor(document.getElementById("email2"),'#80b3ff','lightgrey');
					    document.getElementById("email2_err").innerHTML = '';
					}
	     }	 
	  	  
	  if( document.getElementById("pass").value == '' ){
	         document.getElementById("pass_err").innerHTML = 'This Field Is Required.';
			 document.getElementById("pass").style.border='2px solid red';
			 valid = -1;
	  } else {	  
	         if ( !pass_regx.test(document.getElementById("pass").value) ) {
			 
			     valid = -1;
			     setBorderColor(document.getElementById("pass"),'red','red');
			     document.getElementById("pass_err").innerHTML = 'Password Must be Between 6-15 Characters.'+ 
 			                                                     'Consist of at least one UpperCase Letter, one LowerCase Letter, and one digit.';
			 }else{
			            setBorderColor(document.getElementById("pass"),'#80b3ff','lightgrey');
			    	    document.getElementById("pass_err").innerHTML = '';
				  }
	  }
	  
	  if( document.getElementById("name").value == '' || document.getElementById("lastname").value == ''){
	         setBorderColor(document.getElementById("name"),'red','red'); 
			 setBorderColor(document.getElementById("lastname"),'red','red'); 
	         document.getElementById("name_err").innerHTML = 'Both of the Name and Last Name Fields are Required.<br/>';
			 valid = -1;
	  }else if( !text_regx.test(document.getElementById("name").value) || !text_regx.test(document.getElementById("lastname").value)){
	           setBorderColor(document.getElementById("name"),'red','red'); 
		       setBorderColor(document.getElementById("lastname"),'red','red'); 
	           document.getElementById("name_err").innerHTML = 'Both of the Name and Last Name Can Only Consist of English Letters.<br/>';
			   valid = -1;
	       }else{
	            setBorderColor(document.getElementById("name"),'#80b3ff','lightgrey');	         
	            setBorderColor(document.getElementById("lastname"),'#80b3ff','lightgrey');	         
			    document.getElementById("name_err").innerHTML = '';
	        }
	
     
	 if( document.getElementById("city").value == '' ){
	         document.getElementById("city_err").innerHTML = 'This Field Is Required.';
			 document.getElementById("city").style.border='2px solid red';
			 valid = -1;
	  } else {	  
	         if ( !text_regx.test(document.getElementById("city").value) ) {
			 
			     valid = -1;
			     setBorderColor(document.getElementById("city"),'red','red');
			     document.getElementById("city_err").innerHTML = 'City Can Only Consist of Letters.';
			 }else{
			            setBorderColor(document.getElementById("city"),'#80b3ff','lightgrey');
			    	    document.getElementById("city_err").innerHTML = '';
				  }
	  }
	 
	 if( document.getElementById("address").value == '' ){
	         document.getElementById("address_err").innerHTML = 'This Field Is Required.';
			 document.getElementById("address").style.border='2px solid red';
			 valid = -1;
	  } else {	  
	          setBorderColor(document.getElementById("address"),'#80b3ff','lightgrey');
			  document.getElementById("address_err").innerHTML = '';
	  }
	  
      if( document.getElementById("address").value == '' ){
	         document.getElementById("address_err").innerHTML = 'This Field Is Required.';
			 document.getElementById("address").style.border='2px solid red';
			 valid = -1;
	  } else {	  
	          setBorderColor(document.getElementById("address"),'#80b3ff','lightgrey');
			  document.getElementById("address_err").innerHTML = '';
	  } 	  
	 
	  if( document.getElementById("postcode").value == '' ){
	         document.getElementById("post_err").innerHTML = 'This Field Is Required.';
			 document.getElementById("postcode").style.border='2px solid red';
			 valid = -1;
	  } else {	  
	          setBorderColor(document.getElementById("postcode"),'#80b3ff','lightgrey');
			  document.getElementById("post_err").innerHTML = '';
	  }
	 
	  if( document.getElementById("phone").value == '' ){
	         document.getElementById("phone_err").innerHTML = 'This Field Is Required.';
			 document.getElementById("phone").style.border='2px solid red';
			 valid = -1;
	  }else {	  
	          setBorderColor(document.getElementById("phone"),'#80b3ff','lightgrey');
			  document.getElementById("phone_err").innerHTML = '';
	  } 
	 
	  if( valid == -1 )
	     return false;
	  else	 
	     return true;
} 

function setBorderColor(element,color1,color2){
          element.style.borderColor=color2;   
          element.addEventListener('focus',function(){
			       element.style.borderColor= color1; });
										
		  element.addEventListener('blur',function(){
		           element.style.borderColor=color2; });
 
}
