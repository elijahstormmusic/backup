import 'package:flutter/material.dart';

import '../swipeable.dart';

class SwipeableProfile extends Swipeable {

  SwipeableProfile({
    this.data = const {},
    this.parent = const Swipe(badState: true),
  });

  @override
  Widget generateInteriorContent() => Container(
    color: data['colors'],
    child: Text('PROFILE'),
  );
}
