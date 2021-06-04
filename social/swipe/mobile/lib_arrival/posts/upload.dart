/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project

import 'dart:math';
import 'dart:async';
import 'dart:io';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:path/path.dart' show join;
import 'package:path_provider/path_provider.dart';
import 'package:media_gallery/media_gallery.dart';
import 'package:photo_view/photo_view.dart';
import 'package:video_player/video_player.dart';
import 'package:flutter/scheduler.dart';
import 'cloudinary/cloudinary_client.dart';
// import 'package:cloudinary_client/cloudinary_client.dart';
import 'package:flutter_speed_dial/flutter_speed_dial.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:scoped_model/scoped_model.dart';

import '../data/socket.dart';
import '../data/link.dart';
import '../data/preferences.dart';
import '../users/data.dart';
import '../widgets/close_button.dart';
import '../foryou/foryou.dart';
import '../screens/home.dart';
import '../maps/locator.dart';
import '../styles.dart';
import '../const.dart';
import 'video.dart';
import 'uploader/media.dart';
import 'uploader/picker/picker.dart';
import 'uploader/picker/selection.dart';
import 'uploader/picker/thumbnail.dart';
import 'uploader/picker/collections.dart';
import 'uploader/picker/labels.dart';
import 'uploader/picker/selection.dart';


class PostUploadEditingScreen extends StatefulWidget {
  final File upload_single;
  final List<File> upload_collection;

  PostUploadEditingScreen(this.upload_single)
    : assert(upload_single != null),
      upload_collection = null;

  PostUploadEditingScreen.collection(this.upload_collection)
    : assert(upload_collection != null),
      upload_single = null;

  @override
  _UploadEditingState createState() => new _UploadEditingState();
}
class _UploadEditingState extends State<PostUploadEditingScreen> {
  bool isLoading;
  var post_loc;
  bool _track_with_ana;
  String caption;
  bool _already_uploaded = false;

  TextEditingController _captionInput;
  CloudinaryClient _cloudinary_client =
    new CloudinaryClient('868422847775537', 'QZeAt-YmyaViOSNctnmCR0FF61A', 'arrival-kc');

  @override
  void initState() {
    isLoading = false;
    _track_with_ana = false;
    post_loc = {
      'name': '',
      'lat': 39.1439117,
      'lng': -94.5785244,
    };
    caption = '';
    _captionInput = TextEditingController();
    super.initState();
  }
  @override
  void dispose() {
    _captionInput.dispose();
    super.dispose();
  }


  Future<Map<String, dynamic>> _uploadMedia(File _media, bool isVideo) async {
    if (_media == null) return {
      'link': '',
    };

    setState(() {
      isLoading = true;
    });

    try {
      var media_data;

      if (isVideo) {
        media_data = await _cloudinary_client.uploadVideo(
          _media.path,
          folder: 'posts/' + UserData.client.cryptlink,
        );
      }
      else {
        media_data = await _cloudinary_client.uploadImage(
          _media.path,
          folder: 'posts/' + UserData.client.cryptlink,
        );
      }

      return {
        'link': media_data.secure_url.replaceAll(
                  Constants.media_source, ''
                ),
        'height': media_data.height,
        // 'duration': media_data.duration==null ? null : media_data.duration,
      };
    } catch (e) {
      print('''
      =====================================
                  Arrival Error
          $e
      =====================================
      ''');
    }

    return {
      'link': '',
    };
  }

  bool _isUnacceptableFile(File _media) {
    var length = _media.path.length;
    String extension = _media.path.substring(length-4, length);

    return (extension=='.gif');
  }
  bool _isVideo(File _media) {
    var length = _media.path.length;
    String extension = _media.path.substring(length-4, length);

    return (extension=='.mp4' || extension=='.mov' || extension=='.avi'
          || extension=='.wmv');
  }


