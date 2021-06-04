/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project

let article_images = [];
let cloudinary;
function biggerDisplay(element_src) {
  document.getElementById('img01').src = element_src;
  document.getElementById('modal01').style.display = 'block';
}
function killImage(index) {
  saved_img_index = null;

  document.getElementById(index).remove();
  article_images.splice(parseInt(index.replace('arrival_index', '')), 1);
  document.getElementById('imageUploadLabel').innerHTML
    = article_images.length + ' files chosen';
}

let socket;
if (typeof io!=='undefined'){socket = io();}
window.onload = function(){
	socket.on('message', function(data){
		if (data.type==null)return;

    if (data.type==525) {
      document.getElementById('LOGIN').className+= ' hidden';
      document.getElementById('ARTICLE_FORM1').className = '';
      document.getElementById('header').innerHTML = 'Arrival Article Interface';
      cloudinary = data.response;
    }

    else if(data.type==520) {
      document.getElementById('ARTICLE_FORM1').className = 'hidden';
      document.getElementById('ARTICLE_FORM2').className = 'hidden';
      document.getElementById('ARTICLE_FORM3').className = 'hidden';
      document.getElementById('ARTICLE_FORM4').className = 'hidden';
      document.getElementById('ARTICLE_FORM5').className = '';
    }
	});

  document.getElementById('input_image').onchange = function(e) {
    saved_img_index = null;

    for (let i=0;i<e.target.files.length;i++) {
      let element = document.createElement('div');
      element.id = 'arrival_index' + i;
      element.className = 'img_el_box';

      let ex_button = document.createElement('div');
      ex_button.className = 'img_del_btn w3-red';
      ex_button.onclick = function() {
        killImage(element.id);
      };
      ex_button.innerHTML = 'X';

      let cur_img = document.createElement('img');
      cur_img.src = URL.createObjectURL(e.target.files[i]);
      cur_img.className = 'img_disp';
      cur_img.onclick = function() {
        biggerDisplay(cur_img.src);
      };

      element.appendChild(cur_img);
      element.appendChild(ex_button);
      document.getElementById('image_holder').appendChild(element);

      article_images.push(cur_img.src);
    }

    document.getElementById('imageUploadLabel').innerHTML
        = article_images.length + ' files chosen';
  };
};

function validateSession() {
  const user = document.getElementById('username').value;
  const auth = document.getElementById('auth_key').value;
  const pass = document.getElementById('pass').value;
  socket.emit('internal validate', {
    name: user,
    auth: auth,
    pass: pass,
  });
}

