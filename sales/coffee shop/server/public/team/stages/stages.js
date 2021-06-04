/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project


// socket.send({
//   type: 1440,
//   data: staged_data,
// });

let partner_images = [];
let cloudinary, partner_link;
function biggerDisplay(element_src) {
  document.getElementById('img01').src = element_src;
  document.getElementById('modal01').style.display = 'block';
}
function killImage(index) {
  let remove_index = parseInt(index.replace('arrival_index', ''));

  document.getElementById(index).remove();

  for (let i=remove_index + 1;i<partner_images.length;i++) {
    document.getElementById('arrival_index' + i).id = 'arrival_index' + (i - 1);
  }

  partner_images.splice(remove_index, 1);

  document.getElementById('imageUploadLabel').innerHTML
    = partner_images.length + ' image' + (partner_images.length==1 ? '' : 's');
}
function closeParent(element) {
  element.parentElement.remove();
}
function splice(string, startToSplice, endToSplice) {
  return string.slice(0, startToSplice) + string.slice(startToSplice + endToSplice);
}

let socket;
if (typeof io!=='undefined'){socket = io();}
window.onload = function() {
	socket.on('message', function(data){
		if (data.type==null)return;

    if (data.type==525) {
      document.getElementById('LOGIN').className += ' hidden';
      document.getElementById('INTERNAL_FORM1').className = '';
      document.getElementById('header').innerHTML = 'Arrival Partner Interface';
      cloudinary = data.response;
    }

    else if (data.type==520) {
      document.getElementById('INTERNAL_FORM1').className = 'hidden';
      document.getElementById('INTERNAL_FORM2').className = 'hidden';
      document.getElementById('INTERNAL_FORM3').className = 'hidden';
      document.getElementById('INTERNAL_FORM4').className = 'hidden';
      document.getElementById('INTERNAL_FORM5').className = '';
    }

        //** Display search response */
    else if (data.type==500) { // error
      const container = document.querySelector("#search-partners-results");

      for (let i=0;i<container.childNodes.length;) {
        container.childNodes[0].remove();
      }

      let search_card = document.createElement('div');
      search_card.className = 'w3-panel w3-margin ar-pallette-cream w3-card w3-display-container ar-align-left';

      let close_btn = document.createElement('span');
      close_btn.className = 'w3-display-topright w3-padding w3-red ar-hover-pallette-red w3-button';
      close_btn.innerHTML = 'X';
      close_btn.onclick = function() {
        search_card.remove();
      };

      let title = document.createElement('p');
      title.className = 'ar-text-blue ar-center';
      title.innerHTML = 'No Search Results';

      search_card.appendChild(close_btn);
      search_card.appendChild(title);

      container.appendChild(search_card);
    }
    else if (data.type==300) { // success
      const container = document.querySelector("#search-partners-results");

      for (let i=0;i<container.childNodes.length;) {
        container.childNodes[0].remove();
      }

      for (let i=0;i<data.response.length;i++) {
        let index = data.response[i];

        let search_card = document.createElement('div');
        search_card.className = 'w3-panel w3-margin w3-round-xlarge ar-pallette-cream w3-card w3-display-container ar-align-left';

        let close_btn = document.createElement('span');
        close_btn.className = 'w3-display-topright w3-padding w3-margin w3-round-xlarge w3-red ar-hover-pallette-red w3-button';
        close_btn.innerHTML = 'X';
        close_btn.onclick = function() {
          search_card.remove();
        };

        let title = document.createElement('p');
        title.className = 'ar-text-blue ar-center';

        let title_string = '';
        if (index.highlight.length==0 || index.highlight==null) {
          title_string = index.name;
        }
        for (let h=0;h<index.highlight.length;h++) {
          if (index.highlight[h].type=='hit') {
            title_string += `<span class="ar-text-red">${index.highlight[h].value}</span>`;
          }
          else {
            title_string += index.highlight[h].value;
          }
        }
        title.innerHTML = title_string;
        title.style.cursor = 'pointer';
        title.onclick = function() {
          openPartnerDataForm(index.link);
        };

        let info = document.createElement('p');
        info.className = 'ar-text-black';
        info.innerHTML = index.info;

        let image = document.createElement('img');
        image.style.width = '150px';
        image.src = `https://res.cloudinary.com/arrival-kc/image/upload/${index.logo}`;

        let link = document.createElement('p');
        link.className = 'w3-button w3-hover-red ar-pallette-blue w3-round-xlarge ar-text-white ar-align-center';
        link.innerHTML = 'Update this Entry';
        link.onclick = function() {
          openPartnerDataForm(index.link);
        };

        search_card.appendChild(close_btn);
        search_card.appendChild(title);
        search_card.appendChild(image);
        search_card.appendChild(info);
        search_card.appendChild(link);

        container.appendChild(search_card);
      }
    }
    else if (data.type==810) {  // download editable data
      const partner = data.response;
      partner_link = partner.link;

      document.querySelector("#input_title").value = partner.name;
      document.querySelector("#input_info").value = partner.info;
      document.querySelector("#input_lat").value = partner.lat;
      document.querySelector("#input_lng").value = partner.lng;

      document.querySelector("#input_industry").value = convertFromIndustry(partner.industry);

      for (let i=0;i<partner.images.length;i++) {
        partner_images.push({
          link: `https://res.cloudinary.com/arrival-kc/image/upload/${partner.images[i]}`,
          file: null,
        });

        let element = document.createElement('div');
        element.id = 'arrival_index' + i;
        element.className = 'img_el_box';

        let ex_button = document.createElement('div');
        ex_button.className = 'img_del_btn w3-red';
        ex_button.innerHTML = 'X';
        ex_button.onclick = function() {
          killImage(element.id);
        };

        let cur_img = document.createElement('img');
        cur_img.src = partner_images[i].link;
        cur_img.className = 'img_disp';
        cur_img.onclick = function() {
          biggerDisplay(cur_img.src);
        };

        element.appendChild(cur_img);
        element.appendChild(ex_button);
        document.getElementById('image_holder').appendChild(element);
      }

      document.getElementById('imageUploadLabel').innerHTML
          = partner_images.length + ' image' + (partner_images.length==1 ? '' : 's');

      for (let key in partner.contact) {
        if (partner.contact.hasOwnProperty(key)) {
          addContactInfo(key, partner.contact[key]);
        }
      }

      document.getElementById('INTERNAL_FORM3').className = 'hidden';
      document.getElementById('INTERNAL_FORM2').className = '';
    }
	});

  document.getElementById('input_image').onchange = function(e) {
    for (let i=0;i<e.target.files.length;i++) {
      let element = document.createElement('div');
      element.id = 'arrival_index' + partner_images.length;
      element.className = 'img_el_box';

      let ex_button = document.createElement('div');
      ex_button.className = 'img_del_btn w3-red';
      ex_button.innerHTML = 'X';
      ex_button.onclick = function() {
        killImage(element.id);
      };

      let cur_img = document.createElement('img');
      cur_img.src = URL.createObjectURL(e.target.files[i]);
      cur_img.className = 'img_disp';
      cur_img.onclick = function() {
        biggerDisplay(cur_img.src);
      };

      element.appendChild(cur_img);
      element.appendChild(ex_button);
      document.getElementById('image_holder').appendChild(element);

      partner_images.push({
        link: cur_img.src,
        file: e.target.files[i],
      });
    }

    document.getElementById('imageUploadLabel').innerHTML
        = partner_images.length + ' image' + (partner_images.length==1 ? '' : 's');
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
    type: 'change request',
  });
}

