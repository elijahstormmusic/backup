/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project

const Icons = {
  Shadow:'icons/shadow.png',
  Dots:{
    Blue:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Red:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Green:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    LightBlue:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/ltblue-dot.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Yellow:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Purple:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/purple-dot.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Pink:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/pink-dot.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
  },
  Solid:{
    Blue:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Red:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Green:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/green.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    LightBlue:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/lightblue.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Yellow:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Purple:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/purple.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Pink:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/pink.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
  },
  Pins:{
    Blue:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-pushpin.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Red:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-pushpin.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Green:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/grn-pushpin.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    LightBlue:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/ltblu-pushpin.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Yellow:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/ylw-pushpin.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Purple:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/purple-pushpin.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
    Pink:{
      Icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/pink-pushpin.png',
      Shadow: 'https://maps.gstatic.com/mapfiles/ms2/micons/msmarker.shadow.png',
    },
  },
  Places:{
    Restaurant:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/restaurant.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/restaurant.shadow.png'
    },
    Coffeehouse:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/coffeehouse.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/coffeehouse.shadow.png'
    },
    Bar:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/bar.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/bar.shadow.png'
    },
    Snackbar:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/snack_bar.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/snack_bar.shadow.png'
    },
    Man:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/man.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/man.shadow.png'
    },
    Woman:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/woman.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/woman.shadow.png'
    },
    Wheelchair:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/wheel_chair_accessible.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/wheel_chair_accessible.shadow.png'
    },
  },
  Transport:{
    Parkinglot:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/parkinglot.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/parkinglot.shadow.png'
    },
    Cab:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/cabs.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/cabs.shadow.png'
    },
    Bus:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/bus.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/bus.shadow.png'
    },
    Truck:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/truck.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/truck.shadow.png'
    },
    Rail:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/rail.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/rail.shadow.png'
    },
    Plane:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/plane.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/plane.shadow.png'
    },
    Ferry:{
      Icon:'https://maps.gstatic.com/mapfiles/ms2/micons/ferry.png',
      Shadow:'https://maps.gstatic.com/mapfiles/ms2/micons/ferry.shadow.png'
    },
},
  Industry:{
    Media:{
      Icon:'icons/media.png',
    },
    Cosmetics:{
      Icon:'icons/cosmetics.png',
    },
    Music:{
      Icon:'icons/music.png',
    },
    Coffee:{
      Icon:'icons/coffee.png',
    },
    Entertainment:{
      Icon:'icons/entertainment.png',
    },
  }
};

let Data, Phone;
try {
  Phone = AppAndPageCommunication;
} catch (e) {
  console.error('You can only access this page from our app.');
  Phone = null;
}

function initMap() {
  if(Phone==null) return;

  let map;
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 39.1439117, lng: -94.5785244 },
    zoom: 11
  });

  Data = new Data_Class(map);
  document.getElementById("map").onmousedown = function() {
    Data.Close_Info();
  };
  document.getElementById("map").ontouchstart = function() {
    Data.Close_Info();
  };

  let pathData = window.location.href.split('?');
  if(pathData.length!=2) {
    Data.Grab({});
    Data.Locate_Me();
    return;
  }
  pathData = pathData[1].split(':');
  if(pathData.length<=1) {
    Data.Grab({});
    Data.Locate_Me();
    return;
  }
  if(pathData[0]=='m') {
    Data.Grab({});
    if(pathData.length==3) {
      Data.Set_Location({
        lat: parseFloat(pathData[1]),
        lng: parseFloat(pathData[2])
      });
    } else Data.Locate_Me();
  } else if(pathData[0]=='p') {
    Data.Grab({
      name: '^'+pathData[1]
    });
    if(pathData.length==4) {
      Data.Set_Location({
        lat: parseFloat(pathData[2]),
        lng: parseFloat(pathData[3])
      });
    } else Data.Locate_Me();
  } else if(pathData[0]=='d') {
    Data.Grab({});
    Data.Directions({
      name: '^'+pathData[1]
    }, {
      lat: parseFloat(pathData[2]),
      lng: parseFloat(pathData[3])
    });
  } else {
    Data.Grab({});
    Data.Locate_Me();
  }
}

