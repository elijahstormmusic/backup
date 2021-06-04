/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project

let LOADED = false;
const Partners = AppAndPartnersCommunication;
const Posts = AppAndPostsCommunication;
const Userdata = AppAndUserdataCommunication;
const Info = AppAndInfoCommunication;
const Error = AppAndErrorCommunication;
let Server = {
	Info: function(link, info) {
			// request information data
		socket.emit('information set', link, info);
	},
	Userdata: function(username, password) {
			// request information data
		socket.emit('userdata get', {
			username: username,
			password: password
		});
	},
	Partners: function(request) {
		// request information data
		socket.emit('partners search', request);
	},
	Posts: {
		Links: function(request) {
			// request information data
			socket.emit('posts get', request);
		},
		State: function(user) {
			// request information data
			socket.emit('posts set state', user);
		},
		Data: function(request) {
			// request information data
			socket.emit('posts get data', request);
		},
		Comments: function(request) {
			// request information data
			socket.emit('posts get comments', request);
		},
	},
	Radius: function(lat, lng, rad) {
			// request information data
		socket.emit('partners rad', lat, lng, rad);
	},
	Process: function(input) {
		let data = input.split('?');
	  if(data.length!=2) return;
	  data = data[1].split(':');
	  if(data.length<=1) return;

					/* Userdata */
		if(data[0]=='u') {
			if(data.length<3) return;
			Server.Userdata(data[1], data[2]);
		}
					/* Saving info */
		else if(data[0]=='i') {
			if(data.length<3) return;
			Server.Info(data[1], data[2]);
		}
					/* Partners by query */
		else if(data[0]=='p') {
			if(data.length<2) return;
			Server.Partners(data[1]);
		}
					/* Posts by query */
		else if(data[0]=='o') {
			if(data.length<2) return;
			Server.Posts.Links(data[1]);
		}
					/* Set state to recieve
						constant post data */
		else if(data[0]=='s') {
			if(data.length<2) return;
			Server.Posts.State(data[1]);
		}
					/* Post data */
		else if(data[0]=='d') {
			if(data.length<2) return;
			Server.Posts.Data(data[1]);
		}
					/* Post data comments */
		else if(data[0]=='c') {
			if(data.length<2) return;
			Server.Posts.Comments(data[1]);
		}
					/* Partners by radius */
		else if(data[0]=='r') {
			if(data.length<4) return;
			Server.Radius(data[1], data[2], data[3]);
		}
	}
};
let socket;
if(typeof io!=='undefined'){socket = io();}
window.onload = function(){
	if(Partners==null) {
		console.error('Access denied -> invalid device');
		return;
	}

  Server.Process(window.location.href);

	function processDataResponse(Phone, fnc, list) {
		if(list.length==null) {
			Phone.postMessage(fnc + '=' + JSON.stringify(list).replace(/\"/g, ''));
			return;
		}
		let result = JSON.stringify(list[0]);
		for(let i=1;i<list.length;i++)
		{
			result += ';'+JSON.stringify(list[i]);
		}
		Phone.postMessage(fnc + '=' + result.replace(/\"/g, ''));
	}
	socket.on('message', function(data){
		if(data.type==null)return;
			/** initiate connection and errors */
		if(data.type==0)
		{ /** unused */	}
		else if(data.type==1)
		{ /** unused */	}

			/** partner database access */
		else if(data.type==300)
		{	// download partner data
			try {
				for(let i=0;i<data.response.length;i++)
					data.response[i].info  = data.response[i].info.replace(/\,/g, '~');
			} catch (e) {
				data.response = [];
			}
			try {
				processDataResponse(Partners, 'response', data.response);
			} catch (e) {
				console.error('Var `Partners` not found.');
				console.error('_ar-error_ => '+data.response);
			}
		}

			/** partner database access */
		else if(data.type==800)
		{	// download post links
			try {
				processDataResponse(Posts, 'links', data.response);
			} catch (e) {
				console.error('Var `Posts` not found.');
				console.error('_ar-error_ => '+data.response);
			}
		}
		else if(data.type==801)
		{	// download post data
			data.response.caption = data.response.caption.replace(/\,/g, '~');
			try {
				processDataResponse(Posts, 'data', data.response);
			} catch (e) {
				console.error('Var `Posts` not found.');
				console.error('_ar-error_ => '+data.response);
			}
		}
		else if(data.type==802)
		{	// download post comments data
			try {
				for(let i=0;i<data.response.length;i++)
					data.response[i].text  = data.response[i].text.replace(/\,/g, '~');
			} catch (e) {
				data.response = [];
			}
			try {
				processDataResponse(Posts, 'comments', data.response);
			} catch (e) {
				console.error('Var `Posts` not found.');
				console.error('_ar-error_ => '+data.response);
			}
		}
		else if(data.type==803)
		{	// state link state
			console.error('improper use, data rejected');
		}

			/** error reaching database */
		else if(data.type==500)
		{	// report error on server input
			try {
				processDataResponse(Error, 'response', '_ar-error_ => '+data.response);
			} catch (e) {
				console.error('Var `Error` not found.');
				console.error('_ar-error_ => '+data.response);
			}
		}

			/** user database access */
		else if(data.type==600)
		{	// download current logged in user data
			try {
				processDataResponse(Userdata, 'response', data.response);
			} catch (e) {
				console.error('Var `Userdata` not found.');
				console.error('_ar-error_ => '+data.response);
			}
		}

			/** information database access */
		else if(data.type==700)
		{	// download link to secure information data
			try {
				processDataResponse(Info, 'link', data.link);
			} catch (e) {
				console.error('Var `Info` not found.');
				console.error('_ar-error_ => '+data.response);
			}
		}
	});

	LOADED = true;
};
