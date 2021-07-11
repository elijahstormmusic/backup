import 'package:flutter/material.dart';

import 'draggable_card.dart';
import 'profile_card.dart';
import 'content/swipeable_content.dart';

class Swipeable extends StatefulWidget {
  final IndexedWidgetBuilder itemBuilder;
  final MatchEngine matchEngine;
  final Function onStackFinished;

  const Swipeable(
      {Key? key,
      required this.matchEngine,
      required this.onStackFinished,
      required this.itemBuilder})
      : super(key: key);

  @override
  _SwipeableState createState() => _SwipeableState();
}

class _SwipeableState extends State<Swipeable> {
  Key? _frontCard;
  SwipeItem? _currentItem;
  double _nextCardScale = 0.9;
  SlideRegion slideRegion = SlideRegion.none;

  @override
  void initState() {
    widget.matchEngine.addListener(_onMatchEngineChange);
    _currentItem = widget.matchEngine.currentItem;
    if (_currentItem != null) {
      _currentItem!.addListener(_onMatchChange);
    }
    _frontCard = Key(widget.matchEngine._currentItemIndex.toString());
    super.initState();
  }

  @override
  void dispose() {
    if (_currentItem != null) {
      _currentItem!.removeListener(_onMatchChange);
    }
    widget.matchEngine.removeListener(_onMatchEngineChange);
    super.dispose();
  }

  @override
  void didUpdateWidget(Swipeable oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.matchEngine != oldWidget.matchEngine) {
      oldWidget.matchEngine.removeListener(_onMatchEngineChange);
      widget.matchEngine.addListener(_onMatchEngineChange);
    }
    if (_currentItem != null) {
      _currentItem!.removeListener(_onMatchChange);
    }
    _currentItem = widget.matchEngine.currentItem;
    if (_currentItem != null) {
      _currentItem!.addListener(_onMatchChange);
    }
  }

  void _onMatchEngineChange() {
    setState(() {
      if (_currentItem != null) {
        _currentItem!.removeListener(_onMatchChange);
      }
      _currentItem = widget.matchEngine.currentItem!;
      if (_currentItem != null) {
        _currentItem!.addListener(_onMatchChange);
      }

      if (widget.matchEngine._currentItemIndex == null) return;
      _frontCard = Key(widget.matchEngine._currentItemIndex.toString());
    });
  }

  void _onMatchChange() {
    setState(() {
      //match has been changed
    });
  }

  Widget _buildFrontCard() {
    return ProfileCard(
      child: widget.itemBuilder(context, widget.matchEngine._currentItemIndex),
      key: _frontCard,
    );
  }

  Widget _buildBackCard() {
    return Transform(
      transform: Matrix4.identity()..scale(_nextCardScale, _nextCardScale),
      alignment: Alignment.center,
      child: ProfileCard(
        child: widget.itemBuilder(context, widget.matchEngine._nextItemIndex),
      ),
    );
  }

  void _onSlideUpdate(double distance) {
    setState(() {
      _nextCardScale = 0.9 + (0.1 * (distance / 100.0)).clamp(0.0, 0.1);
    });
  }

  void _onSlideRegion(SlideRegion region) {
    setState(() {
      slideRegion = region;
    });
  }

  void _onSlideOutComplete(SlideDirection direction) {
    SwipeItem currentMatch = widget.matchEngine.currentItem!;
    if (currentMatch == null) return;

    switch (direction) {
      case SlideDirection.left:
        currentMatch.nope();
        break;
      case SlideDirection.right:
        currentMatch.like();
        break;
      case SlideDirection.up:
        currentMatch.superLike();
        break;
    }

    widget.matchEngine.cycleMatch();

    if (widget.matchEngine.currentItem == null) {
      widget.onStackFinished();
    }
  }

  SlideDirection? _desiredSlideOutDirection() {
    if (widget.matchEngine.currentItem == null) return null;

    switch (widget.matchEngine.currentItem!.decision) {
      case Decision.nope:
        return SlideDirection.left;
      case Decision.like:
        return SlideDirection.right;
      case Decision.superLike:
        return SlideDirection.up;
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        if (widget.matchEngine.nextItem != null)
          DraggableCard(
            isDraggable: false,
            card: _buildBackCard(),
            onSlideUpdate: (_) {},
            onSlideRegionUpdate: (_) {},
            onSlideOutComplete: (_) {},
          ),
        if (widget.matchEngine.currentItem != null)
          DraggableCard(
            card: _buildFrontCard(),
            slideTo: _desiredSlideOutDirection(),
            onSlideUpdate: _onSlideUpdate,
            onSlideRegionUpdate: _onSlideRegion,
            onSlideOutComplete: _onSlideOutComplete,
          ),
      ],
    );
  }
}

class MatchEngine extends ChangeNotifier {
  List<SwipeItem> _swipeItems;
  int _currentItemIndex = 0;
  int _nextItemIndex = 1;

  MatchEngine({
    required List<SwipeItem> swipeItems,
  }) : _swipeItems = swipeItems;

  SwipeItem? get currentItem => _currentItemIndex < _swipeItems.length
      ? _swipeItems[_currentItemIndex]
      : null;

  SwipeItem? get nextItem =>
      _nextItemIndex < _swipeItems.length ? _swipeItems[_nextItemIndex] : null;

  void cycleMatch() {
    if (currentItem == null) return;
    if (currentItem!.decision != Decision.undecided) {
      currentItem!.resetMatch();
      _currentItemIndex = _nextItemIndex;
      _nextItemIndex = _nextItemIndex + 1;
      notifyListeners();
    }
  }

  void rewindMatch() {
    if (_currentItemIndex != 0) {
      if (currentItem != null) currentItem!.resetMatch();
      _nextItemIndex = _currentItemIndex;
      _currentItemIndex = _currentItemIndex - 1;
      if (currentItem != null) currentItem!.resetMatch();
      notifyListeners();
    }
  }

  void add(List<SwipeItem> list) {
    _swipeItems += list;
  }
}

class SwipeItem extends ChangeNotifier {
  final dynamic content;
  final Function(SwipeableContent) likeAction;
  final Function(SwipeableContent) superlikeAction;
  final Function(SwipeableContent) nopeAction;
  Decision decision = Decision.undecided;

  SwipeItem({
    required this.content,
    required this.likeAction,
    required this.superlikeAction,
    required this.nopeAction,
  });

  void like() {
    if (decision == Decision.undecided) {
      decision = Decision.like;
      try {
        likeAction(content);
      } catch (e) {}
      notifyListeners();
    }
  }

  void nope() {
    if (decision == Decision.undecided) {
      decision = Decision.nope;
      try {
        nopeAction(content);
      } catch (e) {}
      notifyListeners();
    }
  }

  void superLike() {
    if (decision == Decision.undecided) {
      decision = Decision.superLike;
      try {
        superlikeAction(content);
      } catch (e) {}
      notifyListeners();
    }
  }

  void resetMatch() {
    if (decision != Decision.undecided) {
      decision = Decision.undecided;
      notifyListeners();
    }
  }
}

enum Decision { undecided, nope, like, superLike }