let Data_Class = function(map) {
  if(Phone==null) return;

	let self = this;
	let Marker_Class = function() {
		let self = this;
		let markers = [];
    let infoDisplay = new google.maps.InfoWindow;

		let Places_Class = function(options) {
			let self = this;
			let result;

			self.Options = function() {
				return {
					position: options.pos,
					map: map,
					icon: options.icon
				};
			};
			self.Result = function() {
				return result;
			};

			result = new google.maps.Marker(self.Options());
		};

		let Info_Class = function(options) {
			let self = this;
			let result = ({
				content: options.content
			});

			self.Options = function() {
				return {
					content: options.content
				};
			};
			self.Result = function() {
				return result;
			};
		};

		self.Add = function(options) {
			let place = new Places_Class({
				pos: {
					lat: options.lat,
					lng: options.lng
				},
        icon: options.icon
			});
			markers.push({
        index: options.index,
				place: place
			});

      if(options.content==null) return;
			let open_fnc = function() {
        infoDisplay.setContent(options.content);
				infoDisplay.open(map, place.Result());
			};
			place.Result().addListener('click', open_fnc);
		};
    self.Grab = function(index) {
      for(let i=0;i<markers.length;i++)
        if(markers[i].index==index) return markers[i].place;
    };
    self.Unique_Index = function() {
      let index, unique = false;
    	function make_letter()
    	{ // 65 = A, 97 = a
    		let start = Math.random()>0.5 ? 65 : 97;
    		let index = Math.floor(Math.random()*26)+start;
    		if(start==65)	// upper case
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
      while (!unique) {
        index = make_letter()+make_letter()+make_letter();
        unique = true;
        for(let i=0;i<markers.length;i++) {
          if(markers[i].index==index)
          {
            unique = false;
            break;
          }
        }
      }
      return index;
    };
    self.Close_Info = function() {
      infoDisplay.close();
    };
	};
	let Markers = new Marker_Class;
	let socket = io();
  let myLocation, destLocation;
  let killPosUpdate = false, timePerTick = 10000;
  let markerArray = [];
  let stepDisplay = new google.maps.InfoWindow();
  let InfoCard = '<img src="../partners/VARIMAGES/logo.jpg" class="infocard-logo"></img>' +
    '<h1 class="infocard-title">VARNAME</h1>' +
    '<p class="infocard-info">VARINFO</p>' +
    '<p class="infocard-rating">VARRATING (VARRATAMT)</p>' +
    '<p class="infocard-takeme" onclick="Data.Take_Me(\'VARTAKEME\');">TAKE ME HERE</p>' +
    '<p><a class="infocard-phone" href="tel:VARPHONE">VARPHONE</a></p>' +
    '<p><a class="infocard-website" href="VARWEBSITE">WEBSITE</a></p>';
  function ratingDisplay(rating) {
    let star = '<i class="fas fa-star infocard-y"></i>';
    let halfStar = '<i class="fas fa-star-half-alt infocard-br"></i>';
    let noStar = '<i class="far fa-star infocard-bl"></i>';
    let str = '';
    for(let i=1;i<6;i++) {
      str+=(i<rating ? star : (i-1<rating && rating%1>0.5 ? halfStar : noStar));
    }
    return str + '</svg>';
  }

  let directionsService = new google.maps.DirectionsService,
    directionsDisplay = new google.maps.DirectionsRenderer({
    map: map
  });

	socket.on('message', function(data){
		if(data.type==null)return;
			/** initiate connection and errors */
		if(data.type==0)
		{	// refresh connection
			CONNECTION_TIMEOUT = 0;
		}

			/** partner database access */
		else if(data.type==300)
		{	// download partner data
			let response = data.response;
			for(let i=0;i<response.length;i++) {
        let curIndex = Markers.Unique_Index();
				self.Populate({
          index: curIndex,
					lat: response[i].lat,
					lng: response[i].lng,
					icon: response[i].icon,
					content: InfoCard.replace(/\VARNAME/g, response[i].name).
            replace(/\VARIMAGES/g, response[i].images).
            replace(/\VARINFO/g, response[i].info).
            replace(/\VARRATING/g, ratingDisplay(response[i].rating)).
            replace(/\VARTAKEME/g, curIndex).
            replace(/\VARRATAMT/g, response[i].ratingAmount).
            replace(/\VARPHONE/g, response[i].contact.phoneNumber).
            replace(/\VARWEBSITE/g, response[i].contact.website)
				});
			}
		}
		else if(data.type==301)
		{	// set directions
      let response = data.response;
      let curIndex = Markers.Unique_Index();
      destLocation = {
				lat: response.lat,
				lng: response.lng
      };
      calculateAndDisplayRoute(myLocation, destLocation);
      self.Populate({
        index: curIndex,
        lat: response.lat,
        lng: response.lng,
        icon: response.icon,
        content: InfoCard.replace(/\VARNAME/g, response.name).
          replace(/\VARIMAGES/g, response.images).
          replace(/\VARINFO/g, response.info).
          replace(/\VARRATING/g, ratingDisplay(response.rating)).
          replace(/\VARTAKEME/g, curIndex).
          replace(/\VARRATAMT/g, response.ratingAmount).
          replace(/\VARPHONE/g, response.contact.phoneNumber).
          replace(/\VARWEBSITE/g, response.contact.website)
      });
		}

			/** server error handling */
    else if(data.type==500)
    {	// refresh connection
      console.error('Server error:',data.error_code);
    }
	});

	self.Grab = function(query) {
		socket.emit('partners search', query);
	};
	self.Populate = function(data) {
    let _icon = null, _shadow = null;
    let curIndex = data.index==null ? Markers.Unique_Index() : data.index;
    switch (data.icon) {
      case 0: // Music
        _icon = Icons.Industry.Music.Icon;
        _shadow = Icons.Shadow;
        break;
      case 1: // Entertainment
        _icon = Icons.Industry.Entertainment.Icon;
        _shadow = Icons.Shadow;
        break;
      case 2: // Cosmetics
        _icon = Icons.Industry.Cosmetics.Icon;
        _shadow = Icons.Shadow;
        break;
      case 3: // Media
        _icon = Icons.Industry.Media.Icon;
        _shadow = Icons.Shadow;
        break;
      case 4: // Food
        _icon = Icons.Places.Restaurant.Icon;
        _shadow = Icons.Shadow;
        break;
      case 5: // Coffee
        _icon = Icons.Industry.Coffee.Icon;
        _shadow = Icons.Shadow;
        break;
      default:
        _icon = data.icon;
        // _icon = data.icon.Icon;
        // _shadow = data.icon.Shadow;
        break;
    }
    if(_shadow!=null)
		  Markers.Add({
  			lat: data.lat,
  			lng: data.lng,
  			icon: _shadow
  		});
		Markers.Add({
      index: curIndex,
			lat: data.lat,
			lng: data.lng,
			icon: _icon,
			content: data.content
		});
	};
  self.Directions = function(dest, forceMyLocation) {
		socket.emit('partners take me', {
      name: '^'+dest.name
		});
    if(forceMyLocation==null) return;
    myLocation = forceMyLocation;
  };
  self.Set_Location = function(loc) {
    myLocation = loc;
  };
  self.Take_Me = function(dest) {
    dest = Markers.Grab(dest);
    if(dest==null) return;
    destLocation = dest.Options().position;
    calculateAndDisplayRoute(myLocation, destLocation);
  };
  self.Locate_Me = function() {
    // Try HTML5 geolocation or throw error
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        myLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(myLocation);
        let timeoutReposition = function() {
          if(killPosUpdate) return;
          navigator.geolocation.getCurrentPosition(function(position) {
            myLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setTimeout(function() {
              timeoutReposition();
            }, timePerTick);
            if(destLocation==null) return;
            if(destLocation.lat==null || destLocation.lng==null) return;
            calculateAndDisplayRoute(myLocation, destLocation);
          });
        };
        setTimeout(function() {
          timeoutReposition();
        }, timePerTick);
      }, function() {
        handleLocationError(true, map.getCenter());
      });
    } else handleLocationError(false, map.getCenter());
  };
  self.Close_Info = function() {
    Markers.Close_Info();
  };
  self.Relocate = function(_location) {
    if(_location==null) return;
    _location = JSON.parse(_location);
    if(_location.lat==null || _location.lat==null) return;
    myLocation = {
      lat: _location.lat,
      lng: _location.lng
    };
    if(destLocation==null) return;
    if(destLocation.lat==null || destLocation.lng==null) return;
    calculateAndDisplayRoute(myLocation, destLocation);
  };

  function calculateAndDisplayRoute(pointA, pointB) {
    for (i = 0; i < markerArray.length; i++) {
      markerArray[i].setMap(null);
    }
    directionsService.route({
      origin: pointA,
      destination: pointB,
      avoidTolls: true,
      avoidHighways: false,
      travelMode: google.maps.TravelMode.DRIVING
    }, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        showSteps(response);
      } else {
        let infoWindow = new google.maps.InfoWindow;
        infoWindow.setPosition(pos);
        infoWindow.setContent('Directions request failed due to ' + status);
        infoWindow.open(map);
      }
    });
  }
  function showSteps(directionResult) {
    let myRoute = directionResult.routes[0].legs[0];

    for (let i = 0; i < myRoute.steps.length; i++) {
      let marker = new google.maps.Marker({
        position: myRoute.steps[i].start_point,
        map: map
      });
      attachInstructionText(marker, myRoute.steps[i].instructions);
      markerArray[i] = marker;
    }
  }
  function attachInstructionText(marker, text) {
    google.maps.event.addListener(marker, 'click', function() {
      stepDisplay.setContent(text);
      stepDisplay.open(map, marker);
    });
  }
  function handleLocationError(browserHasGeolocation, pos) {
    let infoWindow = new google.maps.InfoWindow;
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }
};
