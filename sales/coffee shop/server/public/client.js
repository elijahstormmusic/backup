/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project


function validateSignup(user, pass){
	if(!user||!pass)return false;
	if(typeof(user)!=="string" || typeof(pass)!=="string")return false;
	if(user==""||pass=="")return false;
	if(user.length>20 || pass.length>20)return false;
	if(user.length<3 || pass.length<4)return false;
	if(user.indexOf("/")!=-1 || pass.indexOf("/")!=-1)return false;
	if(user.indexOf("\\")!=-1 || pass.indexOf("\\")!=-1)return false;
	if(user.indexOf(" ")!=-1 || pass.indexOf(" ")!=-1)return false;
	if(user.indexOf("<")!=-1 || pass.indexOf("<")!=-1)return false;
	if(user.indexOf(">")!=-1 || pass.indexOf(">")!=-1)return false;
	if(user.indexOf(".")!=-1 || pass.indexOf(".")!=-1)return false;
	if(user.indexOf(":")!=-1 || pass.indexOf(":")!=-1)return false;
	if(user.indexOf(";")!=-1 || pass.indexOf(";")!=-1)return false;
	return true;
}
function validateEmail(email) {
	if(!email)return false;
	if(typeof(email)!=="string")return false;
	if(email=="")return false;
	if(email.length<3)return false;
	let pos = email.indexOf("@");
	if(pos==-1)return false;
	if(email.indexOf("@", pos+1)!=-1)return false;
	if(pos==0 || pos==email.length-1)return false;
	pos = email.indexOf(".");
	if(pos==-1)return false;
	if(email.indexOf(".", pos+1)!=-1)return false;
	if(pos==0 || pos==email.length-1)return false;
	if(Math.abs(pos-email.indexOf("@"))<=1)return false;
	return true;
}
function reportLoggedIn(user, pass, report){
	if(!LOADED){
		report("The game has not loaded yet.");
		return;
	}
	if(CONNECTED){
		report("Already signed in... try refreshing");
		return;
	}
	if(!validateSignup(user, pass))return;
	CONNECT(user, pass, report);
}
function reportNewUser(email, user, pass, report){
	if(!LOADED)return;
	if(CONNECTED)return;
	if(!validateEmail(email))return;
	if(!validateSignup(user, pass))return;
	if(new Date-LAST_CONNECT_MESSAGE<5000){
		if(report)report("Please wait 5 seconds before retrying...");
		return;
	}
	LAST_CONNECT_MESSAGE = new Date;
	socket.emit('new user', email, user, pass);
}
function logOut(){

}
function sendEmailMessage(form) {

	let curEl, subject, body, sender;
	let err = console.error; // change this later
	for(let i=0;i<form.childNodes.length;i++)
	{
		curEl = form.childNodes[i];
		for(let j=0;j<curEl.childNodes.length;j++)
		{
			if(curEl.childNodes[j].name=="Subject")
			{
				subject = curEl.childNodes[j].value;
				continue;
			}
			if(curEl.childNodes[j].name=="Email")
			{
				sender = curEl.childNodes[j].value;
				continue;
			}
			if(curEl.childNodes[j].name=="Message")
			{
				body = curEl.childNodes[j].value;
				continue;
			}
		}
	}
	if(subject==null || body==null || sender==null)
	{
		if(err!=null) err("Make sure to fill all forms");
		return false;
	}
	if(subject.length>100 || body.length>1500)
	{
		if(err!=null) err("Messages might be a little too long :(");
		return false;
	}
	socket.emit("email", {
		email: sender,
		subject: subject,
		body: body
	});
	return true;
}

