import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:badges/badges.dart';

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
  final REQUEST_AMOUNT = 20, CONTENT_MINIMUM = 10;
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

    setState(() => _matchEngine.add(_swipeItems));

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
    padding: EdgeInsets.all(1.0),
    child: Stack(
      children: [
        Container(
          height: MediaQuery.of(context).size.height - 60,
          child: Swipeable(
            matchEngine: _matchEngine,
            itemBuilder: (BuildContext context, int index) {
              return Card(
                elevation: 6,
                // shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: Container(
                  child: Stack(
                    children: [
                      Positioned(
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        child: content_list[index].images,
                      ),

                      Positioned(
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            gradient: LinearGradient(
                              begin: FractionalOffset.topCenter,
                              end: FractionalOffset.bottomCenter,
                              colors: [
                                Colors.grey.withOpacity(0.0),
                                Colors.black.withOpacity(0.5),
                                Colors.black.withOpacity(0.7),
                              ],
                              stops: [
                                0.5,
                                0.7,
                                1.0,
                              ],
                            ),
                          ),
                        ),
                      ),

                      Positioned(
                        bottom: 84.0,
                        left: 30.0,
                        right: 30.0,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    content_list[index].online
                                      ? Container(
                                        padding: EdgeInsets.only(
                                          right: 4.0,
                                        ),
                                        child: BlinkingActiveCircle(),
                                      )
                                      : Container(width: 0),

                                      Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            content_list[index].text,
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 30,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),

                                          content_list[index].verified
                                          ? Container(
                                            padding: EdgeInsets.only(
                                              left: 4.0,
                                            ),
                                            child: Badge(
                                              shape: BadgeShape.circle,
                                              badgeColor: Colors.deepPurple,
                                              animationType: BadgeAnimationType.slide,
                                              badgeContent: Text(
                                                'S',
                                                style: TextStyle(
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ),
                                          )
                                          : Container(width: 0),
                                        ],
                                      ),
                                  ],
                                ),

                                SizedBox(width: 12.0),

                                Text(
                                  '${content_list[index].sex[0].toUpperCase()}${content_list[index].sex.substring(1)}',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),

                            SizedBox(height: 8.0),

                            Text(
                              content_list[index].caption,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
            onStackFinished: () {
              Scaffold.of(context).showSnackBar(SnackBar(
                content: Text("Stack Finished"),
                duration: Duration(milliseconds: 500),
              ));
            },
          ),
        ),

        SizedBox(height: 24.0),

        Positioned(
          bottom: 20.0,
          left: 31.0,
          right: 31.0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              GestureDetector(
                onTap: () {
                  if (_matchEngine.currentItem == null) return;

                  _matchEngine.currentItem!.nope();
                },
                child: CircleAvatar(
                  radius: 25.0,
                  backgroundColor: Colors.red,
                  child: Center(
                    child: const Icon(
                      FontAwesomeIcons.times,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              GestureDetector(
                onTap: () {
                  if (_matchEngine.currentItem == null) return;

                  _matchEngine.currentItem!.superLike();
                },
                child: CircleAvatar(
                  radius: 20.0,
                  backgroundColor: Colors.blue,
                  child: Center(
                    child: const Icon(
                      FontAwesomeIcons.star,
                      color: Colors.white,
                      size: 14.0,
                    ),
                  ),
                ),
              ),
              GestureDetector(
                onTap: () {
                  if (_matchEngine.currentItem == null) return;

                  _matchEngine.currentItem!.like();
                },
                child: CircleAvatar(
                  radius: 25.0,
                  backgroundColor: Colors.green,
                  child: Center(
                    child: const Icon(
                      FontAwesomeIcons.check,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class BlinkingActiveCircle extends StatefulWidget {
  @override
  _BlinkingActiveCircleState createState() => _BlinkingActiveCircleState();
}

class _BlinkingActiveCircleState extends State<BlinkingActiveCircle>
    with SingleTickerProviderStateMixin {
  AnimationController? _animationController;

  @override
  void initState() {
    _animationController =
        new AnimationController(vsync: this, duration: Duration(milliseconds: 700));
    _animationController!.repeat(reverse: true);
    super.initState();
  }

  @override
  void dispose() {
    _animationController!.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animationController!,
      child: CircleAvatar(
        radius: 4.0,
        backgroundColor: Colors.green,
      ),
    );
  }
}
