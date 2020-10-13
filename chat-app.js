'use strict';

var SERVER_URL = 'http://d315xfu76uv2z9.cloudfront.net/';

var bodyParser = require('body-parser'),
  express = require('express'),
  https = require('https'),
  request = require('request'),
  fs = require('fs'),
  nodemailer = require("nodemailer"),
  mysql      = require('mysql'),
  busboy = require('connect-busboy'),
  fs = require('fs'),
  multer  = require('multer'),
  cors = require('cors'),
  srs = require('secure-random-string'),
  helmet = require('helmet'),
  morgan = require('morgan'),
  crypto = require('crypto'),
  microtime = require('microtime'),
  uniqid = require('uniqid'),
  aws = require('aws-sdk'),
  multerS3 = require('multer-s3'),
  s3 = new aws.S3(),
  gmdate = require('phpdate-js').gmdate;


  //npm install --save express  
  var app = express();
  app.use(bodyParser.json());
  app.use(cors());
  app.use(busboy());
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(helmet.xssFilter({ setOnOldIE: true }));
  app.use(helmet.frameguard('deny')); 
  app.use(helmet.hsts({maxAge: 7776000000, includeSubDomains: true})); 
  app.use(helmet.hidePoweredBy()); 
  app.use(helmet.ieNoOpen()); 
  app.use(helmet.noSniff()); 
  app.use(helmet.noCache());

  app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

 // const nodemailer = require("nodemailer");

// constants starts here

var GST_RATE = process.env.GST_RATE;
var VEHICLE = process.env.VEHICLE;
var SALE = process.env.SALE;
var RENT = process.env.RENT;
var PROPERTY = process.env.PROPERTY;
var SERVICES = process.env.SERVICES;
var UNIT_PRICE_TST = process.env.UNIT_PRICE_TST;
var UNIT_PRICE_ZB = process.env.UNIT_PRICE_ZB;
var OTHERS = process.env.OTHERS;
var session_ttl_minutes = process.env.SESSION_TTL_MINUTES;
var signed_field_names=process.env.SIGNED_FIELD_NAMES;
var secretKey=process.env.SECRETKEY;
var access_key = process.env.ACCESS_KEY;
var profile_id = process.env.PROFILE_ID;
var payment_url = process.env.PAYMENT_URL;
var s3_bucket_name_chatbot_advertiserimage = process.env.CHATBOT_S3_UPLOAD_BUCKET_NAME;
var table = process.env.CHATBOT_DB_TABLE;

// ends constants here

app.listen(process.env.CHATBOT_CONTAINER_PORT, () => {
 console.log("Server running on port " + process.env.CHATBOT_CONTAINER_PORT);
});

//Get request
app.get("/", cors(), (req, res, next) => {
 res.json(["Bad request received.","/"]);
});


//Get request
app.get("/favicon.ico", cors(), (req, res, next) => {
 res.json(["Bad","request","/favicon.ico","received"]);
});

//Get request
app.get("/welcome", cors(), (req, res, next) => {
 res.json(["Bad request received.", "/welcome"]);
});


//Reference https://stackoverflow.com/questions/40494050/uploading-image-to-amazon-s3-using-multer-s3-nodejs
//https://www.npmjs.com/package/multer-s3
//s3 upload

var saveFileStorageLocation = "";
var dateUploaded = getGenericDate(0);

var uploads3 = multer({
    storage: multerS3({
       s3: s3,
       bucket: s3_bucket_name_chatbot_advertiserimage,
       storageClass: 'INTELLIGENT_TIERING',
       key: function (req, file, cb) {
        	console.log("uploads3 req.body:: ",req.body);
        	var temp = JSON.parse(JSON.stringify(req.body));
        	var values_json = JSON.parse(temp.data);
        	var fileStruct = dateUploaded + "/" + values_json.id + "/";
            saveFileStorageLocation = microtime.now() +"."+ file.originalname.split(".")[1];
       	    cb(null, `${fileStruct}${saveFileStorageLocation}`); //use getGenericDate(0) aditionally to save file date wise, for unique file key date in yyyy-mm-dd format.
       }
   })
});

app.post('/fileupload', uploads3.array('uploadFile',1), function (req, res, next) {

//local storage comment next two lines below and uncomment above set of code to enable s3 upload.
//var upload = multer({ dest: '/Users/sssingh/upload/' })
//app.post('/fileupload', upload.single('uploadFile'), function (req, res) {
   
   // req.file is the name of your file in the form above, here 'uploaded_file'
   // req.body will hold the text fields, if there were any 
   //var data = req.body;
   
   var temp = JSON.parse(JSON.stringify(req.body, null, 2));
   var values_json = JSON.parse(temp.data);

   //console.log("file", req.file['filename']);
   console.log("file", req.files[0]['originalname']);

   var id = values_json.id;
   console.log("contact number as id :" , id);

   var message = values_json.textMessage;
   console.log("message received:" , message);

   var nextTemplate = values_json.nextTemplate;
   console.log("nextTemplate received:" , nextTemplate);

   //var fileName = req.file['filename'];
   var fileName = req.files[0]['originalname'];
   
   var messageData; 

   var hash_token = req.headers['chat-cookie'];
   console.log(req.headers);

   console.log("hash_token received:" , hash_token);

   if(hash_token){
		res.header("chat-cookie",hash_token);
	}
  
	  if(!id || !hash_token){
		 var token = getToken();
		 messageData = sendForm(); 
	   	 console.log("sending message :" , messageData);
	   	 res.header("chat-cookie",token);
	  }
   
	   // image storage is local for now need to move files to s3 storage implementation required
	   
	   try{
	   		if(nextTemplate == "has-upload-service-image"){

	   		if(fileName){

	   			var query = "update "+table+" set ad_service_image_name = '"+saveFileStorageLocation+"' ,date_uploaded = '"+dateUploaded+"' where phone_number = '"+id+"'  and token = '"+hash_token+"' and validity >= now() and is_active = false order by create_timestamp  DESC LIMIT 1";
			    console.log("query: ", query);
			    indsertUpdateData(query);
			    
	   		}
	   		
		    messageData = sendHasQrCode(id, "qr-code-services" , "nature-services", "Great, Service picture received.🖇 <br/>Do you also have the QR Code ?");

	   }
	   if(nextTemplate == "qr-code-services-upload-mlutipart"){

	   		if(fileName){

	   			var query = "update  "+table+" set ad_service_qr_image_name = '"+saveFileStorageLocation+"' ,date_uploaded = '"+dateUploaded+"' where phone_number = '"+id+"'  and token = '"+hash_token+"' and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
			    console.log("query: ", query);
			    indsertUpdateData(query);
			    
	   		}
	   		
			 messageData = sendNoQrCode(id, "no-qr-code-services" , "qr-code-services", "<strong>Well done. QR code received.</strong><br/>What is the price in SGD? Example: 50000, 65080 etc <br/>NOTE: Only Numbers are acceptable.");

	   }
	   if(nextTemplate == "has-qr-code-vehicle"){

	   		if(fileName){

	   			var query = "update  "+table+" set ad_vehicle_image_name = '"+saveFileStorageLocation+"' ,date_uploaded = '"+dateUploaded+"' where phone_number = '"+id+"'  and token = '"+hash_token+"' and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
			    console.log("query: ", query);
			    indsertUpdateData(query);
			    
	   		}
	   		
		    messageData = sendHasQrCode(id, "qr-code-vehicle" , "upload-vehicle-image", "Great Vehicle picture received.🖇 <br/>Do you also have the QR Code ?");

	   }  if(nextTemplate == "has-qr-code-services"){

	   		if(fileName){

	   			var query = "update  "+table+" set ad_service_image_name = '"+saveFileStorageLocation+"' ,date_uploaded = '"+dateUploaded+"' where phone_number = '"+id+"' and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
			    console.log("query: ", query);
			    indsertUpdateData(query);
			    
	   		}
	   		
		    messageData = sendHasQrCode(id, "qr-code-services" , "has-upload-service-image", "Great Service picture received.🖇 <br/>Do you also have the QR Code ?");

	   }else if(nextTemplate == "has-qr-code-property"){

	   		
	   		if(fileName){

	   			var query = "update  "+table+" set ad_property_image_name = '"+saveFileStorageLocation+"' ,date_uploaded = '"+dateUploaded+"' where phone_number = '"+id+"'  and token = '"+hash_token+"' and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
			    console.log("query: ", query);
			    indsertUpdateData(query);
			    
	   		}

		    messageData = sendHasQrCode(id, "qr-code-property" , "upload-property-image", "Great Property picture received.🖇 <br/>Do you also have the QR Code ?");

	   }else if(nextTemplate == "qr-code-vehicle-upload-mlutipart"){

	   		if(fileName){
	   			
	   			var query = "update  "+table+" set ad_vehicle_qr_code_name = '"+saveFileStorageLocation+"' ,date_uploaded = '"+dateUploaded+"' , has_vehicle_qr_code = true where phone_number = '"+id+"'  and token = '"+hash_token+"' and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
			    console.log("query: ", query);
			    indsertUpdateData(query);
			    
	   		}else{

	   			var query = "update  "+table+" set ad_vehicle_qr_code_name = '' , has_vehicle_qr_code = false where phone_number = '"+id+"'  and token = '"+hash_token+"' and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
			    console.log("query: ", query);
			    indsertUpdateData(query);
			    
	   		}

		    messageData = sendNoQrCode(id,"no-qr-code-vehicle", "has-qr-code-vehicle", "<strong>Well done. QR code received.</strong><br/>What is the price in SGD? Example: 50000, 65080 etc <br/>NOTE: Only Numbers are acceptable."); ;

	   }else if(nextTemplate == "qr-code-property-upload-mlutipart"){

	   		if(fileName){
	   			var query = "update  "+table+" set ad_property_qr_code_name = '"+saveFileStorageLocation+"' ,date_uploaded = '"+dateUploaded+"' , has_property_qr_code = true where phone_number = '"+id+"'  and token = '"+hash_token+"' and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
			    console.log("query: ", query);
			    indsertUpdateData(query);
			    
	   			
	   		}else{

	   			var query = "update "+table+" set ad_property_qr_code_name = ''  , has_property_qr_code = false where phone_number = '"+id+"'  and token = '"+hash_token+"' and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
			    console.log("query: ", query);
			    indsertUpdateData(query);
			    
	   		}

		    messageData = sendNoQrCode(id,"no-qr-code-property", "has-qr-code-property", "<strong>Well done. QR code received.</strong><br/>What is the price in SGD? Example: 50000, 65080 etc <br/>NOTE: Only Numbers are acceptable."); 

	   }
	   }catch(e) {
        console.error("ERROR occured 2:", e);
        messageData = sendError("Error occured due to inactive session.Please start from beginning");
    }
    if(!messageData){
    	 messageData = sendError("Invalid Requst Administrator has been notified.");
    }

   sendResult(res, messageData);

});