  Map<String, double> _settingsValues = {
    'padding': 8.0,
    'devider': 1.0,
    'text size': 16.0,
  };
  Widget _buildAdvancedSettingsButton(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        vertical: _settingsValues['padding'] * 1.5,
        horizontal: _settingsValues['padding'] * 3,
      ),
      child: GestureDetector(
        onTap: () {
          print('tapped advanced settings');
        },
        child: GestureDetector(
          onTap: () {
            print('add location btn pressed');
          },
          child: Text(
            'Advanced Settings',
            style: TextStyle(
              fontSize: _settingsValues['text size'] - 2,
            ),
          ),
        ),
      ),
    );
  }
  Widget _buildAnalyticsButton(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        vertical: _settingsValues['padding'] * 1.5,
        horizontal: _settingsValues['padding'] * 3,
      ),
      child: GestureDetector(
        onTap: () {
          setState(() => _track_with_ana = !_track_with_ana);
        },
        child: Text(
          _track_with_ana ? 'Analytics are on for this post. Remove?' : 'Track with Analytics',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: _track_with_ana ? Styles.ArrivalPalletteRed : null,
            fontSize: _settingsValues['text size'],
          ),
        ),
      ),
    );
  }
  Widget _buildLocationChooser(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        vertical: _settingsValues['padding'] * 1.5,
        horizontal: _settingsValues['padding'] * 3,
      ),
      child: GestureDetector(
        onTap: () {
          print('choose a location tapped');
        },
        child: Text(
          'Choose a Location',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: _settingsValues['text size'],
          ),
        ),
      ),
    );
  }
  Widget _buildAddLocationButton(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        vertical: _settingsValues['padding'] * 1.5,
        horizontal: _settingsValues['padding'] * 3,
      ),
      child: GestureDetector(
        onTap: () {
          MyLocation myself = MyLocation();
          setState(() => post_loc = {
            'name': 'undefined',
            'lat': myself.lat,
            'lng': myself.lng,
          });
        },
        child: Text(
          post_loc['name']=='' ? 'Add My Location'
            : (post_loc['name'] + ' ('
                  + post_loc['lat'].toString() + ', '
                  + post_loc['lng'].toString() + ')'),
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: _settingsValues['text size'],
          ),
        ),
      ),
    );
  }
  Widget _buildPostSettings(BuildContext context) {
    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _buildAddLocationButton(context),
          Container(
            height: _settingsValues['devider'],
            color: Styles.ArrivalPalletteGrey,
          ),
          _buildLocationChooser(context),
          Container(
            height: _settingsValues['devider'],
            color: Styles.ArrivalPalletteGrey,
          ),
          _buildAnalyticsButton(context),
          Container(
            height: _settingsValues['devider'],
            color: Styles.ArrivalPalletteGrey,
          ),
          _buildAdvancedSettingsButton(context),
        ],
      ),
    );
  }

  void _onCaptionChanged(String input) {
    caption = input;
  }
  Map<String, double> _captionValues = {
    'padding': 4.0,
    'min size': 40.0,
    'circle': 30.0,
    'fontSize': 12.0,
  };
  Widget _buildCaptionInsert(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(_captionValues['padding'] * 2),
      child: TextField(
        controller: _captionInput,
        keyboardType: TextInputType.multiline,
        minLines: 1,
        maxLines: 10,
        maxLength: 500,
        decoration: InputDecoration(
          labelText: 'Caption',
        ),
        onChanged: _onCaptionChanged,
      ),
    );
  }

  Widget _buildProfileIcon(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(_captionValues['padding'] * 2),
      height: (_captionValues['circle'] + _captionValues['padding']) * 2,
      child: CircleAvatar(
        radius: _captionValues['circle'],
        backgroundImage: NetworkImage(UserData.client.media_href()),
      ),
    );
  }
  Widget _buildPostIcon(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(_captionValues['padding']),
      child: widget.upload_single!=null
                ? ( _isVideo(widget.upload_single)
                  ? Container(
                      width: 10,
                      height: 90,
                      child: ArrivalVideoPlayer.local(widget.upload_single)
                    )
                  : Image(image: FileImage(widget.upload_single))
                  )
                : Image(image: FileImage(widget.upload_collection[0])),
    );
  }

  Widget _buildPostInformationDisplay(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        vertical: _captionValues['padding'],
        horizontal: _captionValues['padding'],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            flex: 1,
            child: _buildProfileIcon(context),
          ),
          Expanded(
            flex: 4,
            child: _buildCaptionInsert(context),
          ),
          Expanded(
            flex: 1,
            child: _buildPostIcon(context),
          ),
        ],
      ),
    );
  }

  Map<String, double> _headerValues = {
    'height': 50.0,
    'padding': 6.0,
  };
  Widget _buildUploadHeader() {
    return Container(
      height: _headerValues['height'],
      padding: EdgeInsets.fromLTRB(_headerValues['padding'], 0, 0, 0),
      width: MediaQuery.of(context).size.width - (_headerValues['padding'] * 2),
      child: Row(
        children: <Widget>[
          Expanded(
            flex: 1,
            child: Center(
              child: ArrCloseButton(() {
                Navigator.of(context).pop();
              }),
            ),
          ),
          Expanded(
            flex: 5,
            child: Container(),
          ),
          Expanded(
            flex: 2,
            child: Center(
              child: GestureDetector(
                onTap: () async {
                  if (_already_uploaded) return;

                  if (_isUnacceptableFile(widget.upload_single)) return;

                  String post_id = UserData.client.name + Random().nextInt(1000000).toString();
                  var database_info = {
                    'userlink': UserData.client.cryptlink,
                    'caption': caption,
                    'id': post_id,
                    'analytics': _track_with_ana,
                    'loc': {
                      'name': post_loc['name'],
                      'lat': post_loc['lat'],
                      'lng': post_loc['lng'],
                    }
                  };

                  if (widget.upload_single!=null || widget.upload_collection.length==1) {  // single upload

                    _already_uploaded = true;
                    Arrival.navigator.currentState.pop();
                    HomeScreen.gotoForyou();
                    ForYouPage.addUploadingMediaProgress(database_info['id']);

                    Map<String, dynamic> media_data;

                    if (_isVideo(widget.upload_single)) {
                      database_info['type'] = 2;
                      database_info['duration'] = media_data['duration'];
                      media_data = await _uploadMedia(widget.upload_single, true);
                    }
                    else {
                      database_info['type'] = 0;
                      media_data = await _uploadMedia(widget.upload_single, false);
                    }

                    if (media_data['link']=='') return;

                    database_info['height'] = media_data['height'];
                    database_info['width'] = media_data['width'];
                    database_info['cloudlink'] = media_data['link'];
                  }
                  else if (widget.upload_collection.length>1) {  // gallery upload

                    _already_uploaded = true;
                    Arrival.navigator.currentState.pop();
                    HomeScreen.gotoForyou();
                    ForYouPage.addUploadingMediaProgress(database_info['id']);

                    Map<String, dynamic> media_data = Map<String, dynamic>();
                    List<Map<String, dynamic>> attributes = List<Map<String, dynamic>>();
                    List<String> links = List<String>();

                    for (int i=0;i<widget.upload_collection.length;i++) {

                      if (_isVideo(widget.upload_collection[i])) {
                        media_data = await _uploadMedia(widget.upload_collection[i], true);

                        attributes[i]['duration'] = media_data['duration'];
                      }
                      else {
                        media_data = await _uploadMedia(widget.upload_collection[i], false);
                      }

                      if (media_data['link']=='') return;

                      attributes[i]['height'] = media_data['height'];
                      database_info['width'] = media_data['width'];
                    }

                    database_info['type'] = 1;
                    database_info['cloudlink'] = links;
                    database_info['attributes'] = attributes;
                  }
                  else return;

                  ForYouPage.finishUploadingMediaProgress(database_info['id']);
                  socket.emit('posts upload', database_info);

                  UserData.client.earnPoints(35);
                  await ScopedModel.of<Preferences>(context)..addNotificationHistory({
                    'label': 'Posted some gold',
                    'value': 35,
                  });
                },
                child: Text(
                  'UPLOAD',
                  style: Styles.activeTabButton,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }


  Map<String, double> _containerValues = {
    'devider': 1.0,
  };
  Widget _buildEditsContainer(BuildContext context) {
    return ListView(
      physics: ClampingScrollPhysics(),
      children: <Widget>[
        _buildUploadHeader(),
        Container(
          height: _containerValues['devider'],
          color: Styles.ArrivalPalletteGrey,
        ),
        _buildPostInformationDisplay(context),
        Container(
          height: _containerValues['devider'],
          color: Styles.ArrivalPalletteGrey,
        ),
        _buildPostSettings(context),
      ],
    );
  }

  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _buildEditsContainer(context),
      ),
    );
  }
}


class PostUploadScreen extends StatefulWidget {
  @override
  _PostUploadState createState() => new _PostUploadState();
}
class _PostUploadState extends State<PostUploadScreen>
        with WidgetsBindingObserver {
  var _image;

  ScrollController _galleryScrollController;
  ScrollController _uploadContainerScrollController;

  List _galleryImages, _galleryImageNames;

  Future<void> _loadImageList() async {
    return;

    Map allImageTemp;
    try {
      // allImageTemp = await FlutterGallaryPlugin.getAllImages;
    }
    catch (e) {
      print('''
        =======================================
                  Arrival Error
            $e
        =======================================
      ''');
      return;
    }

    setState(() {
      _galleryImages = allImageTemp['URIList'] as List;
      _galleryImageNames = allImageTemp['DISPLAY_NAME'] as List;
    });
  }


  void _initalizeCamera() async {
    return;

    try {
    }
    catch (e) {
      print('''
          ==================================
                    Camera Error
                $e
          ==================================
      ''');
    }
  }
  @override
  void initState() {
    super.initState();
    _galleryImages = List();
    _galleryImageNames = List();
    _galleryScrollController = ScrollController();
    _galleryScrollController.addListener(_galleryScrollListener);
    _uploadContainerScrollController = ScrollController();
    _uploadContainerScrollController.addListener(_containerScrollListener);
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _loadImageList();
    });
    _initalizeCamera();
  }
  @override
  void dispose() {
    _galleryScrollController.dispose();
    _uploadContainerScrollController.dispose();
    super.dispose();
  }

  void _galleryScrollListener() {
    if (_galleryScrollController.offset >= _galleryScrollController.position.maxScrollExtent &&
        !_galleryScrollController.position.outOfRange) {
      // _loadMore();
    }
  }
  void _containerScrollListener() {
    if (_uploadContainerScrollController.offset >= _uploadContainerScrollController.position.maxScrollExtent &&
        !_uploadContainerScrollController.position.outOfRange) {
      // _loadMore();
    }
  }

  // [input upload camera]


  bool _isVideo(File _media) {
    var length = _media.path.length;
    String extension = _media.path.substring(length-4, length);

    return (extension=='.mp4' || extension=='.mov' || extension=='.avi'
          || extension=='.wmv');
  }
  Map<String, double> _imageValues = {
    'body': 300.0,
    'row': 40.0,
    'circle': 20.0,
    'padding': 6.0,
  };
  Widget _buildImageShowcase() {
    return Center(
      child: _image != null
        ? ( _isVideo(_image)
            ? ArrivalVideoPlayer.local(_image)
            : Image(image: FileImage(_image))
          )
        : Icon(
            Icons.photo,
            size: _imageValues['circle'] * 5,
            color: Styles.ArrivalPalletteGrey,
          ),
    );
  }

  Map<String, double> _headerValues = {
    'height': 50.0,
    'padding': 6.0,
  };
  Widget _buildUploadHeader() {
    return Container(
      height: _headerValues['height'],
      padding: EdgeInsets.fromLTRB(_headerValues['padding'], 0, 0, 0),
      width: MediaQuery.of(context).size.width - (_headerValues['padding'] * 2),
      child: Row(
        children: <Widget>[
          Expanded(
            flex: 1,
            child: Center(
              child: ArrCloseButton(() {
                Navigator.of(context).pop();
              }),
            ),
          ),
          Expanded(
            flex: 3,
            child: _selectedIndex==1
              ? Container()
              : GestureDetector(
                onTap: () => print('tapped folder change'),
                child: Text(
                  'Recent Gallery',
                  style: Styles.inactiveTabButton,
                ),
              ),
          ),
          Expanded(
            flex: 2,
            child: Container(),
          ),
          Expanded(
            flex: 2,
            child: Center(
              child: _selectedIndex==1 && !_imageTaken
                ? Container()
                : GestureDetector(
                    onTap: () {
                      if (_image==null) return;
                      Arrival.navigator.currentState.push(MaterialPageRoute(
                        builder: (context) => PostUploadEditingScreen(_image),
                        fullscreenDialog: true,
                      ));
                    },
                    child: Text(
                      _image==null ? '' : 'NEXT',
                      style: Styles.activeTabButton,
                    ),
                  ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDisplayCasing(BuildContext context) {
    return Container(
      height: _imageValues['body'],
      child: Stack(
        children: <Widget>[
          _buildImageShowcase(),
          Positioned(
            bottom: _imageValues['padding'],
            left: _imageValues['padding'],
            child: Container(
              height: _imageValues['row'],
              width: MediaQuery.of(context).size.width - (_imageValues['padding'] * 2),
              child: Row(
                children: <Widget>[
                  Expanded(
                    flex: 1,
                    child: Center(
                      child: GestureDetector(
                        onTap: () => print('tapped #1'),
                        child: CircleAvatar(
                          radius: _imageValues['circle'],
                          backgroundColor: Styles.ArrivalPalletteGrey,
                          child: Icon(
                            Icons.person,
                            size: _imageValues['circle'],
                            color: Styles.ArrivalPalletteWhite,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 6,
                    child: Container(),
                  ),
                  Expanded(
                    flex: 1,
                    child: Center(
                      child: GestureDetector(
                        onTap: () => print('tapped #2'),
                        child: CircleAvatar(
                          radius: _imageValues['circle'],
                          backgroundColor: Styles.ArrivalPalletteGrey,
                          child: Icon(
                            Icons.edit,
                            size: _imageValues['circle'],
                            color: Styles.ArrivalPalletteWhite,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  MediaPickerSelection selection;
  Widget _buildGalleryCasing(BuildContext context) {

    return Container(
      margin: EdgeInsets.all(20.0),
      padding: EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        color: Styles.ArrivalPalletteWhite,
        borderRadius: BorderRadius.circular(4.0),
      ),
      height: MediaQuery.of(context).size.height - MediaQuery.of(context).padding.top - 450,
      child: selection == null || selection.selectedMedias.isEmpty
          ? Center(
            child: GestureDetector(
              onTap: () async {
                final result = await MediaPicker.show(context);
                if (result != null) {
                  var output = await result.selectedMedias[0].getFile();
                  setState(() => _image = output);
                  // setState(() => selection = result);
                }
              },
              child: Icon(
                Icons.cloud_upload,
                color: Styles.ArrivalPalletteRed,
                size: 65,
              ),
            ),
          )
          : Wrap(
              spacing: 10.0,
              runSpacing: 10.0,
              children: <Widget>[
                ...selection.selectedMedias.map<Widget>(
                  (x) => GestureDetector(
                    onTap: () {
                      setState(() => _image = x.getFile());
                    },
                    child: SizedBox(
                      width: 128,
                      height: 128,
                      child: MediaThumbnailImage(media: x),
                    ),
                  ),
                ),
              ],
            ),
    );

    return GridView.count(
      shrinkWrap: true,
      childAspectRatio: 1,
      scrollDirection: Axis.vertical,
      crossAxisCount: 4,
      controller: _galleryScrollController,
      physics: ClampingScrollPhysics(),
      children: new List<Widget>.generate(
        _galleryImages.length, (index) {
          return Container(
            padding: EdgeInsets.all(1.0),
            child: GestureDetector(
              onTap: () {
                setState(() => _image = File(_galleryImages[index]));
              },
              child: Image.file(File(_galleryImages[index].toString())),
            ),
          );
        }
      ).toList(),
    );
  }

  bool _imageTaken = false;
  Map<String, double> _cameraValues = {
    'outter UI glow': 42.0,
    'outter UI button': 40.0,
    'inner UI button': 35.0,
  };
  Widget _buildCameraVisualDisplay(BuildContext context) {

    return Container(
      child: Center(
        child: Text(
          'Camera upload available in next update.',
          style: TextStyle(
            color: Styles.ArrivalPalletteWhite,
          ),
        ),
      ),
    );
  }
  Widget _buildCameraDisplayCasing(BuildContext context) {
    return Container(
      color: Styles.ArrivalPalletteBlack,
      height: _imageValues['body'],
      child: _imageTaken ? Center(
                child: Image(image: FileImage(_image))
              )
            : _buildCameraVisualDisplay(context),
    );
  }
  Widget _buildCameraUICasing(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height - MediaQuery.of(context).padding.top
        - _imageValues['body'] - (_headerValues['height']*3) - (_containerValues['devider']*2),
      child: Center(
        child: GestureDetector(
          onTap: () async {
            if (_imageTaken) return;

            try {
              final path = join(
                (await getTemporaryDirectory()).path,
                '${DateTime.now()}.png',
              );

              // await _cameraController.takePicture(path);
              return;

              _image = File(path);
              setState(() => _imageTaken = true);
            } catch (e) {
              print('''
              =========================
                      Arrival Error
                  $e
              =========================
              ''');
              ForYouPage.openSnackBar({
              'text': 'Camera Error $e',
              'duration': 10,
              });
            }
          },
          child: CircleAvatar(
            radius: _cameraValues['outter UI glow'],
            backgroundColor: Styles.ArrivalPalletteRedTransparent,
            child: CircleAvatar(
              radius: _cameraValues['outter UI button'],
              backgroundColor: Styles.ArrivalPalletteGrey,
              child: CircleAvatar(
                radius: _cameraValues['inner UI button'],
                backgroundColor: Styles.ArrivalPalletteBlack,
                child: Icon(
                  Icons.camera,
                  size: _imageValues['circle'],
                  color: Styles.ArrivalPalletteWhite,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Map<String, double> _containerValues = {
    'devider': 1.0,
  };
  Widget _buildUploadContainer(BuildContext context) {
    var displayList = <Widget>[
      _buildUploadHeader(),
      Container(
        height: 1,
        color: Styles.ArrivalPalletteGrey,
      ),
    ];

    if (_selectedIndex==0) {  // gallery option
      displayList += <Widget>[
        _buildDisplayCasing(context),
        Container(
          height: _containerValues['devider'],
          color: Styles.ArrivalPalletteGrey,
        ),
        _buildGalleryCasing(context),
      ];
    }
    else {  // camera option
      displayList += <Widget>[
        _buildCameraDisplayCasing(context),
        Container(
          height: _containerValues['devider'],
          color: Styles.ArrivalPalletteGrey,
        ),
        _buildCameraUICasing(context),
      ];
    }

    return ListView(
      physics: ClampingScrollPhysics(),
      controller: _uploadContainerScrollController,
      children: displayList,
    );
  }

  int _selectedIndex = 0;
  void _selectedTab(BuildContext context, int index) {
    setState(() => _selectedIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _buildUploadContainer(context),
      ),
      bottomNavigationBar: BottomNavigationBar(
        onTap: (index) => _selectedTab(context, index),
        items: <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Container(),
            title: Text('Gallery'),
          ),
          BottomNavigationBarItem(
            icon: Container(),
            title: Text('Camera'),
          ),
        ],
        currentIndex: _selectedIndex,
        backgroundColor: Styles.ArrivalPalletteWhite,
        selectedFontSize: 18.0,
        unselectedFontSize: 18.0,
        selectedItemColor: Styles.ArrivalPalletteBlack,
        unselectedItemColor: Styles.ArrivalPalletteGrey,
      ),
    );
  }
}
