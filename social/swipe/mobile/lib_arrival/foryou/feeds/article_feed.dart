/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:scoped_model/scoped_model.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../../widgets/slide_menu.dart';
import '../../widgets/blobs.dart';
import '../../widgets/cards.dart';
import '../../data/socket.dart';
import '../../data/arrival.dart';
import '../../data/app_state.dart';
import '../../data/preferences.dart';
import '../../articles/article.dart';
import '../../data/link.dart';
import '../../bookmarks/casing.dart';
import '../../styles.dart';
import '../favorites/article.dart';
import '../cards/article_card.dart';
import '../cards/row_card.dart';
import '../search.dart';


class ArticleFeed extends StatefulWidget {
  static _ArticleFeedState _s;

  static void scrollToTop() => _s.scrollToTop();
  static void refresh_state() => _s.refresh_state();

  static void openSnackBar(Map<String, dynamic> input) => _s.openSnackBar(input);

  @override
  _ArticleFeedState createState() {
    _s = _ArticleFeedState();
    return _s;
  }
}

class _ArticleFeedState extends State<ArticleFeed> {

  ScrollController _scrollController;
  RefreshController _refreshController;
  RowCard _loadingCard;
  bool showUploadButton = true, _scrolling = false;
  bool _allowRequest = true, _requestFailed = false;
  bool kill_reflow = false;
  final REQUEST_AMOUNT = 10;
  final _scrollTargetDistanceFromBottom = 400.0;
  Search _search;

  @override
  void initState() {
    super.initState();
    socket.delivery.add(this);
    _scrollController = ScrollController();
    _scrollController.addListener(_scrollListener);
    _refreshController = RefreshController(
      initialRefresh: false,
    );
    _loadingCard = RowLoading();
    _search = Search();
    if (ArrivalData.article_feed==null) {
      ArrivalData.article_feed = List<RowCard>();
    }
    if (ArrivalData.article_feed.length==0) {
      _pullNext(10);
    }
  }
  @override
  void dispose() {
    kill_reflow = true;
    socket.delivery.removeWhere((x) => x==this);
    _scrollController.dispose();
    super.dispose();
  }

  void _pullNext(int amount) {
    if (!_allowRequest) return;
    _allowRequest = false;
    socket.emit('foryou ask', {
      'amount': amount,
      'type': 'articles',
    });
    _checkForFailure();
  }
  bool _responseHeard, _forceFailCurrentState = false;
  int _timesFailedToHearResponse = 0;
  void _checkForFailure() async {
    _responseHeard = false;
    await Future.delayed(const Duration(seconds: 6));
    if (!_responseHeard) {
      _timesFailedToHearResponse++;
      if (_timesFailedToHearResponse>3) {
        if (kill_reflow) return;
        openSnackBar({
          'text': 'Network error. A-401',
        });
        setState(() => _forceFailCurrentState = true);
        return;
      }
      _checkForFailure();
    }
  }
  void _refresh() {
    if (!_allowRequest) return;
    ArrivalData.article_feed = List<RowCard>();
    _pullNext(REQUEST_AMOUNT);
  }
  void _loadMore() {
    if (!_allowRequest) return;
    _pullNext(REQUEST_AMOUNT);
  }
  void response(var data) async {
    _responseHeard = true;
    _timesFailedToHearResponse = 0;
    if (data.length==0) {
      _requestFailed = true;
      _refreshController.loadComplete();
      _refreshController.refreshCompleted();
      return;
    }

    List<RowCard> list = List<RowCard>();
    var card, result;

    try {
      for (var i=0;i<data.length;i++) {
        try {
          if (data[i]['type']!=DataType.article) continue;
          result = Article.json(data[i]);
          card = RowArticle(result);
          ArrivalData.innocentAdd(ArrivalData.articles, result);
        } catch (e) {
          continue;
        }

        list.add(card);
      }
      _refreshController.loadComplete();
      _refreshController.refreshCompleted();
    }
    catch (e) {
      _requestFailed = true;
      _refreshController.loadComplete();
      _refreshController.refreshCompleted();
      print(e);
      return;
    }

    _requestFailed = false;
    if (kill_reflow) return;
    setState(() => ArrivalData.article_feed += list);
    ArrivalData.save();
    await Future.delayed(const Duration(seconds: 1));
    _allowRequest = true;
  }

