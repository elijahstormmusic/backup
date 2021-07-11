import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';


class CloseButton extends StatefulWidget {
  const CloseButton(this.onPressed);

  final VoidCallback onPressed;

  @override
  CloseButtonState createState() {
    return CloseButtonState();
  }
}

/// Partially overlays and then blurs its child's background.
class FrostedBox extends StatelessWidget {
  const FrostedBox({
    required this.child,
    Key? key,
  }) : super(key: key);

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white,
        ),
        child: child,
      ),
    );
  }
}

/// An Icon that implicitly animates changes to its color.
class ColorChangingIcon extends ImplicitlyAnimatedWidget {
  const ColorChangingIcon(
    @required this.icon, {
    this.color = Colors.black,
    required this.size,
    required Duration duration,
    Key? key,
  })  : assert(icon != null),
        assert(color != null),
        assert(duration != null),
        super(key: key, duration: duration);

  final Color color;

  final IconData icon;

  final double size;

  @override
  _ColorChangingIconState createState() => _ColorChangingIconState();
}

class _ColorChangingIconState
    extends AnimatedWidgetBaseState<ColorChangingIcon> {
  ColorTween? _colorTween;

  @override
  Widget build(BuildContext context) {
    return Icon(
      widget.icon,
      semanticLabel: 'Close button',
      size: widget.size,
      color: _colorTween?.evaluate(animation),
    );
  }

  @override
  void forEachTween(TweenVisitor<dynamic> visitor) {
    _colorTween = visitor(
      _colorTween,
      widget.color,
      (dynamic value) => ColorTween(begin: value as Color),
    ) as ColorTween;
  }
}

class CloseButtonState extends State<CloseButton> {
  bool tapInProgress = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (details) {
        setState(() => tapInProgress = true);
      },
      onTapUp: (details) {
        setState(() => tapInProgress = false);
        widget.onPressed();
      },
      onTapCancel: () {
        setState(() => tapInProgress = false);
      },
      child: ClipOval(
        child: FrostedBox(
          child: Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(15),
            ),
            child: Center(
              child: ColorChangingIcon(
                Icons.back,
                duration: Duration(milliseconds: 300),
                color: tapInProgress
                    ? Color(0xff808080)
                    : Colors.red,
                size: 20,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
