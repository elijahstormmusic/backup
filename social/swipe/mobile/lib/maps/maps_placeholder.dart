import 'package:flutter/material.dart';


class Maps extends StatefulWidget {
  @override
  _MapTabViewState createState() => _MapTabViewState();
}

class _MapTabViewState extends State<Maps> {

  @override
  Widget build(BuildContext context) => Container(
    width: MediaQuery.of(context).size.width,
    height: MediaQuery.of(context).size.height,
    child: FittedBox(
      fit: BoxFit.cover,
      child: Image.asset(
        'assets/demo/maps/map.jpg',
      ),
    ),
  );
}
