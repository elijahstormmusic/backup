/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project

window.onload = function(){
  const location = window.location.href.split('?')[1] || '$2a$10$b9sieTweZHT8OW.2tDX.BuIOT5lhmDldkmF6kgY7PPMLufbrJOJG6';

  let socket;
  if (typeof io!=='undefined') {
    socket = io();

    socket.emit('posts get display data', {
      link: location,
    });
  }

  socket.on('message', function(data){
		if (data.type==null) return;

    if (data.type==806) {
      deliverContent(data.response);
    }
	});

  function deliverContent(post) {

    document.getElementById('content-username').innerHTML = post.user.name;
    document.getElementById('content-user-pic').style.backgroundImage = `url(https://res.cloudinary.com/arrival-kc/image/upload/${post.user.pic})`;
    document.getElementById('content-user-href').onclick = function() {
      window.location.href = `../u?${post.user.link}`;
    };

    if (post.display.post_type==0) {
      let img = document.createElement('img');
      img.style.width = '100%';
      img.src = 'https://res.cloudinary.com/arrival-kc/image/upload/' + post.display.cloudlink;
      document.getElementById('content-display').appendChild(img);
    }
    else if (post.display.post_type==1) {

    }

    function _showTimeSinceDate(date) {
      let timeSince = new Date - date;
      let output = 'just now';

      const seconds = 1000;
      const minutes = seconds * 60;
      const hours = minutes * 60;
      const days = hours * 24;
      const months = days * 30;
      const years = months * 12;

      if (timeSince < seconds) return output;

      if (Math.floor(timeSince / years)==0) {
        if (Math.floor(timeSince / months)==0) {
          if (Math.floor(timeSince / days)==0) {
            if (Math.floor(timeSince / hours)==0) {
              if (Math.floor(timeSince / minutes)==0) {
                output = Math.floor(timeSince / seconds) + ' second';
                if (timeSince / seconds >= 2) output+='s';
                output+=' ago';
              } else {
                output = Math.floor(timeSince / minutes) + ' minute';
                if (timeSince / minutes >= 2) output+='s';
                output+=' ago';
              }
            } else {
              output = Math.floor(timeSince / hours) + ' hour';
              if (timeSince / hours >= 2) output+='s';
              output+=' ago';
            }
          } else {
            output = Math.floor(timeSince / days) + ' day';
            if (timeSince / days >= 2) output+='s';
            output+=' ago';
          }
        } else {
          output = Math.floor(timeSince / months) + ' month';
          if (timeSince / months >= 2) output+='s';
          output+=' ago';
        }
      } else {
        output = Math.floor(timeSince / years) + ' year';
        if (timeSince / years >= 2) output+='s';
        output+=' ago';
      }

      return output;
    }

    document.getElementById('content-helpers-username').innerHTML = post.user.name;
    document.getElementById('content-helpers-caption').innerHTML = post.display.caption;
    document.getElementById('content-helpers-username').style.fontSize = '16px';
    document.getElementById('content-helpers-caption').style.fontSize = '16px';

    document.getElementById('content-helpers-likes').innerHTML = post.display.likes;
    if (post.display.likes == 0) document.getElementById('content-helpers-likes-container').style.display = 'none';


    document.getElementById('content-helpers-upload_date').innerHTML = _showTimeSinceDate(new Date(post.display.date));
    document.getElementById('content-helpers-location').innerHTML = post.display.location.name;
    document.getElementById('content-helpers-upload_date').style.fontSize = '11px';
    document.getElementById('content-helpers-location').style.fontSize = '11px';

    let commentsContianer = document.createElement('div');
    commentsContianer.style.textAlign = 'left';

    for (let i=0;i<post.comments.length;i++) {
      let comment = document.createElement('div');
      comment.style.margin = '4px 4px 12px 4px';

      let name = document.createElement('p');
      name.style.fontWeight = 'bold';
      name.innerHTML = post.comments[i].username + '&nbsp;&nbsp;';
      name.style.display = 'inline';
      name.style.fontSize = '12px';
      comment.appendChild(name);

      let content = document.createElement('p');
      content.innerHTML = post.comments[i].content;
      content.style.display = 'inline';
      content.style.fontSize = '12px';
      comment.appendChild(content);

      comment.appendChild(document.createElement('br'));

      let date = document.createElement('p');
      date.innerHTML = _showTimeSinceDate(new Date(post.comments[i].date));
      date.style.fontSize = '8px';
      date.style.display = 'inline-block';
      date.style.margin = '0px';
      date.style.width = '49.9999%';
      comment.appendChild(date);

      let votes = document.createElement('p');
      votes.innerHTML = post.comments[i].votes + ' likes';
      votes.style.fontSize = '8px';
      votes.style.display = 'inline';
      votes.style.width = '49.9999%';
      comment.appendChild(votes);

      commentsContianer.appendChild(comment);
    }

    document.getElementById('content-helpers-comments').appendChild(commentsContianer);
  }

  // deliverContent({
  //   comments: [{
  //     userlink: "$2a$10$Rp/69d3v7kHVexkguXSJPuvn3CB.Wr4.Jo4zLIFtZIbN9GOqupX1G",
  //     username: "Kxng_sutton",
  //     content: "Half Mosquito ",
  //     reply_index: "8dOYe66jN",
  //     date: '2020-11-23T13:34:25.496+00:00',
  //     votes: 0,
  //   },{
  //     userlink: "$2a$10$Rp/69d3v7kHVexkguXSJPuvn3CB.Wr4.Jo4zLIFtZIbN9GOqupX1G",
  //     username: "Kxng_sutton",
  //     content: "Half Mosquito ",
  //     reply_index: "8dOYe66jN",
  //     date: '2020-11-23T13:34:25.496+00:00',
  //     votes: 0,
  //   },{
  //     userlink: "$2a$10$Rp/69d3v7kHVexkguXSJPuvn3CB.Wr4.Jo4zLIFtZIbN9GOqupX1G",
  //     username: "Kxng_sutton",
  //     content: "Half Mosquito ",
  //     reply_index: "8dOYe66jN",
  //     date: '2020-11-23T13:34:25.496+00:00',
  //     votes: 0,
  //   },],
  //   display: {
  //     caption: "Late night city life 🌇",
  //     cloudlink: "v1606002790/posts/Elijah/IMG_20200808_020551.jpg",
  //     cryptlink: "$2a$10$b9sieTweZHT8OW.2tDX.BuIOT5lhmDldkmF6kgY7PPMLufbrJOJG6",
  //     date: "2020-11-21T23:45:50.277Z",
  //     likes: 0,
  //     location: {name: "", lat: 39.1439117, lng: -94.5785244},
  //     post_type: 0,
  //     views: 3,
  //   },
  //   user: {
  //     link: "$2a$10$B0e9sUyPOL3kzYAxYRJM4.PQJKvJNOTQttARlloCeLMQb9139Qnnu",
  //     name: "Elijah",
  //     pic: "v1604857281/profile/Elijah/Elijah690762_1604857278732.jpg",
  //   },
  // });
};

function validateSession() {
  const user = document.getElementById('username').value;
  const auth = document.getElementById('auth_key').value;
  const pass = document.getElementById('pass').value;
  socket.emit('internal validate', {
    name: user,
    auth: auth,
    pass: pass,
    type: 'upload',
  });
}

function timestamp(){
	let str = '';
	for (let i in arguments)
	{
		str+=arguments[i]+' ';
	}
	console.log(new Date().toLocaleTimeString(),'->',str);
}
