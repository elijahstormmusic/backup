import 'package:flutter/material.dart';

import 'swipeable.dart';
// import 'image_carousel.dart';
import 'content/swipeable_content.dart';
import 'content/swipeable_profile.dart';
import 'content/swipeable_ad.dart';
import 'content/mock_content.dart';

enum CONTENT {
  NONE,
  PROFILE,
  AD,
}
enum SWIPES {
  NONE,
  ACCEPT,
  DENY,
  LOVE,
}

class Swipe extends StatefulWidget {

  bool badState;

  Swipe({
    this.badState = false,
  });

  @override
  _SwipeState createState() => _SwipeState();
}

class _SwipeState extends State<Swipe> {

  List<SwipeableContent> content_list = [];
  int _swiped_amount = 0;
  MatchEngine _matchEngine = MatchEngine(swipeItems: []);

  @override
  void initState() {
    _loadContent();
    super.initState();
  }


  void _swipeInput(SwipeableContent content, SWIPES type) {

    print('onSwipe _swipeInput');

    if (widget.badState) return;

    _openNextInList();
  }

  void _likeAction(SwipeableContent content) {
    _swipeInput(content, SWIPES.ACCEPT);
  }
  void _nopeAction(SwipeableContent content) {
    _swipeInput(content, SWIPES.DENY);
  }
  void _superlikeAction(SwipeableContent content) {
    _swipeInput(content, SWIPES.LOVE);
  }


  bool _allowRequest = true, _requestFailed = false;
  final REQUEST_AMOUNT = 10, CONTENT_MINIMUM = 5;
  bool kill_reflow = false;

  void _openNextInList() {
    if (_swiped_amount++ < CONTENT_MINIMUM) {
      _requestMoreContent(REQUEST_AMOUNT);
    }
  }
  void _requestMoreContent(int amount) {
    if (!_allowRequest) return;

    _allowRequest = false;

    // socket.emit('foryou ask', {
    //   'amount': amount,
    // });

    _checkForFailure();

    response(MockContent.all);
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

    List<SwipeableContent> list = [];
    var result;

    for (var i=0;i<data.length;i++) {
      try {
        if (data[i]['type']==CONTENT.PROFILE) {
          result = ContentProfile(data[i]);
        }
        else if (data[i]['type']==CONTENT.AD) {
          result = ContentAd(data[i]);
        }
        else continue;

        list.add(result);

      } catch (e) {
        print(
          '''
          -------------
                Swipe Profile Parsing Error - lib/swipe/swipe.dart -> response()
          With Data:
            ${data[i]}
          With Error:
            ${e}
          -------------
          '''
        );
      }
    }

    _requestFailed = false;
    if (kill_reflow) return;

    content_list += list;

    List<SwipeItem> _swipeItems = [];

    for (int i=0;i<content_list.length;i++) {
      _swipeItems.add(SwipeItem(
        content: content_list[i],
        likeAction: _likeAction,
        nopeAction: _nopeAction,
        superlikeAction: _superlikeAction,
      ));
    }

    setState(() => _matchEngine = MatchEngine(swipeItems: _swipeItems));

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


  @override
  Widget build(BuildContext context) => Container(
    child: Container(
      child: Column(
        children: [
          Container(
            height: MediaQuery.of(context).size.height,
            child: Swipeable(
              matchEngine: _matchEngine,
              itemBuilder: (BuildContext context, int index) {
                return content_list[index].generate(context);
              },
              onStackFinished: () {
                Scaffold.of(context).showSnackBar(SnackBar(
                  content: Text("Stack Finished"),
                  duration: Duration(milliseconds: 500),
                ));
              },
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              RaisedButton(
                onPressed: () {
                  if (_matchEngine.currentItem == null) return;

                  _matchEngine.currentItem!.nope();
                },
                child: Text("Nope")),
              RaisedButton(
                onPressed: () {
                  if (_matchEngine.currentItem == null) return;

                  _matchEngine.currentItem!.superLike();
                },
                child: Text("Superlike")),
              RaisedButton(
                onPressed: () {
                  if (_matchEngine.currentItem == null) return;

                  _matchEngine.currentItem!.like();
                },
                child: Text("Like"))
            ],
          ),
        ],
      ),
    ),
  );
}
