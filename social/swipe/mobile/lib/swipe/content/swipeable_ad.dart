import 'package:flutter/material.dart';

import 'swipeable_content.dart';


class ContentAd extends SwipeableContent {
  ContentAd(Map<String, dynamic> input)
    : super(
      text: input['text'],
      color: input['color']
    )
  {

  }
}