function  convertToIndustry(value) {
  if (value=='diner') return 0;
  if (value=='fastfood') return 1;
  if (value=='coffee') return 2;
  if (value=='bar') return 3;
  if (value=='musicstu') return 4;
  if (value=='musicshop') return 5;
  if (value=='photostu') return 6;
  if (value=='hair') return 7;
  if (value=='clothing') return 8;
  if (value=='shoes') return 9;
  return -1;
}
function  convertFromIndustry(value) {
  if (value==0) return 'diner';
  if (value==1) return 'fastfood';
  if (value==2) return 'coffee';
  if (value==3) return 'bar';
  if (value==4) return 'musicstu';
  if (value==5) return 'musicshop';
  if (value==6) return 'photostu';
  if (value==7) return 'hair';
  if (value==8) return 'clothing';
  if (value==9) return 'shoes';
  return 'none';
}
function  convertToContact(value) {
  const container = document.getElementById('contact-info-container');

  let json = {}, data_elements;

  for (let i=0;i<container.children.length;i++) {
    data_elements = container.children[i].children;
    if (data_elements.length!=3) continue;
    if (typeof(data_elements[0].value)!=='string') continue;
    if (typeof(data_elements[1].value)!=='string') continue;
    if (data_elements[1].value==='') continue;

    json[data_elements[0].value] = data_elements[1].value;
  }

  return json;
}
function  convertToSales(value) {
  return 0;
}

