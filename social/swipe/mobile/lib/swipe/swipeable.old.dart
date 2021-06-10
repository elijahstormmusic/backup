import 'dart:core';
import 'package:flutter/material.dart';

import 'swipe.dart';


class Swipeable extends StatefulWidget {

  Map<String, dynamic> data;
  void Function(Map<String, dynamic>, int) onSwipe;

  Swipeable({
    this.data = const {},
    required this.onSwipe,
  });

  Widget generateInteriorContent() => Container(
    color: Colors.red,
    child: Text(
      'Bad State',
    ),
  );

  @override
  _SwipeableState createState() => _SwipeableState();
}

class _SwipeableState extends State<Swipeable> {

    //// data handlers
  void _accept() {
    widget.onSwipe(widget.data, SWIPES.ACCEPT.index);
  }
  void _deny() {
    widget.onSwipe(widget.data, SWIPES.DENY.index);
  }


    //// swipe animation
  double _swipeAnimationDegree = 0.0;
  void _setSwipeOffsetValue(double value) {
    setState(() => _swipeAnimationDegree = value);
  }
  void _animateSwipe(int direction) {

    // on finish -> _onSwipeAnimationHasFinished();
  }
  void _animateSwipeRight() => _animateSwipe(1);
  void _animateSwipeLeft() => _animateSwipe(-1);


    //// exiting and input choice reporting
  void _finishSwipeRight() {
    _accept();
    _animateSwipeRight();
  }
  void _finishSwipeLeft() {
    _deny();
    _animateSwipeLeft();
  }


    //// extra information for swipable container
  bool _isInformationIn = false;
  void _pullInInformation() {
    _isInformationIn = true;
  }
  void _pullOutInformation() {
    _isInformationIn = false;
  }
  void _togglePullupInformation() {
    if (_isInformationIn) {
      _pullOutInformation();
    }
    else {
      _pullInInformation();
    }
  }


    //// handling input
  double _startCardDrag = 0, _cardDragDeadzone = 15;
  double _swipeConfirmDistance = 150, _minimumSwipeableReleaseSpeed = 20;
  bool _finishedDragAction = false;
  void _onVerticalDragStart(var details) {
    _startCardDrag = details.globalPosition.dy;
    _finishedDragAction = false;
  }
  void _onVerticalDragUpdate(var details) {
    if (_finishedDragAction) return;

    if (details.globalPosition.dy > _startCardDrag + _cardDragDeadzone) { // down
      _pullInInformation();
      _finishedDragAction = true;
    }
    else if (details.globalPosition.dy < _startCardDrag - _cardDragDeadzone) { // up
      _pullOutInformation();
      _finishedDragAction = true;
    }
  }
  void _onHorizontalDragStart(var details) {
    _startCardDrag = details.globalPosition.dy;
    _finishedDragAction = false;
  }
  void _onHorizontalDragUpdate(var details) {
    if (_finishedDragAction) return;

      // both right and left
    if (details.globalPosition.dx > (_cardDragDeadzone - _startCardDrag).abs()) {
      _setSwipeOffsetValue(double.parse(details.globalPosition.dx.toString()) - _startCardDrag);
    }
  }
  void _onHorizontalDragEnd(var details) {
    if (_finishedDragAction) return;

    if (details.primaryVelocity > _minimumSwipeableReleaseSpeed) {
      if (details.globalPosition.dx > _startCardDrag + _cardDragDeadzone) { // right
        _finishSwipeRight();
      }
    }
    else if (details.primaryVelocity < _minimumSwipeableReleaseSpeed) {
      if (details.globalPosition.dx < _startCardDrag - _cardDragDeadzone) { // left
        _finishSwipeLeft();
      }
    }
  }


    //// drawables
  Widget _buildContentCard() => GestureDetector(
    onTap: () {
      print('click');
    },
    onDoubleTap: () {
      _togglePullupInformation();
    },
    onVerticalDragStart: (details) {
      _onVerticalDragStart(details);
    },
    onVerticalDragUpdate: (details) {
      _onVerticalDragUpdate(details);
    },
    onHorizontalDragStart: (details) {
      _onHorizontalDragStart(details);
    },
    onHorizontalDragUpdate: (details) {
      _onHorizontalDragUpdate(details);
    },
    child: Container(
      child: widget.generateInteriorContent(),
    ),
  );

  Widget _buildAcceptanceButtons() => Container(
    padding: EdgeInsets.symmetric(
      horizontal: _buttonsPadding,
    ),
    width: MediaQuery.of(context).size.width - (_buttonsPadding * 2),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        GestureDetector(
          onTap: _finishSwipeLeft,
          child: CircleAvatar(
            child: const Icon(Icons.close),
            backgroundColor: Colors.red,
            radius: 30,
          ),
        ),
        GestureDetector(
          onTap: _finishSwipeRight,
          child: CircleAvatar(
            child: const Icon(Icons.star_border),
            backgroundColor: Colors.blue,
            radius: 20,
          ),
        ),
        GestureDetector(
          onTap: _finishSwipeRight,
          child: CircleAvatar(
            child: const Icon(Icons.check),
            backgroundColor: Colors.green,
            radius: 30,
          ),
        ),
      ],
    ),
  );


  final _buttonsPadding = 18.0;

  @override
  Widget build(BuildContext context) => Container(
    child: AnimatedContainer(
      duration: Duration(milliseconds: 500),
      padding: EdgeInsets.only(
        left: _swipeAnimationDegree,
      ),
      child: Container(
        width: double.infinity,
        height: double.infinity,
        padding: const EdgeInsets.symmetric(
          horizontal: 2.0,
          vertical: 2.0,
        ),
        child: Stack(
          children: [
            _buildContentCard(),

            Positioned(
              bottom: _buttonsPadding,
              child: _buildAcceptanceButtons(),
            ),
          ],
        ),
      ),
    ),
  );
}
