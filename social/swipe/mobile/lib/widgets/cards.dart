import 'package:flutter/material.dart';


class BigBox extends StatefulWidget {

  String image;
  final VoidCallback? onTap;

  BigBox({
    required this.image,
    this.onTap,
  });

  @override
  _BigBoxState createState() => _BigBoxState();
}

class _BigBoxState extends State<BigBox> {
  @override
  Widget build(BuildContext context) => Container(
    child: PressableCard(
      upElevation: 4,
      downElevation: 2,
      child: Image.asset(
        (widget.image == null)
          ? 'assets/loading/explore_card.jpg'
          : widget.image,
        fit: BoxFit.cover,
      ),
      onPressed: widget.onTap,
    ),
  );
}



class PressableCard extends StatefulWidget {
  const PressableCard({
    required this.child,
    this.borderRadius = const BorderRadius.all(Radius.circular(0)),
    this.upElevation = 2,
    this.downElevation = 0,
    this.shadowColor = Colors.grey,
    this.duration = const Duration(milliseconds: 100),
    this.color = Colors.grey,
    this.onPressed,
    Key? key,
  }) : super(key: key);

  final VoidCallback? onPressed;

  final Widget child;

  final Color color;

  final BorderRadius borderRadius;

  final double upElevation;

  final double downElevation;

  final Color shadowColor;

  final Duration duration;

  @override
  _PressableCardState createState() => _PressableCardState();
}

class _PressableCardState extends State<PressableCard> {
  bool cardIsDown = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        setState(() => cardIsDown = false);
        if (widget.onPressed != null) {
          widget.onPressed!();
        }
      },
      onTapDown: (details) => setState(() => cardIsDown = true),
      onTapCancel: () => setState(() => cardIsDown = false),
      child: AnimatedPhysicalModel(
    elevation: cardIsDown ? widget.downElevation : widget.upElevation,
    borderRadius: widget.borderRadius,
    shape: BoxShape.rectangle,
    shadowColor: widget.shadowColor,
    duration: widget.duration,
    color: widget.color,
    child: ClipRRect(
          borderRadius: widget.borderRadius,
          child: widget.child,
        ),
      ),
    );
  }
}

class PressableCircle extends StatefulWidget {
  const PressableCircle({
    required this.child,
    this.radius = 30,
    this.upElevation = 2,
    this.downElevation = 0,
    this.shadowColor = Colors.black,
    this.duration = const Duration(milliseconds: 100),
    this.onPressed,
    Key? key,
  }) : super(key: key);

  final VoidCallback? onPressed;

  final Widget child;

  final double radius;

  final double upElevation;

  final double downElevation;

  final Color shadowColor;

  final Duration duration;

  @override
  _PressableCircleState createState() => _PressableCircleState();
}

class _PressableCircleState extends State<PressableCircle> {
  bool cardIsDown = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        setState(() => cardIsDown = false);
        if (widget.onPressed != null) {
          widget.onPressed!();
        }
      },
      onTapDown: (details) => setState(() => cardIsDown = true),
      onTapCancel: () => setState(() => cardIsDown = false),
      child: AnimatedPhysicalModel(
        elevation: cardIsDown ? widget.downElevation : widget.upElevation,
        borderRadius: const BorderRadius.all(Radius.circular(9999)),
        shape: BoxShape.rectangle,
        shadowColor: widget.shadowColor,
        duration: widget.duration,
        color: Colors.grey,
        child: Transform.scale(
          scale: cardIsDown ? 0.95 : 1.0,
          child: AnimatedContainer(
            duration: Duration(milliseconds: 200),
            child: widget.child,
          ),
        ),
      ),
    );
  }
}