function sendError(message){

	var messageData = {
			"status" : 500,
			"errMsg" : message,
			"payload" : {}
		}
	return messageData;
}

//POST request
app.post('/message', cors(), async function (req, res) {
  var data = req.body;
  console.log("request recieved :" , data);

  var id = data.id;
  console.log("contact number as id :" , id);

  var message = data.textMessage;
  console.log("message received:" , message);

  var nextTemplate = data.nextTemplate;
  console.log("nextTemplate received:" , nextTemplate);

   var hash_token = req.headers['chat-cookie'];

  console.log(req.headers);
  console.log("hash_token received:" , hash_token);

	if(hash_token){
		res.header("chat-cookie",hash_token);
	}
  

  var messageData; 
 
	try{

	if(!id || !hash_token){
		 var token = getToken();
		 messageData = sendForm(); 
	   	 console.log("sending message :" , messageData);
	   	 res.header("chat-cookie",token);
	  }

	// start conversation now.
  	else if(nextTemplate == 'sample'){

  		var firstName = message.firstcontactname;
	  	var lastName = message.lastcontactname;
	  	var email = message.email;
	  	var nextTemplate = data.nextTemplate;
		var create_timestamp = new Date(new Date()+" UTC").toISOString().slice(0, 19).replace('T', ' ');

		var bill_to_address_line1 = message.bill_to_address_line1;
		var bill_to_address_city = message.bill_to_address_city;
		var bill_to_address_state = message.bill_to_address_state;
		var bill_to_address_postal_code = message.bill_to_address_postal_code;
		

		if(firstName){
			
			var query = "insert into "+table+" (first_name, last_name, phone_number, email, create_timestamp, token, validity, bill_to_address_line1, bill_to_address_city, bill_to_address_state, bill_to_address_postal_code, bill_to_country) values ('"+firstName+"','"+lastName+"','"+id+"','"+email+"','"+create_timestamp+"', '"+hash_token+"', now() + INTERVAL '"+session_ttl_minutes+"' MINUTE, '"+bill_to_address_line1+"', '"+bill_to_address_city+"', '"+bill_to_address_state+"', '"+bill_to_address_postal_code+"', 'SG')";
			console.log("query: ", query);
			indsertUpdateData(query);
			
		}
		
  		messageData = sendSample(id, "publication" , "", "What's the nature of your advertisement? <br/>Click on the ad type that you'd like me to walk you through👇 <br/>These are our advertisement sample."); 
  	
  	}else if(nextTemplate == 'publication'){

  		if(message){

	   		console.log("nextTemplate message : ", message);
	  		var query = "update "+table+" set ad_type = '"+message+"' where phone_number = '"+id+"' and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
	  		console.log("query: ", query);
	  		indsertUpdateData(query);

	  		messageData = sendPublication(id, "adType" , "sample","<strong>"+message +"</strong>, Noting it down, thanks for your selection 😇 <br/>Next, let's select which publication you'd like the ad to appear in."); 
	   	
	   	}else{
	   		messageData = sendPublication(id, "adType" , "sample", "let's select which publication you'd like the ad to appear in."); 
	   	}
	
  	
  	}else if(nextTemplate == 'adType'){

  		if(message){

  			console.log("nextTemplate message : ", message);
	  		var query = "update "+table+" set publication = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
	  		console.log("query: ", query);
	  		indsertUpdateData(query);
	  		
	  		messageData = sendAvailableDates(id, "availableDate" , "publication" ,"<strong>"+message +"</strong> it is! <br/>As a quick note, there is a cut off time of 2 pm the next day for "+message+" 😊 <br/>Please select the available START and END date of publication 🗓"); 
	  	
	 	}else{
	 		messageData = sendAvailableDates(id, "availableDate" , "publication" ,"As a quick note, there is a cut off time of 2 pm the next day.<br/>Please select the available START and END date of publication 🗓"); 
	 	}

  		
  	}else if(nextTemplate == 'availableDate'){


  		if(message){
	   			
	   			console.log("nextTemplate message : ", message);
		  		var from_to_date_range= message.split(" - ");
		  		var query = "update "+table+" set start_date = '"+from_to_date_range[0]+"', end_date = '"+from_to_date_range[1]+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
		  		console.log("query: ", query);
		  		indsertUpdateData(query);
		  		
		  		messageData = sendSaleRentService(id, "sale-rent-service" , "adType","Okay, <strong>"+ message +"</strong>. Advertisement is for Sale ,Rent or Services ?"); 

	   		}else{

	   			messageData = sendSaleRentService(id, "sale-rent-service" , "adType","Okay. Advertisement is for Sale ,Rent or Services ?"); 

	   		}

  		
  	
  	}else if(nextTemplate == 'sale-rent-service'){


  			var query = "select ad_type from "+table+" where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now() order by create_timestamp  DESC LIMIT 1";

  			var results = await fetchData(query);
  			console.log("callback ",results);

  			var ad_type = results.ad_type;
			console.log("ad_type from select query returned value :", ad_type);

			if(message){
				   	var query_insert_update = "update "+table+" set ad_nature = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
			  		console.log("query: ", query_insert_update);
			  		indsertUpdateData(query_insert_update);
			  		

		  		if(ad_type.trim() == VEHICLE){

		  				messageData = sendMakeBrandVehicle(id, "upload-vehicle-image" , "availableDate", "Sure, <strong>"+ message +"</strong>. 👍 <br/>What is the Make or Brand of the Vehicle, please type in  🖊 <br/>Example: Acura, Alfa Romeo, Aston Martin, <br/> Audi, Bentley, BMW, Bugatti, Buick etc"); 

		  		}else if(ad_type.trim() == PROPERTY){
			  			
			  			messageData = sendPropertyType(id, "upload-property-image" , "availableDate", "Sure, <strong>"+ message +"</strong>. 👍 <br/>What is the type of the property?");  

		  		}
		  		else if(ad_type.trim() == OTHERS){

		  			messageData = sendServiceType(id, "nature-services" , "availableDate", "Sure, <strong>"+ message +"</strong>. 👍 <br/>What is the nature of Services , please type in  🖊 <br/>Example: IT, Maid, Security, Home Service, Gardner, Care Taker."); 
		  		}
		  		else{
		  			console.log("Unhandled use case received!, ignoring.");
		  		}			
			}else {

			
		  		if(ad_type.trim() == VEHICLE){

		  				messageData = sendMakeBrandVehicle(id, "upload-vehicle-image" , "availableDate", "Sure. 👍 <br/>What is the Make or Brand of the Vehicle, please type in  🖊 <br/>Example: Acura, Alfa Romeo, Aston Martin, <br/> Audi, Bentley, BMW, Bugatti, Buick etc"); 

		  		}else if(ad_type.trim() == PROPERTY){
			  			
			  			messageData = sendPropertyType(id, "upload-property-image" , "availableDate", "Sure. 👍 <br/>What is the type of the property?");  

		  		}
		  		else if(ad_type.trim() == OTHERS){

		  			// Service will handle later
		  			messageData = sendServiceType(id, "nature-services" , "availableDate", "Sure, <strong>"+ message +". 👍 </strong><br/>What is the nature of Services , please type in  🖊 <br/>Example: IT, Maid, Security, Home Service, Gardner, Care Taker."); 
		  		}
		  		else{
		  			console.log("Unhandled use case received!, ignoring.");
		  		}	

			}
			


  	}if(nextTemplate == "has-upload-service-image"){
	   		
		    messageData = sendHasQrCode(id, "qr-code-services" , "nature-services", "Do you also have the QR Code ?");

	   }
	   if(nextTemplate == "qr-code-services-upload-mlutipart"){
			
			 messageData = sendNoQrCode(id, "no-qr-code-services" , "qr-code-services", "What is the service charge in SGD? Example: 500 /day, 100 / hr etc <br/>");

	   }
	   if(nextTemplate == "has-qr-code-vehicle"){

		    messageData = sendHasQrCode(id, "qr-code-vehicle" , "upload-vehicle-image", "Do you also have the QR Code ?");

	   } 
	   if(nextTemplate == "has-qr-code-services"){

		    messageData = sendHasQrCode(id, "qr-code-vehicle" , "upload-vehicle-image", "Do you also have the QR Code ?");

	   }else if(nextTemplate == "has-qr-code-property"){

		    messageData = sendHasQrCode(id, "qr-code-property" , "upload-property-image", "Do you also have the QR Code ?");

	   }else if(nextTemplate == "qr-code-vehicle-upload-mlutipart"){

		    messageData = sendNoQrCode(id,"no-qr-code-vehicle", "qr-code-vehicle", "What is the price in SGD? Example: 50000, 65080 etc <br/>NOTE: Only Numbers are acceptable."); ;

	   }else if(nextTemplate == "qr-code-property-upload-mlutipart"){

		    messageData = sendNoQrCode(id,"no-qr-code-property", "qr-code-property", "What is the price in SGD? Example: 50000, 65080 etc <br/>NOTE: Only Numbers are acceptable."); 

	   }else if(nextTemplate == "nature-services"){

  		if(message){

  			var query = "update "+table+" set service_nature = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
	  		console.log("query: ", query);
	  		indsertUpdateData(query);
	  		

	  		messageData = sendUploadAdImage(id, "has-upload-service-image" , "sale-rent-service", "Noted, <strong>"+ message +". 👍 </strong><br/>Please upload your advertisement image.");  
	   			
	   	}else{

	   		messageData = sendUploadAdImage(id, "has-upload-service-image" , "sale-rent-service", "Noted. 👍 <br/>Please upload your advertisement image.");  
	   	}

  		

  	}else if(nextTemplate == "upload-vehicle-image"){

  		if(message){

  			var query = "update "+table+" set vehicle_brand = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
	  		console.log("query: ", query);
	  		indsertUpdateData(query);
	  		

	  		messageData = sendUploadAdImage(id, "has-qr-code-vehicle" , "sale-rent-service", "Noted, <strong>"+ message +". 👍 </strong><br/>Please upload your vehicle image.");  
	   			
	   	}else{

	   		messageData = sendUploadAdImage(id, "has-qr-code-vehicle" , "sale-rent-service", "Noted. 👍 <br/>Please upload your vehicle image.");  
	   	}

  		

  	}else if(nextTemplate == "upload-property-image"){

  		if(message){

	   			var query = "update "+table+" set property_type = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
		  		console.log("query: ", query);
		  		indsertUpdateData(query);
		  		

		  		messageData = sendUploadAdImage(id, "has-qr-code-property" , "sale-rent-service", "Noted, <strong>"+ message +". 👍</strong> <br/>Please upload your property image.");  		
	   	}else{

	   		 messageData = sendUploadAdImage(id, "has-qr-code-property" , "sale-rent-service", "Noted. 👍 <br/>Please upload your property image.");  
	   	}

  		

  	}else if(nextTemplate == "qr-code-services"){

  		if(message == 'Yes, QR Code'){

  			messageData = sendUploadAdImage(id,"qr-code-services-upload-mlutipart", "has-qr-code-services" , "Noted. Yes 👍 Please upload the QR Code.");

  		}else{

  			messageData = sendNoQrCode(id,"no-qr-code-services", "has-qr-code-services" , "Noted. 👍 <br/>What is the service charge in SGD? Example: 500 /day, 100 / hr etc <br/>"); 
  		}
  	
  	}else if(nextTemplate == "qr-code-vehicle"){

  		if(message == 'Yes, QR Code'){

  			messageData = sendUploadAdImage(id,"qr-code-vehicle-upload-mlutipart", "has-qr-code-vehicle" , "Noted. Yes 👍 Please upload the QR Code.");

  		}else{

  			messageData = sendNoQrCode(id,"no-qr-code-vehicle", "has-qr-code-vehicle" , "Noted. 👍 <br/>What is the price in SGD? <br/>Example: 50000, 65080 etc <br/>NOTE: Only Numbers are acceptable."); 
  		}
  	
  	}else if(nextTemplate == "qr-code-property"){

  		if(message == 'Yes, QR Code'){

  			messageData = sendUploadAdImage(id,"qr-code-property-upload-mlutipart", "has-qr-code-property" , "Noted. Yes 👍 Please upload the QR Code.");

  		}else{

  			messageData = sendNoQrCode(id,"no-qr-code-property", "has-qr-code-property", "Noted 👍 <br/>What is the price in SGD? <br/>Example: 50000, 65080 etc <br/>NOTE: Only Numbers are acceptable."); 

  		}
		
  	}else if(nextTemplate == "no-qr-code-services"){

  		if(message){

  			var query = "update "+table+" set service_charge = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
	  		console.log("query: ", query);
	  		indsertUpdateData(query);
	  		

  		}
  		var query = "select publication from "+table+" where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
		var pub = await fetchData(query);
		var choosen_language =  pub.publication;
		var maxTextLength = 0;
		var text_language_specific = "";

		if(choosen_language == "Lianhe ZaoBao"){

			text_language_specific = "As you chose <strong style='color:#0a9fc2'>Lianhe ZaoBao</strong> to list your advertisement, please type the text in <strong style='color:#0a9fc2''>Chinese Language</strong>  you want to advertise, you can click on  <br/><img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/home.png' width='15%' height='15%'> to start again or click <br/> <img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/back.png' width='15%' height='15%'>  to go back to the previous state. <br/>NOTE:  Characters should not exceed 40 length (Including Spaces)";
			maxTextLength = 40;

		}else if(choosen_language == "The Straits Times"){

			text_language_specific = "As you chose  <strong style='color:#0a9fc2'>The Straits Times</strong>  to list your advertisement, please type the text in <strong style='color:#0a9fc2''>English Language</strong> you want to advertise, you can click on  <br/><img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/home.png' width='15%' height='15%'> to start again or click <br/> <img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/back.png' width='15%' height='15%'>  to go back to the previous state. <br/>NOTE:  Characters should not exceed 67 length (Including Spaces)";
			maxTextLength = 65;
		}

  		messageData = sendAdText(id, "paynow-service" , "qr-code-services-upload-mlutipart", "Okay, <strong>"+ message +". 👍 </strong><br/>" + text_language_specific , maxTextLength); 

  		
  	}else if(nextTemplate == "no-qr-code-property"){


  		if(message){

  				var query = "update "+table+" set property_price = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
		  		console.log("query: ", query);
		  		indsertUpdateData(query);
		  		

		  		messageData = sendBedRoomsInproperty(id, "property-bedrooms-number" , "qr-code-property-upload-mlutipart", "Okay,<strong> "+ message +". 👍 </strong><br/>How many bedrooms are there in the property? <br/>Example: 1, 2, 3, 4, 5 <br/>NOTE: Only numbers are accepted."); 

	   			
	   	}else{

	   		   messageData = sendBedRoomsInproperty(id, "property-bedrooms-number" , "qr-code-property-upload-mlutipart", "Okay. 👍 <br/>How many bedrooms are there in the property? <br/>Example: 1, 2, 3, 4, 5 <br/>NOTE: Only numbers are accepted."); 

	   	}

  		
  	}else if(nextTemplate == "no-qr-code-vehicle"){


  		if(message){
	   			
	   			var query = "update "+table+" set vehicle_price = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
		  		console.log("query: ", query);
		  		indsertUpdateData(query);
		  		

		  		messageData = sendVehicleRegistrationDate(id, "vehicle-registration-date" , "qr-code-vehicle-upload-mlutipart", "Okay, <strong>"+ message +". 👍</strong> <br/>What is the Registration date ? 🗓");
	   	}else{

	   			messageData = sendVehicleRegistrationDate(id, "vehicle-registration-date" , "qr-code-vehicle-upload-mlutipart", "Okay. 👍 <br/>What is the Registration date ? 🗓");

	   	}

  		
  	
  	}else if(nextTemplate == "property-bedrooms-number"){


  		if(message){
	   			
	   			var query = "update "+table+" set property_bedrooms = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
		  		console.log("query: ", query);
		  		indsertUpdateData(query);
		  		

		  		messageData = sendPropertySize(id, "text-to-advertise-property" , "no-qr-code-property", "Noted. <strong>"+message+" </strong>bedrooms. <br/>What is property size in sqft. <br/>Example: 3000, 3200, 4000 NOTE: Only numbers are accepted. ");	
	   	}else{

				messageData = sendPropertySize(id, "text-to-advertise-property" , "no-qr-code-property", "Noted. <br/>What is property size in sqft. <br/>Example: 3000, 3200, 4000 NOTE: Only numbers are accepted. ");		   		
	   	}

  		
  	
  	}else if(nextTemplate == "vehicle-registration-date"){

  		if(message){

  			var query = "update "+table+" set vehicle_reg_date = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
	  		console.log("query: ", query);
	  		indsertUpdateData(query);
	  		
	  		messageData = sendVehicleMileage(id, "text-to-advertise-vehicle" , "no-qr-code-vehicle", "Noted. It's <strong>"+ message +"</strong>. <br/>Please share the mileage. "); 
	   			
	   	}else{

	   		messageData = sendVehicleMileage(id, "text-to-advertise-vehicle" , "no-qr-code-vehicle", "Noted. <br/>Please share the mileage."); 
	   	}

  	}else if(nextTemplate == "text-to-advertise-property"){

		var query = "select publication from "+table+" where phone_number = '"+id+"'  and token = '"+hash_token+"' order by create_timestamp  DESC LIMIT 1";
		var pub = await fetchData(query);
		var choosen_language =  pub.publication;
		var maxTextLength = 0;
		var text_language_specific = "";

		if(choosen_language == "Lianhe ZaoBao"){

			text_language_specific = "As you chose <strong style='color:#0a9fc2'>Lianhe ZaoBao</strong> to list your advertisement, please type the text in <strong style='color:#0a9fc2''>Chinese Language</strong>  you want to advertise, you can click on  <br/><img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/home.png' width='15%' height='15%'> to start again or click <br/><img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/back.png' width='15%' height='15%'>  to go back to the previous state. <br/>NOTE:  Characters should not exceed 40 length (Including Spaces)";
			maxTextLength = 40;
		}else if(choosen_language == "The Straits Times"){

			text_language_specific = "As you chose  <strong style='color:#0a9fc2'>The Straits Times</strong>  to list your advertisement, please type the text in <strong style='color:#0a9fc2''>English Language</strong> you want to advertise, you can click on  <br/><img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/home.png' width='15%' height='15%'> to start again or click <br/><img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/back.png' width='15%' height='15%'>  to go back to the previous state. <br/>NOTE:  Characters should not exceed 67 length (Including Spaces)";
			maxTextLength =67;
		}

  		if(message){

  			var query = "update "+table+" set property_area = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
	  		console.log("query: ", query);
	  		indsertUpdateData(query);
	  		

	  		messageData = sendAdText(id, "paynow-property" , "property-bedrooms-number", "Okay. It's <br/><strong>"+ message +"</strong>.<br/>" +text_language_specific, maxTextLength); 
	    }else{

	    	messageData = sendAdText(id, "paynow-property" , "property-bedrooms-number", "Okay.<br/>"+text_language_specific, maxTextLength); 
	    }

  		
  }else if(nextTemplate == "text-to-advertise-vehicle"){

  		var query = "select publication from "+table+" where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
		var pub = await fetchData(query);
		var choosen_language =  pub.publication;
		var maxTextLength = 0;
		var text_language_specific = "";

		if(choosen_language == "Lianhe ZaoBao"){

			text_language_specific = "As you chose <strong style='color:#0a9fc2'>Lianhe ZaoBao</strong> to list your advertisement, please type the text in <strong style='color:#0a9fc2''>Chinese Language</strong>  you want to advertise otherwise you can click on <br/><img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/home.png' width='10%' height='10%'> to start again or click <br/> <img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/back.png' width='15%' height='15%'>  to go back to the previous state. <br/>NOTE:  Characters should not exceed 40 length (Including Spaces)";
			maxTextLength = 40;
		}else if(choosen_language == "The Straits Times"){

			text_language_specific = "As you chose  <strong style='color:#0a9fc2'>The Straits Times</strong>  to list your advertisement, please type the text in <strong style='color:#0a9fc2''>English Language</strong> you want to advertise, you can click on  <br/><img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/home.png' width='15%' height='15%'> to start again or click  <br/><img src='https://chatbox-images.s3-ap-southeast-1.amazonaws.com/back.png' width='15%' height='15%'>  to go back to the previous state. <br/>NOTE:  Characters should not exceed 67 length (Including Spaces)";
			maxTextLength = 67;
		}

  		if(message){
	   			
	   			var query = "update "+table+" set vehicle_mileage = '"+message+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
		  		console.log("query: ", query);
		  		indsertUpdateData(query);
		  		

		  		messageData = sendAdText(id, "paynow-vehicle" , "vehicle-registration-date", "Okay. It's <br/><strong>"+ message +"</strong>.<br/>"+text_language_specific, maxTextLength);
		  		
	   	}else{

	   		messageData = sendAdText(id, "paynow-vehicle" , "vehicle-registration-date", "Okay.<br/>"+text_language_specific, maxTextLength);
	   	}

  }else if(nextTemplate == "paynow-service"){

  		if(message){

	  		var query_insert_update = "update "+table+" set advertisement_text = '"+message+"', is_active = true where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
	  		console.log("query: ", query_insert_update);
	  		indsertUpdateData(query_insert_update);
	  		
		}

		var query = "select first_name,last_name,publication,ad_type,ad_nature,start_date,end_date, DATEDIFF(end_date, start_date) AS day from "+table+" where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = true order by create_timestamp  DESC LIMIT 1";
		var result = await fetchData(query); 
		var first_name = result.first_name;
		var last_name = result.last_name;
		var publication = result.publication;
		var ad_type = result.ad_type;
		var ad_nature = result.ad_nature;
		var start_date = new Date(result.start_date).toISOString().slice(0,10);
		var end_date =  new Date(result.end_date).toISOString().slice(0,10);
		var days = result.day; 
		var price = 0;

		if(publication == 'The Straits Times'){
			price = UNIT_PRICE_TST;
		}else if(publication == 'Lianhe ZaoBao'){
			price = UNIT_PRICE_ZB;
		}

		var sub_total = days * price;
		var GST = (GST_RATE * sub_total) / 100;
		var total = sub_total + GST;

		let userMap = new Map()
		userMap.set("Advertiser Name", first_name + " " + last_name);
		userMap.set("Publication",  publication);
		userMap.set("Advertisement Type",  ad_type);
		userMap.set("Ad Nature",  ad_nature);
		userMap.set("Ad Start Date",  start_date);
		userMap.set("Ad End Date",  end_date);
		userMap.set("Ad Duration (days)",  days );
		userMap.set("Unit Price (in SGD)",  price);
		userMap.set("GST Rate",  GST_RATE);
		userMap.set("GST (in SGD)",  GST);
		userMap.set("Total (in SGD)",  total);
		userMap.set("Payment Status",  "Waiting Payment Gateway Confirmation");
		
		//emailRecepientMetadata(id,userMap);
		
		var query_insert_update2 = "update "+table+" set price = '"+price+"', days = '"+days+"' , sub_total = '"+sub_total+"', gst = '"+GST+"' , total = '"+total+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = true order by create_timestamp  DESC LIMIT 1";
	  	indsertUpdateData(query_insert_update2);
	  	

		messageData = orderInformation(id, "payment-gateway", "text-to-advertise-property" , price , ad_type, publication, start_date, end_date, days, sub_total, GST, total );

	}else if(nextTemplate == "paynow-vehicle"){

  		if(message){

	  		var query_insert_update = "update "+table+" set advertisement_text = '"+message+"' , is_active = true where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
	  		console.log("query: ", query_insert_update);
	  		indsertUpdateData(query_insert_update);
	  		
		}

		var query = "select first_name,last_name,publication,ad_type,ad_nature,start_date,end_date, DATEDIFF(end_date, start_date) AS day from "+table+" where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now() and is_active = true order by create_timestamp  DESC LIMIT 1";
		var result = await fetchData(query); 
		var first_name = result.first_name;
		var last_name = result.last_name;
		var publication = result.publication;
		var ad_type = result.ad_type;
		var ad_nature = result.ad_nature;
		var start_date = new Date(result.start_date).toISOString().slice(0,10);
		var end_date =  new Date(result.end_date).toISOString().slice(0,10);
		var days = result.day; 
		var price = 0;

		if(publication == 'The Straits Times'){
			price = UNIT_PRICE_TST;
		}else if(publication == 'Lianhe ZaoBao'){
			price = UNIT_PRICE_ZB;
		}


		var sub_total = days * price;
		var GST = (GST_RATE * sub_total) / 100;
		var total = sub_total + GST;

		let userMap = new Map()
		userMap.set("Advertiser Name", first_name + " " + last_name);
		userMap.set("Publication",  publication);
		userMap.set("Advertisement Type",  ad_type);
		userMap.set("Ad Nature",  ad_nature);
		userMap.set("Ad Start Date",  start_date);
		userMap.set("Ad End Date",  end_date);
		userMap.set("Ad Duration (days)",  days );
		userMap.set("Unit Price (in SGD)",  price);
		userMap.set("GST Rate",  GST_RATE);
		userMap.set("GST (in SGD)",  GST);
		userMap.set("Total (in SGD)",  total);
		userMap.set("Payment Status",  "Waiting Payment Gateway Confirmation");
		
		//emailRecepientMetadata(id,userMap);
		
		var query_insert_update2 = "update "+table+" set price = '"+price+"', days = '"+days+"' , sub_total = '"+sub_total+"', gst = '"+GST+"' , total = '"+total+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = true order by create_timestamp  DESC LIMIT 1";
	  	indsertUpdateData(query_insert_update2);
	  	
		messageData = orderInformation(id, "payment-gateway", "text-to-advertise-property" , price , ad_type, publication, start_date, end_date, days, sub_total, GST, total );

	}else if(nextTemplate == "paynow-property"){

		if(message){

			var query_insert_update = "update "+table+" set advertisement_text = '"+message+"' , is_active = true where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = false order by create_timestamp  DESC LIMIT 1";
	  		console.log("query: ", query_insert_update);
	  		indsertUpdateData(query_insert_update);
	  		
	  	}

  		var query = "select first_name,last_name,publication,ad_type,ad_nature,start_date,end_date, DATEDIFF(end_date, start_date) AS day from "+table+" where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now() order by and is_active = true create_timestamp  DESC LIMIT 1";
		var result = await fetchData(query); 
		var first_name = result.first_name;
		var last_name = result.last_name;
		var publication = result.publication;
		var ad_type = result.ad_type;
		var ad_nature = result.ad_nature;
		var start_date = new Date(result.start_date).toISOString().slice(0,10);
		var end_date =  new Date(result.end_date).toISOString().slice(0,10);
		var days = result.day; 
		var price = 0;

		if(publication == 'The Straits Times'){
			price = UNIT_PRICE_TST;
		}else if(publication == 'Lianhe ZaoBao'){
			price = UNIT_PRICE_ZB;
		}

		var sub_total = days * price;
		var GST = (GST_RATE * sub_total) / 100;
		var total = sub_total + GST;


		let userMap = new Map()
		userMap.set("Advertiser Name", first_name + " " + last_name);
		userMap.set("Publication",  publication);
		userMap.set("Advertisement Type",  ad_type);
		userMap.set("Ad Nature",  ad_nature);
		userMap.set("Ad Start Date",  start_date);
		userMap.set("Ad End Date",  end_date);
		userMap.set("Ad Duration (days)",  days );
		userMap.set("Unit Price (in SGD)",  price);
		userMap.set("GST Rate",  GST_RATE);
		userMap.set("GST (in SGD)",  GST);
		userMap.set("Total (in SGD)",  total);
		userMap.set("Payment Status",  "Waiting Payment Gateway Confirmation");

		//emailRecepientMetadata(id,userMap);

		var query_insert_update2 = "update "+table+" set price = '"+price+"', days = '"+days+"' , sub_total = '"+sub_total+"', gst = '"+GST+"' , total = '"+total+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = true order by create_timestamp  DESC LIMIT 1";
	  	indsertUpdateData(query_insert_update2);
	  	
		messageData = orderInformation(id, "payment-gateway", "text-to-advertise-property" , price , ad_type, publication, start_date, end_date, days, sub_total, GST, total );

  }else if(nextTemplate == "payment-gateway"){

  	var query = "select first_name,last_name,email,phone_number,total,bill_to_address_line1,bill_to_address_city,bill_to_address_state,bill_to_address_postal_code,bill_to_country from "+table+" where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now() order by create_timestamp  DESC LIMIT 1";
  	var result = await fetchData(query); 
	var first_name = result.first_name;
	var last_name = result.last_name;
	var phone_number = result.phone_number;
	var email = result.email;
	var total = result.total;
	var bill_to_address_line1 = result.bill_to_address_line1;
	var bill_to_address_city = result.bill_to_address_city;
	var bill_to_address_state = result.bill_to_address_state;
	var bill_to_address_postal_code = result.bill_to_address_postal_code;
	var bill_to_country = result.bill_to_country;

	var transaction_uuid = uniqid();
	var reference_number = microtime.now()+"-sphchatbot";
	var timestamps = gmdate("Y-m-d\TH:i:s\Z").replace('GM','');
	var finalSignedDateTime = timestamps.substring(0, timestamps.length-1)+"Z";

	var uniqueTemplateId = getTemplateId();

	let fieldMap = new Map()
	fieldMap.set("access_key", access_key);
	fieldMap.set("profile_id",  profile_id);
	fieldMap.set("transaction_uuid",  transaction_uuid);
	fieldMap.set("signed_field_names",  signed_field_names);
	fieldMap.set("unsigned_field_names",  "");
	fieldMap.set("signed_date_time",  finalSignedDateTime);
	fieldMap.set("locale",  "en" );
	fieldMap.set("transaction_type",  "sale");
	fieldMap.set("reference_number",  reference_number);
	fieldMap.set("amount",  total);
	fieldMap.set("currency",  "SGD");
	fieldMap.set("bill_to_forename",  first_name);
	fieldMap.set("bill_to_surname",  last_name);
	fieldMap.set("bill_to_email",  email);
	fieldMap.set("bill_to_phone",  phone_number);
	fieldMap.set("bill_to_address_line1",  bill_to_address_line1);
	fieldMap.set("bill_to_address_city",  bill_to_address_city);
	fieldMap.set("bill_to_address_state",  bill_to_address_state);
	fieldMap.set("bill_to_address_country",  bill_to_country);
	fieldMap.set("bill_to_address_postal_code",  bill_to_address_postal_code);
	fieldMap.set("auth_indicator",  0);


	var signedFieldNames = signed_field_names.split(",");
    var  dataToSign= [];
    var index =0;
    for (var i = 0; i < signedFieldNames.length; i++) {
       dataToSign[index] = signedFieldNames[i] + "=" +fieldMap.get(signedFieldNames[i]);
       index++;
    }
    var data = dataToSign.join();
    console.log("data:", data);
    var signature = crypto.createHmac('sha256', secretKey)
											.update(data)
											.digest('base64');
	console.log("signature:", signature);	

	var query_insert_update = "update "+table+" set transaction_uuid = '"+transaction_uuid+"', reference_number = '"+reference_number+"' , finalSignedDateTime = '"+finalSignedDateTime+"' where phone_number = '"+id+"'  and token = '"+hash_token+"'  and validity >= now()  and is_active = true order by create_timestamp  DESC LIMIT 1";
	indsertUpdateData(query_insert_update);		
								

	var html='';
		//  html +="<!DOCTYPE html><html><body>";
		  html += "<form action='"+payment_url+"' style= 'display:none' target = '_blank' accept-charset='utf-8' name='paymentForm' method='POST' enctype='multipart/form-data'>";
		  html += "<input type='hidden' name='access_key' value='"+access_key+"' />";
		  html += "<input type='hidden' name='profile_id' value='"+profile_id+"' />";
		  html += "<input type='hidden' name='transaction_uuid' value='"+transaction_uuid+"' />";
		  html += "<input type='hidden' name='signed_field_names' value='access_key,profile_id,transaction_uuid,signed_field_names,unsigned_field_names,signed_date_time,locale,transaction_type,reference_number,amount,currency,bill_to_forename,bill_to_surname,bill_to_email,bill_to_phone,bill_to_address_line1,bill_to_address_city,bill_to_address_state,bill_to_address_country,bill_to_address_postal_code,auth_indicator' />'";
		  html += "<input type='hidden' name='unsigned_field_names' value='' />'";
		  html += "<input type='hidden' name='signed_date_time' value='"+finalSignedDateTime+"' />";
		  html += "<input type='hidden' name='locale' value='en' />'";
		  html += "<input type='hidden' name='transaction_type' value='sale' />'";
		  html += "<input type='hidden' name='reference_number' value='"+reference_number+"' />";
		  html += "<input type='hidden' name='amount' value='"+total+"' />";
		  html += "<input type='hidden' name='currency' value='SGD' />";
		  html += "<input type='hidden' name='bill_to_forename' value='"+first_name+"' />";
		  html += "<input type='hidden' name='bill_to_surname' value='"+last_name+"' />";
		  html += "<input type='hidden' name='bill_to_email' value='"+email+"' />";
		  html += "<input type='hidden' name='bill_to_phone' value='"+phone_number+"' />";
		  html += "<input type='hidden' name='bill_to_address_line1' value='"+bill_to_address_line1+"' />";
		  html += "<input type='hidden' name='bill_to_address_city' value='"+bill_to_address_city+"' />";
		  html += "<input type='hidden' name='bill_to_address_state' value='"+bill_to_address_state+"' />";
		  html += "<input type='hidden' name='bill_to_address_country' value='"+bill_to_country+"' />";
		  html += "<input type='hidden' name='bill_to_address_postal_code' value='"+bill_to_address_postal_code+"' />";
		  html += "<input type='hidden' name='auth_indicator' value='0' />'";
		  html += "<input type='hidden' name='signature' value='"+signature+"' />";
		  html += "<div style='display:none'><input type='submit' name='next' id='next' value=''/></div>";
		  html += "</form>";
		  html += "<script type='text/javascript'>document.forms['paymentForm'].submit();</script>";
		 // html += "</body></html>";

		  messageData ={
				   "status" : 200,
				   "msg" : "Success",
				   "payload" : {
				       "id" : id,
				        "previousTemplate" : {
				          "templateName" : ""
			      },
			       "nextTemplate" : "",
			       "templateName" : "sendPayment",
			       "templateElement" : {
			           templateId: "232323",
			           templateText: html
			       }
			   }
			}

		console.log("Html:",html);	

  }

	}catch(e) {
       console.error("ERROR occured 1 :", e);
       messageData = sendError("Error occured due to inactive session.Please start from beginning");
    }	

    if(!messageData){
    	 messageData = sendError("Invalid Requst Administrator has been notified.");
    }
   sendResult(res, messageData);

});