let serverAskTimestamp = new Date;
function cleanQuery(input) {
  if (input.length>30) {
    return '';
  }
  return input;
}
function serve(type, data) {
  const requestLimit = 1*1000;
  let currentTime = new Date;

  if (currentTime-serverAskTimestamp <= requestLimit) {
    setTimeout(function() {
      serve(type, data);
    }, (requestLimit) - (currentTime - serverAskTimestamp));
    return;
  }

  if (type=='search') {
    data.query = cleanQuery(data.query);
    if (data.query.length<2) return;

    socket.emit('partners search', {
      name: data.query,
    });
  }
  else if (type=='request') {
    if (data.link==null || data.link=='') return;

    socket.emit('partners get', {
      link: data.link
    });
  }
  else if (type=='upload') {
    if (cloudinary==null) {
      alert('There was an error connecting to the database.');
      return;
    }
    if (!confirm('It\'s important we get this right. ' +
        'We recommend double checking your details. ' +
        'When you\'re ready, press OK to submit your changes.')) return;

    const user = document.getElementById('username').value;
    const auth = document.getElementById('auth_key').value;
    const pass = document.getElementById('pass').value;
    const url = 'https://api.cloudinary.com/v1_1/'+cloudinary.cloud_name+'/image/upload';
    const folder_path = 'partners/' + document.querySelector("#input_title").value.substring(0, 10);

    let uploadImages = function(files) {
      viewUploadingProgress();

      const formData = new FormData();
      let image_cloud_links = new Array(files.length);

      let socketData = function() {
        socket.emit('partners upload', {
          date: new Date,
          name: user,
          auth: auth,
          pass: pass,
          type: 'change request',
          request: document.querySelector("#input_request").value,
        }, {
          link: partner_link,
          id: new Date().toString(),
          name: document.querySelector("#input_title").value,
          info: document.querySelector("#input_info").value,
          lat: parseFloat(document.querySelector("#input_lat").value),
          lng: parseFloat(document.querySelector("#input_lng").value),
          imagelinks: image_cloud_links,
          industry: convertToIndustry(document.querySelector("#input_industry").value),
          contact: convertToContact(document.querySelector("#contact-info-container")),
          sales: convertToSales(document.querySelector("#sales-info-container")),
        });
      };
      let reflowUpload = function(i, limit) {
        updateUploadProgress(i / limit);
        if (i>=limit) {
          socketData();
          return;
        }

        let file = files[i].file;

        if (file==null) {
          image_cloud_links[i] = files[i].link
            .replace('https://res.cloudinary.com/arrival-kc/image/upload/', '');
          reflowUpload(i + 1, limit);
          return;
        }

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

            image_cloud_links[i] = url;

            reflowUpload(i + 1, limit);
          });
      };

      reflowUpload(0, files.length);
    };

    uploadImages(partner_images);
  }
  else if (type=='test') {
    console.log('in here');
  }

  serverAskTimestamp = currentTime;
}

