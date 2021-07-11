import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';

enum SlideDirection { none, left, right, up }
enum SlideRegion { none, inNopeRegion, inLikeRegion, inSuperLikeRegion }

class DraggableCard extends StatefulWidget {
  final Widget card;
  final bool isDraggable;
  final SlideDirection? slideTo;
  final Function(double distance) onSlideUpdate;
  final Function(SlideRegion slideRegion) onSlideRegionUpdate;
  final Function(SlideDirection direction) onSlideOutComplete;

  DraggableCard({
    required this.card,
    this.isDraggable = true,
    this.slideTo,
    required this.onSlideUpdate,
    required this.onSlideOutComplete,
    required this.onSlideRegionUpdate,
  });

  @override
  _DraggableCardState createState() => _DraggableCardState();
}

class _DraggableCardState extends State<DraggableCard>
    with TickerProviderStateMixin {
  GlobalKey profileCardKey = GlobalKey(debugLabel: 'profile_card_key');
  Offset? cardOffset = const Offset(0.0, 0.0);
  Offset? dragStart;
  Offset? dragPosition;
  Offset? slideBackStart;
  SlideDirection slideOutDirection = SlideDirection.none;
  SlideRegion slideRegion = SlideRegion.none;
  Tween<Offset>? slideOutTween = Tween(
      begin: const Offset(0.0, 0.0), end: Offset(0.0, 0.0));
  AnimationController? slideBackAnimation;
  AnimationController? slideOutAnimation;

  @override
  void initState() {
    slideBackAnimation = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    )
      ..addListener(() => setState(() {
            if (cardOffset == null || slideBackAnimation == null) return;

            cardOffset = Offset.lerp(
              slideBackStart,
              const Offset(0.0, 0.0),
              Curves.elasticOut.transform(slideBackAnimation!.value),
            );

            widget.onSlideUpdate(cardOffset!.distance);

            widget.onSlideRegionUpdate(slideRegion);
          }))
      ..addStatusListener((AnimationStatus status) {
        if (status == AnimationStatus.completed) {
          setState(() {
            dragStart = null;
            slideBackStart = null;
            dragPosition = null;
          });
        }
      });
    slideOutAnimation = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    )
      ..addListener(() {
        setState(() {
          if (cardOffset == null || slideBackAnimation == null) return;

          if (slideOutTween != null) {
            cardOffset = slideOutTween!.evaluate(slideOutAnimation!);
          }

          widget.onSlideUpdate(cardOffset!.distance);

          widget.onSlideRegionUpdate(slideRegion);
        });
      })
      ..addStatusListener((AnimationStatus status) {
        if (status == AnimationStatus.completed) {
          setState(() {
            dragStart = null;
            dragPosition = null;
            slideOutTween = null;
            
            widget.onSlideOutComplete(slideOutDirection);
          });
        }
      });

    super.initState();
  }

  var topLeft, bottomRight;
  Rect anchorBounds = new Rect.fromLTRB(0,0,0,0);
  bool isAnchorInitialized = false;

  @override
  void didUpdateWidget(DraggableCard oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.card.key != oldWidget.card.key) {
      cardOffset = const Offset(0.0, 0.0);
    }

    if (oldWidget.slideTo == null && widget.slideTo != null) {
      switch (widget.slideTo) {
        case SlideDirection.left:
          _slideLeft();
          break;
        case SlideDirection.right:
          _slideRight();
          break;
        case SlideDirection.up:
          _slideUp();
          break;
      }
    }
  }

  @override
  void dispose() {
    if (slideBackAnimation != null)
      slideBackAnimation!.dispose();
    super.dispose();
  }

  Offset? _chooseRandomDragStart() {
    final cardContext = profileCardKey.currentContext!;
    if (cardContext == null || cardContext.size == null) return null;

    final cardTopLeft = (cardContext.findRenderObject() as RenderBox)
        .localToGlobal(const Offset(0.0, 0.0));
    final dragStartY =
        cardContext.size!.height * (Random().nextDouble() < 0.5 ? 0.25 : 0.75) +
            cardTopLeft.dy;
    return Offset(cardContext.size!.width / 2 + cardTopLeft.dx, dragStartY);
  }

  void _slideLeft() async {
    await Future.delayed(Duration(milliseconds: 1)).then((_) {
      if (context.size == null || slideOutAnimation == null) return;

      final screenWidth = context.size!.width;
      dragStart = _chooseRandomDragStart()!;
      if (dragStart == null) return;

      slideOutTween = Tween(
          begin: const Offset(0.0, 0.0), end: Offset(-2 * screenWidth, 0.0));
      slideOutAnimation!.forward(from: 0.0);
    });
  }

  void _slideRight() async {
    await Future.delayed(Duration(milliseconds: 1)).then((_) {
      if (context.size == null || slideOutAnimation == null) return;

      final screenWidth = context.size!.width;
      dragStart = _chooseRandomDragStart()!;
      if (dragStart == null) return;

      slideOutTween = Tween(
          begin: const Offset(0.0, 0.0), end: Offset(2 * screenWidth, 0.0));
      slideOutAnimation!.forward(from: 0.0);
    });
  }

  void _slideUp() async {
    await Future.delayed(Duration(milliseconds: 1)).then((_) {
      if (context.size == null || slideOutAnimation == null) return;

      final screenHeight = context.size!.height;
      dragStart = _chooseRandomDragStart()!;
      if (dragStart == null) return;

      slideOutTween = Tween(
          begin: const Offset(0.0, 0.0), end: Offset(0.0, -2 * screenHeight));
      slideOutAnimation!.forward(from: 0.0);
    });
  }

  void _onPanStart(DragStartDetails details) {
    dragStart = details.globalPosition;

    if (slideBackAnimation == null) return;

    if (slideBackAnimation!.isAnimating) {
      slideBackAnimation!.stop(canceled: true);
    }
  }

  void _onPanUpdate(DragUpdateDetails details) {
    if (cardOffset == null || context.size == null) return;

    final isInLeftRegion = (cardOffset!.dx / context.size!.width) < -0.45;
    final isInRightRegion = (cardOffset!.dx / context.size!.width) > 0.45;
    final isInTopRegion = (cardOffset!.dy / context.size!.height) < -0.40;

    setState(() {
      if (details.globalPosition == null || dragStart == null || cardOffset == null) return;

      if (isInLeftRegion || isInRightRegion) {
        slideRegion = isInLeftRegion
            ? SlideRegion.inNopeRegion
            : SlideRegion.inLikeRegion;
      } else if (isInTopRegion) {
        slideRegion = SlideRegion.inSuperLikeRegion;
      } else {
        slideRegion = SlideRegion.none;
      }

      dragPosition = details.globalPosition;
      cardOffset = dragPosition! - dragStart!;

      widget.onSlideUpdate(cardOffset!.distance);

      widget.onSlideRegionUpdate(slideRegion);
    });
  }

  void _onPanEnd(DragEndDetails details) {
    if (cardOffset == null || context.size == null) return;

    final dragVector = cardOffset! / cardOffset!.distance;

    final isInLeftRegion = (cardOffset!.dx / context.size!.width) < -0.15;
    final isInRightRegion = (cardOffset!.dx / context.size!.width) > 0.15;
    final isInTopRegion = (cardOffset!.dy / context.size!.height) < -0.15;

    setState(() {
      if (
        cardOffset == null || context.size == null ||
        slideOutAnimation == null || slideBackAnimation == null
      ) return;

      if (isInLeftRegion || isInRightRegion) {
        slideOutTween = Tween(
            begin: cardOffset!, end: dragVector * (2 * context.size!.width));
        slideOutAnimation!.forward(from: 0.0);

        slideOutDirection =
            isInLeftRegion ? SlideDirection.left : SlideDirection.right;
      } else if (isInTopRegion) {
        slideOutTween = Tween(
            begin: cardOffset!, end: dragVector * (2 * context.size!.height));
        slideOutAnimation!.forward(from: 0.0);

        slideOutDirection = SlideDirection.up;
      } else {
        slideBackStart = cardOffset!;
        slideBackAnimation!.forward(from: 0.0);
      }

      slideRegion = SlideRegion.none;

      widget.onSlideRegionUpdate(slideRegion);
    });
  }

  double _rotation(Rect dragBounds) {
    if (dragStart != null && cardOffset != null) {
      final rotationCornerMultiplier =
          dragStart!.dy >= dragBounds.top + (dragBounds.height / 2) ? -1 : 1;
      return (pi / 8) *
          (cardOffset!.dx / dragBounds.width) *
          rotationCornerMultiplier;
    } else {
      return 0.0;
    }
  }

  Offset _rotationOrigin(Rect dragBounds) {
    if (dragStart != null) {
      return dragStart! - dragBounds.topLeft;
    } else {
      return const Offset(0.0, 0.0);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!isAnchorInitialized) {
      _initAnchor(context);
    }

    return Transform(
      transform: Matrix4.translationValues(cardOffset!.dx, cardOffset!.dy, 0.0)
        ..rotateZ(_rotation(anchorBounds)),
      origin: _rotationOrigin(anchorBounds),
      child: Container(
        key: profileCardKey,
        width: anchorBounds.width,
        height: anchorBounds.height,
        child: GestureDetector(
          onPanStart: _onPanStart,
          onPanUpdate: _onPanUpdate,
          onPanEnd: _onPanEnd,
          child: widget.card,
        ),
      ),
    );
  }

  _initAnchor(BuildContext context) async {
    await Future.delayed(Duration(milliseconds: 3));
    anchorBounds = new Rect.fromLTRB(
      0,
      0,
      MediaQuery.of(context).size.width,
      MediaQuery.of(context).size.height,
    );

    setState(() {
      isAnchorInitialized = true;
    });

    return;


    RenderBox box = context.findRenderObject() as RenderBox;
    topLeft = box.size.topLeft(box.localToGlobal(const Offset(0.0, 0.0)));
    bottomRight =
        box.size.bottomRight(box.localToGlobal(const Offset(0.0, 0.0)));
    anchorBounds = new Rect.fromLTRB(
      topLeft.dx,
      topLeft.dy,
      bottomRight.dx,
      bottomRight.dy,
    );

    setState(() {
      isAnchorInitialized = true;
    });
  }
}
