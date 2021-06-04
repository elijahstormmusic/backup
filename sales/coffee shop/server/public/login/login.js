/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project


const title = document.getElementById('title');
const sendBtn = document.getElementById('sendBtn');
const data = document.getElementById('data_contents');
const email = document.getElementById('email');
const user = document.getElementById('username');
const pass = document.getElementById('pass');
const btn = document.getElementById('signupBtn');
const error = document.getElementById('error');
const logoStyle = document.getElementById('loginLogo');
const stayBox = document.getElementById("staySignedOn");
let stayCheck = false;
const Phone = typeof AppAndPageCommunication === 'undefined' ?
	null : AppAndPageCommunication;

let report = function(err){
	error.style.visibility = 'visible';
	error.innerHTML = err;
};


let signupShown = false, passwordShown = false,
	CONNECTED = false, LOADED = false, socket;
let LAST_CONNECT_MESSAGE = 0;
const CONNECTION = function(){
	let CONNECTION = {
		FAST:3000,
		SLOW:20000,
		NONE:-1
	};
	let time = CONNECTION.SLOW;
	this.GET = function(){
		return time;
	};
	this.SET = function(val){
		switch (val) {
			case 0:
				time = CONNECTION.NONE;
				break;
			case 1:
				if(time==CONNECTION.NONE)
				{
					time = CONNECTION.SLOW;
					CHECK_CONNECTION();
					return;
				}
				time = CONNECTION.SLOW;
				break;
			case 1:
				if(time==CONNECTION.NONE)
				{
					time = CONNECTION.FAST;
					CHECK_CONNECTION();
					return;
				}
				time = CONNECTION.FAST;
				break;
		}
	};
};
const CONNECTION_ACTIVE = new CONNECTION;
let CONNECTION_TIMEOUT = 0;
function CHECK_CONNECTION(){
	if(CONNECTION_TIMEOUT>5)
	{
		if(CONNECTED)
		{
			LOST_CONNECTION();
			CONNECTED = false;
		}
	}
	else
	{
		if(!CONNECTED)
		{
			CONNECT(socket.username, socket.password);
			RECONNECTED();
		}
		CONNECTION_TIMEOUT++;
	}
	socket.emit('check');
	if(CONNECTION_ACTIVE.GET()==-1) return;
	setTimeout(function(){CHECK_CONNECTION()}, CONNECTION_ACTIVE.GET());
}
function CONNECT(name, pass, report){
	if(CONNECTED) return;
	if(new Date-LAST_CONNECT_MESSAGE<5000){
		if(report)report("Please wait 5 seconds before retrying...");
		return;
	}
	LAST_CONNECT_MESSAGE = new Date;
	socket.username = name;
	socket.password = pass;
	socket.emit('connect user', name, pass);
}
function LOST_CONNECTION(){
	if(!CONNECTED) return;
	let time = new Date().toLocaleTimeString();
	Phone.postMessage('disconnect');
}
function RECONNECTED(){
	if(!CONNECTED) return;
	let time = new Date().toLocaleTimeString();
	Phone.postMessage('reconnect');
}
function setConnection(val){
	CONNECTION_ACTIVE.SET(val);
}

function validateSignup(user, pass){
	if(!user||!pass) return false;
	if(typeof(user)!=="string" || typeof(pass)!=="string") return false;
	if(user==""||pass=="") return false;
	if(user.length>20 || pass.length>20) return false;
	if(user.length<3 || pass.length<4) return false;
	if(user.indexOf("/")!=-1 || pass.indexOf("/")!=-1) return false;
	if(user.indexOf("\\")!=-1 || pass.indexOf("\\")!=-1) return false;
	if(user.indexOf(" ")!=-1 || pass.indexOf(" ")!=-1) return false;
	if(user.indexOf("<")!=-1 || pass.indexOf("<")!=-1) return false;
	if(user.indexOf(">")!=-1 || pass.indexOf(">")!=-1) return false;
	if(user.indexOf(".")!=-1 || pass.indexOf(".")!=-1) return false;
	if(user.indexOf(":")!=-1 || pass.indexOf(":")!=-1) return false;
	if(user.indexOf(";")!=-1 || pass.indexOf(";")!=-1) return false;
	return true;
}
function validateEmail(email) {
	if(!email) return false;
	if(typeof(email)!=="string") return false;
	if(email=="") return false;
	if(email.length<3) return false;
	let pos = email.indexOf("@");
	if(pos==-1) return false;
	if(pos==0 || pos==email.length-1) return false;
	if(email.indexOf("@", pos+1)!=-1) return false;
	pos = email.indexOf(".");
	if(pos==-1) return false;
	if(pos==0 || pos==email.length-1) return false;
	if(Math.abs(pos-email.indexOf("@"))<=1) return false;
	return true;
}
function reportLoggedIn(user, pass, report){
	if(!LOADED){
		report("The page has not loaded yet.");
		return;
	}
	if(CONNECTED){
		report("Already signed in... try refreshing");
		return;
	}
	if(!validateSignup(user, pass)) return;
	CONNECT(user, pass, report);
}
function reportNewUser(email, user, pass, report){
	if(!LOADED) return;
	if(CONNECTED) return;
	if(!validateEmail(email)) return;
	if(!validateSignup(user, pass)) return;
	if(new Date-LAST_CONNECT_MESSAGE<5000){
		if(report)report("Please wait 5 seconds before retrying...");
		return;
	}
	LAST_CONNECT_MESSAGE = new Date;
	socket.emit('new user', email, user, pass);
}

