/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project

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
window.onload = function(){
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
        image.style.cursor = 'pointer';
        image.onclick = function() {
          openPartnerDataForm(index.link);
        };

        let link = document.createElement('p');
        link.className = 'w3-button w3-hover-red ar-pallette-blue w3-round-xlarge ar-text-white ar-align-center';
        link.innerHTML = 'Update this Entry';
        link.onclick = function() {
          openPartnerDataForm(index.link);
        };

        let delete_btn = document.createElement('p');
        delete_btn.className = 'w3-margin-left w3-button w3-hover-blue ar-pallette-red w3-round-xlarge ar-text-white ar-align-center';
        delete_btn.innerHTML = 'Delete this Entry';
        delete_btn.onclick = function() {
          if (!confirm('This action will have to be approved before it takes affect. Please alert someone if you are planning to do this.')) return;

          serve('delete', {
            link: index.link,
          });
        };

        search_card.appendChild(close_btn);
        search_card.appendChild(title);
        search_card.appendChild(image);
        search_card.appendChild(info);
        search_card.appendChild(link);
        search_card.appendChild(delete_btn);

        container.appendChild(search_card);
      }
    }
    else if (data.type==810) {  // download editable data
      const partner = data.response;
      partner_link = partner.cryptlink;

      document.querySelector("#input_title").value = partner.name;
      document.querySelector("#input_info").value = partner.info;
      document.querySelector("#input_lat").value = partner.lat;
      document.querySelector("#input_lng").value = partner.lng;

      document.querySelector("#input_industry").value = convertFromIndustry(partner.industry);
      document.querySelector('#input_priceRange').value = partner.priceRange;

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

      for (let i=0;i<partner.sales.length;i++) {
        addPromotion({
          link: partner.sales[i].link,
          title: partner.sales[i].name,
          info: partner.sales[i].info,
          img: `https://res.cloudinary.com/arrival-kc/image/upload/${partner.sales[i].img}`,
        });
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

  document.getElementById('sale_image').onchange = function(e) {
    if (currently_editing_sale_index==null) return;

    if (sales_list[currently_editing_sale_index].original_image==null) {
      sales_list[currently_editing_sale_index].original_image
          = sales_list[currently_editing_sale_index].img.src;
    }
    sales_list[currently_editing_sale_index].img.src = URL.createObjectURL(e.target.files[0]);
    sales_list[currently_editing_sale_index].file = e.target.files[0];

    document.getElementById('sales_show_hide_undo_img').className = '';
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
  if (value=='diner') return 1;
  if (value=='fastfood') return 2;
  if (value=='coffee') return 3;
  if (value=='bar') return 4;
  if (value=='musicstu') return 5;
  if (value=='musicshop') return 6;
  if (value=='photostu') return 7;
  if (value=='hair') return 8;
  if (value=='clothing') return 9;
  if (value=='shoes') return 10;
  return 0;
}
function  convertFromIndustry(value) {
  if (value==1) return 'diner';
  if (value==2) return 'fastfood';
  if (value==3) return 'coffee';
  if (value==4) return 'bar';
  if (value==5) return 'musicstu';
  if (value==6) return 'musicshop';
  if (value==7) return 'photostu';
  if (value==8) return 'hair';
  if (value==9) return 'clothing';
  if (value==10) return 'shoes';
  return 'none';
}
function  convertToContact(value) {
  const container = document.getElementById('contact-info-container');

  let json = {}, data_elements;

  for (let i=0;i<container.children.length;i++) {
    data_elements = container.children[i].children;
    if (data_elements.length!=3) continue;
    if (typeof data_elements[0].value!=='string') continue;
    if (typeof data_elements[1].value!=='string') continue;
    if (data_elements[1].value==='') continue;

    if (
      data_elements[0].value=='facebook' ||
      data_elements[0].value=='instagram' ||
      data_elements[0].value=='twitter'
    ) {
      if (data_elements[1].value.indexOf('.com/')!=-1) {
        data_elements[1].value = data_elements[1].value.substring(
          data_elements[1].value.indexOf('.com/') + 5
        ).replace('/', '');
      }
    }

    json[data_elements[0].value] = data_elements[1].value;
  }

  return json;
}
function  convertToSales(list) {
  for (let i=0;i<list.length;i++) {
    list[i] = {
      link: list[i].link,
      name: list[i].title,
      info: list[i].info,
      img: list[i].url,
    };
  }
  return list;
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
  else if (type=='delete') {
    socket.emit('partners delete', {
      date: new Date,
      name: user,
      auth: auth,
      pass: pass,
      type: 'delete request',
    }, {
      link: data.link,
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
      let _sale_updated_list = salesOutput();

      let socketData = function() {
        if (image_cloud_links.length==1) {
          image_cloud_links.push(image_cloud_links[0]);
        }

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
          priceRange: parseInt(document.querySelector('#input_priceRange').value),
          sales: convertToSales(_sale_updated_list),
        });
      };
      let reflowUpload = function(i, files_limit, sales_limit) {
        updateUploadProgress(i / (files_limit + sales_limit));

        if (i>=files_limit) {
          if (i>=files_limit + sales_limit) {
            socketData();
            return;
          }

          let index = i - files_limit;

          let file = _sale_updated_list[index].file;

          if (file==null) {
            _sale_updated_list[index].url = _sale_updated_list[index].img
              .replace('https://res.cloudinary.com/arrival-kc/image/upload/', '');

            reflowUpload(i + 1, files_limit, sales_limit);
            return;
          }

          formData.append('file', file);
          formData.append('folder', folder_path + '/sales');
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

              _sale_updated_list[index].url = url;

              reflowUpload(i + 1, files_limit, sales_limit);
            });
          return;
        }

        let file = files[i].file;

        if (file==null) {
          image_cloud_links[i] = files[i].link
            .replace('https://res.cloudinary.com/arrival-kc/image/upload/', '');
          reflowUpload(i + 1, files_limit, sales_limit);
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

            reflowUpload(i + 1, files_limit, sales_limit);
          });
      };

      reflowUpload(0, files.length, _sale_updated_list.length);
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
function openPartnerDataForm(cryptlink) {
  if (cloudinary==null) {
    alert('There was an error connecting to the database.');
    return;
  }

  if (cryptlink!=null) {
    serve('request', {
      link: cryptlink,
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
  option_pi.value = 'pinterest';
  option_pi.innerHTML = 'Pinterest';

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

let currently_editing_sale_index;
let sales_list = [];
function salesInputTextChange() {
  if (currently_editing_sale_index==null) return;

  const title_input = document.getElementById('sales_title').value;
  const info_input = document.getElementById('sales_info').value;

  sales_list[currently_editing_sale_index].title.innerHTML = title_input;
  sales_list[currently_editing_sale_index].info.innerHTML = info_input;
}
function salesOutput() {
  let list = [];

  for (let i=0;i<sales_list.length;i++) {
    if (sales_list[i].removed) continue;

    let data = {
      link: sales_list[i].link.innerHTML,
      title: sales_list[i].title.innerHTML,
      info: sales_list[i].info.innerHTML,
      img: sales_list[i].img.src,
    };
    if (sales_list[i].original_image!=null) {
      data.file = sales_list[i].file;
    }

    list.push(data);
  }

  return list;
}
function salesUndoImageChange() {
  sales_list[currently_editing_sale_index].img.src = sales_list[currently_editing_sale_index].original_image;
  sales_list[currently_editing_sale_index].original_image = null;
  sales_list[currently_editing_sale_index].file = null;
  document.getElementById('sales_show_hide_undo_img').className = 'hidden';
}
function addPromotion(inital_data) {
  if (currently_editing_sale_index!=null) {
    return;
  }

  let openEditor = inital_data==null;
  if (inital_data==null) inital_data = {
    link: '',
    title: 'Sales Promotion',
    info: 'short description',
    img: 'https://res.cloudinary.com/arrival-kc/image/upload/v1599325166/sample.jpg',
  };

  const container = document.getElementById('sales-data-container');
  const index = sales_list.length;

  let card = document.createElement('div');
  card.className = 'w3-round-xlarge ar-pallette-white ar-text-black w3-card sales-promotion';

  let img = document.createElement('img');
  img.className = 'sales-img';
  img.src = inital_data.img;

  let texts = document.createElement('div');
  texts.className = 'w3-panel';
  texts.style.height = '100px';
  texts.style.overflow = 'hidden';

  let title_strong = document.createElement('strong');
  let title_data = document.createElement('div');
  title_data.innerHTML = inital_data.title;
  title_strong.appendChild(title_data);

  let description = document.createElement('div');
  description.style.fontSize = 'smaller';
  description.innerHTML = inital_data.info;

  let cryptlink = document.createElement('div');
  cryptlink.style.display = 'none';
  cryptlink.innerHTML = inital_data.link;

  texts.appendChild(title_strong);
  texts.appendChild(description);
  texts.appendChild(cryptlink);

  let buttons = document.createElement('div');
  buttons.className = 'w3-panel';
  buttons.style.marginLeft = '4px';

  let edit = document.createElement('button');
  edit.className = 'ar-pallette-blue ar-hover-pallette-yellow w3-button w3-circle slide';
  edit.style.marginRight = '100px';

  let edit_icon = document.createElement('i');
  edit_icon.className = 'fas fa-edit';
  edit.appendChild(edit_icon);

  let remove = document.createElement('button');
  remove.className = 'ar-pallette-red ar-hover-pallette-yellow w3-button w3-circle slide';
  remove.disabled = true;

  let remove_icon = document.createElement('i');
  remove_icon.className = 'far fa-trash-alt';
  remove.appendChild(remove_icon);

  function click_edit() {
    card.className += ' editing';
    document.getElementById('promotion-editing-block').className = 'slide';
    document.getElementById('sales_title').value = title_data.innerHTML;
    document.getElementById('sales_info').value = description.innerHTML;
    edit_icon.className = 'fas fa-save';
    remove.disabled = false;
    currently_editing_sale_index = index;
    if (sales_list[index].original_image==null) {
      document.getElementById('sales_show_hide_undo_img').className = 'hidden';
    }
    else {
      document.getElementById('sales_show_hide_undo_img').className = '';
    }

    for (let i=0;i<sales_list.length;i++) {
      if (i==index) continue;
      sales_list[i].saved_btn.disabled = true;
    }
  }
  function stop_edit() {
    card.className = card.className.slice(0, card.className.indexOf(' editing'));
    document.getElementById('promotion-editing-block').className = 'slide slide-out';
    edit_icon.className = 'fas fa-edit';
    remove.disabled = true;
    currently_editing_sale_index = null;

    for (let i=0;i<sales_list.length;i++) {
      sales_list[i].saved_btn.disabled = false;
    }
  }

  edit.onclick = function() {
    if (card.className.includes('editing')) {
      stop_edit();
    }
    else {
      click_edit();
    }
  };
  remove.onclick = function() {
    sales_list[index].removed = true;
    card.remove();
    stop_edit();
  };

  buttons.appendChild(edit);
  buttons.appendChild(remove);

  card.appendChild(img);
  card.appendChild(texts);
  card.appendChild(buttons);

  container.appendChild(card);

  sales_list.push({
    card: card,
    link: cryptlink,
    title: title_data,
    info: description,
    saved_btn: edit,
    img: img,
  });

  if (openEditor) click_edit();
}

function viewConfirmPopup() {
  if (currently_editing_sale_index!=null) {
    alert('One promotion is currently being edited.');
    return;
  }
  if (
    document.querySelector("#input_title").value=='' ||
    document.querySelector("#input_info").value=='' ||
    document.querySelector("#input_lat").value=='' ||
    document.querySelector("#input_lng").value==''
  ) {
    alert('All of the fields are required.');
    return;
  }
  if (partner_images.length<=1) {
    alert('Please add images to this entry.');
    return;
  }
  if (document.querySelector("#input_request").value.length<10) {
    alert('Sorry, but a short reason has to be given in order to protect the integrity of Arrival and our partners. Your request may not be long enough.');
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

function timestamp(){
	let str = '';
	for (let i in arguments)
	{
		str+=arguments[i]+' ';
	}
	console.log(new Date().toLocaleTimeString(),'->',str);
}
