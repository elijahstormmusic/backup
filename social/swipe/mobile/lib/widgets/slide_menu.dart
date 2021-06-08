/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../team_support/mission.dart';
import '../team_support/report.dart';
import '../team_support/contact.dart';
import '../login/user_state.dart';


class SlideMenu extends StatefulWidget {
  @override
  _SlideState createState() => _SlideState();
}

class _SlideState extends State<SlideMenu> {
  @override
  Widget build(BuildContext context) => Drawer(
    child: ListView(
      physics: ClampingScrollPhysics(),
      padding: EdgeInsets.zero,
      children: <Widget>[
        DrawerHeader(
          child: Container(),
          decoration: BoxDecoration(
            image: DecorationImage(
              fit: BoxFit.fill,
              image: AssetImage(
                'assets/images/generic_golf_slide_menu.jpg'
              )
            )
          ),
        ),
        ListTile(
          leading: const Icon(Icons.verified_user),
          title: Text('Profile'),
          // onTap: () => Navigator.of(context).push(MaterialPageRoute(
          //                   builder: (context) => MyProfilePage(),
          //                   fullscreenDialog: true,
          //                 )),
        ),
        ListTile(
          leading: const Icon(Icons.settings),
          title: Text('Settings'),
          // onTap: () => Navigator.of(context).push(MaterialPageRoute(
          //                   builder: (context) => SettingsPage(),
          //                   fullscreenDialog: true,
          //                 )),
        ),
        ListTile(
          leading: const Icon(Icons.border_color),//FontAwesomeIcons.bullhorn
          title: Text('Feedback'),
          onTap: () => Navigator.of(context).push(MaterialPageRoute(
                            builder: (context) => ContactUs(),
                            fullscreenDialog: true,
                          )),
        ),
        ListTile(
          leading: const Icon(Icons.bolt),
          title: Text('Our Mission'),
          onTap: () => Navigator.of(context).push(MaterialPageRoute(
                            builder: (context) => OurMission(),
                            fullscreenDialog: true,
                          )),
        ),
        ListTile(
          leading: const Icon(FontAwesomeIcons.signOutAlt),
          title: Text('Logout'),
          onTap: () {
            UserState.User = '';
            Navigator.of(context)
                .pushReplacementNamed('/')
                .then((_) => false);
          },
        ),
      ],
    ),
  );
}
