

var express = require('express');
var promise = require('bluebird'); 
var bodyParser = require('body-parser');
var pg = require('pg');
//var app = express();

var options = {
    promiseLib: promise 
};

var pgc = require('pg-promise')(options);
var db = pgc(c.DATABASE);
var app = new express();

var connectpath = c.DATABASE_URL;

app.get('/get_countries',function(req,res){
       console.log("countries");
       db.any("select * from countries order by  name ASC")
	   .then(function(data){
	      res.writeHead(200,{'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'});
          res.end(JSON.stringify(data));
		  pgc.end(); 
	   })
	   .catch(function(error){
	      console.log("ERROR====>>>",error);
       })
})

app.get('/get_provinces',function(req,res){

       db.any("select state from countries,states WHERE countries.code = states.country AND countries.name = $1 ORDER BY state ASC ",[req.query.country])
	  .then(function(data){
	      res.writeHead(200,{'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'});
          res.end(JSON.stringify(data));
		  pgc.end(); 
	  })
	  .catch(function(error){
	      console.log("ERROR====>>>",error);
      })
})

app.get('/store_info',function(req,res){
       console.log("recieved to store");
       var email = req.query.email;
	   
	   db.any("SELECT u_id FROM LOGIN WHERE email=$1",[email])
	   .then(function(data){
	         if(data.length > 0 ) {
			    res.writeHead(200,{'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'});
                res.end(JSON.stringify({"status":"exists"}));
		        pgc.end(); 
			 }else{
			    storeInfo(req,res);
			    var textBody = "This is your verification email from Reputech. In order to verify your email "+
				                "address and activate your account please click on the link below"; 
				
				var htmlContent	= "<a href='http://www.google.com'> Please Click On This Link To Activate Your Account.</a>";
				
				sendEmailto(email,"Verification Email For Your Reputech Account",textBody,htmlContent)
				
                res.writeHead(200,{'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'});
                res.end(JSON.stringify({"status":"ok"}));
		   	 }		 
			
	   })
	   .catch(function(error){
	      console.log("ERROR====>>>",error);
       })
   
})
		  
app.listen(8080,function(){
      console.log("server is listening.....");
})	 


function storeInfo(req,res){

       var clientIp = req.ip;
	   var email = req.query.email;
	   var pass = req.query.pass;
	   var name = req.query.name;
	   var lastname = req.query.lastname;
	   var country = req.query.country;
	   var state = req.query.state;
	   var city = req.query.city;
	   var phone = req.query.phone;
	   var addrId;
	   
	   pg.connect(connectpath, function(err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }
		
		client.query("INSERT INTO LOGIN(email,user_type,ip_address) VALUES($1,$2,$3) returning u_id",[email,'Normal',clientIp]);
		
		var sql = "SELECT u_id FROM LOGIN WHERE email= '"+email+"'";
		var sqladdr = "SELECT a_id FROM ADDRESS WHERE ( ( country = '"+country+"' AND province = '"+state+"') AND city = '"+city+"' )";
		
		client.query(sql,function(err,info){
		
             if(err) 		
		         console.log("ERROR =========>>>> \n"+err);
				 
		      	 var clientId = JSON.stringify(info.rows[0].u_id);
				 client.query("INSERT INTO AUTH(u_id,password,privilege) VALUES($1,$2,$3)",[clientId,pass,"Normal"]);
			     client.query("INSERT INTO ADDRESS(country,province,city) VALUES($1,$2,$3)",[country,state,city]);
				 
		         client.query(sqladdr,function(err,info){
				 
	                      if(err) 		
		                         console.log("ERROR =========>>>> \n"+err);
								 
						  var addrId = JSON.stringify(info.rows[0].a_id);		 
						  client.query("INSERT INTO USERS VALUES($1,$2,$3,$4,$5)",[clientId,name,lastname,phone,addrId]);
				});
	    });
		
	 });
}
