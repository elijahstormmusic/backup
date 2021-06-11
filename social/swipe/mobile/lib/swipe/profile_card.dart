import 'package:flutter/material.dart';

class ProfileCard extends StatefulWidget {
  final Widget child;
  final double elevation;
  const ProfileCard({Key? key, this.elevation = 6, required this.child}) : super(key: key);

  @override
  _ProfileCardState createState() => _ProfileCardState();
}

class _ProfileCardState extends State<ProfileCard> {
  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: widget.elevation,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(child: widget.child),
    );
  }
}