// send order information

function orderInformation(id, templateName, previousTemplate , unitcost , adtype, publication, startdate, enddate, days, subtotal, gst, total ){


	var uniqueTemplateId = getTemplateId();

	var messageData = {
			    "status" : 200,
			    "msg" : "Success",
			    "payload" : {
			        "id" : id,
			        "textOption" : {
			              "enableText": "false",
			              "autoComplete": "off"
			         },
			         "previousTemplate" : {
			           "templateName" : previousTemplate,
			           "isEnabled" : false,
			       },
			        "nextTemplate" : templateName,
			        "templateName" : "showTextOrderReceiptTemplate",
			        "templateElement" : {
			            templateId: "23455",
			            orderHeader : "Order Information",
			 			summaryHeader : "Summary",
						payText : "Pay Now",
						payLink : "https://www.straitstimes.com/",
						headerText : "<span class='text11'>This ad will cost $"+unitcost+"/day</span> <br /> <span class='textred'>*Above Price is  without GST</span>", 
						bottomText : "Payment confirmation will be sent to the given email address",
						buttonElement : [{
			                     buttonText : "Pay Now",
			                     buttonId : "paynow-btn-id",
				         		 buttonClass: "pay-now-class",
			                     buttonLink  : ""
			             }],

						orderElement : [
							{
								id: 1,
								orderType: "text",
								orderKey : "Ad Type",
							    orderValue : adtype
							},
							{
								id: 2,
								orderType: "text",
								orderKey : "Publication",
							    orderValue : publication
							},
							{
								id: 3,
								orderType: "text",
								orderKey : "Start Date",
							    orderValue : startdate
							},
							{
								id: 4,
								orderType: "text",
								orderKey : "End Date",
							    orderValue : enddate
							},
							{
								id: 5,
								orderType: "text",
								orderKey : "Package Information",
							    orderValue : days  + " Days"
							},
							{
								id: 6,
								orderType: "text",
								orderKey : "Unit",
							    orderValue : "x " + days + " days"
							},
							{
								id: 7,
								orderType: "text",
								orderKey : "Sub Total",
							    orderValue : "$ " + subtotal
							},
							{
								id: 8,
								orderType: "text",
								orderKey : "GST",
							    orderValue : "$ " + gst + "(" + GST_RATE + "%)"
							},
							{
								id: 9,
								orderType: "text",
								orderKey : "Total",
							    orderValue : "$ " + total
							}

						]
			         }
			     }
			}

	return messageData;

}