var pageFrame;
var page;
var title_box_alert = function(updated){
	var old = document.title;
	this.time = 1000;
	var kill = false;
	var self = this;
	var toggle = true;
	this.stop = function(){
		kill = true;
	};
	var refresh_fnc = function(){
		if(kill){
			document.title = old;
			return;
		}
		if(toggle)
		{
			document.title = updated;
			toggle = false;
		}
		else
		{
			document.title = old;
			toggle = true;
		}
		setTimeout(refresh_fnc, self.time);
	};
	refresh_fnc();
};
var CONNECTED = false;
var CONNECTION_TIMEOUT = 0;
var LOADED = false;
var lobby_open = false;
var socket;
if(typeof io!=='undefined'){socket = io();}
var onFinishedLoadingList = [];
function onFinishedLoading(fnc){
	if(onFinishedLoadingList==null)return;
	onFinishedLoadingList.push(fnc);
}
window.onload = function(){
	LOADED = true;
	pageFrame = document.getElementById('pageFrame');
	page = pageFrame.contentWindow;
	socket.on('public log', function(msg, color, time){
		if(page.LOG)page.LOG.add(msg, color, time);
	});
	socket.on('set client data', function(index, name){
		socket.index = index;
		socket.username = name;
	});
	socket.on('user joined', function(username){
		if(page.LOG)page.LOG.add(username+" joined","#FF0");
		if(!lobby_open)return;
		lobby.contentWindow._activeUsers.add();
		lobby.contentWindow._lobbyAmt.add();
	});
	socket.on('user left', function(username){
		if(page.LOG)page.LOG.add(username+" left","#FF0");
		if(!lobby_open)return;
		lobby.contentWindow._activeUsers.sub();
	});

	socket.on('message', function(data){
	// timestamp("MESSAGE: "+data.type);
		if(data.type==null)return;
			/** initiate connection and errors */
		if(data.type==0)
		{	// refresh connection
			CONNECTION_TIMEOUT = 0;
		}
		else if(data.type==1)
		{ /** unused */	}
		else if(data.type==2)
		{	// refresh connection info
			if(!lobby_open)return;
		}
		else if(data.type==3)
		{	// receive already opened lbbby data
			if(!lobby_open)return;
			for(var i in data.info)
			{
				lobby.contentWindow.add_game(data.info[i].name,data.info[i].map,data.info[i].page);
				lobby.contentWindow._openGames.add();
				// add player list
			}
		}
		else if(data.type==4)
		{	// client disconnected
			CONNECTED = false;
			CONNECTION_TIMEOUT = 0;
		}
		else if(data.type==5)
		{	// report username taken
			var err_report = pageFrame.contentWindow;
			if(err_report==null)return;
			if(err_report.report==null)return;
			err_report.report("User name taken!");
		}
		else if(data.type==6)
		{	// report username does not exist
			var err_report = pageFrame.contentWindow;
			if(err_report==null)return;
			if(err_report.report==null)return;
			err_report.report("Username does not exist!");
		}
		else if(data.type==7)
		{	// report password is not correct
			var err_report = pageFrame.contentWindow;
			if(err_report==null)return;
			if(err_report.report==null)return;
			err_report.report("Password not correct!");
		}
		else if(data.type==8)
		{	// error connecting to server
			if(!page.LOG){
				if(page.report==null)return;
				page.report("General error when signing-up/logging-in");
			}else{
				window.location.reload();
			}
		}
		else if(data.type==9)
		{	// new user added correctly
			var loginFrame = pageFrame.contentWindow;
			if(loginFrame==null)return;
			if(loginFrame.login==null)return;
			LAST_CONNECT_MESSAGE = 0;
			loginFrame.login();
		}


			/** lobby connections */
		else if(data.type==20)
		{	// caching user info and validating connection
			socket.index = data.index;
			CONNECTED = true;
			CHECK_CONNECTION();
			if(pageFrame.src!="/welcome/")
				pageFrame.src = "/welcome/";
			document.title = "Welcome " + socket.username + " to Arrival";
		}

			/** logs */
		else if(data.type==110)
		{	// console log message
			console.warn("WARNING: IMPROPER USE OF MESSAGING");
			console.log(data.msg);
		}
		else if(data.type==111)
		{	// page log message
			console.warn("WARNING: IMPROPER USE OF MESSAGING");
			if(page.LOG)page.LOG.add(data.msg, data.color);
		}
	});
	for(var i in onFinishedLoadingList){
		onFinishedLoadingList[i]();
	}
	onFinishedLoadingList = null;
};

var LAST_CONNECT_MESSAGE = 0;
function CONNECT(name, pass, report){
	if(CONNECTED)return;
	if(new Date-LAST_CONNECT_MESSAGE<5000){
		if(report)report("Please wait 5 seconds before retrying...");
		return;
	}
	LAST_CONNECT_MESSAGE = new Date;
	socket.username = name;
	socket.password = pass;
	socket.emit('connect user', name, pass);
}

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

function setConnection(val){
	CONNECTION_ACTIVE.SET(val);
}

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
	if(CONNECTION_ACTIVE.GET()==-1)return;
	setTimeout(function(){CHECK_CONNECTION()}, CONNECTION_ACTIVE.GET());
}
function LOST_CONNECTION(){
	var time = new Date().toLocaleTimeString();
	console.error("Lost connection at "+time);
	if(page.LOG)page.LOG.add("Lost connection at "+time,"#F00",10000);
	document.title_alert = new title_box_alert("LOST CONNECTION");
}
function RECONNECTED(){
	var time = new Date().toLocaleTimeString();
	console.error("Regained connection at "+time);
	if(page.LOG)page.LOG.add("Regained connection at "+time,"#0F0",5000);
	refresh_lobby();
	if(document.title_alert)
	{
		document.title_alert.stop();
	}
}

function openLobby(){
	lobby.src = "includes/lobby.html";
	document.getElementById("refreshLobby").href = "includes/lobby.html";
	socket.emit('lobby on');
}
function openChat(){
	lobby_open = false;
	document.getElementById("refreshLobby").href = "includes/chat.html";
	lobby.src = "includes/chat.html";
}

function timestamp(){
	var str = "";
	for(var i in arguments)
	{
		str+=arguments[i]+" ";
	}
	console.log(new Date().toLocaleTimeString(),"->",str);
}
var lobby = document.getElementById('lobbyFrame');
