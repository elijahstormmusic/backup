import 'package:flutter/material.dart';

import 'swipeable.dart';
import 'content/swipeable_profile.dart';
import 'content/swipeable_ad.dart';

enum Content {
  NONE,
  PROFILE,
  AD,
}

class Swipe extends StatefulWidget {

  bool badState;

  Swipe({
    this.badState = false,
  });


  void accept(Map<String, dynamic> data) {
    if (badState) return;

  }
  void deny(Map<String, dynamic> data) {
    if (badState) return;

  }


  @override
  _SwipeState createState() => _SwipeState();
}

class _SwipeState extends State<Swipe> {

  List<Map<String, dynamic> > content_list = [];

  @override
  void initState() {
    _loadContent();
    super.initState();
  }


  bool _allowRequest = true, _requestFailed = false;
  final REQUEST_AMOUNT = 10, CONTENT_MINIMUM = 5;
  bool kill_reflow = false;

  void _requestMoreContent(int amount) {
    if (!_allowRequest) return;

    _allowRequest = false;

    // socket.emit('foryou ask', {
    //   'amount': amount,
    // });

    _checkForFailure();

    response([
      {
        'type': Content.PROFILE,
        'profile_id': 'profileId-grey',
        'pic': 'something.jpg',
        'color': Colors.grey,
      },
      {
        'type': Content.PROFILE,
        'profile_id': 'profileId-purple',
        'pic': 'something.jpg',
        'color': Colors.purple,
      },
      {
        'type': Content.PROFILE,
        'profile_id': 'profileId-white',
        'pic': 'something.jpg',
        'color': Colors.white,
      },
      {
        'type': Content.PROFILE,
        'profile_id': 'profileId-black',
        'pic': 'something.jpg',
        'color': Colors.black,
      },
      {
        'type': Content.PROFILE,
        'profile_id': 'profileId-brown',
        'pic': 'something.jpg',
        'color': Colors.brown,
      },
      {
        'type': Content.PROFILE,
        'profile_id': 'profileId-white',
        'pic': 'something.jpg',
        'color': Colors.white,
      },
      {
        'type': Content.PROFILE,
        'profile_id': 'profileId-brown',
        'pic': 'something.jpg',
        'color': Colors.brown,
      },
      {
        'type': Content.PROFILE,
        'profile_id': 'profileId-black',
        'pic': 'something.jpg',
        'color': Colors.black,
      },
      {
        'type': Content.PROFILE,
        'profile_id': 'profileId-pink',
        'pic': 'something.jpg',
        'color': Colors.pink,
      },
    ]);
  }

  bool _responseHeard = false, _forceFailCurrentState = false;
  int _timesFailedToHearResponse = 0;
  void _checkForFailure() async {
    _responseHeard = false;

    await Future.delayed(const Duration(seconds: 6));

    if (!_responseHeard) {
      _timesFailedToHearResponse++;

      if (_timesFailedToHearResponse>3) {
        if (kill_reflow) return;

        _openSnackBar({
          'text': 'Network error. A-400',
        });

        setState(() => _forceFailCurrentState = true);

        return;
      }

      _checkForFailure();
    }
  }
  void _refresh() {
    if (!_allowRequest) return;

    content_list = [];

    _requestMoreContent(REQUEST_AMOUNT);
  }
  void _loadContent() {
    if (!_allowRequest) return;

    _requestMoreContent(REQUEST_AMOUNT);
  }
  void response(var data) async {
    _responseHeard = true;
    _timesFailedToHearResponse = 0;
    if (data.length==0) {
      _requestFailed = true;
      return;
    }

    List<Map<String, dynamic> > list = [];
    var result;

    try {
      for (var i=0;i<data.length;i++) {
        if (data[i]['type']==Content.PROFILE) {
          result = data[i];

          try {
            // result['profile'] = Profile.json(data[i]);
          } catch (e) {
            print(
              '''
              -------------
                    Swipe Profile Parsing Error - lib/swipe/swipe.dart -> response()
                ${e}
              -------------
              '''
            );
          }
        }
        else continue;

        list.add(result);
      }
    }
    catch (e) {
      _requestFailed = true;

      print(
        '''
        -------------
              Swipe Content Parsing Error - lib/swipe/swipe.dart -> response()
          ${e}
        -------------
        '''
      );
      return;
    }

    _requestFailed = false;
    if (kill_reflow) return;

    setState(() => content_list += list);

    await Future.delayed(const Duration(seconds: 1));

    _allowRequest = true;
  }


  void _openSnackBar(Map<String, dynamic> input) =>
    Scaffold.of(context).showSnackBar(SnackBar(
        content: Text(input['text']),
        // backgroundColor: Styles.ArrivalPalletteRed,
        elevation: 15.0,
        behavior: SnackBarBehavior.floating,
        duration: input['duration']==null ? Duration(seconds: 3) : Duration(seconds: input['duration']),
        action: input['action']==null ? null : SnackBarAction(
          // textColor: Styles.ArrivalPalletteBlue,
          // disabledTextColor: Styles.ArrivalPalletteGrey,
          label: input['action-label'],
          onPressed: input['action'],
        ),
      )
    );

  Widget _buildContentCard(Map<String, dynamic> data) {
    var buildType = SwipeableProfile(
      data: data,
      parent: this,
    );

    if (data['type'] == Content.AD) {
      buildType = SwipeableAd(
        data: data,
        parent: this,
      );
    }

    return buildType;
  }

  @override
  Widget build(BuildContext context) => Container(
    child: _buildContentCard(
      content_list.first,
    ),
  );
}
