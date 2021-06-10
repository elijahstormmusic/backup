import 'package:flutter/material.dart';

import 'swipeable_content.dart';


class ContentProfile extends SwipeableContent {
  ContentProfile(Map<String, dynamic> input)
    : super(
      text: input['text'],
      color: input['color']
    )
  { }
}