// send advertisement text

function sendAdText(id, templateName, previousTemplate, templateText, maxTextLength){

	 var uniqueTemplateId = getTemplateId();

	var messageData = {
			"status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id" :id,
		    	"previousTemplate" : {
		           "templateName" : previousTemplate,
		           "isEnabled" : true,
		       },
		    	"nextTemplate": templateName,
		        "templateName" : "sendmessage",
		        "textOption" : {
		              "enableText": true,
		              "maxTextLength": maxTextLength,
		              "autoComplete": "off",
		              "autoOptions": ["Alabama","Alaska","Arizona","Arkansas","Arkansas2","Barkansas"]
		         },

		        "templateElement" : { 
		        	templateId: uniqueTemplateId,
		        	templateText : templateText
		        }
	    }
	}
	return messageData;
}
// send property size

function sendPropertySize(id, templateName, previousTemplate, templateText){

	 var uniqueTemplateId = getTemplateId();

	var messageData = {
			"status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id" :id,
		    	"previousTemplate" : {
		           "templateName" : previousTemplate,
		           "isEnabled" : true,
		       },
		    	"nextTemplate": templateName,
		        "templateName" : "sendmessage",
		        "textOption" : {
		              "enableText": true,
		              "maxTextLength": 10,
		              "autoComplete": "on",
		              "autoOptions": ["9000 ","2000","3000","1000","2400","600"]
		         },

		        "templateElement" : { 
		        	templateId: uniqueTemplateId,
		        	templateText : templateText  
		        }
	    }
	}
	return messageData;

}

