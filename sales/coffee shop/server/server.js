/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project


let express = require('express');
let bcrypt = require('bcryptjs');
let fs = require('fs');
let path = require('path');
let cloudinary = require('cloudinary').v2;

const getEncryptedHash = function(password, callback) {
	bcrypt.genSalt(parseInt(process.env.SALT) || 10, function(err, salt) {
		if (err) return callback(err);

		bcrypt.hash(password, salt, function(err, hash) {
			return callback(err, hash);
		});
	});
};
const comparePassword = function(plainPass, hashword, callback) {
	bcrypt.compare(plainPass, hashword, function(err, isPasswordMatch) {
		return err == null ?
			callback(null, isPasswordMatch) :
			callback(err);
	});
};

let db;
const MongoClient = require('mongodb').MongoClient;
async function syncDatabases(content_db, community_db, internal_db) {
	let content = await content_db.db('content');
	let community = await community_db.db('community');
	let internal = await internal_db.db('internal');

	db = {

			/** Content and offical partnerships */
		articles: content.collection('articles'),
		highlights: content.collection('highlights'),
		partners: content.collection('partners'),
		posts: content.collection('posts'),
		sales: content.collection('sales'),
		stories: content.collection('stories'),

			/** User access information */
		users: internal.collection('users'),
		payments: internal.collection('payments'),
		datatrack: internal.collection('datatrack'),
		auth: internal.collection('authorization'),
		staged_requests: internal.collection('staged_requests'),
		permlogs: internal.collection('permlogs'),

			/** User interaction and community content */
		comments: community.collection('comments'),
		likes: community.collection('likes'),
		messages: community.collection('messages'),
		report: community.collection('report'),
	};
}
async function main() {
	let content, community, internal;
	let _testing_database = 'mongodb://localhost/datatest';
	async function cleanUpServer(eventType, exitCode) {
		timestamp('exiting SERVER, and cleaning up...', eventType, exitCode);
		try {
			await content.close();
			await community.close();
			await internal.close();
		} catch (e) {
			timestamp('ERROR on closing client.');
			console.log(e);
		}
		timestamp('done!');
	}

	cloudinary.config({
	  cloud_name: process.env.CLOUDINARY_NAME,
	  api_key: process.env.CLOUDINARY_API,
	  api_secret: process.env.CLOUDINARY_SECRET
	});

  try {
		[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`]
			.forEach((eventType) => {
			  process.on(eventType, cleanUpServer.bind(null, eventType));
			});

      // Connect to the MongoDB cluster
		content = new MongoClient(
			process.env.ATLAS_URI.replace('[INPUT]', 'content') || _testing_database,
			{useNewUrlParser: true, useUnifiedTopology: true});
		community = new MongoClient(
			process.env.ATLAS_URI.replace('[INPUT]', 'community') || _testing_database,
			{useNewUrlParser: true, useUnifiedTopology: true});
		internal = new MongoClient(
			process.env.ATLAS_URI.replace('[INPUT]', 'internal') || _testing_database,
			{useNewUrlParser: true, useUnifiedTopology: true});

    await content.connect();
		await community.connect();
		await internal.connect();

      // Make the appropriate DB calls
    await syncDatabases(content, community, internal);
  } catch (e) {
    console.error(e);
  }
}
main().catch(console.error);

const Service_Transport = require('nodemailer').createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SOURCE,
    pass: process.env.EMAIL_PASS
  }
});

const APP = express();

if(process.env.NODE_ENV === 'production') {
  APP.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    }
    else {
      next();
    }
  })
}

const SERVER = require('http').createServer(APP);
const IO = require('socket.io')(SERVER);
const PORT = process.env.PORT || 3000;

SERVER.listen(PORT, function() {
	console.log('\********** Server listening on PORT %d **********', PORT);
});

		/*** SAVE_PERM_LOG useage ***
			* data.user -> username that caused log
			* data.email -> that users email
			* data.msg -> the detailed msg in the log
		*/
function SAVE_PERM_LOG(type, data) {
	let logs = db.permlogs;
	let route_data = {
		type: type,
		user: data.user,
		email: data.email,
		timestamp: new Date().toLocaleTimeString(),
		msg: data.msg==null ? "no message" : data.msg
	}
	if (type=="hack") {
		logs.insertOne(route_data, function(err, saved) {
			if (err||!saved) {
				route_data.logged = false;
				SEND_EMAIL("hacked", route_data);
			}
			else {
				route_data.logged = true;
				SEND_EMAIL("hacked", route_data);
			}
		});
	}
	else if (type=="crash") {
		logs.insertOne(route_data, function(err, saved) {
			if (err||!saved) {
				route_data.logged = false;
				SEND_EMAIL("crashed", route_data);
			}
			else {
				route_data.logged = true;
				SEND_EMAIL("crashed", route_data);
			}
		});
	}
	else if (type=="warn") {
		logs.insertOne(route_data, function(err, saved) {
			if (err||!saved) {
				route_data.logged = false;
				SEND_EMAIL("error", route_data);
			}
			else {
			}
		});
	}
}
function SEND_EMAIL(type, data) {
	let mailOptions,
		ARRIVAL_TEAM_EMAIL =
			process.env.EMAIL_NAME + ' <' + process.env.EMAIL_SOURCE + '>';

	if (type=="welcome")
	{ // welcome user to the platform
		fs.readFile(path.join(process.cwd(), '/emails/welcome.html'), 'utf8', function (err, __email) {
			if (err) {
				return timestamp("Email File Read Error: ", err);
			}

			mailOptions = {
			  from: ARRIVAL_TEAM_EMAIL,
			  to: data.email,
			  subject: 'Welcome to Arrival',
			  text: "Welcome to the team! To verify your email, go to this link: " + process.env.PUBLIC_LOC + "/email/verify?" + (data.link + "=" + data.code + "=" + data.email),
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\[VARUSERNAME]/g, data.name)
											.replace(/\[VARDATACODE]/g, (data.link + "=" + data.code + "=" + data.email))
			};

			Service_Transport.sendMail(mailOptions, function(error, info) {
			  if (error) {
			    timestamp("EMAIL ERROR: ", error);
			  } else {
			    timestamp('Email sent: ' + info.response);
			  }
			});
		});
	}
	else if (type=="verify email")
	{ // send email to verify corrent email update
		fs.readFile(path.join(process.cwd(), '/emails/verify email.html'), 'utf8', function (err, __email) {
			if (err) {
				return timestamp("Email File Read Error: ", err);
			}

			mailOptions = {
				from: ARRIVAL_TEAM_EMAIL,
				to: data.email,
				subject: 'Please verify your email - Arrival',
				text: "To verify your email, go to this link: " + process.env.PUBLIC_LOC + "/email/verify?" + (data.link + "=" + data.code + "=" + data.email),
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\[VAREMAILNAME]/g, data.name)
											.replace(/\[VARDATACODE]/g, (data.link + "=" + data.code + "=" + data.email))
			};

			Service_Transport.sendMail(mailOptions, function(error, info) {
			  if (error) {
			    timestamp("EMAIL ERROR: ", error);
			  } else {
			    timestamp('Email sent: ' + info.response);
			  }
			});
		});
	}
	else if (type=="email")
	{ // alert user of email change
		fs.readFile(path.join(process.cwd(), '/emails/email change.html'), 'utf8', function (err, __email) {
			if (err) {
				return timestamp("Email File Read Error: ", err);
			}

			mailOptions = {
			  from: ARRIVAL_TEAM_EMAIL,
			  to: data.email,
			  subject: 'Arrival Email Changed',
			  text: 'Thank you for updating your email, '+data.name+'. Contact will continue to come to this email.',
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\[VARUSERNAME]/g, data.name)
			};

			Service_Transport.sendMail(mailOptions, function(error, info) {
			  if (error) {
			    timestamp("EMAIL ERROR: ", error);
			  } else {
			    timestamp('Email sent: ' + info.response);
			  }
			});
		});
	}
	else if (type=="password")
	{ // alert user of password change
		fs.readFile(path.join(process.cwd(), '/emails/password change.html'), 'utf8', function (err, __email) {
			if (err) {
				return timestamp("Email File Read Error: ", err);
			}

			mailOptions = {
			  from: ARRIVAL_TEAM_EMAIL,
			  to: data.email,
			  subject: 'Arrival Password Changed 🤫',
			  text: 'Your password has been updated.',
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\[VARUSERNAME]/g, data.name)
											.replace(/\[VARUSERLINK]/g, data.link)
			};

			Service_Transport.sendMail(mailOptions, function(error, info) {
			  if (error) {
			    timestamp("EMAIL ERROR: ", error);
			  } else {
			    timestamp('Email sent: ' + info.response);
			  }
			});
		});
	}
	else if (type=="recover password")
	{ // alert user of password change
		fs.readFile(path.join(process.cwd(), '/emails/forgot password.html'), 'utf8', function (err, __email) {
			if (err) {
				return timestamp("Email File Read Error: ", err);
			}

			mailOptions = {
			  from: ARRIVAL_TEAM_EMAIL,
			  to: data.email,
			  subject: 'Arrival Password Change Request 👀',
			  text: 'Forgot your password? A request to change it was sent here. If you did not request this change, just ignore this message. It was most likely a mistake. Nothing will change unless you follow this link. '
											+ process.env.PUBLIC_LOC + 'lost_password/?' + data.link + ',' + data.code,
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\[VARUSERLINK]/g, data.link)
											.replace(/\[VARCODE]/g, data.code)
			};

			Service_Transport.sendMail(mailOptions, function(error, info) {
			  if (error) {
			    timestamp("EMAIL ERROR: ", error);
			  } else {
			    timestamp('Email sent: ' + info.response);
			  }
			});
		});
	}
	else if (type=="feedback" || type=="support")
	{	// allow users to send feedback emails for us to check
		fs.readFile(path.join(process.cwd(), `/emails/${type}.html`), 'utf8', function (err, __email) {
			if (err) {
				return timestamp("Email File Read Error: ", err);
			}

			mailOptions = {
			  from: ARRIVAL_TEAM_EMAIL,
			  to: process.env.EMAIL_SOURCE,
			  subject: type.toLocaleUpperCase() + ': '+data.message.subject,
			  text: data.message.subject + " <" + (data.sender.username + ", " + data.sender.email) + ">: " + data.message.body,
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\[VARUSERNAME]/g, data.sender.username)
											.replace(/\[VARUSERLINK]/g, data.sender.userlink)
											.replace(/\[VARMSGSUB]/g, data.message.subject)
											.replace(/\[VARMSGBODY]/g, data.message.body)
			};
			let responseOptions = {
			  from: ARRIVAL_TEAM_EMAIL,
			  to: data.sender.email,
			  subject: `Thank you for your ${type}!`,
			  text: data.message.subject + " <" + (data.sender.username + ", " + data.sender.email) + ">: " + data.message.body,
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\[VARUSERNAME]/g, data.sender.username)
											.replace(/\[VARUSERLINK]/g, data.sender.userlink)
											.replace(/\[VARMSGSUB]/g, data.message.subject)
											.replace(/\[VARMSGBODY]/g, data.message.body)
			};

			Service_Transport.sendMail(mailOptions, function(error, info) {
			  if (error) {
			    timestamp("EMAIL ERROR: ", error);
			  }
			});
			Service_Transport.sendMail(responseOptions, function(error, info) {
			  if (error) {
			    timestamp("EMAIL ERROR: ", error);
			  }
			});
		});
	}

			// ** Offical communication help */
	else if (type=="newsletter")
	{ // send most recent news letter to recipient
		fs.readFile(path.join(process.cwd(), '/emails/newsletter.html'), 'utf8', function (err, __email) {
			if (err) {
				return timestamp("Email File Read Error: ", err);
			}

			mailOptions = {
				from: ARRIVAL_TEAM_EMAIL,
				to: data.recipient,
				subject: 'ThunderLite Newsletter 🥳',
				text: 'Read the update here: https://thunderlite.herokuapp.com/email/newsletter?'+data.cryptlink,
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\VAREMAILNAME/g, data.name)
											.replace(/VARCRYPTLINK/g, data.cryptlink)
			};

			Service_Transport.sendMail(mailOptions, function(error, info) {
				if (error) {
					timestamp("EMAIL ERROR: ", error);
				} else {
					timestamp('Email sent: ' + info.response);
				}
			});
		});
	}

		// ** Error logging to dev email */
	else if (type=="crashed")
	{	// report a serice CRASH to the dev team
		fs.readFile(path.join(process.cwd(), '/emails/feedback.html'), 'utf8', function (err, __email) {
			if (err) {
				return timestamp("Email File Read Error: ", err);
			}

			mailOptions = {
			  from: ARRIVAL_TEAM_EMAIL,
			  to: process.env.EMAIL_SOURCE,
			  subject: 'CRASHED APP',
			  text: data.user + " caused the issue: "+data.type+" -> "+data.msg,
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\VARFORMSENDER/g, data.user)
											.replace(/\VARFORMSUBJECT/g, data.type)
											.replace(/\VARFORMMESSAGE/g, data.msg)
			};

			Service_Transport.sendMail(mailOptions, function(error, info) {
			  if (error) {
			    timestamp("EMAIL ERROR: ", error);
			  } else {
			    timestamp('Email sent: ' + info.response);
			  }
			});
		});
	}
	else if (type=="hacked")
	{	// warn that a hacking attempt was stopped
		fs.readFile(path.join(process.cwd(), '/emails/feedback.html'), 'utf8', function (err, __email) {
			if (err) {
				return timestamp("Email File Read Error: ", err);
			}

			mailOptions = {
			  from: ARRIVAL_TEAM_EMAIL,
			  to: process.env.EMAIL_SOURCE,
			  subject: 'HACKED',
			  text: data.user + " caused the issue: "+data.type+" -> "+data.msg,
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\VARFORMSENDER/g, data.user)
											.replace(/\VARFORMSUBJECT/g, data.type)
											.replace(/\VARFORMMESSAGE/g, data.msg)
			};

			Service_Transport.sendMail(mailOptions, function(error, info) {
			  if (error) {
			    timestamp("EMAIL ERROR: ", error);
			  } else {
			    timestamp('Email sent: ' + info.response);
			  }
			});
		});
	}
	else if (type=="error")
	{	// report a database access error to the dev team
		fs.readFile(path.join(process.cwd(), '/emails/feedback.html'), 'utf8', function (err, __email) {
			if (err) {
				return timestamp("Email File Read Error: ", err);
			}

			mailOptions = {
			  from: ARRIVAL_TEAM_EMAIL,
			  to: process.env.EMAIL_SOURCE,
			  subject: 'ERROR LOG',
			  text: data.user + " caused the issue: "+data.type+" -> "+data.msg,
				html: __email.replace(/\[VARCWDLOC]/g, process.env.PUBLIC_LOC)
											.replace(/\VARFORMSENDER/g, data.user)
											.replace(/\VARFORMSUBJECT/g, data.type)
											.replace(/\VARFORMMESSAGE/g, data.msg)
			};

			Service_Transport.sendMail(mailOptions, function(error, info) {
			  if (error) {
			    timestamp("EMAIL ERROR: ", error);
			  } else {
			    timestamp('Email sent: ' + info.response);
			  }
			});
		});
	}
}
let VERIFICATION_CODES = new Array();
function DATA_CHECK(type, data) {
	if (type=="email")
	{
		if (typeof(data)!=="string")
			return false;
		if (data.indexOf('@')==-1)
			return false;
		return true;
	}
	if (type=="verify email")
	{
		for (let i=0;i<VERIFICATION_CODES.length;i++)
		{
			if (VERIFICATION_CODES[i].time<new Date)
			{
				VERIFICATION_CODES[i].splice(i--, 1);
				continue;
			}
			if (VERIFICATION_CODES[i].data.type=='EMAIL') {
				if (VERIFICATION_CODES[i].data.name==data.name)
				{
					if (data.code==VERIFICATION_CODES[i].data.code)
					{
						VERIFICATION_CODES.splice(i, 1);
						return true;
					}
					if (++VERIFICATION_CODES[i].attempts>=3)
					{	// failure
						socket.send({type:500,error_code:2,error:"verify password attempts"});
						VERIFICATION_CODES.splice(i, 1);
					}
					return false;
				}
			}
		}
		return false;
	}
	if (type=="SET verify email")
	{
		for (let i=0;i<VERIFICATION_CODES.length;i++)
		{
			if (VERIFICATION_CODES[i].data.name==data.name)
			{	// refreshing code and overwriting old code
				VERIFICATION_CODES[i] = {
					data:data,
					attempts:0,
					time:new Date() + 60 * 60 * 24 * 1000 // max 24 hours to verify
				};
				return true;
			}
		}
		VERIFICATION_CODES.push({
			data:data,
			attempts:0,
			time:new Date() + 60 * 60 * 24 * 1000 // max 24 hours to verify
		});
		return true;
	}
	if (type=="password")
	{
		if (typeof(data)!=="string")
			return false;
		if (data=="")return false;
		if (data.indexOf("/")!=-1)return false;
		if (data.indexOf("\\")!=-1)return false;
		if (data.indexOf(" ")!=-1)return false;
		if (data.indexOf(".")!=-1)return false;
		if (data.indexOf(":")!=-1)return false;
		if (data.indexOf(";")!=-1)return false;
		return true;
	}
	if (type=="SET password update")
	{
		for (let i=0;i<VERIFICATION_CODES.length;i++)
		{
			if (VERIFICATION_CODES[i].data.email==data.email)
			{	// refreshing code and overwriting old code
				VERIFICATION_CODES[i] = {
					data:data,
					attempts:0,
					time:new Date() + 60 * 60 * 24 * 1000 // max 24 hours to verify
				};
				return true;
			}
		}
		VERIFICATION_CODES.push({
			data:data,
			attempts:0,
			time:new Date() + 60 * 60 * 24 * 1000 // max 24 hours to verify
		});
		return true;
	}
	if (type=="verify password update")
	{
		for (let i=0;i<VERIFICATION_CODES.length;i++)
		{
			if (VERIFICATION_CODES[i].time<new Date)
			{
				VERIFICATION_CODES[i].splice(i--, 1);
				continue;
			}
			if (VERIFICATION_CODES[i].data.type=='PASS') {
				if (VERIFICATION_CODES[i].data.email==data.email)
				{
					if (data.code==VERIFICATION_CODES[i].data.code)
					{
						if (data.erase) {
							VERIFICATION_CODES.splice(i, 1);
						}
						return true;
					}
					if (++VERIFICATION_CODES[i].attempts>=3)
					{	// failure
						socket.send({type:605,error_code:1,error:"verify email attempts"});
						VERIFICATION_CODES.splice(i, 1);
					}
					return false;
				}
			}
		}
		return false;
	}
	if (type=="pic")
	{
		if (typeof(data)!=="string")
			return false;
		if (data=="")return false;
		return true;
	}
	if (type=="name")
	{
		if (typeof(data)!=="string")
			return false;
		if (data=="")return false;
		return true;
	}
	if (type=="bio")
	{
		if (typeof(data)!=="string")
			return false;
		return true;
	}
	return false;
}

function PUSH_NEWSLETTER() {
	db.users.find({}, async function(err, data) {
		if (err)return;
		if (data==null)return;
		data = await data.toArray();
		for (let i=0;i<data.length;i++) {
			if (data[i].email==null) continue;
			SEND_EMAIL('newsletter', {
				recipient: data[i].email,
				name: data[i].username,
				cryptlink: data[i].cryptlink,
			});
		}
	});
}

// Routing
APP.use(express.static(__dirname + '/public'));

function timestamp() {
	var str = "";
	for (let i in arguments)
	{
		str +=
			(typeof arguments[i]==='object'
				? JSON.stringify(arguments[i])
				: arguments[i])
			+ " ";
	}
	console.log(new Date().toLocaleTimeString(),"->",str);
}
function Create_ID(amount, numberToLetterRate) {	// ideal numberToLetterRate => 0.3
	function make_letter()
	{ // 65 = A, 97 = a
		let start = Math.random()>0.5 ? 65 : 97;
		let index = Math.floor(Math.random()*26)+start;
		if (start==65)	// upper case
		{	// these if/else's prevent lookalike characters from existing, to make course input freindlier
			while(index==14 || index==8)	// O, I
			{
				index = Math.floor(Math.random()*26)+start;
			}
		}
		else
		{	// lower case
			while(index==11)	// l
			{
				index = Math.floor(Math.random()*26)+start;
			}
		}
		return String.fromCharCode(index);
	}
	function make_number()
	{	// 1 to 9
		let index = Math.random()*9+1;
		return Math.floor(index);
	}
	let _str = "";
	for (let bunch=0;bunch<amount;bunch++)
	{
		_str += Math.random() > numberToLetterRate ? make_letter() : make_number();
	}
	return _str;
}
function Display_ID(input) {
	if (input.length==9)
		return "("+input.substring(0, 3) + "-" + input.substring(3, 6) + "-" + input.substring(6, 9)+")";
	return input;
}

let Connections = new function() {
	var active = new function() {
		this.list = [];
		this.Add = function(data)
		{
			let _index, found = true;
			while(found)
			{
				_index = Create_ID(9, 0.3);
				found = false;
				for (let i in this.list)
				{
					if (i==_index)
					{
						found = true;
						break;
					}
				}
			}
			this.list[_index] = data;
			return _index;
		};
		this.Remove = function(index)
		{
			for (let i in this.list)
			{
				if (i==index)
				{
					let data = this.list[i];
					this.list[i] = null;
					this.list = this.list.filter(function(el) {
						return el!=null;
					});
					return data;
				}
			}
			return null;
		};
		this.Active = function()
		{
			var running = [];
			for (var i in this.list)
			{
				if (this.list[i]!=null)
				{
					running.push(this.list[i]);
				}
			}
			return running;
		};
	}();
	var amt = 0;
	this.Socket = function(index)
	{
		if (index>=active.list.length)return null;
		return active.list[index];
	};
	this.Add = function(socket)
	{
		amt++;
		return active.Add(socket);
	};
	this.Disconnect = function(index)
	{
		var user = active.Remove(index);
		if (!user)return;
		amt--;
	};
	this.Reconnect = function(index, socket)
	{
		if (index>=active.list.length)return;
		var oldSocket = active.list[index];
		socket.index = index;
		socket.username = oldSocket.username;
		socket.user_state = oldSocket.user_state;
		active.list[index] = socket;
	};
	this.Length = function()
	{
		return active.list.length;
	};
	this.Amount = function()
	{
		return amt;
	};
	this.Active = function()
	{
		return active.Active();
	};
}();

const MAX_COMMENT_BUCKET_SIZE = 30;

let SUDO_ROUTE_PASS = Math.random();
setInterval(function() {
	SUDO_ROUTE_PASS = Math.random();
}, 300000); // refresh passkey every 5 minutes


function cleanQuery(query) {
	function removeRegEx(input) {
		return input;
	}
	function removeExtraWhiteSpace(input) {
		let updated = input.replace(/\n\s*\n/g, '\n').replace(/\s+/g, ' ');
		let whitespace = [' ', '\n', '\t'];

		for (let i=0;i<whitespace.length;i++) {
			if (updated.indexOf(0)==whitespace[i])
				updated = updated.substring(1, updated.length);
			if (updated.indexOf(updated.length-1)==whitespace[i])
				updated = updated.substring(0, updated.length-1);
		}

		return updated;
	}

	try {
		if (query.cryptlink!=null) {
			if (query.cryptlink.indexOf('\\')!=-1) {
				query.cryptlink = '';
			}
		}
	} catch (e) {
		query.cryptlink = '';
	}
	try {
		if (query.link!=null) {
			if (query.link.indexOf('\\')!=-1) {
				query.link = '';
			}
		}
	} catch (e) {
		query.link = '';
	}

	try {
		if (query.content!=null) {
			query.content = removeRegEx(removeExtraWhiteSpace(query.content));
		}
	} catch (e) {
		query.content = '';
	}
	try {
		if (query.caption!=null) {
			query.caption = removeRegEx(removeExtraWhiteSpace(query.caption));
		}
	} catch (e) {
		query.caption = '';
	}
	try {
		if (query.shortBio!=null) {
			query.shortBio = removeRegEx(removeExtraWhiteSpace(query.shortBio));
		}
	} catch (e) {
		query.shortBio = '';
	}

	try {
		if (query.username!=null) {
			query.username = removeRegEx(removeExtraWhiteSpace(query.username));
		}
	} catch (e) {
		query.username = '';
	}
	try {
		if (query.name!=null) {
			query.name = removeRegEx(removeExtraWhiteSpace(query.name));
		}
	} catch (e) {
		query.name = '';
	}
	try {
		if (query.email!=null) {
			query.email = removeRegEx(removeExtraWhiteSpace(query.email));
		}
	} catch (e) {
		query.email = '';
	}

	return query;
}
function detectIllegalContent(input) {
	if (input=='') return;
	return false;
}

const DEFAULT_INTERESTS = {
	articles: {
		archive: false,
	},
	posts: {
		archive: false,
	},
	sales: {
		archive: false,
	},
	partners: {
		archive: false,
	},
};
const DEFAULT_KNOBS = [ 0, 1, 0, 3, 2 ];
const DEFAULT_SEEN = { articles: 0, posts: 0, sales: 0, partners: 0 };


IO.on('connection', function(socket) {
	socket.user_state = {
		username: '',
		online: false,
		last_cycle: 0,
		interests: DEFAULT_INTERESTS,
		algorithm: {
			knobs: DEFAULT_KNOBS,
			seen: {
				articles: DEFAULT_SEEN.articles,
				posts: DEFAULT_SEEN.posts,
				sales: DEFAULT_SEEN.sales,
				partners: DEFAULT_SEEN.partners,
			},
		}
	};

	socket.on('log', function(msg) {
		timestamp(socket.username+": "+msg);
	});
	socket.on('contact us', function(contact_data) {
		if (contact_data.message.subject==null
			|| contact_data.message.body==null)return;
		if (contact_data.message.subject.length>100
			|| contact_data.message.body.length>3500)return;

		db.users.findOne({cryptlink: contact_data.sender.link}, function(err, userData) {
			if (err) {
				socket.send({type:500,error_code:2});
				return;
			}
			if (userData==null) {
				socket.send({type:500,error_code:3});
				return;
			}

			SEND_EMAIL("feedback", {
				sender: {
					username: contact_data.sender.name,
					userlink: contact_data.sender.link,
					email: contact_data.sender.email,
				},
				message: {
					subject: contact_data.message.subject,
					body: contact_data.message.body,
				},
			});
		});
	});
	socket.on('report item', function(reported_data) {
		if (reported_data.message.subject==null
			|| reported_data.message.body==null) return;
		if (reported_data.message.subject.length>100
			|| reported_data.message.body.length>3500) return;

		db.report.insertOne({
			type: reported_data.item.type,
			link: reported_data.item.link,
			from: reported_data.sender.link,
		});

		db.users.findOne({cryptlink: reported_data.sender.link}, function(err, userData) {
			if (err) {
				socket.send({type:500,error_code:2});
				return;
			}
			if (userData==null) {
				socket.send({type:500,error_code:3});
				return;
			}

			SEND_EMAIL("feedback", {
				sender: {
					username: reported_data.sender.name,
					userlink: reported_data.sender.link,
					email: reported_data.sender.email
				},
				message: {
					subject: reported_data.message.subject,
					body: reported_data.message.body
				}
			});
		});
	});
	socket.on('survey response', function(response) {
		response = cleanQuery(response);
		db.datatrack.findOne({cryptlink: response.link}, function(err, data) {
			if (err || data==null) return;

			let next_response = {
				type: response.type,
				response: response.responses,
			};

			if (data.surveys==null) data.surveys = [];
			data.surveys.push(next_response);

			db.datatrack.updateOne({cryptlink: response.link}, {$set:{
				surveys: data.surveys
			}});
		});
	});
	socket.on('send support email', function(response) {
		response = cleanQuery(response);

		try {
			SEND_EMAIL('support', {
				sender: {
					username: 'Alpha User',
					userlink: response.userlink,
					email: response.user_email,
				},
				message: {
					subject: 'support request',
					body: response.message,
				},
			});

			socket.send({
				type: 529,
				msg: 'ok',
			});
		}
		catch (e) {
			socket.send({
				type: 529,
				msg: 'internal error: C09',
			});
			return;
		}
	});
	socket.on('sudo update database', function(password) {
		if (password==null) return;

		comparePassword(password, process.env.SUDO_PASS, async function (err, correct) {
			if (err || !correct) return;

			// when needed, do here:

			// let current_user, datatrack_data;
			// let user_list = await db.users.find({});
			// user_list = await user_list.toArray();
			//
			// for (let i=0;i<user_list.length;i++) {
			// 	current_user = user_list[i];
			//
			// 	current_user.last_login = current_user.account_created;
			// 	current_user.archived = false;
			// 	current_user.settings.legal.UGC_agreement = false;
			//
			// 	db.users.updateOne({cryptlink: current_user.cryptlink}, {$set: current_user});
			//
			// 	datatrack_data = await db.datatrack.findOne({cryptlink: current_user.cryptlink});
			//
			// 	datatrack_data.blocking = [];
			// 	datatrack_data.blocked_by = [];
			//
			// 	db.datatrack.updateOne({cryptlink: current_user.cryptlink}, {$set: datatrack_data});
			// }
		});
	});

	socket.on('information set', function(link, info) {
		// return with data type:700
	});

	socket.on('new user', function(email, username, password) {

		return;	// don't use

	});
	socket.on('connect user', function(username, password) {
		if (socket.user_state.online)return;
		db.users.findOne({username:username}, function(err, data) {
			if (err || data==null) {
				socket.send({type:6});
				return;
			}
			comparePassword(password, data.password, function(err, is_correct) {
				if (!is_correct) {
					socket.send({type:666, code:666});
					return;
				}
				let activeCons = Connections.Active();
				let rejoined = false;
				for (let i in activeCons) {
					if (activeCons[i].username!=username)continue;
					if (!activeCons[i].user_state.online) {
						Connections.Reconnect(activeCons[i].index, socket);
						rejoined = true;
						break;
					}else{
						timestamp("ERROR: user", username, "tried to join twice at once");
						socket.send({type:8});
						return;
					}
				}
				if (!rejoined) {
					socket.index = Connections.Add(socket);
					socket.username = username;
				}
				socket.send({
					type:20,
					pic:data.pic,
					index:socket.index
				});
				socket.user_state.online = true;
			});
		});
	});
	socket.on('disconnect', function() {
		if (!socket.user_state.online)return;
		socket.user_state.online = false;
		// echo globally that this client has left
		socket.broadcast.emit('user left', socket.username);
		Connections.Disconnect(socket.index);
	});
	socket.on('userdata get', function(user) {
		user_auth = cleanQuery(user);

		db.users.findOne({username: user.username}, function(err, data) {
			if (err) {
				socket.send({type:500,error_code:4});
				return;
			}
			if (data==null) {
				socket.send({type:500,error_code:5});
				return;
			}
			comparePassword(user.password, data.password, function(err, is_correct) {
				if (!is_correct) {
					socket.send({type:666, code:666});
					return;
				}
				socket.send({
					type:600,
					response:{
						pic: data.pic,
						email: data.email,
						shortBio: data.shortBio,
						verified: data.verified,
						name: data.username,
						cryptlink: data.cryptlink,
						level: data.level,
						points: data.points,
						settings: data.settings
					}
				});
			});
		});
	});
	socket.on('userdata get link', function(user) {
		user_auth = cleanQuery(user);

		db.users.findOne({cryptlink: user.link}, function(err, data) {
			if (err) {
				socket.send({type:500,error_code:4});
				return;
			}
			if (data==null) {
				socket.send({type:500,error_code:5});
				return;
			}
			comparePassword(user.password, data.password, function(err, is_correct) {
				if (!is_correct) {
					socket.send({type:666, code:666});
					return;
				}
				socket.send({
					type:600,
					response:{
						pic: data.pic,
						email: data.email,
						shortBio: data.shortBio,
						verified: data.verified,
						name: data.username,
						cryptlink: data.cryptlink,
						level: data.level,
						points: data.points,
						settings: data.settings
					}
				});
			});
		});
	});
	socket.on('userdata update', function(query) {
		let user_find = cleanQuery({
			cryptlink: query.link,
		});
		query = cleanQuery(query);

		db.users.findOne(user_find, function(err, user_data) {
			if (err) {
				socket.send({type:500,error_code:6});
				return;
			}
			if (user_data==null) {
				socket.send({type:500,error_code:7});
				return;
			}

			if (query.password==null) {
				if (query.type=='update forgotten pass') {
					if (DATA_CHECK('verify password update', {
						email: user_data.email,
						type: 'PASS',
						code: query.code,
						erase: true,
					})) {
						if (!DATA_CHECK("password", query.value))
						{	// invalid input error
							socket.send({type:605, response:45});
							return;
						}

							// encrypt passwords
						getEncryptedHash(query.value, function(err, hashPass) {
							if (err!=null)
							{
								socket.send({type:605, code:41});
								return;
							}
								// update stored password
							db.users.updateOne(user_find, {$set:{
								password: hashPass
							}});
							SEND_EMAIL("password", {
								email: user_data.email,
								name: user_data.username,
								link: user_data.cryptlink
							});
							socket.send({
								type:605,
								response: 44,
							});
						});
					}
				}
				return;
			}

			comparePassword(query.password, user_data.password, function(err, is_correct) {
				if (!is_correct) {
					socket.send({type:666, code:5});
					return;
				}

				if (query.type=="email")
				{	// starts email verification process
					if (!DATA_CHECK("email", query.value))
					{	// invalid input error
						socket.send({type:666, code:1, error:'email'});
						return;
					}

					let CODE = Create_ID(15, .43);

					DATA_CHECK("SET verify email", {
						name: user_data.cryptlink,
						type: 'EMAIL',
						code: CODE
					});
					SEND_EMAIL("verify email", {
						name: user_data.username,
						link: user_data.cryptlink,
						email: query.value,
						code: CODE
					});
					socket.send({
						type:602,
						response: query.value,
					});
				}
				else if (query.type=="verify email")
				{	// finishes email verification process and updates new email if succesful
					if (!DATA_CHECK("email", query.value))
					{	// invalid input error
						socket.send({type:666, code:1, error:'email'});
						return;
					}
					if (!DATA_CHECK("verify email", {
						name: user_data.cryptlink,
						type: 'EMAIL',
						code: query.code
					})) {
						socket.send({type:666, code:1, error:'verify email'});
						return;
					}

					// here is the final email update, after verification
					db.users.updateOne(user_find, {$set:{
						email: query.value
					}});
					socket.send({
						type: 601,
						response: query.value,
					});
					SEND_EMAIL("email", {
						name: user_data.username,
						email: query.value
					});
				}
				else if (query.type=="password")
				{	// update password
					if (!DATA_CHECK("password", query.value))
					{	// invalid input error
						socket.send({type:666, code:1, error:'password'});
						return;
					}

						// encrypt passwords
					getEncryptedHash(query.value, function(err, hashPass) {
						if (err!=null)
						{
							socket.send({type:666, code:2});
							return;
						}
							// update stored password
						db.users.updateOne(user_find, {$set:{
							password: hashPass
						}});
						SEND_EMAIL("password", {
							email: user_data.email,
							name: user_data.username,
							link: user_data.cryptlink
						});
						socket.send({
							type: 601,
							response: query.value,
						});
					});
				}
				else if (query.type=="pic")
				{	// update profile pic
					if (!DATA_CHECK("pic", query.value))
					{	// invalid input error
						socket.send({type:666, code:1, error:"pic"});
						return;
					}

					if (user_data.pic!=null) {
						let last_link = user_data.pic
							.substring(user_data.pic.indexOf('/') + 1, user_data.pic.length);
						let last_dot, cur_dot = 0;
						do {
							last_dot = cur_dot;
							cur_dot = last_link.indexOf('.', last_dot + 1);
						} while(cur_dot!=-1);
						cloudinary.uploader.destroy(last_link.substring(0, last_dot));
					}

					db.users.updateOne(user_find, {$set:{
						pic: query.value
					}});
				}
				else if (query.type=="name")
				{	// update profile pic
					if (!DATA_CHECK("name", query.value))
					{	// invalid input error
						socket.send({type:666, code:1, error:"name"});
						return;
					}

					db.users.updateOne(user_find, {$set:{
						username: query.value
					}});
				}
				else if (query.type=="bio")
				{	// update profile pic
					if (!DATA_CHECK("bio", query.value))
					{	// invalid input error
						socket.send({type:666, code:1, error:"bio"});
						return;
					}

					db.users.updateOne(user_find, {$set:{
						shortBio: query.value.substring(0, Math.min(query.value.length, 500))
					}});
				}
				else if (query.type=="membership tier")
				{	// update profile pic
					let Membership = {
						Free: 0,
						Lite: 1,
						Premium: 2,
					}

					if (query.value!=Membership.Free
						&& query.value!=Membership.Lite
						&& query.value!=Membership.Premium) return;

					user_data.settings.membership.tier = query.value;

					db.users.updateOne(user_find, {$set:{
						settings: user_data.settings
					}});
				}
				else if (query.type=='settings')
				{	// general settings
					let updater = query.value;

					if (updater.email_notifs!=null) {
						user_data.settings.membership.email_notifs = updater.email_notifs;
					}

					db.users.updateOne(user_find, {$set:{
						settings: user_data.settings
					}});
				}
			});
		});
	});
	socket.on('userdata verify', function(query) {
		let user_find = cleanQuery({
			cryptlink: query.link,
		});

		db.users.findOne(user_find, function(err, user_data) {
			if (err) {
				socket.send({type:500,error_code:6});
				return;
			}
			if (user_data==null) {
				socket.send({type:500,error_code:7});
				return;
			}

			if (query.type=='email') {
				if (!DATA_CHECK("verify email", {
					name: user_data.cryptlink,
					type: 'EMAIL',
					code: query.code
				})) {
					socket.send({type:666, code:1, error:'verify email'});
					return;
				}

				// here is the final email update, after verification
				if (query.changed) {	// email change
					db.users.updateOne(user_find, {$set:{
						email: query.email,
					}});
					socket.send({
						type: 601,
						response: query.email,
					});
					SEND_EMAIL("email", {
						name: user_data.username,
						email: query.value
					});
				}
				else {	// account activation
					db.users.updateOne(user_find, {$set:{
						activated: true,
					}});
					socket.send({
						type: 601,
					});
				}
			}
		});
	});
	socket.on('userdata follow toggle', async function(input) {
		let follow_data = (await db.datatrack.findOne({cryptlink: input.user})).following;
		let recipient_followers_data = (await db.datatrack.findOne({cryptlink: input.follow})).followers;

		let index = follow_data.indexOf(input.follow);

		if (index == -1) {
			follow_data.push(input.follow);
			recipient_followers_data.push(input.user);
		}
		else {
			follow_data.splice(index, 1);

			index = recipient_followers_data.indexOf(input.user);
			recipient_followers_data.splice(index, 1);
		}

		db.datatrack.updateOne({cryptlink: input.user}, {$set:{
				following: follow_data,
			}});
		db.datatrack.updateOne({cryptlink: input.follow}, {$set:{
			followers: recipient_followers_data,
		}});
	});
	socket.on('userdata follow', async function(input) {
		let follow_data = (await db.datatrack.findOne({cryptlink: input.user})).following;
		let recipient_followers_data = (await db.datatrack.findOne({cryptlink: input.follow})).followers;

		let index = follow_data.indexOf(input.follow);

		if (index == -1) {
			if (!input.action) return;	// stop execution because it's already set correctly

			follow_data.push(input.follow);
			recipient_followers_data.push(input.user);
		}
		else {
			if (input.action) return;	// stop execution because it's already set correctly

			follow_data.splice(index, 1);

			index = recipient_followers_data.indexOf(input.user);
			recipient_followers_data.splice(index, 1);
		}

		db.datatrack.updateOne({cryptlink: input.user}, {$set:{
				following: follow_data,
			}});
		db.datatrack.updateOne({cryptlink: input.follow}, {$set:{
			followers: recipient_followers_data,
		}});
		db.users.updateOne({cryptlink: input.user}, {$set:{
			followingCount: follow_data.length,
		}});
		db.users.updateOne({cryptlink: input.follow}, {$set:{
			followersCount: recipient_followers_data.length,
		}});
	});
	socket.on('userdata block', async function(input) {
		let blocking_data = (await db.datatrack.findOne({cryptlink: input.user})).blocking;
		let recipient_blocking_data = (await db.datatrack.findOne({cryptlink: input.block})).blocked_by;

		let index = blocking_data.indexOf(input.block);

		if (index == -1) {
			if (!input.action) return;	// stop execution because it's already set correctly

			blocking_data.push(input.block);
			recipient_blocking_data.push(input.user);
		}
		else {
			if (input.action) return;	// stop execution because it's already set correctly

			blocking_data.splice(index, 1);

			index = recipient_blocking_data.indexOf(input.user);
			recipient_blocking_data.splice(index, 1);
		}

		db.datatrack.updateOne({cryptlink: input.user}, {$set:{
			blocking: blocking_data,
		}});
		db.datatrack.updateOne({cryptlink: input.block}, {$set:{
			blocked_by: recipient_blocking_data,
		}});
	});
	socket.on('userdata set legal agreement', function(input) {
		let user_find = cleanQuery({
			cryptlink: input.user,
		});

		db.users.findOne(user_find, function(err, user_data) {
			if (err) {
				socket.send({type:500,error_code:6});
				return;
			}
			if (user_data==null) {
				socket.send({type:500,error_code:7});
				return;
			}

			if (input.agreements.type == 'ugc') {
				user_data.settings.legal.UGC_agreement = input.agreements.value;
			}
			else return;

			db.users.updateOne(user_find, {$set:{
				settings: user_data.settings,
			}});
		});
	});

	socket.on('profile get', function(msg) {
		msg = cleanQuery(msg);
		db.users.findOne({cryptlink:msg.link}, function(err, data) {
			if (err) {
				socket.send({type: 500, error_code: 14});
				return;
			}
			if (data==null) {
				socket.send({type: 500, error_code: 97});
				return;
			}
			socket.send({
				type: 803,
				response: {
					name: data.username,
					verified: data.verified,
					cryptlink: data.cryptlink,
					email: data.email,
					shortBio: data.shortBio,
					level: data.level,
					points: data.points,
					pic: data.pic,
					followersCount: data.followersCount,
					followingCount: data.followingCount,
				}
			});
		});
	});
	socket.on('profile get posts', async function(query) {
		query = cleanQuery(query);
		let data;

		try {
			data = await (db.posts.find({user: query.link, archive: false})
				.skip(query.index).limit(query.amount));
			data = await data.toArray();
		} catch (e) {
			socket.send({type: 500, error_code: 60});
			return;
		}

		if (data.length==0) {
			socket.send({type: 500, error_code: 25});
			return;
		}

		let responseList = [];
		let is_at_end = query.amount>=data.length;

		for (let i=0;i<query.amount && i<data.length;i++) {
			responseList.push({
				cryptlink: data[i].cryptlink,
				cloudlink: data[i].cloud,
				user: data[i].user,
				caption: data[i].caption,
				date: data[i].upload_date,
				likes: data[i].likes,
				views: data[i].views,
				height: data[i].height,
				width: data[i].width,
				location: data[i].location,
				post_type: data[i].type,
			});
		}

		socket.send({
			type: 805,
			response: {
				list: responseList,
				at_end: is_at_end,
			},
		});
	});
	socket.on('profile lite', function(msg) {
		msg = cleanQuery(msg);
		db.users.findOne({cryptlink:msg.link}, function(err, data) {
			if (err) {
				socket.send({type:500,error_code:14});
				return;
			}
			if (data==null) {
				socket.send({type:500,error_code:98});
				return;
			}
			socket.send({
				type:804,
				response:{
					name: data.username,
					verified: data.verified,
					cryptlink: data.cryptlink,
					pic: data.pic,
				}
			});
		});
	});

	socket.on('chat', async function(msg) {
		if (socket.user_state.thread==null) return;

		let data = {
			id: msg.id,
			text: msg.text,
			image: msg.image,
			video: msg.video,
			time: msg.time,
			user: msg.user,
			properties: msg.properties,
		};

		for (let index in socket.user_map) {
			if (index==msg.user) continue;
			// socket.chat_user_map[index].send(data);
		}

		let message_data = (await db.messages.findOne({thread: socket.user_state.thread})).messages;

		message_data.push({
			data: data,
			deleted: false,
		});

		db.messages.updateOne({thread: socket.user_state.thread}, {$set:{
			messages: message_data,
		}});
	});
	socket.on('set chat state', async function(init) {
		socket.user_state.link = init.link;
		socket.user_state.thread = init.thread;

		try {
			let data = await db.messages.findOne({thread: init.thread});
			socket.chat_user_map = data.users;

			let sendableChatData = [];

			for (let i=0;i<15 && i<data.messages.length;i++) {
				if (data.messages[data.messages.length - i - 1].deleted) continue;

				sendableChatData.push(data.messages[data.messages.length - i - 1].data);
			}

			socket.send(sendableChatData.reverse());
		}
		catch (e) {
			socket.chat_user_map = [init.link];
		}
	});
	socket.on('chatlist ask', async function(input) {
		let limit = input.amount || 15;
		let start_list_index = input.start || 0;

		let chat_list_indexes = (await db.datatrack.findOne({cryptlink: input.user})).messages;
		let chat_list_data = [];

		limit = Math.min(chat_list_indexes.length, limit);

		for (
			let i=start_list_index, used=0, currentChatData;
			i<chat_list_indexes.length && used<limit;
			i++
		) {
			currentChatData = await db.messages.findOne({thread: chat_list_indexes[i]});

			if (currentChatData == null) continue;
			if (currentChatData.archive) continue;
			if (currentChatData.messages.length == 0) continue;

			let lastMsg = currentChatData.messages[currentChatData.messages.length - 1].data;

			chat_list_data.push({
				thread: currentChatData.thread,
				users: currentChatData.users,
				icon: currentChatData.icon,
				name: currentChatData.name,
				lastMsgTime: lastMsg.time,
				lastMsg: lastMsg.text,
				lastMsgUser: lastMsg.user,
			});
			used++;
		}

		socket.send({
			type: 840,
			response: chat_list_data,
		});
	});
	socket.on('message new', function(input) {
		let newMessageIndex = Create_ID(21, .3);

		db.messages.insertOne({
			thread: newMessageIndex,
			archive: false,
			icon: input.icon,
			name: input.name,
			users: input.users_list,
			messages: [],
		});

		socket.user_state.link = input.users_list[0];
		socket.user_state.thread = newMessageIndex;
		socket.chat_user_map = input.users_list;

		socket.send({type: 1001});

		async function recurCreateMessage(i) {
			if (i >= input.users_list.length) return;

			recurCreateMessage(i + 1);

			let message_data = (await db.datatrack.findOne({cryptlink: input.users_list[i]})).messages;

			message_data.push(newMessageIndex);

			db.datatrack.updateOne({cryptlink: input.users_list[i]}, {$set:{
				messages: message_data,
			}});
		}

		recurCreateMessage(0);
	});
	socket.on('message create if new', async function(msg) {
		if (msg.sender == msg.receiver) return;

		let chat_list_indexes = (await db.datatrack.findOne({cryptlink: msg.sender})).messages;

		let cur_chat;
		let MessageGroup;

			//** If finished in this loop -- found existing msg */
		for (let i=0;i<chat_list_indexes.length;i++) {
			MessageGroup = await db.messages.findOne({thread: chat_list_indexes[i]});
			cur_chat = MessageGroup.users;

			if (users.length != 2) continue;

			let not_the_group = true;

			if (users[0] == msg.sender) {
				if (users[1] == msg.receiver) {
					not_the_group = false;
				}
			}
			else if (users[0] == msg.receiver) {
				if (users[1] == msg.sender) {
					not_the_group = false;
				}
			}

			if (not_the_group) continue;

			let data = {
				id: Create_ID(9, .3),
				text: msg.content,
				image: null,
				video: null,
				time: new Date().getTime(),
				user: msg.sender,
				properties: null,
			};

			let message_data = MessageGroup.messages;

			message_data.push({
				data: data,
				deleted: false,
			});

			db.messages.updateOne({thread: socket.user_state.thread}, {$set:{
				messages: message_data,
			}});

			return;
		}

			//** If down below here -- creating new message */

		let newMessageIndex = Create_ID(21, .3);

		db.messages.insertOne({
			thread: newMessageIndex,
			archive: false,
			icon: '',
			name: '',
			users: [msg.sender, msg.receiver],
			messages: [],
		});

		async function recurCreateMessage(i, user_list) {
			if (i >= user_list.length) return;

			recurCreateMessage(i + 1);

			let message_data = (await db.datatrack.findOne({cryptlink: user_list[i]})).messages;

			message_data.push(newMessageIndex);

			db.datatrack.updateOne({cryptlink: user_list[i]}, {$set:{
				messages: message_data,
			}});
		}

		recurCreateMessage(0, [msg.sender, msg.receiver]);

		let data = {
			id: Create_ID(9, .3),
			text: msg.content,
			image: null,
			video: null,
			time: new Date().getTime(),
			user: msg.sender,
			properties: null,
		};

		let message_data = (await db.messages.findOne({thread: newMessageIndex})).messages;

		message_data.push({
			data: data,
			deleted: false,
		});

		db.messages.updateOne({thread: newMessageIndex}, {$set:{
			messages: message_data,
		}});
	});

	socket.on('internal validate', function(auth) {
		db.auth.findOne({name: auth.name}, function(err, data) {
			if (err || data==null) {
				socket.send({type:1400});
				return;
			}
			comparePassword(auth.auth, data.auth, function(err, is_correct) {
				if (err || !is_correct) {
					socket.send({type:1401});
					return;
				}
				comparePassword(auth.pass, data.pass, function(err, is_correct) {
					if (err || !is_correct) {
						socket.send({type:1401});
						return;
					}

					if (data.access.admin) {
						socket.send({
							type: 525,
							response: {
								cloud_name: process.env.CLOUDINARY_NAME,
								preset: 'gfihiqmz'
							}
						});
					}
					else if (auth.type=='upload' && data.access.upload) {
						socket.send({
							type: 525,
							response: {
								cloud_name: process.env.CLOUDINARY_NAME,
								preset: 'gfihiqmz'
							}
						});
					}
					else if (auth.type=='change request' && data.access.change_request) {
						socket.send({
							type: 525,
							response: {
								cloud_name: process.env.CLOUDINARY_NAME,
								preset: 'gfihiqmz'
							}
						});
					}
					else if (auth.type=='partner' && data.access.partner) {
						socket.send({
							type: 525,
							response: {}
						});
					}
				});
			});
		});
	});
	socket.on('internal stages', function(auth) {
		db.auth.findOne({name: auth.name}, function(err, data) {
			if (err || data==null) {
				socket.send({type:1400});
				return;
			}
			comparePassword(auth.auth, data.auth, function(err, is_correct) {
				if (err || !is_correct) {
					socket.send({type:1401});
					return;
				}
				comparePassword(auth.pass, data.pass, function(err, is_correct) {
					if (err || !is_correct) {
						socket.send({type:1401});
						return;
					}

					if (!data.access.admin) return;

					async function asyncRun() {
						let staged_data = await db.staged_requests.find({});
						staged_data = await staged_data.toArray();

						socket.send({
							type: 1440,
							data: staged_data,
						});
					}

					asyncRun();
				});
			});
		});
	});
	socket.on('internal approve', function(auth, decision) {
		db.auth.findOne({name: auth.name}, function(err, data) {
			if (err || data==null) {
				socket.send({type:1400});
				return;
			}
			comparePassword(auth.auth, data.auth, function(err, is_correct) {
				if (err || !is_correct) {
					socket.send({type:1401});
					return;
				}
				comparePassword(auth.pass, data.pass, function(err, is_correct) {
					if (err || !is_correct) {
						socket.send({type:1401});
						return;
					}

					if (!data.access.admin) return;

					let _search_request = {
						request: decision.link,
						auth: decision.auth,
					};

					db.staged_requests.findOne(_search_request, function(err, request) {
						let result = 'denied';

						if (decision.approved) {
							result = `approved by ${data.name}`;

							if (request.action=='request partner upload') {
								db.partners.insertOne(request.data, function(err, saved) {
									if (err||!saved) socket.send({type:521});
									else {
										socket.send({
											type: 520,
											link: hashLink,
										});
									}
								});

								for (let i=0;i<request.data.sales.length;i++) {
									getEncryptedHash(request.data.sales[i].name, function(err, salesLink) {
										db.sales.insertOne({
											cryptlink: salesLink,
											name: request.data.sales[i].name,
											info: request.data.sales[i].info,
											img: request.data.sales[i].img,
											partner: request.data.cryptlink,
										}, function(err, saved) {
											if (err||!saved) socket.send({type:521});
										});
									});
								}
							}
							else if (request.action=='request partner change') {
								db.partners.findOne({cryptlink: request.data.cryptlink}, function(err, _existing_data) {
									if (err || _existing_data==null) return;

									db.partners.updateOne({cryptlink: request.data.cryptlink}, {$set:{
										name: request.data.name,
										lat: request.data.lat,
										lng: request.data.lng,
										images: request.data.images,
										industry: request.data.industry,
										contact: request.data.contact,
										info: request.data.info,
									}});

									for (let i=0;i<request.data.sales.length;i++) {
										getEncryptedHash(request.data.sales[i].name, function(err, salesLink) {
											db.sales.insertOne({
												cryptlink: salesLink,
												name: request.data.sales[i].name,
												info: request.data.sales[i].info,
												img: request.data.sales[i].img,
												partner: _existing_data.cryptlink,
											}, function(err, saved) {
												if (err||!saved) socket.send({type:521});
											});
										});
									}
								});
							}
						}

						db.auth.findOne({auth: decision.auth}, function(err, requester) {
							requester.requests[decision.link].approval = result;

							db.auth.updateOne({auth: decision.auth}, {$set:{
								requests: requester.requests
							}});
						});

						db.staged_requests.deleteOne(_search_request);
					});
				});
			});
		});
	});

	socket.on('partners search', async function(query) {
		query = cleanQuery({
			name: query.name,
		});

		let data, limit = query.limit || 10;
		query = [
						  {
						    $search: {
						      text: {
						        query: query.name,
						        path: 'name'
						      },
						      highlight: {
						        path: 'name'
						      }
						    }
						  }, {
						    $project: {
						      _id: 0,
									info: 1,
									cryptlink: 1,
									name: 1,
									images: 1,
						      score: {
						        $meta: 'searchScore'
						      },
						      highlight: {
						        $meta: 'searchHighlights'
						      }
						    }
						  }, {
						    $limit: limit
						  }
						];

		try {
			data = await db.partners.aggregate(query).toArray();
		}
		catch (e) {
			timestamp(e);
			socket.send({type:500, error_code:18});
			return;
		}

		if (data.length==0) {
			socket.send({type:500, error_code:17});
			return;
		}

		let requestData = [];
		for (let i=0;i<data.length;i++) {
			requestData.push({
				name: data[i].name,
				link: data[i].cryptlink,
				info: data[i].info,
				logo: data[i].images[0],
				highlight: data[i].highlight[0].texts
			});
		}

		socket.send({type:300, response: requestData});
	});
	socket.on('partners get', function(msg) {
		msg = cleanQuery(msg);
		db.partners.findOne({cryptlink: msg.link}, async function(err, data) {
			if (err) {
				socket.send({type:500,error_code:14});
				return;
			}
			if (data==null) {
				socket.send({type:500,error_code:99});
				return;
			}

			let sales = [];

			let sales_data = await db.sales.find({partner: msg.link});
			sales_data = await sales_data.toArray();

			for (let i=0;i<sales_data.length;i++) {
				sales.push({
					link: sales_data[i].cryptlink,
					name: sales_data[i].name,
					info: sales_data[i].info,
					img: sales_data[i].img,
				});
			}

			socket.send({
				type: 810,
				response: {
					name: data.name,
					cryptlink: data.cryptlink,
					lat: data.lat,
					lng: data.lng,
					industry: data.industry,
					info: data.info,
					rating: data.rating,
					ratingAmount: data.ratingAmount,
					images: data.images,
					contact: data.contact,
					priceRange: data.priceRange,
					sales: sales,
				}
			});
		});
	});
	socket.on('partners rad', function(lat, lng, radius) {
		db.partners.find({}, async function(err, data) {
			if (err) {
				socket.send({type:500,error_code:18});
				return;
			}
			data = await data.toArray();
			if (data.length==0) {
				socket.send({type:500,error_code:19});
				return;
			}
			let requestData = [];
			for (let i=0;i<data.length && i<10;i++) {
				requestData.push({
					name: data[i].name,
					lat: data[i].lat,
					lng: data[i].lng,
					industry: data[i].industry,
					info: data[i].info,
					rating: data[i].rating,
					ratingAmount: data[i].ratingAmount,
					images: data[i].images,
					contact: data[i].contact,
					priceRange: data[i].priceRange,
				});
			}
			socket.send({type:300, response: requestData});
		});
	});
	socket.on('partners take me', function(query) {
		query = cleanQuery({
			name: query.name,
		});
		db.partners.findOne(query, function(err, data) {
			if (err) {
				socket.send({type:500,error_code:20});
				return;
			}
			if (data==null) {
				socket.send({type:500,error_code:21});
				return;
			}
			socket.send({type:301, response:{
				name: data.name,
				lat: data.lat,
				lng: data.lng,
				industry: data.industry,
				info: data.info,
				rating: data.rating,
				ratingAmount: data.ratingAmount,
				images: data.images,
				contact: data.contact,
				priceRange: data.priceRange,
			}});
		});
	});
	socket.on('partners upload', function(auth, input) {
		db.auth.findOne({name: auth.name}, function(err, data) {
			if (err || data==null) {
				socket.send({type:1400});
				return;
			}
			comparePassword(auth.auth, data.auth, function(err, is_correct) {
				if (err || !is_correct) {
					socket.send({type:1401});
					return;
				}
				comparePassword(auth.pass, data.pass, function(err, is_correct) {
					if (err || !is_correct) {
						socket.send({type:1401});
						return;
					}

					if (data.access.admin) {
						if (input.link==null) {
							getEncryptedHash(input.id, function(err, hashLink) {
								if (err) {
									socket.send({type:1402});
									return;
								}

								db.partners.insertOne({
									cryptlink: hashLink,
									name: input.name,
									rating: 0,
									ratingAmount: 0,
									lat: input.lat,
									lng: input.lng,
									images: input.imagelinks,
									industry: input.industry,
									contact: input.contact,
									priceRange: input.priceRange,
									info: input.info,
									upload_date: new Date(),
									archive: false,
								}, function(err, saved) {
									if (err||!saved) socket.send({type:521});
									else {
										socket.send({
											type: 520,
											link: hashLink,
										});
									}
								});

								for (let i=0;i<input.sales.length;i++) {
									getEncryptedHash(input.sales[i].name, function(err, salesLink) {
										db.sales.insertOne({
											cryptlink: salesLink,
											name: input.sales[i].name,
											info: input.sales[i].info,
											img: input.sales[i].img,
											partner: hashLink,
											archive: false,
										}, function(err, saved) {
											if (err||!saved) socket.send({type:521});
										});
									});
								}
							});
						}
						else {
							db.partners.findOne({cryptlink: input.link}, async function(err, _existing_data) {
								if (err || _existing_data==null) return;

								db.partners.updateOne({cryptlink: input.link}, {$set:{
									name: input.name,
									lat: input.lat,
									lng: input.lng,
									images: input.imagelinks,
									industry: input.industry,
									contact: input.contact,
									priceRange: input.priceRange,
									info: input.info,
								}});

								let sales_data = await db.sales.find({partner: input.link});
								sales_data = await sales_data.toArray();

								let _marked_for_deletion = [];
								for (let i=0;i<sales_data.length;i++) {
									_marked_for_deletion[sales_data[i].cryptlink] = {
										marked: true,
										img: sales_data[i].img,
									};
								}

								for (let i=0;i<input.sales.length;i++) {
									if (input.sales[i].link == '') {
										getEncryptedHash(input.sales[i].name, function(err, salesLink) {
											db.sales.insertOne({
												cryptlink: salesLink,
												name: input.sales[i].name,
												info: input.sales[i].info,
												img: input.sales[i].img,
												partner: input.link,
												archive: false,
											}, function(err, saved) {
												if (err||!saved) socket.send({type:521});
											});
										});
									}
									else {
										_marked_for_deletion[input.sales[i].link].marked = false;
										db.sales.updateOne({cryptlink: input.sales[i].link}, {$set:{
											name: input.sales[i].name,
											info: input.sales[i].info,
											img: input.sales[i].img,
										}}, function(err, saved) {
											if (err||!saved) socket.send({type:521});
										});
									}
								}

								for (let x in _marked_for_deletion) {
									if (!_marked_for_deletion[x].marked) continue;

									db.sales.deleteOne({cryptlink: x});

									if (_marked_for_deletion[x].img == 'v1599325166/sample.jpg') continue;

									let last_link = _marked_for_deletion[x].img
											.substring(_marked_for_deletion[x].img.indexOf('/') + 1,
											_marked_for_deletion[x].img.length);
									let last_dot, cur_dot = 0;
									do {
										last_dot = cur_dot;
										cur_dot = last_link.indexOf('.', last_dot + 1);
									} while(cur_dot!=-1);
									cloudinary.uploader.destroy(last_link.substring(0, last_dot));
								}

								socket.send({
									type: 520,
									link: input.link,
								});
							});
						}
					}
					else if (auth.type=='change request' && data.access.change_request) {
						let request_list = data.requests || {};
						let request_link;
						do {
							request_link = Create_ID(6, .4);
						} while (request_list[request_link]!=null);

						if (input.link==null) {
							getEncryptedHash(input.id, function(err, hashLink) {
								if (err) {
									socket.send({type:1402});
									return;
								}

								db.staged_requests.insertOne({
									action: 'request partner upload',
									request: request_link,
									auth: auth.auth,
									data: {
										cryptlink: hashLink,
										name: input.name,
										rating: 0,
										ratingAmount: 0,
										lat: input.lat,
										lng: input.lng,
										images: input.imagelinks,
										industry: input.industry,
										contact: input.contact,
										priceRange: input.priceRange,
										info: input.info,
										sales: input.sales,
										upload_date: new Date(),
										archive: false,
									},
								}, function(err, saved) {
									if (err||!saved) socket.send({type:521});
									else {
										socket.send({
											type: 520,
											link: hashLink,
										});
									}
								});

								request_list[request_link] = {
									action: 'request partner upload',
									request: auth.request,
									date: new Date,
									approval: 'waiting',
								};
								db.auth.updateOne({name: auth.name}, {$set:{
									requests: request_list
								}});
							});
						}
						else {
							db.partners.findOne({cryptlink: input.link}, function(err, _existing_data) {
								if (err || _existing_data==null) return;

								db.staged_requests.insertOne({
									action: 'request partner change',
									request: request_link,
									auth: auth.auth,
									data: {
										cryptlink: _existing_data.cryptlink,
										name: input.name,
										lat: input.lat,
										lng: input.lng,
										images: input.imagelinks,
										industry: input.industry,
										contact: input.contact,
										priceRange: input.priceRange,
										info: input.info,
										sales: input.sales,
									},
								}, function(err, saved) {
									if (err||!saved) socket.send({type:521});
									else {
										socket.send({
											type: 520,
											link: input.link,
										});
									}
								});

								request_list[request_link] = {
									action: 'request partner change',
									request: auth.request,
									date: new Date,
									approval: 'waiting',
								};
								db.auth.updateOne({name: auth.name}, {$set:{
									requests: request_list
								}});
							});
						}
					}
				});
			});
		});
	});
	socket.on('partners delete', function(auth, input) {
		db.auth.findOne({name: auth.name}, function(err, data) {
			if (err || data==null) {
				socket.send({type:1400});
				return;
			}
			comparePassword(auth.auth, data.auth, function(err, is_correct) {
				if (err || !is_correct) {
					socket.send({type:1401});
					return;
				}
				comparePassword(auth.pass, data.pass, function(err, is_correct) {
					if (err || !is_correct) {
						socket.send({type:1401});
						return;
					}

					if (data.access.admin) {
						db.partners.findOne({cryptlink: input.link}, function(err, data) {
							if (err || data==null) return;
							db.partners.updateOne({cryptlink: input.link}, {$set:{
								archive: true,
							}});
						});
					}
					else if (auth.type=='change request' && data.access.change_request) {
						let request_list = data.requests || {};
						let request_link;
						do {
							request_link = Create_ID(6, .4);
						} while (request_list[request_link]!=null);

						db.staged_requests.insertOne({
							action: 'request partner deletion',
							request: request_link,
							auth: auth.auth,
							data: {
								cryptlink: input.link,
							},
						}, function(err, saved) {
							if (err||!saved) socket.send({type:521});
							else {
								socket.send({
									type: 520,
									link: input.link,
								});
							}
						});

						request_list[request_link] = {
							action: 'request partner deletion',
							request: 'marked for deletion',
							date: new Date,
							approval: 'waiting',
						};
						db.auth.updateOne({name: auth.name}, {$set:{
							requests: request_list
						}});
					}
				});
			});
		});
	});
	socket.on('partners set rating', function(input) {
		input = cleanQuery(input);

		db.partners.findOne({cryptlink:input.link}, async function(err, data) {
			if (err) {
				socket.send({type:500,error_code:14});
				return;
			}
			if (data==null) {
				socket.send({type:500,error_code:99});
				return;
			}

			let user_data = await db.datatrack.findOne({cryptlink:input.user});

			let updated_rating, updated_amount = data.ratingAmount;

			let is_new_rating = true, i = 0;

			for (;i<user_data.ratings.length;i++) {
				if (user_data.ratings[i].link==input.link) {
					is_new_rating = false;
					break;
				}
			}

			let new_ratings = user_data.ratings;

			if (is_new_rating) {
				updated_amount++;
				updated_rating = ((data.ratingAmount * data.rating) + input.rating)
														/ updated_amount;
				new_ratings.push({
					link: input.link,
					rating: input.rating,
				});
			}
			else {
				let last_rating = user_data.ratings[i].rating;
				updated_rating = ((data.ratingAmount * data.rating)
														- last_rating + input.rating) / updated_amount;
				new_ratings[i].rating = input.rating;
			}

			db.datatrack.updateOne({cryptlink:input.user}, {$set:{
				ratings: new_ratings,
			}});
			db.partners.updateOne({cryptlink:input.link}, {$set:{
				ratingAmount: updated_amount,
				rating: updated_rating,
			}});
		});
	});

	socket.on('article get link', function(msg) {
		return;

		msg = cleanQuery(msg);
		db.articles.findOne({cryptlink: msg.link}, function(err, data) {
			if (err) {
				socket.send({type:500,error_code:14});
				return;
			}
			if (data==null) {
				socket.send({type:500,error_code:99});
				return;
			}
			socket.send({
				type: 820,
				response: {
					link: data.cryptlink,
					title: data.title,
					category: data.category,
					author: data.author,
					date: data.written_date,
					topic: data.topic,
					body: data.body,
					images: data.images,
					extra_info: data.extra_info,
				}
			});
		});
	});	/** UNUSED */
	socket.on('article upload', function(auth, input) {
		db.auth.findOne({name: auth.name}, function(err, data) {
			if (err || data==null) {
				socket.send({type:1400});
				return;
			}
			comparePassword(auth.auth, data.auth, function(err, is_correct) {
				if (err || !is_correct) {
					socket.send({type:1401});
					return;
				}
				comparePassword(auth.pass, data.pass, function(err, is_correct) {
					if (err || !is_correct) {
						socket.send({type:1401});
						return;
					}

					let upload_action = null, insert_data;

					getEncryptedHash(input.id, function(err, hashLink) {
						try {
							let end_index = 100;
							let short_intro = input.body[0].content.substring(0, end_index);

							while (short_intro[end_index]!=' ') {
								end_index--;

								if (end_index<10) {
									end_index = 100;
									break;
								}
							}

							input.body[0].content.substring(0, end_index);

							if (auth.type=='upload' && data.access.upload) {
								upload_action = db.articles;
								insert_data = {
									cryptlink: hashLink,
									title: input.title,
									author: input.author,
									category: input.category,
									written_date: input.date,
									topic: input.topic,
									body: input.body,
									images: input.images,
									extra_info: input.extra_info,
									short_intro: short_intro,
									upload_date: new Date(),
									archive: false,
								};
							}
							else if (auth.type=='upload request' && data.access.upload_request) {
								upload_action = db.staged_requests;
								insert_data = {
									action: 'request upload',
									request: request_link,
									auth: auth.auth,
									data: {
										cryptlink: hashLink,
										title: input.title,
										author: input.author,
										category: input.category,
										written_date: input.date,
										topic: input.topic,
										body: input.body,
										images: input.images,
										extra_info: input.extra_info,
										short_intro: short_intro,
										upload_date: new Date(),
										archive: false,
									},
								};
							}

							if (upload_action==null) return;

							upload_action.insertOne(insert_data, function(err, saved) {
								if (err||!saved) socket.send({type:521});
								else {
									socket.send({
										type: 520,
										link: hashLink,
									});
								}
							});

							let action_list = data.actions || [];
							action_list.push({
								action: `article ${auth.type}`,
								link: hashLink,
								date: new Date,
							});
							db.auth.updateOne({name: auth.name}, {$set:{
							actions: action_list
						}});
						}
						catch (e) {
							timestamp(`Arrival Error\n${e}`);
						}
					});
				});
			});
		});
	});

	socket.on('posts upload', function(input) {
		input = cleanQuery(input);

		getEncryptedHash(input.id, function(err, hashLink) {
			let resizedHeight = Math.min(input.height, 500) || 400;
			let resizedWidth = resizedHeight / input.height * (input.width || 400);

			let _post_data = {
				cryptlink: hashLink,
				cloud: input.cloudlink,
				user: input.userlink,
				caption: input.caption,
				type: input.type,
				upload_date: new Date(),
				location: {
					name: input.loc.name,
					lat: input.loc.lat,
					lng: input.loc.lng,
				},
				height: resizedHeight,
				width: resizedWidth,
				likes: 0,
				views: 0,
				archive: false,
			};

			_post_data.duration = input.duration;

			db.posts.insertOne(_post_data, function(err, saved) {
				if (err||!saved) socket.send({type:531});
				else {
					db.likes.insertOne({
						cryptlink: hashLink,
						users: [],
					});
					db.comments.insertOne({
						cryptlink: hashLink,
						page: 0,
						comments: [],
						at_capacity: false,
					});
					socket.send({
						type: 530,
						id: input.id,
						link: hashLink,
					});
				}
			});
		});
	});
	socket.on('posts get', function(query) {
		let limit = query.amount;
		if (limit==null) limit = 25;
		query = cleanQuery({
			// caption
			// tag
			// username
		});
		db.posts.find(query, async function(err, data) {
			if (err) {
				socket.send({type:500,error_code:24});
				return;
			}
			data = await data.toArray();
			if (data.length==0) {
				socket.send({type:500,error_code:25});
				return;
			}
			let requestData = [];
			for (let i=0;i<data.length && i<limit;i++) {
				requestData.push({
					link: data[i].cryptlink,
					cloud: data[i].cloud,
					type: data[i].type,
				});
			}
			socket.send({type:800, response: requestData});
		});
	});
	socket.on('posts get display data', async function(msg) {
		msg = cleanQuery(msg);

		let post_data = await db.posts.findOne({cryptlink: msg.link});
		let user_data = await db.users.findOne({cryptlink: post_data.user});
		let comment_data = await db.comments.findOne({cryptlink: post_data.cryptlink, page: 0});

		socket.send({
			type:806,
			response: {
				user: {
					link: user_data.cryptlink,
					verified: user_data.verified,
					name: user_data.username,
					pic: user_data.pic,
				},
				comments: comment_data.comments,
				display: {
					cryptlink: post_data.cryptlink,
					cloudlink: post_data.cloud,
					caption: post_data.caption,
					date: post_data.upload_date,
					likes: post_data.likes,
					views: post_data.views,
					location: post_data.location,
					post_type: post_data.type,
				}
			}
		});
		db.posts.updateOne({cryptlink:msg.link}, {$set:{
			views: post_data.views+1,
		}});
	});
	socket.on('posts get data', function(msg) {
		msg = cleanQuery(msg);
		db.posts.findOne({cryptlink: msg.link}, function(err, post_data) {
			if (err) {
				socket.send({type:500,error_code:26});
				return;
			}
			if (post_data==null) {
				socket.send({type:500,error_code:27});
				return;
			}
			db.posts.updateOne({cryptlink:msg.link}, {$set:{
				views: post_data.views+1,
			}});
			socket.send({
				type:801,
				response: {
					cryptlink: post_data.cryptlink,
					cloudlink: post_data.cloud,
					user: post_data.user,
					caption: post_data.caption,
					date: post_data.upload_date,
					likes: post_data.likes,
					views: post_data.views,
					height: post_data.height,
					location: post_data.location,
					post_type: post_data.type,
					// duration: post_data.duration,
				}
			});
		});
	});
	socket.on('posts delete', function(msg) {
		msg = cleanQuery(msg);
		db.posts.findOne({cryptlink: msg.link}, function(err, post_data) {
			if (err) {
				socket.send({type:500,error_code:26});
				return;
			}
			if (post_data==null) {
				socket.send({type:500,error_code:27});
				return;
			}

			db.posts.updateOne({cryptlink:msg.link}, {$set:{
				archive: true,
				mark_for_deletion: true,
			}});
		});
	});
	socket.on('posts archive', function(msg) {
		msg = cleanQuery(msg);
		db.posts.findOne({cryptlink: msg.link}, function(err, post_data) {
			if (err) {
				socket.send({type:500,error_code:26});
				return;
			}
			if (post_data==null) {
				socket.send({type:500,error_code:27});
				return;
			}

			if (msg.archive) {
				db.posts.updateOne({cryptlink:msg.link}, {$set:{
					archive: true,
				}});
			}
			else {
				db.posts.updateOne({cryptlink:msg.link}, {$set:{
					archive: false,
				}});
			}
		});
	});
	socket.on('posts stop comments', function(msg) {
		msg = cleanQuery(msg);
		db.posts.findOne({cryptlink: msg.link}, function(err, post_data) {
			if (err) {
				socket.send({type:500,error_code:26});
				return;
			}
			if (post_data==null) {
				socket.send({type:500,error_code:27});
				return;
			}

			if (msg.stop) {
				db.posts.updateOne({cryptlink:msg.link}, {$set:{
					stop_comments: true,
				}});
			}
			else {
				db.posts.updateOne({cryptlink:msg.link}, {$set:{
					stop_comments: false,
				}});
			}
		});
	});
	socket.on('posts get comments', function(msg) {
		let commentQuery = cleanQuery({
			cryptlink: msg.link,
			page: msg.page,
		});
		if (msg.reply!=null) {
			commentQuery.reply = msg.reply;
		}

		db.comments.findOne(commentQuery, function(err, data) {
			if (err) {
				socket.send({type: 500, error_code: 28});
				return;
			}
			if (data==null) {
				socket.send({type: 500, error_code: 29});
				return;
			}

			socket.send({type: 802, query: commentQuery, response: data.comments});
		});
	});
	socket.on('posts add comment', function(msg) {
		if (msg.content=='') return;
		msg = cleanQuery(msg);
		msg.commentQuery = cleanQuery({
			cryptlink: msg.link,
			at_capacity: false,
		});
		if (detectIllegalContent(msg.content)) return;

		db.posts.findOne({cryptlink: msg.commentQuery.cryptlink}, function(err, post_data) {
			if (err || post_data==null) return;
			if (post_data.stop_comments) return;

			db.comments.findOne(msg.commentQuery, function(err, comment_data) {
				if (err) {
					socket.send({type:500,error_code:28});
					return;
				}
				if (comment_data==null) {
					socket.send({type:500,error_code:29});
					return;
				}

				let reply_index;

				do {
					reply_index = Create_ID(9, 0.3);
				} while (
					comment_data.comments.map(
						e => e.reply_index
					).indexOf(reply_index)
					!= -1
				);

				let updatedList = comment_data.comments;
				updatedList.push({
					userlink: msg.cryptlink,
					username: msg.username,
					content: msg.content,
					reply_index: reply_index,
					date: new Date(),
					votes: 0,
				});
				for (let _search=0;_search<updatedList.length;_search++) {
					if (updatedList[_search]=='') {
						updatedList.splice(_search, 1);
						_search--;
					}
				}

				var _setter = {
					comments: updatedList,
				};

				if (updatedList.length>=MAX_COMMENT_BUCKET_SIZE) {
					_setter.at_capacity = true;
					db.comments.insertOne({
						cryptlink: msg.link,
						page: comment_data.page + 1,
						comments: [],
						at_capacity: false,
					});
				}

				db.comments.updateOne(msg.commentQuery, {$set:_setter});
				socket.send({type:532, cryptlink: reply_index});
			});
		});
	});
	socket.on('posts liked content', function(input) {
		db.posts.findOne({cryptlink: input.link}, function(err, post_data) {
			if (err) {
				socket.send({type:500,error_code:26});
				return;
			}
			if (post_data==null) {
				socket.send({type:500,error_code:27});
				return;
			}
			db.posts.updateOne({cryptlink: input.link}, {$set:{
				likes: post_data.likes+1,
			}});
		});

		db.likes.findOne({cryptlink: input.link}, function(err, like_data) {
			if (err) {
				socket.send({type:500,error_code:26});
				return;
			}
			if (like_data==null) {
				socket.send({type:500,error_code:27});
				return;
			}

			let updated_list = like_data.users;

			let index = updated_list.indexOf(input.link);

			if (index==-1) {
				updated_list.push(input.link);
			}
			else {
				updated_list.splice(index, 1);
			}

			db.likes.updateOne({cryptlink: input.link}, {$set:{
				users: updated_list,
			}});
		});
	});

	socket.on('story upload', function(story) {
		getEncryptedHash(Create_ID(9, .3), async function(err, storyHash) {
			let new_story = {
				cryptlink: storyHash,
				user: story.user,
				media: story.media,
				time: story.time,
				date: new Date,
			};

			let story_search_query = {owner: story.user};

			let found_story_data = await db.stories.findOne(story_search_query);

			if (found_story_data!=null) {
				let _content = found_story_data.content;

				_content.push(new_story);

				db.stories.updateOne(story_search_query, {$set:{
					content: _content,
				}});
			}
			else {
				let _content = [];

				_content.push(new_story);

				getEncryptedHash(Create_ID(9, .3), function(err, hashLink) {
					db.stories.insertOne({
						link: hashLink,
						owner: story.user,
						content: _content,
					});
				});
			}
		});
	});
	socket.on('story ask', async function(query) {
		let user_query = {};
		// query.user

		let list = await db.stories.find(user_query);
		list = await list.toArray();

		let story_data = [];
		const OneDay = 1000 * 60 * 60 * 24;

		for (let i=0,_content;i<list.length;i++) {
			_content = [];

			for (let j=0;j<list[i].content.length;j++) {
				if (list[i].content[j].date + OneDay < new Date) continue;

				_content.push({
					link: list[i].content[j].cryptlink,
					// user: list[i].content[j].user,
					media: list[i].content[j].media,
					time: list[i].content[j].time,
					date: list[i].content[j].date,
				});
			}

			story_data.push({
				type: 5,
				link: list[i].cryptlink,
				user: list[i].owner,
				content: _content,
			});
		}

		socket.send({
			type: 850,
			response: story_data,
		});
	});
	socket.on('story get', async function(query) {
		let user_query = {owner: query.user};

		let story_data = await db.stories.findOne(user_query);

		if (story_data==null) return;

		let _content = [];
		const OneDay = 1000 * 60 * 60 * 24;

		for (let j=0;j<story_data.content.length;j++) {
			if (story_data.content[j].date + OneDay < new Date) continue;

			_content.push({
				link: story_data.content[j].cryptlink,
				// user: story_data.content[j].user,
				media: story_data.content[j].media,
				time: story_data.content[j].time,
				date: story_data.content[j].date,
			});
		}

		socket.send({
			type: 851,
			response: {
				type: 5,
				link: story_data.cryptlink,
				user: story_data.owner,
				content: _content,
			},
		});
	});

	socket.on('story highlight save', function(story) {

	});
	socket.on('story highlight archive', function(story) {

	});
	socket.on('story highlight get', async function(query) {
		let user_query = {owner: query.user};

		let list = await db.highlights.find(user_query);
		list = await list.toArray();

		let story_data = [];

		for (let i=0,_content;i<list.length;i++) {
			_content = [];

			for (let j=0;j<list[i].content.length;j++) {
				_content.push({
					link: list[i].content[j].cryptlink,
					media: list[i].content[j].media,
					time: list[i].content[j].time,
					date: list[i].content[j].date,
				});
			}

			story_data.push({
				type: 5,
				link: list[i].link,
				content: _content,
				name: list[i].name,
				icon: list[i].icon,
			});
		}

		socket.send({
			type: 852,
			user: query.user,
			response: story_data,
		});
	});

	socket.on('foryou ask', async function(query) {
		let limit = query.amount;
		if (limit==null) limit = 20;

		let ContentType = {
			posts: 0,
			articles: 1,
			partners: 2,
			sales: 3,
		};
		let content_types;
		if (query.type!=null) {
			content_types = [false, false, false, false];
			if (query.type.includes('posts')) {
				content_types[ContentType.posts] = true;
			}
			if (query.type.includes('articles')) {
				content_types[ContentType.articles] = true;
			}
			if (query.type.includes('partners')) {
				content_types[ContentType.partners] = true;
			}
			if (query.type.includes('sales')) {
				content_types[ContentType.sales] = true;
			}
		} else content_types = [true, true, true, true];

		let user_state = socket.user_state;
		query = cleanQuery(user_state.interests);

		let requestData = [], amount = 0;
		const Limits = {
			articles: 4,
			posts: 6,
			sales: 4,
			partners: 2,
		};
		const Minimums = {
			articles: 1,
			posts: 1,
			sales: 4,
			partners: 1,
		};

		let P = socket.user_state.algorithm.seen.partners,
				A = socket.user_state.algorithm.seen.articles,
				p = socket.user_state.algorithm.seen.posts,
				S = socket.user_state.algorithm.seen.sales;


		let limit_getter = function(top, bottom, overflow) {
			if (overflow) return Math.floor(Math.random() * top) + bottom;
			return Math.min(limit - amount, Math.floor(Math.random() * top) + bottom);
		};
		let add_articles = async function() {
			if (!content_types[ContentType.articles]) return;

			let article_data = await db.articles.find(query.articles).limit(
				limit_getter(Limits.articles, Minimums.articles)
			).sort({$natural:-1}).skip(A);
			article_data = await article_data.toArray();

			if (article_data.length==0) A = 0;

			for (let i=0; i < article_data.length; i++) {
				requestData.push({
					type: 1,
					link: article_data[i].cryptlink,
					title: article_data[i].title,
					author: article_data[i].author,
					category: article_data[i].category,
					date: article_data[i].written_date,
					topic: article_data[i].topic,
					body: article_data[i].body,
					images: article_data[i].images,
					extra_info: article_data[i].extra_info,
					short_intro: article_data[i].short_intro,
				});
			}

			A += article_data.length;
			amount += article_data.length;
		};
		let add_posts = async function() {
			if (!content_types[ContentType.posts]) return;

			let post_data = await db.posts.find(query.posts).limit(
				limit_getter(Limits.posts, Minimums.posts)
			).sort({$natural:-1}).skip(p);
			post_data = await post_data.toArray();

			if (post_data.length==0) p = 0;

			for (let i=0; i < post_data.length; i++) {
				let short_comment_data = await db.comments.findOne({
					cryptlink: post_data[i].cryptlink,
					page: 0,
				});
				if (short_comment_data.comments!=null)
					short_comment_data = short_comment_data.comments.splice(0, 3);
				else short_comment_data = null;

				requestData.push({
					type: 2,
					cryptlink: post_data[i].cryptlink,
					cloudlink: post_data[i].cloud,
					user: post_data[i].user,
					caption: post_data[i].caption,
					date: post_data[i].upload_date,
					likes: post_data[i].likes,
					views: post_data[i].views,
					location: post_data[i].location,
					short_comments: short_comment_data,
					post_type: post_data[i].type,
					height: post_data[i].height,
					width: post_data[i].width,
					// duration: post_data[i].duration,
				});
			}

			p += post_data.length;
			amount += post_data.length;
		};
		let add_sales = async function() {
			if (!content_types[ContentType.sales]) return;

			let sale_data = await db.sales.find(query.sales).limit(
				limit_getter(Limits.sales, Minimums.sales, true)
			).sort({$natural:-1}).skip(S);
			sale_data = await sale_data.toArray();

			if (sale_data.length==0) {
				S = 0;
				sale_data = await db.sales.find(query).limit(
					limit_getter(Limits.sales, Minimums.sales)
				).sort({$natural:-1});
				sale_data = await sale_data.toArray();
			}

			let grouped_sale_data = new Array();

			for (let i=0; i < sale_data.length; i++) {
				grouped_sale_data.push({
					link: sale_data[i].cryptlink,
					partner: sale_data[i].partner,
					name: sale_data[i].name,
					cloud: sale_data[i].img,
					info: sale_data[i].info,
				});
			}

			requestData.push({
				type: 3,
				list: grouped_sale_data,
			});
			S += grouped_sale_data.length;
			amount += 1;
		};
		let add_partners = async function() {
			if (!content_types[ContentType.partners]) return;

			let partner_data = await db.partners.find(query.partners).limit(
				limit_getter(Limits.partners, Minimums.partners)
			).sort({$natural:-1}).skip(P);
			partner_data = await partner_data.toArray();

			if (partner_data.length==0) P = 0;

			for (let i=0; i < partner_data.length; i++) {
				requestData.push({
					type: 0,
					name: partner_data[i].name,
					cryptlink: partner_data[i].cryptlink,
					lat: partner_data[i].lat,
					lng: partner_data[i].lng,
					industry: partner_data[i].industry,
					info: partner_data[i].info,
					rating: partner_data[i].rating,
					ratingAmount: partner_data[i].ratingAmount,
					images: partner_data[i].images,
					contact: partner_data[i].contact,
					priceRange: partner_data[i].priceRange,
				});
			}

			P += partner_data.length;
			amount += partner_data.length;
		};
		let add_to_feed = [add_articles, add_posts,
												add_sales, add_partners];

		let algorithmic_results = user_state.algorithm.knobs;
		let for_you_feed = new Array();

		for (let priority=0; priority < algorithmic_results.length; priority++) {
			for_you_feed.push(
				add_to_feed[
					algorithmic_results[
						priority
					]
				]
			);
		}

		let currentAmount = 0, lastAmount;
		let last_cycle = socket.user_state.last_cycle;

		do {
			lastAmount = currentAmount;

			for (let cycle=0; cycle < for_you_feed.length; cycle++) {
				await for_you_feed[(cycle + last_cycle) % for_you_feed.length]();

				if (amount>=limit) {
					last_cycle = (cycle + last_cycle) % for_you_feed.length;
					break;
				}
			}

			currentAmount = amount;
		} while(amount<limit && lastAmount!=currentAmount);

		socket.send({type:900, response: requestData});

		socket.user_state.last_cycle = last_cycle;
		socket.user_state.algorithm.seen.partners = P;
		socket.user_state.algorithm.seen.articles = A;
		socket.user_state.algorithm.seen.posts = p;
		socket.user_state.algorithm.seen.sales = S;
	});

	socket.on('search content', async function(query) {
		query = cleanQuery({
			query: query.query,
		});

		if (query.query=='') return;

		async function search_db(source, path, pull_in_data) {
			let data, limit = query.limit || 10;

			let project = {
				_id: 0,
				score: {
					$meta: 'searchScore'
				},
				highlight: {
					$meta: 'searchHighlights'
				},
			};

			for (let x in pull_in_data) {
				project[x] = pull_in_data[x];
			}

			let search_query = [
							  {
							    $search: {
							      text: {
							        query: query.query,
							        path: path
							      },
							      highlight: {
							        path: path
							      }
							    }
							  }, {
							    $project: project
							  }, {
							    $limit: limit
							  }
							];

			try {
				data = await source.aggregate(search_query).toArray();

				return data;
			}
			catch (e) {
				timestamp(e);
				return [];
			}
		}

		let partner_data = await search_db(db.partners, ['name', 'info'], {
			cryptlink: 1,
			name: 1,
			industry: 1,
			info: 1,
			rating: 1,
			images: 1,
			priceRange: 1,
		});
		let article_data = await search_db(db.articles, ['title', 'author'], {
			cryptlink: 1,
			link: 1,
			title: 1,
			author: 1,
			date: 1,
			topic: 1,
			images: 1,
			short_intro: 1,
		});
		let post_data = await search_db(db.posts, 'caption', {
			cryptlink: 1,
			cloudlink: 1,
			user: 1,
			caption: 1,
			type: 1,
		});
		let sale_data = await search_db(db.sales, ['name', 'info'], {
			cryptlink: 1,
			link: 1,
			name: 1,
			info: 1,
			images: 1,
		});
		let user_data = await search_db(db.users, ['username', 'shortBio'], {
			cryptlink: 1,
			username: 1,
			email: 1,
			shortBio: 1,
			level: 1,
			points: 1,
			pic: 1,
		});

		let requestData = [];

		for (let i=0;i<partner_data.length;i++) {
			requestData.push({
				type: 0,
				cryptlink: partner_data[i].cryptlink,
				name: partner_data[i].name,
				industry: partner_data[i].industry,
				info: partner_data[i].info,
				rating: partner_data[i].rating,
				images: [partner_data[i].images[0], partner_data[i].images[1]],
				priceRange: partner_data[i].priceRange,
			});
		}

		for (let i=0;i<article_data.length;i++) {
			requestData.push({
				type: 1,
				link: article_data[i].cryptlink,
				title: article_data[i].title,
				author: article_data[i].author,
				date: article_data[i].written_date,
				topic: article_data[i].topic,
				images: [article_data[i].images[0]],
				short_intro: article_data[i].short_intro,
			});
		}

		for (let i=0;i<post_data.length;i++) {
			requestData.push({
				type: 2,
				cryptlink: post_data[i].cryptlink,
				cloudlink: post_data[i].cloud,
				user: post_data[i].user,
				caption: post_data[i].caption,
				type: post_data[i].type,
			});
		}

		for (let i=0;i<sale_data.length;i++) {
			requestData.push({
				type: 3,
				link: sale_data[i].cryptlink,
				name: sale_data[i].name,
				info: sale_data[i].info,
				images: sale_data[i].images,
			});
		}

		for (let i=0;i<user_data.length;i++) {
			requestData.push({
				type: 4,
				cryptlink: user_data[i].cryptlink,
				name: user_data[i].username,
				email: user_data[i].email,
				shortBio: user_data[i].shortBio,
				level: user_data[i].level,
				points: user_data[i].points,
				pic: user_data[i].pic,
			});
		}

		if (requestData.length==0) {
			requestData = null;
		}

		socket.send({type:310, response: requestData});
	});

	socket.on('client set state', function(user_auth) {
		socket.send({
			type: 1,
		});

		user_auth = cleanQuery(user_auth);

		db.users.findOne({cryptlink: user_auth.link}, function(err, data) {
			if (err) {
				socket.send({type:500,error_code:4});
				return;
			}
			if (data==null) {
				socket.send({type:500,error_code:5});
				return;
			}

			comparePassword(user_auth.password, data.password, function(err, is_correct) {
				if (!is_correct) {
					socket.send({type:666, code:666});
					return;
				}

				socket.send({	// send user data
					type: 600,
					response: {
						cryptlink: data.cryptlink,
						shortBio: data.shortBio,
						name: data.username,
						email: data.email,
						pic: data.pic,

						activated: data.activated,
						verified: data.verified,

						level: data.level,
						points: data.points,

						settings: data.settings,

						followersCount: data.followersCount,
						followingCount: data.followingCount,
					},
				});

				db.datatrack.findOne({cryptlink: user_auth.link}, function(err, saved_state) {
					if (err || saved_state==null) return;

					socket.send({	// seprately send extra user data
						type: 610,
						response: {
							favorites: saved_state.favorites,
							ratings: saved_state.ratings,
						},
					});

					socket.user_state.username = data.username;
					socket.user_state.online = true;
					socket.user_state.last_cycle = 0;
					socket.user_state.interests = saved_state.interests;
					socket.user_state.algorithm = saved_state.algorithm;

					if (socket.user_state.interests==null) {
						socket.user_state.interests = DEFAULT_INTERESTS;
					}
					if (socket.user_state.algorithm==null) {
						socket.user_state.algorithm = {
							knobs: DEFAULT_KNOBS,
							seen: {
								articles: DEFAULT_SEEN.articles,
								posts: DEFAULT_SEEN.posts,
								sales: DEFAULT_SEEN.sales,
								partners: DEFAULT_SEEN.partners,
							},
						};
					}
					if (socket.user_state.algorithm.knobs==null) {
						socket.user_state.algorithm = {
							knobs: DEFAULT_KNOBS,
						};
					}

					socket.user_state.algorithm.seen = {
						articles: DEFAULT_SEEN.articles,
						posts: DEFAULT_SEEN.posts,
						sales: DEFAULT_SEEN.sales,
						partners: DEFAULT_SEEN.partners,
					};
				});

				db.users.updateOne({cryptlink: user_auth.link}, {$set: {
					last_login: new Date,
				}});
			});
		});
	});
	socket.on('check user auth', function(auth) {
		auth = cleanQuery(auth);

		let search = {}, wrong_input = 4;

		if (auth.email!=null) {
			search.email = auth.email;
			wrong_input = 3;
		}
		else if (auth.link!=null) {
			search.cryptlink = auth.link;
			wrong_input = 5;
		}
		else if (auth.name!=null) {
			search.username = auth.name;
			wrong_input = 2;
		}
		else {
			socket.send({
				type: 605,
				response: wrong_input,
			});
			return;
		}

		db.users.findOne(search, function(err, data) {
			if (err) {
				socket.send({
					type: 605,
					response: 6,
				});
				return;
			}
			if (data==null) {
				socket.send({
					type: 605,
					response: wrong_input,
				});
				return;
			}

			comparePassword(auth.pass, data.password, function(err, is_correct) {
				if (!is_correct) {
					socket.send({
						type: 605,
						response: 1,
					});
					return;
				}

				socket.send({
					type: 605,
					response: 0,
					link: data.cryptlink,
				});
			});
		});
	});
	socket.on('new app user', function(auth) {
		if (socket.user_state.online) return;

		auth = cleanQuery(auth);
		let username = auth.email.substring(0, auth.email.indexOf('@'));

		if (auth.email==null || auth.pass==null || auth.email=='null' || auth.pass=='null' || username=='null' || username==null) {
			socket.send({
				type: 605,
				response: 11,
			});
			return;
		}

		db.users.findOne({email: auth.email}, function(err, data) {
			if (err) {
				socket.send({
					type: 605,
					response: 12,
				});
				return;
			}

			if (data==null) {
				getEncryptedHash(auth.email, function(err, hashLink) {
					if (err!=null) {
						socket.send({
							type: 605,
							response: 12,
						});
						return;
					}

					getEncryptedHash(auth.pass, function(err, hashPass) {
						if (err!=null) {
							socket.send({
								type: 605,
								response: 12,
							});
							return;
						}

						try {

							db.users.insertOne({
								cryptlink: hashLink,
								email: auth.email,
								password: hashPass,
								username: username,
								account_created: new Date(),
								last_login: new Date(),

								pic: '',
								shortBio: '',

								level: 1,
								points: 0,

								followingCount: 0,
								followersCount: 0,

								activated: false,
								verified: false,
								archived: false,

								settings: {
									membership: {
										newsletter: true,
										// tier: 0,
										default_tip: 0.2,
									},
									legal: {
										UGC_agreement: false,
										location: false,
										general_use: false,
									},
								},
							}, function(err, saved) {
								if (err||!saved) {
									socket.send({
										type: 605,
										response: 12,
									});
								}
								else {
									socket.send({
										type: 605,
										response: 10,
										link: hashLink,
									});
								}
							});
							db.datatrack.insertOne({
								cryptlink: hashLink,

								interests: DEFAULT_INTERESTS,
								algorithm: {
									knobs: DEFAULT_KNOBS,
								},

								favorites: [],
								messages: [],
								following: [],
								followers: [],
								blocking: [],
								blocked_by: [],

								personality: {},
								demographic: {},

								location_pings: [],
								ratings: [],
							}, function(err, saved) {
								if (err) {
									SAVE_PERM_LOG('warn', {
										user:username,
										email:email,
										msg:'Error creating DATATRACK data'
									});
								} else if (!saved) {
									SAVE_PERM_LOG('warn', {
										user:username,
										email:email,
										msg:'DATATRACK data could not be saved'
									});
								}
							});
							db.payments.insertOne({
								cryptlink: hashLink,
							}, function(err, saved) {
								if (err) {
									SAVE_PERM_LOG('warn', {
										user:username,
										email:email,
										msg:'Error creating PAYMENTS data'
									});
								} else if (!saved) {
									SAVE_PERM_LOG('warn', {
										user:username,
										email:email,
										msg:'PAYMENTS data could not be saved'
									});
								}
							});

							socket.send({
								type: 600,
								response: {
									pic: '',
									email: auth.email,
									verified: false,
									shortBio: '',
									name: username,
									cryptlink: hashLink,
									level: 1,
									points: 0,
									settings: {
										membership: {
											newsletter: true,
											tier: 0,
											default_tip: 0.2,
										},
										legal: {
											location: true,
											general_use: true,
										},
									},
									followersCount: 0,
									followingCount: 0,
								}
							});

							let CODE = Create_ID(15, .43);

							DATA_CHECK("SET verify email", {
								name: hashLink,
								type: 'EMAIL',
								code: CODE
							});
							SEND_EMAIL("welcome", {
								email: auth.email,
								link: hashLink,
								name: username,
								code: CODE,
							});

						}
						catch (e) {
							timestamp('error creating new user', e);
							socket.send({
								type: 605,
								response: 13,
							});
						}
					});
				});
			}
			else socket.send({
				type: 605,
				response: 13,
			});
		});
	});
	socket.on('forgot password', function(auth) {
		auth = cleanQuery({
			email: auth.email,
		});
		if (auth.email==null || auth.email=='null') {
			socket.send({
				type: 605,
				response: 21,
			});
			return;
		}

		db.users.findOne(auth, function(err, data) {
			if (err) {
				socket.send({
					type: 605,
					response: 22,
				});
				return;
			}
			if (data==null) {
				socket.send({
					type: 605,
					response: 23,
				});
				return;
			}

			let _request_code = Create_ID(15, .43);

			socket.send({
					type: 605,
					response: 20,
				});
			DATA_CHECK("SET password update", {
				email: data.email,
				type: 'PASS',
				code: _request_code
			});
			SEND_EMAIL('recover password', {
				email: data.email,
				link: data.cryptlink,
				code: _request_code,
			});
		});
	});
	socket.on('verify password code', function(auth) {
		auth = cleanQuery({
			link: auth.link,
			code: auth.code,
		});
		if (auth.link==null) {
			socket.send({
				type: 605,
				response: 41,
			});
			return;
		}

		db.users.findOne({cryptlink: auth.link}, function(err, data) {
			if (err) {
				socket.send({
					type: 605,
					response: 41,
				});
				return;
			}
			if (data==null) {
				socket.send({
					type: 605,
					response: 42,
				});
				return;
			}

			if (!DATA_CHECK("verify password update", {
				email: data.email,
				type: 'PASS',
				code: auth.code
			})) {
				socket.send({
					type:605,
					response:43,
				});
				return;
			}

			socket.send({
				type:605,
				response:40,
			});
		});
	});
	socket.on('client check', function() {
		if (socket.user_state.online) socket.send({type: 1});
		else socket.send({type: 4});
	});
});
