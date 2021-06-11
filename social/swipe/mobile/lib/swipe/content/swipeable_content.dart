import 'package:flutter/material.dart';

import '../../const.dart';


class SwipeableContent {
  final String text;
  final String caption;
  final List<String> pictures;
  final String sex;
  final bool online;
  final bool verified;
  final String id;

  SwipeableContent({
    required this.text,
    required this.caption,
    required this.pictures,
    required this.sex,
    required this.online,
    required this.verified,
    required this.id,
  });

  void action() {

  }

  Widget get images {
    List<String> list = [];

    for (int i=0;i<pictures.length;i++) {
      list.add(Constants.demo_source + pictures[i]);
    }

    return PageView.builder(
      itemCount: list.length,
      controller: PageController(viewportFraction: 1),
      itemBuilder: (_, i) {
        return Container(
          child: Image.asset(
            list[i],
          ),
        );
      },
    );
  }

  Widget generate(BuildContext context) => Container(
    child: Stack(
      children: [
        Positioned(
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          child: images,
        ),

        Positioned(
          bottom: 8.0,
          left: 8.0,
          child: Text(
            caption,
          ),
        ),

        Positioned(
          bottom: 26.0,
          left: 8.0,
          child: Text(
            text,
          ),
        ),
      ],
    ),
  );
}