// send mileage vehicle

function sendVehicleMileage(id, templateName, previousTemplate, templateText){

	 var uniqueTemplateId = getTemplateId();
 

	var messageData = {
			"status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id" :id,
		    	"previousTemplate" : {
		           "templateName" : previousTemplate,
		           "isEnabled" : true,
		       },
		    	"nextTemplate": templateName,
		        "templateName" : "sendmessage",
		        "textOption" : {
		              "enableText": true,
		              "maxTextLength": 15,
		              "autoComplete": "off",
		              "autoOptions": [" $ 8900 / yr "," $ 6200 / yr "," $ 800 / yr "," $ 6700 / yr "," $ 9800 / yr "," $ 5000 / yr "]
		         },

		        "templateElement" : { 
		        	templateId: uniqueTemplateId,
		        	templateText : templateText
		        }
	    }
	}
	return messageData;
}


function sendServiceType(id, templateName, previousTemplate, templateText){

	 var uniqueTemplateId = getTemplateId();
 

	var messageData = {
			"status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id" :id,
		    	"previousTemplate" : {
		           "templateName" : previousTemplate,
		           "isEnabled" : true,
		       },
		    	"nextTemplate": templateName,
		        "templateName" : "sendmessage",
		        "textOption" : {
		              "enableText": true,
		              "maxTextLength": 15,
		              "autoComplete": "on",
		              "autoOptions": ["Maid","IT","Printing","Hawker","Care Taker","Home Services","Laundry"]
		         },

		        "templateElement" : { 
		        	templateId: uniqueTemplateId,
		        	templateText : templateText   
		        }
	    }
	}
	return messageData;

}

