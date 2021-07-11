import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import 'package:stream_chat_flutter/stream_chat_flutter.dart';

import 'login/login_screen.dart';
import 'login/transition_route_observer.dart';
import 'login/user_state.dart';
import 'dashboard_screen.dart';
import 'chat/chat.dart';
import 'partners/cache.dart';
import 'swipe/content/users/cache.dart';
// import 'maps/maps.dart';

void main() async {
  SystemChrome.setSystemUIOverlayStyle(
    SystemUiOverlayStyle(
      systemNavigationBarColor:
          SystemUiOverlayStyle.dark.systemNavigationBarColor,
    ),
  );

  final client = StreamChatClient(
    'dz5f4d5kzrue',
    logLevel: Level.INFO,
  );

  await client.connectUser(
    User(
      id: 'throbbing-brook-2',
      extraData: {
        'image': 'http://local.getstream.io:9000/random_png/?id=throbbing-brook-2&amp;name=throbbing',
      },
    ),
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoidGhyb2JiaW5nLWJyb29rLTIiLCJleHAiOjE2MjM2NzMzODF9.d3rSSehbKfxjnr3wa0mkDSzj8cSZyDSoosPaVMinMRM',
  );

  runApp(SwipeApp(client));
}

class SwipeApp extends StatelessWidget {

  final StreamChatClient client;
  SwipeApp(this.client);

  @override
  Widget build(BuildContext context) {
    dynamic launchState = LoginScreen();
    String _initialRoute = LoginScreen.routeName;

    if (UserState.User != '') {
      launchState = DashboardScreen();
      _initialRoute = DashboardScreen.routeName;
    }

    if (
      !kReleaseMode &&
      AppDebugLogin.bypass
    ) {
      launchState = DashboardScreen();
      _initialRoute = DashboardScreen.routeName;

      UserState.User = AppDebugLogin.username;
      UserState.Auth = AppDebugLogin.password;
    }

    PartnerCache.load_mock_data();
    UserCache.load_mock_data();

    return MaterialApp(
      title: 'Swipe',
      // theme: ThemeData(
      //   // brightness: Brightness.dark,
      //   primarySwatch: Colors.deepPurple,
      //   accentColor: Colors.orange,
      //   textSelectionTheme: TextSelectionThemeData(cursorColor: Colors.orange),
      //   fontFamily: 'SourceSansPro',
      //   textTheme: TextTheme(
      //     headline3: TextStyle(
      //       fontFamily: 'OpenSans',
      //       fontSize: 45.0,
      //       // fontWeight: FontWeight.w400,
      //       color: Colors.orange,
      //     ),
      //     button: TextStyle(
      //       // OpenSans is similar to NotoSans but the uppercases look a bit better IMO
      //       fontFamily: 'OpenSans',
      //     ),
      //     caption: TextStyle(
      //       fontFamily: 'NotoSans',
      //       fontSize: 12.0,
      //       fontWeight: FontWeight.normal,
      //       color: Colors.deepPurple[300],
      //     ),
      //     headline1: TextStyle(fontFamily: 'Quicksand'),
      //     headline2: TextStyle(fontFamily: 'Quicksand'),
      //     headline4: TextStyle(fontFamily: 'Quicksand'),
      //     headline5: TextStyle(fontFamily: 'NotoSans'),
      //     headline6: TextStyle(fontFamily: 'NotoSans'),
      //     subtitle1: TextStyle(fontFamily: 'NotoSans'),
      //     bodyText1: TextStyle(fontFamily: 'NotoSans'),
      //     bodyText2: TextStyle(fontFamily: 'NotoSans'),
      //     subtitle2: TextStyle(fontFamily: 'NotoSans'),
      //     overline: TextStyle(fontFamily: 'NotoSans'),
      //   ),
      // ),
      builder: (context, widget) {
        return StreamChat(
          child: widget,
          client: client,
        );
      },
      navigatorObservers: [TransitionRouteObserver()],
      initialRoute: _initialRoute,
      home: launchState,
      routes: {
        LoginScreen.routeName: (context) => LoginScreen(),
        DashboardScreen.routeName: (context) => DashboardScreen(),
      },
    );
  }
}
