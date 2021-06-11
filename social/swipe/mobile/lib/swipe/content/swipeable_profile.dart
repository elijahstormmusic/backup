import 'package:flutter/material.dart';

import 'swipeable_content.dart';


class ContentProfile extends SwipeableContent {
  ContentProfile(Map<String, dynamic> input)
    : super(
      text: input['text'],
      caption: input['caption'],
      pictures: input['pictures'],
      sex: input['sex'],
      online: input['online'],
      verified: input['verified'],
      id: input['id'],
    )
  { }
}