// send rooms in property
function sendBedRoomsInproperty(id, templateName, previousTemplate, templateText){

	 var uniqueTemplateId = getTemplateId();
 

	var messageData = {
			"status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id" :id,
		    	"previousTemplate" : {
		           "templateName" : previousTemplate,
		           "isEnabled" : true,
		       },
		    	"nextTemplate": templateName,
		        "templateName" : "sendmessage",
		        "textOption" : {
		              "enableText": true,
		              "maxTextLength": 1,
		              "autoComplete": "on",
		              "autoOptions": ["1","2","3","4","5","6"]
		         },

		        "templateElement" : { 
		        	templateId: uniqueTemplateId,
		        	templateText : templateText   
		        }
	    }
	}
	return messageData;
}

// send no qr code query

function sendNoQrCode(id, templateName, previousTemplate, templateText){

	 var uniqueTemplateId = getTemplateId();
 

	var messageData = {
			"status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id" :id,
		    	"previousTemplate" : {
		           "templateName" : previousTemplate,
		           "isEnabled" : true,
		       },
		    	"nextTemplate": templateName,
		        "templateName" : "sendmessage",
		        "textOption" : {
		              "enableText": true,
		              "maxTextLength": 10,
		              "autoComplete": "on",
		              "autoOptions": ["40000","10000","20000","70000","60000","50000"]
		         },

		        "templateElement" : { 
		        	templateId: uniqueTemplateId,
		        	templateText : templateText     
		        }
	    }
	}
	return messageData;

}

// send vehicle registration date
function sendVehicleRegistrationDate(id, templateName, previousTemplate, templateText){

 var uniqueTemplateId = getTemplateId();
 
 var messageData = {
				    "status" : 200,
				    "msg" : "Success",
				    "payload" : {
				        "id" : "12345678",
				       "textOption" : {
				              "enableText": "false",
				              "autoComplete": "off"
				         },
				          "previousTemplate" : {
				           "templateName" : previousTemplate,
				           "isEnabled" : true,
				       },
				        "nextTemplate" : templateName,
				         "templateName" : "showDateTimeAndRangePickerTemplate",
				        "templateElement" : {
						       templateId: uniqueTemplateId,
						       templateText: templateText,
						       isRange: false,
						       timePickerConfig: {
						          timePicker: false,
						          timePickerFormat: "24",
						          timeMinuteStep: "15",
						       },
						       autoClose: false,
						       showCalendars: true,
						       showHeader: false,
						       showFooter: false,
						       startEmpty: true,
							   dateFormat : "YYYY-MM-DD",
						       calendarPosition: "top",
						       calendarCount : 1,
						       pastDateDisable: false,
						       futureDateDisable: true,
						       disableDates: [],
						       selectDateRangeBetween : {},
						       dateDisableBetween : []
						}

				    }
				}
	return messageData;

}

// send vehicle make or brand message
function sendMakeBrandVehicle(id, templateName, previousTemplate, templateText){

	 var uniqueTemplateId = getTemplateId();
 

		var messageData = {
			"status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id" :id,
		    	"previousTemplate" : {
			           "templateName" : previousTemplate,
			           "isEnabled" : true,
			       },
		    	"nextTemplate": templateName,
		        "templateName" : "sendmessage",
		        "textOption" : {
		              "enableText": true,
		              "maxTextLength": 15,
		              "autoComplete": "on",
		              "autoOptions": ["Acura","Alfa","Romeo","Aston Martin","Bentley","Bugatti"]
		         },

		        "templateElement" : { 
		        	templateId: uniqueTemplateId,
		        	templateText : templateText  
		        }
	    }
	}
	return messageData;
}


