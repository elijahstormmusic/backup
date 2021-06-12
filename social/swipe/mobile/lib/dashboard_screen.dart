import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter_login/theme.dart';
import 'package:flutter_login/widgets.dart';

import 'login/transition_route_observer.dart';
import 'login/constants.dart';
import 'widgets/animated_numeric_text.dart';
import 'widgets/fade_in.dart';
import 'widgets/round_button.dart';
// import 'widgets/slide_menu.dart';

import 'loader/loader.dart';
import 'swipe/swipe.dart';
// import 'maps/maps.dart';
// import 'chat/chat.dart';
// import 'explore/explore.dart';


class DashboardScreen extends StatefulWidget {
  static const routeName = '/dashboard';

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin, TransitionRouteAware {

  Future<bool> _gotoLogin(BuildContext context) {
    return Navigator.of(context)
        .pushReplacementNamed('/auth')
        // we dont want to pop the screen, just replace it completely
        .then((_) => false);
  }

  final routeObserver = TransitionRouteObserver<PageRoute?>();
  static const headerAniInterval = Interval(.1, .3, curve: Curves.easeOut);
  late Animation<double> _headerScaleAnimation;
  AnimationController? _loadingController;
  bool _onload = false;

  @override
  void initState() {
    super.initState();

    _loadingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1250),
    );

    _headerScaleAnimation =
        Tween<double>(begin: .6, end: 1).animate(CurvedAnimation(
      parent: _loadingController!,
      curve: headerAniInterval,
    ));

