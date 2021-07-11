import 'package:flutter/material.dart';


class SlideInCard extends StatefulWidget {

  double? height;
  SlideUpController? controller;
  Widget child;

  SlideInCard({
    this.height,
    this.controller,
    required this.child,
  });

  @override
  _SlideInCardState createState() => _SlideInCardState();
}

class _SlideInCardState extends State<SlideInCard> {

  @override
  void initState() {
    super.initState();

    if (widget.height != null) {
      _middleCardMiddleValue = widget.height!;
    }

    if (widget.controller != null) {
      widget.controller!.slideIn = _setMainCardToMiddle;
      widget.controller!.slideOut = _setMainCardOut;
    }
  }


  double _middleCardVerticalPosition = 600.0;
  final double _middleCardTopValue = 0;
  double _middleCardMiddleValue = 100.0;
  double _middleCardOutValue = 600.0;
  bool initating = true;
  void _setMainCardToTop() {
    if (_middleCardVerticalPosition==_middleCardTopValue) return;
    setState(() => _middleCardVerticalPosition = _middleCardTopValue);
  }
  void _setMainCardToMiddle() {
    if (_middleCardVerticalPosition==_middleCardMiddleValue) return;
    setState(() => _middleCardVerticalPosition = _middleCardMiddleValue);
  }
  void _setMainCardOut() {
    if (_middleCardVerticalPosition==_middleCardOutValue) return;
    setState(() => _middleCardVerticalPosition = _middleCardOutValue);
  }
  void _setMainCardUp() {
    if (_middleCardVerticalPosition==_middleCardMiddleValue) {
      _setMainCardToTop();
    }
    else if (_middleCardVerticalPosition==_middleCardOutValue) {
      _setMainCardToMiddle();
    }
  }
  void _setMainCardDown() {
    if (_middleCardVerticalPosition==_middleCardTopValue) {
      _setMainCardToMiddle();
    }
    else if (_middleCardVerticalPosition==_middleCardMiddleValue) {
      _setMainCardOut();
    }
  }

  double? _startCardDrag;
  double _cardDragDeadzone = 15;
  bool _doneDragAction = false;
  void _onVerticalDragStart(var details) {
    _startCardDrag = details.globalPosition.dy;
    _doneDragAction = false;
  }
  void _onVerticalDragUpdate(var details) {
    if (_doneDragAction) return;
    if (details.globalPosition.dy > _startCardDrag! + _cardDragDeadzone) { // down
      _setMainCardDown();
      _doneDragAction = true;
    }
    else if (details.globalPosition.dy < _startCardDrag! - _cardDragDeadzone) { // up
      _setMainCardUp();
      _doneDragAction = true;
    }
  }

  @override
  Widget build(BuildContext context) => GestureDetector(
    onDoubleTap: () {
      if (_middleCardVerticalPosition==_middleCardMiddleValue) {
        _setMainCardToTop();
      }
      else {
        _setMainCardToMiddle();
      }
    },
    onTap: () {
      if (_middleCardVerticalPosition==_middleCardOutValue) {
        _setMainCardToMiddle();
      }
    },
    onVerticalDragStart: (details) {
      _onVerticalDragStart(details);
    },
    onVerticalDragUpdate: (details) {
      _onVerticalDragUpdate(details);
    },
    child: AnimatedContainer(
      duration: Duration(milliseconds: 350),
      curve: Curves.easeOut,
      height: MediaQuery.of(context).size.height,
      width: MediaQuery.of(context).size.width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      margin: EdgeInsets.only(top: _middleCardVerticalPosition),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Stack(
          children: <Widget>[
            widget.child,

            Positioned(
              left: 0,
              right: 0,
              top: 0,
              child: Center(
                child: GestureDetector(
                  onTap: () {
                    if (_middleCardVerticalPosition==_middleCardMiddleValue) {
                      _setMainCardToTop();
                    }
                    else {
                      _setMainCardToMiddle();
                    }
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      vertical: 10,
                      horizontal: 10,
                    ),
                    child: Container(
                      height: 3,
                      width: 50,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        color: Colors.grey,
                      ),
                    ),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    ),
  );
}

class SlideUpController {

  VoidCallback? slideIn;
  VoidCallback? slideOut;

  void dispose() {
    slideIn = null;
    slideOut = null;
  }
}