// create connection object
function getConnection(){
	var connection = mysql.createConnection({
          host     : process.env.CHATBOT_HOSTNAME,
          user     : process.env.CHATBOT_USERNAME,
          password : process.env.CHATBOT_PASSWORD,
          database : process.env.CHATBOT_DB,
          port     : process.env.CHATBOT_DB_PORT
    });
	connection.connect(function(err) {
      if (err){
      	console.error('error when connecting to db:', err);
      	setTimeout(getConnection, 5000); 
      }
      console.log("Connected!");
    });
	return connection;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var counter_retry_undefined = 0;
var counter_max_retry_undefined = 3;

 async function fetchData(query_str){

 			console.log("query_str::::", query_str);
 			await sleep(1000);	
 			var connection = getConnection();
			var aPromise =  new Promise(function(resolve, reject) { 
  			//connection.query(query_str, function (error, results, fields) {
  			connection.query({sql: query_str, timeout: 5000}, function (error, results, fields) {
  			console.log('The fetchData solution before is: ', results);
  			console.log('The fetchData solution before error: ', error);
  			
			 if (error) {
			 	console.error("fetchData ERROR 1 ::::", error);
                reject(error);
            } else {
            	console.log("results[0]", results[0]);
                resolve(results[0]);
            }
		});
  		
	 }).then((response) => {
	 	console.log("response", response)
		return response;
	}).catch((err) => {
		console.error("fetchData ERROR 2:::", err)
	});

	connection.end(function(err) { if (err) { return console.error('ERROR connection end fetchData:' + err.message); } console.log('Close the database connection, fetchData'); });

	var return_result = await aPromise;
	if(return_result === 'undefined'){
		if(counter_retry_undefined == counter_max_retry_undefined){
			console.log("counter_retry_undefined", return_result)
			counter_retry_undefined++;
			fetchData(query_str);
		}		
	}
	console.log("return_result", return_result);
	return JSON.parse(JSON.stringify(return_result));
}


// Database communication

function indsertUpdateData(query){
	
	var connection = getConnection();
	//connection.query(query, function (error, results, fields) {
	connection.query({sql: query, timeout: 5000}, function (error, results, fields) {
		  	if(error) {
		 		console.error("indsertUpdateData ERROR::::", error);
				throw error;
            }
		  console.log('The indsertUpdateData solution is: ', results);
	});
	connection.end(function(err) { if (err) { return console.error('ERROR connection end indsertUpdateData:' + err.message); } console.log('Close the database connection, indsertUpdateData.'); });
}

//ask for upload image
function sendUploadAdImage(id, templateName, previousTemplate, templateText){

 var uniqueTemplateId = getTemplateId();
 

	var messageData = {
	    "status" : 200,
	    "msg" : "Success",
	    "payload" : {
	    	"id" :id,
	    	"previousTemplate" : {
	           "templateName" : previousTemplate,
	           "isEnabled" : true,
	       },
		    "nextTemplate": templateName,
	        "templateName" : "showAttachFileTemplate",
	        "textOption" : {
	              "enableText": false,
	              "autoComplete": "off"
	         },
	        "templateElement" : {
	        	templateId: uniqueTemplateId,
	        	templateText : templateText,
	        	isMultiple : false,
	         	mimeType : "image/*",
	            dataSizeToUpload: "2097152",
	            name : "uploadFile"
			}
	    }
	}
	return messageData;
}


// send sale rent or service query

function sendHasQrCode(id, templateName, previousTemplate, templateText){

	 var uniqueTemplateId = getTemplateId();
 

	var messageData = {
		    "status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id" :id,
		    	"previousTemplate" : {
		           "templateName" : previousTemplate,
		           "isEnabled" : true,
		       },
		    	"nextTemplate": templateName,
		        "templateName" : "showQuickRepliesTemplate",
		        "textOption" : {
		              "enableText": false,
		              "autoComplete": "off"
		         },

		        "templateElement" : {
		        	templateId: uniqueTemplateId,
		        	templateText : templateText, 
		             question: "",
		             replies: [
		                'Yes, QR Code',
		                'No, QR Code'
		              ]
		        }
		    }
		}
	return messageData;
}

// send sale rent or service query

function sendSaleRentService(id, templateName, previousTemplate, templateText){

	 var uniqueTemplateId = getTemplateId();
 

	var messageData = {
		    "status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id" :id,
		    	"previousTemplate" : {
		           "templateName" : previousTemplate,
		           "isEnabled" : true,
		       },
		    	"nextTemplate": templateName,
		        "templateName" : "showQuickRepliesTemplate",
		        "textOption" : {
		              "enableText": false,
		              "autoComplete": "off"
		         },
		        "templateElement" : {
		        	templateId: uniqueTemplateId,
		        	templateText : templateText, 
		             question: "",
		             replies: [
		                'Sale',
		                'Rent',
		                'Services'
		              ]
		        }
		    }
		}
	return messageData;
}

// send sale rent or service query

function sendPropertyType(id, templateName, previousTemplate, templateText){

 var uniqueTemplateId = getTemplateId();
 

	var messageData = {
		    "status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id" :id,
		    	"previousTemplate" : {
		           "templateName" : previousTemplate,
		           "isEnabled" : true,
		       },
		    	"nextTemplate": templateName,
		        "templateName" : "showQuickRepliesTemplate",
		        "textOption" : {
		              "enableText": false,
		              "autoComplete": "off"
		         },
		        "templateElement" : {
		        	templateText : templateText, 
		        	templateId: uniqueTemplateId,
		             question: "",
		             replies: [
		                'Landed',
		                'Private Apt',
		                'Commercial'
		              ]
		        }
		    }
		}
	return messageData;
}

// send calender to available dates to choose from and to

function sendAvailableDates(id, templateName, previousTemplate, templateText){
	
	var end_date_available = (new Date(new Date().getTime() + (90*60*60*24*1000))).toISOString().slice(0,10);
	var start_date_available = (new Date(new Date().getTime() + (0*60*60*24*1000))).toISOString().slice(0,10);
	var uniqueTemplateId = getTemplateId();
 

	var messageData = {
				    "status" : 200,
				    "msg" : "Success",
				    "payload" : {
				        "id" : "12345678",
				       "textOption" : {
				              "enableText": "false",
				              "autoComplete": "off"
				         },
				          "previousTemplate" : {
				           "templateName" : previousTemplate,
				           "isEnabled" : true,
				       },
				        "nextTemplate" : templateName,
				         "templateName" : "showDateTimeAndRangePickerTemplate",
				        "templateElement" : {
						       templateId: uniqueTemplateId,
						       templateText: templateText,
						       isRange: true,
						       timePickerConfig: {
						          timePicker: false,
						          timePickerFormat: "24",
						          timeMinuteStep: "15",
						       },
						       autoClose: false,
						       showCalendars: true,
						       showHeader: false,
						       showFooter: false,
						       startEmpty: true,
							   dateFormat : "YYYY-MM-DD",
						       calendarPosition: "top",
						       calendarCount : 1,
						       pastDateDisable: true,
						       futureDateDisable: false,
						       disableDates: [],
						       selectDateRangeBetween : {},
						       dateDisableBetween : [
						           { start: start_date_available, end : end_date_available }
						       ]
						}

				    }
				}
	return messageData;
}

// send sendPublication

function sendPublication(id, templateName, previousTemplate, templateText){

	var uniqueTemplateId = getTemplateId();

	 var messageData = {
	 		"status" : 200,
			    "msg" : "Success",
			    "payload" : {
			    	"id": id,
			    	"previousTemplate" : {
			           "templateName" : previousTemplate,
			           "isEnabled" : true,
			       },
		    		"nextTemplate": templateName,
			        "templateName" : "showGenericTemplate",
			         "textOption" : {
			              "enableText": false,
			              "autoComplete": "off"
			         },

			        "templateElement" : {
			            templateText : templateText, 
			            templateId: uniqueTemplateId,
			            carousel: true,
			            templateItems : [
			                {
			                    imageUrl: 'https://chatbox-images.s3-ap-southeast-1.amazonaws.com/straits-times-singapore-news-logo.jpg',
			                    title: 'The Straits Times',
			                    subtitle: '',
			                    buttons: [
			                        'The Straits Times'
			                    ]
			                },
			                {
			                    imageUrl: 'https://chatbox-images.s3-ap-southeast-1.amazonaws.com/lianhe_zaobao_chinese_newspaper-logo.jpg',
			                    title: 'Lianhe ZaoBao',
			                    subtitle: '',
			                    buttons: [
			                        'Lianhe ZaoBao'
			                    ]
			                }
			            ]
			        }
			    }
			
	 }
	 return messageData;
}


// send advertisement Sample information