function focusAndBlink(element) {
  element.focus();
  element.className += ' act';

  setTimeout(function() {
    let className = element.className;
    element.className = splice(className, className.indexOf(' act'), 4);
  }, 250);
}
function openPartnerDataForm(partner_link) {
  if (cloudinary==null) {
    alert('There was an error connecting to the database.');
    return;
  }

  if (partner_link!=null) {
    serve('request', {
      link: partner_link,
    });
    document.getElementById('INTERNAL_FORM1').className = 'hidden';
    document.getElementById('INTERNAL_FORM3').className = '';
    return;
  }

  addContactInfo();

  document.getElementById('INTERNAL_FORM1').className = 'hidden';
  document.getElementById('INTERNAL_FORM2').className = '';
}
function addContactInfo(initial_selection, initial_data_value) {
  const container = document.getElementById('contact-info-container');

  let panel = document.createElement('div');
  panel.className = 'w3-cell-row';

  let select = document.createElement('select');
  select.className = 'w3-cell w3-mobile textInput-half';

  let optgroup_loc = document.createElement('optgroup');
  optgroup_loc.label = 'Location';

  let option_ad = document.createElement('option');
  option_ad.value = 'address';
  option_ad.innerHTML = 'Address';

  let option_ci = document.createElement('option');
  option_ci.value = 'city';
  option_ci.innerHTML = 'City';

  let option_st = document.createElement('option');
  option_st.value = 'state';
  option_st.innerHTML = 'State';

  let option_zi = document.createElement('option');
  option_zi.value = 'zip';
  option_zi.innerHTML = 'Zip Code';

  optgroup_loc.appendChild(option_ad);
  optgroup_loc.appendChild(option_ci);
  optgroup_loc.appendChild(option_st);
  optgroup_loc.appendChild(option_zi);

  select.appendChild(optgroup_loc);

  let optgroup_onl = document.createElement('optgroup');
  optgroup_onl.label = 'Online';

  let option_we = document.createElement('option');
  option_we.value = 'website';
  option_we.innerHTML = 'Website';

  let option_ph = document.createElement('option');
  option_ph.value = 'phoneNumber';
  option_ph.innerHTML = 'Phone Number';

  let option_em = document.createElement('option');
  option_em.value = 'email';
  option_em.innerHTML = 'Email';

  let option_in = document.createElement('option');
  option_in.value = 'instagram';
  option_in.innerHTML = 'Instagram';

  let option_fb = document.createElement('option');
  option_fb.value = 'facebook';
  option_fb.innerHTML = 'Facebook';

  let option_tw = document.createElement('option');
  option_tw.value = 'twitter';
  option_tw.innerHTML = 'Twitter';

  let option_pi = document.createElement('option');
  option_pi.value = 'pintrest';
  option_pi.innerHTML = 'Pintrest';

  optgroup_onl.appendChild(option_we);
  optgroup_onl.appendChild(option_ph);
  optgroup_onl.appendChild(option_em);
  optgroup_onl.appendChild(option_in);
  optgroup_onl.appendChild(option_fb);
  optgroup_onl.appendChild(option_tw);
  optgroup_onl.appendChild(option_pi);

  select.appendChild(optgroup_onl);

  if (initial_selection!=null)
    select.value = initial_selection;

  let input = document.createElement('input');
  input.className = 'w3-cell w3-mobile textInput-half';
  input.type = 'text';

  if (initial_data_value!=null)
    input.value = initial_data_value;

  panel.appendChild(select);
  panel.appendChild(input);

  let divider = document.createElement('hr');
  divider.className = 'w3-rounded w3-margin w3-hide-large w3-hide-medium';

  panel.appendChild(divider);

  container.appendChild(panel);
}
function viewConfirmPopup() {
  if (
    document.querySelector("#input_title").value=='' ||
    document.querySelector("#input_info").value=='' ||
    document.querySelector("#input_lat").value=='' ||
    document.querySelector("#input_lng").value==''
  ) {
    alert('All of the fields are required.');
    return;
  }
  if (partner_images.length==0) {
    alert('Please add images to this entry.');
    return;
  }
  if (document.querySelector("#input_request").value.length<10) {
    alert('Sorry, but a short reason has to be given in order to protect the integrity of Arrival and our partners. You request may not be long enough.');
    focusAndBlink(document.querySelector('#input_request'));
    return;
  }

  serve('upload');
}
function viewUploadingProgress() {
  document.getElementById('INTERNAL_FORM2').className = 'hidden';
  document.getElementById('INTERNAL_FORM4').className = '';
}
function updateUploadProgress(progress) {
  document.getElementById('progress-value').style.width = (progress * 100).toString() + '%';
}

let lastInputChange;
function searchTextChange() {
  const delayTime = 1000;
  lastInputChange = new Date;

  setTimeout(function() {
    let currentTime = new Date;

    if (currentTime-lastInputChange < delayTime) {
      return;
    }

    serve('search', {
      query: document.getElementById('search-partner-input').value,
    });
  }, delayTime);
}

function timestamp() {
	let str = '';
	for (let i in arguments)
	{
		str+=arguments[i]+' ';
	}
	console.log(new Date().toLocaleTimeString(),'->',str);
}