let saved_img_index;
function sendArticleToDatabase() {
  if (cloudinary==null) {
    alert('There was an error connecting to the database.');
    return;
  }
  let test = confirm('Confirm you want to send this article? It will be live once you hit Yes.');
  if (!test) return;

  const user = document.getElementById('username').value;
  const auth = document.getElementById('auth_key').value;
  const pass = document.getElementById('pass').value;
  const title = document.getElementById('input_title').value.replace(/\s+/g, ' ');
  const author = document.getElementById('input_author').value.replace(/\s+/g, ' ');
  const date_test = document.getElementById('input_date').value;
  const date = date_test=='' ? (new Date().getYear()+'/'+new Date().getMonth()+'/'+new Date().getDate()) : date_test;
  const topic = document.getElementById('input_topic').value.replace(/\s+/g, ' ');
  const article_input = document.getElementById('input_article').value;
  const id = title.replaceAll(' ', '').toLowerCase() + Math.floor(Math.random()*10+1).toString();
  let parseDate = function(s) {
    var b = s.split(/\D/);
    return new Date(b[0], --b[1], b[2]);
  };

  let article_array = article_input.replace(/\n\s*\n/g, '\n').split('\n');
  for (let i=0;i<article_array.length;i++) {
    article_array[i] = {
      type: 0,
      content: article_array[i],
    };
  }
  if (article_array[0].content=='') article_array.splice(0, 1);
  if (article_array[article_array.length-1].content=='')
    article_array.splice(article_array.length-1, 1);

  for (let i=1;i<saved_img_index.length;i++) {
    article_array.splice(saved_img_index[i].index + 1, 0, {
      type: 1,
      content: i,
    });
  }

  const url = 'https://api.cloudinary.com/v1_1/'+cloudinary.cloud_name+'/image/upload';
  const folder_path = 'articles/' + date.replaceAll('-', '_') + '/' + id.substring(0, 10);

  let uploadImages = function(files) {
    showUploadScreen();
    const formData = new FormData();
    let images = new Array(files.length);

    let socketData = function() {
      socket.emit('article upload', {
        name: user,
        auth: auth,
        pass: pass,
      }, {
        id: id,
        title: title,
        author: author,
        date: parseDate(date),
        topic: topic,
        body: article_array,
        images: images,
      });
    };
    let reflowUpload = function(i, limit) {
      updateUploadProgress(i / limit);
      if (i>=limit) {
        socketData();
        return;
      }

      let file = files[i];
      formData.append('file', file);
      formData.append('folder', folder_path);
      formData.append('upload_preset', cloudinary.preset);

      fetch(url, {
        method: 'POST',
        body: formData
      })
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          let url = JSON.parse(data).secure_url
            .replace('https://res.cloudinary.com/arrival-kc/image/upload/', '');

          images[i] = url;

          reflowUpload(i + 1, limit);
        });
    };

    reflowUpload(0, files.length);
  };

  uploadImages(document.querySelector('#input_image').files);
}