function sendSample(id, templateName, previousTemplate, templateText){

	var uniqueTemplateId = getTemplateId();

				var messageData =  {
			    "status" : 200,
			    "msg" : "Success",
			    "payload" : {
			    	"id": id,
			    	"previousTemplate" : {
			           "templateName" : previousTemplate,
			           "isEnabled" : true,
			       },
		    		"nextTemplate": templateName,
			        "templateName" : "showGenericTemplate",
			         "textOption" : {
			              "enableText": false,
			              "autoComplete": "off"
			         },

			        "templateElement" : {
			            templateText : templateText, 
			            templateId: uniqueTemplateId,
			            carousel: true,
			            templateItems : [
			                {
			                    imageUrl: 'https://chatbox-images.s3-ap-southeast-1.amazonaws.com/CHATBOT_-_VEH-01-test.png',
			                    title: 'Vehicle',
			                    subtitle: 'Sale or Rent Vehicle',
			                    buttons: [
			                        'Vehicle'
			                    ]
			                },
			                {
			                    imageUrl: 'https://chatbox-images.s3-ap-southeast-1.amazonaws.com/CHATBOT_-_VEH_chinese-01.png',
			                    title: 'Vehicle',
			                    subtitle: 'Sale or Rent Vehicle',
			                    buttons: [
			                        'Vehicle'
			                    ]
			                },
			                {
			                    imageUrl: 'https://chatbox-images.s3-ap-southeast-1.amazonaws.com/CHATBOT_-_ST_PROP2-01.png',
			                    title: 'Properties',
			                    subtitle: 'Sale or Rent Property',
			                    buttons: [
			                        'Property'
			                    ]
			                },
			                {
			                    imageUrl: 'https://chatbox-images.s3-ap-southeast-1.amazonaws.com/CHATBOT_-_Chiense_PROP-01.png',
			                    title: 'Properties',
			                    subtitle: 'Sale or Rent Property',
			                    buttons: [
			                        'Property'
			                    ]
			                },
			                {
			                    imageUrl: 'https://chatbox-images.s3-ap-southeast-1.amazonaws.com/CHATBOT_-_OTHERS-01.png',
			                    title: 'Others',
			                    subtitle: 'Services',
			                    buttons: [
			                        'Others'
			                    ]
			                },
			                {
			                    imageUrl: 'https://chatbox-images.s3-ap-southeast-1.amazonaws.com/CHATBOT_-_OTHERS_CHINESE-01.png',
			                    title: 'Others',
			                    subtitle: 'Services',
			                    buttons: [
			                        'Others'
			                    ]
			                }
			            ]
			        }
			    }
			}

	return messageData;
}



// send form 

function sendForm(){
    
    var uniqueTemplateId = getTemplateId();

			var messageData =  {
		    "status" : 200,
		    "msg" : "Success",
		    "payload" : {
		    	"id": "",
		    	"nextTemplate":"sample",
		    	"previousTemplate" : {
		           "templateName" : "",
		           "isEnabled" : true,
		       },
		        "templateName" : "showFormTemplate",
		        "textOption" : {
		              "enableText": false,
		              "autoComplete": "off"
		         },
		        "templateElement" : {
		            formHeader : "Contact Information",
		            templateId: uniqueTemplateId,
		            formNeedLabel : true,
		            formName: "contact-form",
		            formElement : [
		                {
		                    formType: "text",
		                    formId: "first-name-id",
		                    formElemName: "firstcontactname",
		                    formLabel: "First Name",
		                    formMinLength: 3,
		                    formMaxLength: 20,
		                    formPlaceholder: "First Name",
		                    formFormat: "string",
		                    isReadonly: false,
		                    isDisabled: false,
		                    isRequired: true,
		                    errorMsgs :{
		                        common: "Please enter First Name"
		                    }
		                },
		                {
		                    formType: "text",
		                    formId: "last-name-id",
		                    formElemName: "lastcontactname",
		                    formLabel: "Last Name",
		                    formMinLength: 3,
		                    formMaxLength: 20,
		                    formPlaceholder: "Last Name",
		                    formFormat: "string",
		                    isReadonly: false,
		                    isDisabled: false,
		                    isRequired: true,
		                    errorMsgs :{
		                        common: "Please enter Last Name"
		                    }
		                },
		                {
		                    formType: "email",
		                    formId: "email-id",
		                    formElemName: "email",
		                    formLabel: "Email",
		                    formMaxLength: 50,
		                    formPlaceholder: "Email",
		                    formFormat: "string",
		                    isRequired: true,
		                    isReadonly: false,
		                    isDisabled: false,
		                    errorMsgs :{
		                        common: "Please enter a valid email.",
		                    }
		                },
		                 {
		                     formType: "number",
		                     formId: "mobile-id",
		                     formElemName: "mobile",
		                     formLabel: "Mobile",
		                     formMaxLength: 20,
		                     formPlaceholder: "Mobile",
		                     formFormat: "number",
		                     isRequired: true,
		                     isReadonly: false,
		                     isDisabled: false,
		                     patternValidation : "\d+",
		                     errorMsgs :{
		                          common: "Please enter a valid Mobile Number",
		                     }
		                 },
		                {
		                    formType: "bill_to_address_line1",
		                    formId: "bill_to_address_line1",
		                    formElemName: "bill_to_address_line1",
		                    formLabel: "Address Line 1",
		                    formMaxLength: 30,
		                    formPlaceholder: "Address Line 1",
		                    formFormat: "string",
		                    isRequired: true,
		                    isReadonly: false,
		                    isDisabled: false,
		                    errorMsgs :{
		                        common: "Please enter a valid address.",
		                    }
		                },
		                {
		                    formType: "bill_to_address_city",
		                    formId: "bill_to_address_city",
		                    formElemName: "bill_to_address_city",
		                    formLabel: "City",
		                    formMaxLength: 30,
		                    formPlaceholder: "City",
		                    formFormat: "string",
		                    isRequired: true,
		                    isReadonly: false,
		                    isDisabled: false,
		                    errorMsgs :{
		                        common: "Please enter a valid city.",
		                    }
		                },
		                {
		                    formType: "bill_to_address_state",
		                    formId: "bill_to_address_state",
		                    formElemName: "bill_to_address_state",
		                    formLabel: "State",
		                    formMaxLength: 30,
		                    formPlaceholder: "State",
		                    formFormat: "string",
		                    isRequired: true,
		                    isReadonly: false,
		                    isDisabled: false,
		                    errorMsgs :{
		                        common: "Please enter a valid state.",
		                    }
		                },
		                {
		                    formType: "bill_to_address_postal_code",
		                    formId: "bill_to_address_postal_code",
		                    formElemName: "bill_to_address_postal_code",
		                    formLabel: "Postal Code",
		                    formMaxLength: 6,
		                    formPlaceholder: "Postal Code",
		                    formFormat: "number",
		                    isRequired: true,
		                    isReadonly: false,
		                    isDisabled: false,
		                    errorMsgs :{
		                        common: "Please enter a valid postal code.",
		                    }
		                }
		            ]
		        }
		    }
		}
	return messageData;
}


//Referece
//https://nodemailer.com/about/
// async..await is not allowed in global scope, must use a wrapper
async function emailRecepientMetadata(recipient, userMap) {

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  //let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
   //var mailbody = "Hi Team,\n\nThis is an auto-generated email, please do not reply!\nRecipient communicated to Chat Bot with the following information.\n\nMETADATA";

   var mailbody = "Hi Team,\n\nThis is an auto-generated email, please do not reply!\nRecipient communicated to Chat Bot with the following information.\n\n\n";
  
   var table_header = "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/loose.dtd'> <head><meta http-equiv='Content-Type' content='text/html; charset=utf-8'> <style> #customers {font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif; border-collapse: collapse; width: 50%; } #customers td, #customers th {border: 1px solid #ddd; padding: 8px; } #customers tr:nth-child(even){background-color: #f2f2f2;} #customers tr:hover {background-color: #ddd;} #customers th {padding-top: 12px; padding-bottom: 12px; text-align: center; background-color: #4CAF50; color: white; } </style> </head> <body> <table  id='customers'>";
   var table_data = "<tr><th>ADVERTISEMENT PARAMETERS</th><th>CHOOSEN VALUES</th> </tr>"; 
   var table_bottom = "</table> </body></html>";


   for (let [key, value] of userMap) {
		  console.log(key + ' = ' + value)
		  var unit_data = "<tr><td align='center'>"+key+"</td><td align='center'>"+ value +"</td></tr>";
       	  table_data = table_data + unit_data;
	}


  var final_table = table_header + table_data + table_bottom;
   //mailbody = mailbody.replace("METADATA", final_table);
   //mailbody = mailbody + final_table+ "\n\n\nThanks";
  let transporter = nodemailer.createTransport({
    host: "email-smtp.us-west-2.amazonaws.com",
    port: 2465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "AKIAYROJ3LFCISD5CW7N", // generated ethereal user
      pass: "BLipykM3N1MTIyQfaW2c87MWv4LecXHPXipppJ+qvKgBJ" // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'sphtechdatateam@outlook.com', // sender address
    to: "sphtech-growth@sph.com.sg", // list of receivers
    subject: "ChatBot Communication with Recipient Id - " + recipient, // Subject line
    //text: mailbody // plain text body
    html: "<p>Hi Team,<br><br>This is an auto-generated email, please do not reply!<br>Recipient communicated to Chat Bot with the following information.<br><br><br></p>" + final_table // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}


function sendResult(res, messageData){
   
   var outJson = JSON.stringify(messageData);
   res.header("Access-Control-Expose-Headers", "chat-cookie");
   console.log("outJson: ",outJson);
   res.end(JSON.stringify(outJson));

}


function getTemplateId(){
 
	var currentdate = new Date(); 
	var datetime = currentdate.getDate() + ""
                + (currentdate.getMonth()+1)  + "" 
                + currentdate.getFullYear() + ""  
                + currentdate.getHours() + ""  
                + currentdate.getMinutes() + "" 
                + currentdate.getSeconds();
    return datetime;
}

function getGenericDate(advanceDays){

		var today = new Date();
		var dd = today.getDate() + advanceDays;

		var mm = today.getMonth()+1; 
		var yyyy = today.getFullYear();
		if(dd<10) 
		{
		    dd='0'+dd;
		} 

		if(mm<10) 
		{
		    mm='0'+mm;
		} 
		
	return yyyy+'-'+mm+'-'+dd;
}


//console.log(getToken());

function getToken(){
	var date = new Date();
	var result = srs()+"_"+date.getTime();
	return result;
}
