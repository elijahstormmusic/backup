import 'package:flutter/material.dart';

import '../highlights/casing.dart';
import '../swipe/content/users/display.dart';
import '../swipe/content/mock_content.dart';
import '../const.dart';

class UserProfilesHighlights extends CasingFavorites {
  void explore() => print('opening explore');

  @override
  void open(BuildContext _, Map<String, dynamic> data) => Navigator.of(_).push(
    MaterialPageRoute(
      builder: (_) => UserContentDisplayPage(
        data['link'],
      ),
    ),
  );

  @override
  Map<String, dynamic> generateListData(int i) => {
            'link': MockContent.all[i]['cryptlink'],
            'color': MockContent.all[i]['sex'] == 'male' ? 'blue' : 'pink',
            'icon': Constants.demo_source + MockContent.all[i]['pictures'][0],
            'name': MockContent.all[i]['text'],
          };

  @override
  int listSize() => MockContent.all.length;

  @override
  int bookmarkableType() => 0;
}