function eraseCookie(){
	document.cookie = "user;SameSite=Strict;expires=-1";
	document.cookie = "pass;SameSite=Strict;expires=-1";
}

window.onload = function(){
	if(Phone==null) {
		report('Cannot sign up -> invalid device');
		return;
	}
	if(typeof io==='undefined') {
		report('Cannot sign up -> not connected to internet');
		return;
	}
	socket = io();
	socket.on('message', function(data){
		if(data.type==null) return;

			/** initiate connection and error handling */
		if(data.type==0)
		{	// refresh connection
			CONNECTION_TIMEOUT = 0;
		}
		else if(data.type==5)
		{	// report username taken
			report("User name taken!");
		}
		else if(data.type==6)
		{	// report username does not exist
			report("Username does not exist!");
		}
		else if(data.type==7)
		{	// report password is not correct
			report("Password not correct!");
		}
		else if(data.type==8)
		{	// error connecting to server
			report("General error when signing-up/logging-in");
		}
		else if(data.type==9)
		{	// new user added correctly
			LAST_CONNECT_MESSAGE = 0;
			login();
		}

			/** lobby connections */
		else if(data.type==20)
		{	// caching user info and validating connection
			Phone.postMessage('connect='+socket.username+';'+socket.password);
		}
	});

	if(window.innerWidth<400)
	{
		btn.style.marginTop = "45px";
	}
	let LOGIN = function(e){
		if(e.keyCode==13)
		{
			login();
			return false;
		}
	};
	pass.onkeydown = LOGIN;
	user.onkeydown = LOGIN;

	let reflow = function(e){

	};
	window.addEventListener("resize", reflow, false);
	reflow();

	let pathData = window.location.href.split('?');
  if(pathData.length==2) {
		pathData = pathData[1].split(':');
		if(pathData.length==3) {
			if(pathData[0]=='u') {
				user.value = pathData[1];
				pass.value = pathData[2];
				login();
				return;
			}
			if(pathData[0]=='f') {	// forget username

				return;
			}
			if(pathData[0]=='fp') {	// forget password

				return;
			}
		}
	}

	if(document.cookie!=null)
	if(document.cookie!=""){
		var cookies = document.cookie.split("; ");
		var cookUser,cookPass;
		for(var i in cookies){
			if(cookUser&&cookPass)break;
			var curCookie = cookies[i];
			if(curCookie.substr(0,4)=="user"){
				var equals = curCookie.indexOf('=');
				if(~equals){
					cookUser = curCookie.substr(equals+1);
				}
				continue;
			}
			if(curCookie.substr(0,4)=="pass"){
				var equals = curCookie.indexOf('=');
				if(~equals){
					cookPass = curCookie.substr(equals+1);
				}
				continue;
			}
		}
		if(cookUser&&cookPass){
			user.value = cookUser;
			pass.value = cookPass;
			// login();
		}
		pass.focus();
	}
	else user.focus();
	LOADED = true;
};

email.onkeyup = function() {
	if(!validateEmail(email.value))
	{
		email.className = "textInput shown error";
	}
	else
	{
		email.className = "textInput shown";
	}
};
user.onkeyup = function() {
	if(!validateSignup(user.value, "pass"))
	{
		user.className = "textInput error";
	}
	else
	{
		user.className = "textInput";
	}
};
pass.onkeyup = function() {
	if(!validateSignup("user", pass.value))
	{
		pass.className = "textInput error";
	}
	else
	{
		pass.className = "textInput";
	}
};

function openSignup(){
	if(signupShown){
		email.className = "textInput";
		sendBtn.innerHTML = 'LOGIN';
		signupShown = false;
		btn.innerHTML = "CREATE ACCOUNT";
	}else{
		email.className += " shown";
		sendBtn.innerHTML = 'CREATE ACCOUNT';
		signupShown = true;
		btn.innerHTML = 'LOGIN';
	}
}
function seePassword() {
	if(passwordShown){
		pass.type = "password";
		passwordShown = false;
	}else{
		pass.type = "text";
		passwordShown = true;
	}
}
function toggleMemory() {
	if (stayCheck) {
		stayCheck = false;
		stayBox.className = "checkmarkbox";
	}
	else {
		stayCheck = true;
		stayBox.className += " checked";
	}
}

function sendMsgBtn(){
	if(stayCheck){
		var date = new Date();
		date.setTime(date.getTime()+4838400000);
		var expires = date.toGMTString();
		document.cookie = "user="+user.value+";SameSite=Strict;expires="+expires+";path=/";
		document.cookie = "pass="+pass.value+";SameSite=Strict;expires="+expires+";path=/";
	}
	if(signupShown)
		signup();
	else login();
}
function login(){
	if(!validateSignup(user.value, pass.value)){
		report("invalid user info");
	}
	else reportLoggedIn(user.value, pass.value, report);
}
function signup(){
	if(!validateEmail(email.value)){
		report("invalid email address");
	}
	else if(!validateSignup(user.value, pass.value)){
		report("invalid user info");
	}
	else reportNewUser(email.value, user.value, pass.value, report);
}
