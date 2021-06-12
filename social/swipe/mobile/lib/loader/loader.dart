import 'package:flutter/material.dart';

import 'package:flutter_spinkit/flutter_spinkit.dart';


class LoaderAnimation extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _LoaderAnimationAct();
}
class _LoaderAnimationAct extends State<LoaderAnimation> {

  @override
  Widget build(BuildContext context) => Center(
    child: SpinKitFadingCircle(
      itemBuilder: (BuildContext context, int index) {
        return DecoratedBox(
          decoration: BoxDecoration(
            color: index.isEven ? Colors.red : Colors.green,
          ),
        );
      },
    ),
  );
}
