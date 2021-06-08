import 'package:flutter/material.dart';

import '../swipeable.dart';

class SwipeableAd extends Swipeable {

  SwipeableAd({
    this.data = const {},
    this.parent = const Swipe(badState: true),
  });

  @override
  Widget generateInteriorContent() => Container(
    color: data['colors'],
    child: Text('ADVERTISEMENT'),
  );
}