    SchedulerBinding.instance!.addPostFrameCallback((_) {
      _fadeIn();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    routeObserver.subscribe(
        this, ModalRoute.of(context) as PageRoute<dynamic>?);
  }

  @override
  void dispose() {
    routeObserver.unsubscribe(this);
    _loadingController!.dispose();
    super.dispose();
  }

  @override
  void didPushAfterTransition() => _loadingController!.forward();

  AppBar _buildAppBar(ThemeData theme) {
    final menuBtn = IconButton(
      color: theme.accentColor,
      icon: const Icon(FontAwesomeIcons.bars),
      onPressed: () {

      },
    );
    // final signOutBtn = IconButton(
    //   icon: const Icon(FontAwesomeIcons.golfBall),//signOutAlt
    //   color: theme.accentColor,
    //   onPressed: () => _gotoChat(context),
    // );
    final title = Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Hero(
              tag: Constants.logoTag,
              child: Image.asset(
                'assets/images/ecorp.png',
                filterQuality: FilterQuality.high,
                height: 30,
              ),
            ),
          ),
          HeroText(
            Constants.appName,
            tag: Constants.titleTag,
            viewState: ViewState.shrunk,
            style: LoginThemeHelper.loginTextStyle,
          ),
          SizedBox(width: 20),
        ],
      ),
    );

    return AppBar(
      // leading: FadeIn(
      //   controller: _loadingController,
      //   offset: .3,
      //   curve: headerAniInterval,
      //   fadeDirection: FadeDirection.startToEnd,
      //   child: menuBtn,
      // ),
      // actions: <Widget>[
      //   FadeIn(
      //     controller: _loadingController,
      //     offset: .3,
      //     curve: headerAniInterval,
      //     fadeDirection: FadeDirection.endToStart,
      //     child: signOutBtn,
      //   ),
      // ],
      title: title,
      backgroundColor: theme.primaryColor.withOpacity(.1),
      elevation: 0,
      textTheme: theme.accentTextTheme,
      iconTheme: theme.accentIconTheme,
    );
  }

  Widget _buildHeader(ThemeData theme) {
    final primaryColor =
        Colors.primaries.where((c) => c == theme.primaryColor).first;
    final accentColor =
        Colors.primaries.where((c) => c == theme.accentColor).first;
    final linearGradient = LinearGradient(colors: [
      primaryColor.shade800,
      primaryColor.shade200,
    ]).createShader(Rect.fromLTWH(0.0, 0.0, 418.0, 78.0));

    return ScaleTransition(
      scale: _headerScaleAnimation,
      child: FadeIn(
        controller: _loadingController,
        curve: headerAniInterval,
        fadeDirection: FadeDirection.bottomToTop,
        offset: .5,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text(
                  '\$',
                  style: theme.textTheme.headline3!.copyWith(
                    fontWeight: FontWeight.w300,
                    color: accentColor.shade400,
                  ),
                ),
                SizedBox(width: 5),
                AnimatedNumericText(
                  initialValue: 14,
                  targetValue: 3467.87,
                  curve: Interval(0, .5, curve: Curves.easeOut),
                  controller: _loadingController!,
                  style: theme.textTheme.headline3!.copyWith(
                    foreground: Paint()..shader = linearGradient,
                  ),
                ),
              ],
            ),
            Text('Account Balance', style: theme.textTheme.caption),
          ],
        ),
      ),
    );
  }

  Widget _buildButton(
      {Widget? icon, String? label, required Interval interval}) {
    return RoundButton(
      icon: icon,
      label: label,
      loadingController: _loadingController,
      interval: Interval(
        interval.begin,
        interval.end,
        curve: ElasticOutCurve(0.42),
      ),
      onPressed: () {},
    );
  }

  Widget _buildDashboardGrid() {
    const step = 0.04;
    const aniInterval = 0.75;

    return GridView.count(
      padding: const EdgeInsets.symmetric(
        horizontal: 32.0,
        vertical: 20,
      ),
      childAspectRatio: .9,
      // crossAxisSpacing: 5,
      crossAxisCount: 3,
      children: [
        _buildButton(
          icon: Icon(FontAwesomeIcons.user),
          label: 'Profile',
          interval: Interval(0, aniInterval),
        ),
        _buildButton(
          icon: Container(
            // fix icon is not centered like others for some reasons
            padding: const EdgeInsets.only(left: 16.0),
            alignment: Alignment.centerLeft,
            child: Icon(
              FontAwesomeIcons.moneyBillAlt,
              size: 20,
            ),
          ),
          label: 'Fund Transfer',
          interval: Interval(step, aniInterval + step),
        ),
        _buildButton(
          icon: Icon(FontAwesomeIcons.handHoldingUsd),
          label: 'Payment',
          interval: Interval(step * 2, aniInterval + step * 2),
        ),
        _buildButton(
          icon: Icon(FontAwesomeIcons.chartLine),
          label: 'Report',
          interval: Interval(0, aniInterval),
        ),
        _buildButton(
          icon: Icon(Icons.vpn_key),
          label: 'Register',
          interval: Interval(step, aniInterval + step),
        ),
        _buildButton(
          icon: Icon(FontAwesomeIcons.history),
          label: 'History',
          interval: Interval(step * 2, aniInterval + step * 2),
        ),
        _buildButton(
          icon: Icon(FontAwesomeIcons.ellipsisH),
          label: 'Other',
          interval: Interval(0, aniInterval),
        ),
        _buildButton(
          icon: Icon(FontAwesomeIcons.search, size: 20),
          label: 'Search',
          interval: Interval(step, aniInterval + step),
        ),
        _buildButton(
          icon: Icon(FontAwesomeIcons.slidersH, size: 20),
          label: 'Settings',
          interval: Interval(step * 2, aniInterval + step * 2),
        ),
      ],
    );
  }

  Widget _buildDebugButtons() {
    const textStyle = TextStyle(fontSize: 12, color: Colors.white);

    return Positioned(
      bottom: 0,
      right: 0,
      child: Row(
        children: <Widget>[
          MaterialButton(
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            color: Colors.red,
            onPressed: () => _loadingController!.value == 0
                ? _loadingController!.forward()
                : _loadingController!.reverse(),
            child: Text('loading', style: textStyle),
          ),
        ],
      ),
    );
  }

  int _selectedIndex = 0;
  void _selectedTab(int index) {
    if (_selectedIndex == index) {
      // Arrival.navigator.currentState.popUntil((route) => route.isFirst);
      if (_selectedIndex == 0) {
        // ArticleFeed.scrollToTop();
      }
      else if (_selectedIndex == 1) {
        // PostFeed.scrollToTop();
      }
      else if (_selectedIndex == 2) {
        // ForYouPage.scrollToTop();
      }
      else if (_selectedIndex == 3) {
        // PartnerFeed.scrollToTop();
      }
      else if (_selectedIndex == 4) {
        // Maps.scrollToTop();
      }
      else {
        // ForYouPage.scrollToTop();
      }
    }
    setState(() => _selectedIndex = index);
  }
  Widget _decideInteriorBody() {
    var choice;

    switch (_selectedIndex) {
      case 0:
        choice = Swipe();
        break;
      case 1:
        // choice = Explore();
        break;
      case 2:
        // choice = Maps();
        break;
      case 3:
        // choice = Chat();
        break;
      default:
        choice = Swipe();
        break;
    }

    return Stack(
      children: [
        LoaderAnimation(),

        AnimatedOpacity(
          duration: Duration(milliseconds: 500),
          opacity: _onload ? 1.0 : 0.0,
          child: choice,
        ),
      ],
    );
  }
  void _fadeIn() async {
    await Future.();
    setState(() => _onload = true);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return WillPopScope(
      onWillPop: () => _gotoLogin(context),
      child: SafeArea(
        child: Scaffold(
          // appBar: _buildAppBar(theme),
          // drawer: SlideMenu(),
          bottomNavigationBar: BottomNavigationBar(
            onTap: _selectedTab,
            enableFeedback: true,
            type: BottomNavigationBarType.fixed,
            items: const <BottomNavigationBarItem>[
              BottomNavigationBarItem(
                icon: Icon(Icons.supervisor_account),
                label: '',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.home),
                label: '',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.map),
                label: '',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.chat),
                label: '',
              ),
            ],
            currentIndex: _selectedIndex,
            backgroundColor: Colors.white,
            selectedIconTheme: IconThemeData(
              color: Colors.red,
              size: 24.0,
            ),
            unselectedIconTheme: IconThemeData(
              size: 24.0,
            ),
            // selectedItemColor: Styles.ArrivalPalletteRed,
            selectedFontSize: 16.0,
            unselectedFontSize: 16.0,
            showSelectedLabels: false,
            showUnselectedLabels: false,
          ),
          body: _decideInteriorBody(),
        ),
      ),
    );
  }
}