function nextPage() {
  if (cloudinary==null) {
    alert('There was an error connecting to the database.');
    return;
  }

  document.getElementById('ARTICLE_FORM1').className = 'hidden';
  document.getElementById('ARTICLE_FORM2').className = '';
}
function lastPage() {
  document.getElementById('ARTICLE_FORM2').className = 'hidden';
  document.getElementById('ARTICLE_FORM1').className = '';
}
function updateUploadProgress(progress) {
  document.getElementById('progress-value').style.width = (progress * 100).toString() + '%';
}
function showUploadScreen() {
  document.getElementById('LOGIN').className = 'hidden';
  document.getElementById('ARTICLE_FORM3').className = 'hidden';
  document.getElementById('ARTICLE_FORM4').className = '';
}
function backToDataPage() {
  document.getElementById('ARTICLE_FORM3').className = 'hidden';
  document.getElementById('ARTICLE_FORM2').className = '';
}
function confirmPage() {
  if (cloudinary==null) {
    alert('There was an error connecting to the database.');
    return;
  }
  if (document.getElementById('input_article').value=='') {
    alert('There needs to be content in order to upload.');
    return;
  }

  if (article_images.length==0) {
    alert('You must have at least one picture, for the header image.');
    return;
  }
  document.getElementById('ARTICLE_FORM2').className = 'hidden';
  document.getElementById('ARTICLE_FORM3').className = '';

  if (saved_img_index==null) {
    saved_img_index = new Array(article_images.length);
    for (let i=0;i<article_images.length;i++) {
      saved_img_index[i] = {
        index: (i-1) * 2,
        src: article_images[i],
      };
    }
  }

  reflow_example();
}
function reflow_example() {
  const article_element = document.getElementById('article_example');
  let expired = article_element.children;
  while(expired.length>0) {
    expired[0].remove();
  }

  const article_input = document.getElementById('input_article').value;
  const title = document.getElementById('input_title').value.replace(/\s+/g, ' ');
  const author = document.getElementById('input_author').value.replace(/\s+/g, ' ');
  const date = document.getElementById('input_date').value;

  let article_array = article_input.replace(/\n\s*\n/g, '\n').split('\n');
  for (let i=0;i<article_array.length;i++) {
    article_array[i] = {
      type: 0,
      content: article_array[i],
    };
  }
  if (article_array[0].content=='') article_array.splice(0, 1);
  if (article_array[article_array.length-1].content=='')
    article_array.splice(article_array.length-1, 1);

  for (let i=1;i<saved_img_index.length;i++) {
    article_array.splice(saved_img_index[i].index + 1, 0, {
      type: 1,
      content: i,
    });
  }


  let header_disp = document.createElement('img');
  header_disp.src = saved_img_index[0].src;
  header_disp.id = 'ex-header-img';
  article_element.appendChild(header_disp);

  let title_disp = document.createElement('h1');
  title_disp.innerHTML = title;
  article_element.appendChild(title_disp);

  let author_disp = document.createElement('p');
  author_disp.innerHTML = author;
  author_disp.style.fontStyle = 'italic';
  author_disp.style.fontWeight = 'bold';
  author_disp.style.display = 'inline';
  article_element.appendChild(author_disp);

  let date_disp = document.createElement('p');
  date_disp.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;' + date;
  date_disp.style.fontStyle = 'italic';
  date_disp.style.display = 'inline';
  article_element.appendChild(date_disp);
  article_element.appendChild(document.createElement('br'));

  for (let i=0,para_index=0;i<article_array.length;i++) {
    if (article_array[i].type==0) {  // body
      let paragraph = document.createElement('p');
      paragraph.className = 'example-para';
      paragraph.innerHTML = article_array[i].content;

      para_index++;
      article_element.appendChild(paragraph);
    }
    else if (article_array[i].type==1) {  // image
      let container = document.createElement('div');
      container.className = 'example-img-' + (para_index%2==0 ? 'R' : 'L')
        + (i==article_array.length-1 ? ' force-no-float' : '');
      container.id = 'ex-img-flow'+article_array[i].content;
      if(i<article_array.length-1)
      if(article_array[i+1].type==1)
        container.className += ' force-no-float';

      let image = document.createElement('img');
      image.className = 'ex-img';
      image.src = saved_img_index[article_array[i].content].src;

      let up_button = document.createElement('div');
      up_button.className = 'img_del_btn ex-ar-up w3-green';
      up_button.onclick = function() {
        let index = parseInt(container.id.replace('ex-img-flow', ''));
        if(saved_img_index[index].index<=0) {
          let switcher = saved_img_index[0].src;
          saved_img_index[0].src = saved_img_index[index].src;
          saved_img_index[index].src = switcher;

          let files = document.querySelector('#input_image').files;
          switcher = files[0];
          files[0] = files[index];
          files[index] = switcher;

          reflow_example();
          return;
        }
        saved_img_index[index].index--;
        reflow_example();
      };
      up_button.innerHTML = '↑';

      let down_button = document.createElement('div');
      down_button.className = 'img_del_btn ex-ar-down w3-blue';
      down_button.onclick = function() {
        let index = parseInt(container.id.replace('ex-img-flow', ''));
        if(saved_img_index[index].index
          >= article_array.length-saved_img_index.length+index-1) return;
        saved_img_index[index].index++;
        reflow_example();
      };
      down_button.innerHTML = '↓';

      container.appendChild(image);
      container.appendChild(up_button);
      container.appendChild(down_button);
      article_element.appendChild(container);
    }
    else if (article_array[i].type==2) {  // quote
      let quote = document.createElement('p');
      paragraph.className = 'example-quoute';
      quote.innerHTML = article_array[i].content;

      article_element.appendChild(quote);
    }
  }

  article_element.appendChild(document.createElement('br'));
  let author_disp2 = document.createElement('p');
  author_disp2.innerHTML = author;
  author_disp2.style.fontStyle = 'italic';
  author_disp2.style.fontWeight = 'bold';
  article_element.appendChild(author_disp2);

  let date_disp2 = document.createElement('p');
  date_disp2.innerHTML = date;
  date_disp2.style.fontStyle = 'italic';
  article_element.appendChild(date_disp2);
}

function timestamp(){
	let str = '';
	for (let i in arguments)
	{
		str+=arguments[i]+' ';
	}
	console.log(new Date().toLocaleTimeString(),'->',str);
}