  void _scrollListener() {
    if (_scrollController.offset + _scrollTargetDistanceFromBottom
        >= _scrollController.position.maxScrollExtent) {
      _pullNext(REQUEST_AMOUNT);
    }
  }
  void _onEndScroll(ScrollMetrics metrics) {
    // setState(() => _scrolling = false);
    // _scrollController.saveScrollOffset();
  }
  void _onStartScroll(ScrollMetrics metrics) {
    // setState(() => _scrolling = true);
  }
  void scrollToTop() {
    _scrollController.animateTo(
      0.0,
      curve: Curves.easeOut,
      duration: const Duration(milliseconds: 300),
    );
  }
  void refresh_state() => setState(() => 0);

  Widget _buildForyouList(BuildContext context, var prefs) {
    return SmartRefresher(
      enablePullDown: false,
      enablePullUp: true,
      header: WaterDropHeader(),
      footer: CustomFooter(
        builder: (BuildContext context, LoadStatus mode){
          Widget body;
          if (mode==LoadStatus.idle){
            body = Container();
          }
          else if (mode==LoadStatus.loading){
            body = CupertinoActivityIndicator();
          }
          else if (mode == LoadStatus.failed){
            openSnackBar({
              'text': 'Network Error'
            });
            body = Container();
          }
          else if (mode == LoadStatus.canLoading){
            body = Container();
          }
          else {
            body = Container();
          }
          return Container(
            height: 55.0,
            child: Center(child: body),
          );
        },
      ),
      controller: _refreshController,
      onRefresh: _refresh,
      onLoading: _loadMore,
      child: NotificationListener<ScrollNotification>(
        onNotification: (scrollNotification) {
          if (scrollNotification is ScrollStartNotification) {
            _onStartScroll(scrollNotification.metrics);
          } else if (scrollNotification is ScrollEndNotification) {
            _onEndScroll(scrollNotification.metrics);
          }
        },
        child: ListView.builder(
          controller: _scrollController,
          itemCount: ArrivalData.article_feed.length + 2,
          itemBuilder: (context, index) {
            if (index == 0) {
              return ArticleFavorites();
            } else if (index <= ArrivalData.article_feed.length) {
              return ArrivalData.article_feed[index-1].generate(prefs);
            } else {
              if (_forceFailCurrentState) {
                return Styles.ArrivalErrorPage('Make sure you are conntected to the internet.');
              }
              return _loadingCard.generate(prefs);
            }
          },
        ),
      ),
    );
  }

  SnackBar _snackBar;
  void openSnackBar(Map<String, dynamic> input) {
    try {
      Scaffold.of(context).showSnackBar(SnackBar(
        content: Text(input['text']),
        backgroundColor: Styles.ArrivalPalletteRed,
        elevation: 15.0,
        behavior: SnackBarBehavior.floating,
        duration: input['duration']==null ? null : Duration(seconds: input['duration']),
        action: input['action']==null ? null : SnackBarAction(
          textColor: Styles.ArrivalPalletteBlue,
          disabledTextColor: Styles.ArrivalPalletteGrey,
          label: input['action-label'],
          onPressed: input['action'],
        ),
      ));
    } catch (e) {

    }
  }

  @override
  Widget build(BuildContext context) {

    return CupertinoTabView(
      builder: (context) {
        var appState = ScopedModel.of<AppState>(context, rebuildOnChange: true);
        var prefs = ScopedModel.of<Preferences>(context, rebuildOnChange: true);
        var themeData = CupertinoTheme.of(context);
        return Scaffold(
          appBar: AppBar(
            title: Styles.ArrivalAppbarTitle(),
            backgroundColor: Styles.ArrivalPalletteRed,
            actions: <Widget>[
              IconButton(
                onPressed: () => setState(() => _search.toggleSearch()),
                icon: const Icon(Icons.search),
              ),
            ],
          ),
          drawer: SlideMenu(),
          backgroundColor: Styles.ArrivalPalletteWhite,
          body: SafeArea(
            bottom: false,
            child: Stack(
              children: <Widget>[
                _buildForyouList(context, prefs),
                _search,
              ],
            ),
          ),
        );
      },
    );
  }
}
