/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project

import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../partners/partner.dart';
import '../posts/post.dart';
import '../posts/page.dart';
import '../users/profile.dart';
import '../users/data.dart';
import '../screens/home.dart';
import '../data/local.dart';
import '../data/arrival.dart';

class Arrival {
  static final navigator = GlobalKey<NavigatorState>();

  static void forceLogin() => HomeScreen.forceLogin();
}
