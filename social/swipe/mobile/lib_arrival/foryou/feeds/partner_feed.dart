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
import '../../widgets/dialog.dart';
import '../../data/link.dart';
import '../../data/socket.dart';
import '../../data/arrival.dart';
import '../../data/app_state.dart';
import '../../data/preferences.dart';
import '../../partners/partner.dart';
import '../../partners/sale.dart';
import '../../styles.dart';
import '../favorites/partner.dart';
import '../cards/partner_card.dart';
import '../cards/sale_card.dart';
import '../cards/row_card.dart';
import '../search.dart';


class PartnerFeed extends StatefulWidget {
  static _PartnerFeedState _s;

  static void scrollToTop() => _s.scrollToTop();
  static void refresh_state() => _s.refresh_state();

  static void openSnackBar(Map<String, dynamic> input) => _s.openSnackBar(input);

  @override
  _PartnerFeedState createState() {
    _s = _PartnerFeedState();
    return _s;
  }
}

class _PartnerFeedState extends State<PartnerFeed> {

  ScrollController _scrollController;
  RefreshController _refreshController;
  RowCard _loadingCard;
  bool showUploadButton = true, _scrolling = false;
  bool _allowRequest = true, _requestFailed = false;
  final REQUEST_AMOUNT = 10;
  final _scrollTargetDistanceFromBottom = 400.0;
  Search _search;
  List<RowCard> _filteredPartnerFeed;

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

    _filteredPartnerFeed = List<RowCard>();
    if (ArrivalData.partner_feed==null) {
      ArrivalData.partner_feed = List<RowCard>();
    }
    if (ArrivalData.partner_feed.length==0) {
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
  @override
  void setState(_) async {
    if (!mounted) return;
    _();
    await _createFilteredFeed();
    super.setState(() {});
  }

  void _pullNext(int amount) {
    if (!_allowRequest) return;
    _allowRequest = false;
    socket.emit('foryou ask', {
      'amount': amount,
      'type': 'partners sales',
    });
    _checkForFailure();
  }
  bool _responseHeard, _forceFailCurrentState = false;
  int _timesFailedToHearResponse = 0;
  bool kill_reflow = false;
  void _checkForFailure() async {
    _responseHeard = false;
    await Future.delayed(const Duration(seconds: 6));
    if (!_responseHeard) {
      _timesFailedToHearResponse++;
      if (_timesFailedToHearResponse>3) {
        if (kill_reflow) return;
        openSnackBar({
          'text': 'Network error. A-402',
        });
        setState(() => _forceFailCurrentState = true);
        return;
      }
      _checkForFailure();
    }
  }
  void _refresh() {
    if (!_allowRequest) return;
    ArrivalData.partner_feed = List<RowCard>();
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
          if (data[i]['type']==DataType.partner) {
            result = Partner.json(data[i]);
            card = RowPartner(result);
            ArrivalData.innocentAdd(ArrivalData.partners, result);
          }
          else if (data[i]['type']==DataType.sale) {
            try {
              var _sale_list = data[i]['list'];
              List<Sale> result_list = List<Sale>();
              for (int _sale=0;_sale<_sale_list.length;_sale++) {
                try {
                  result = Sale.json(_sale_list[_sale]);
                  ArrivalData.innocentAdd(result_list, result);
                  ArrivalData.innocentAdd(ArrivalData.sales, result);
                }
                catch (e) {
                  print('''
                  ==========================
                    Sale.json Data Parse Error ${i}
                  --------------------------
                        $e
                  ==========================
                  ''');
                  continue;
                }
              }
              card = RowSale(result_list);
            } catch (e) {
              print('''
              ==========================
                RowSale Data Parse Error ${i}
              --------------------------
                    $e
              ==========================
              ''');
              continue;
            }
          }
        } catch (e) {
          print('''
          ==========================
            Partner Feed Error ${i}
          --------------------------
                $e
          ==========================
          ''');
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
    setState(() => ArrivalData.partner_feed += list);
    ArrivalData.save();
    await Future.delayed(const Duration(seconds: 1));
    _allowRequest = true;
  }
  void _createFilteredFeed() async {
    var prefs = ScopedModel.of<Preferences>(context, rebuildOnChange: true);
    _filteredPartnerFeed = List<RowCard>();

    for (int i=0;i<ArrivalData.partner_feed.length;i++) {
      try {
        // if (skip) continue;  // note to developer -> if should skip

        if (ArrivalData.partner_feed[i].datatype==DataType.sale) {
          List<Sale> filteredSales = List<Sale>();
          var saleCard = RowSale.source(ArrivalData.partner_feed[i]);

          for (int j=0;j<saleCard.sales.length;j++) {

            if (saleCard.sales[j].partner.priceRange > _optionsPriceRange) continue;

            if (_optionsBookmarks) {
              if (!(await prefs.isBookmarked(
                DataType.sale,
                saleCard.sales[j].cryptlink
              ))) continue;
            }

            if (_highRatingFilter) {
              if (Partner.link(saleCard.sales[j].cryptlink).rating < 5.0) continue;
            }

            filteredSales.add(saleCard.sales[j]);
          }

          _filteredPartnerFeed.add(RowSale(filteredSales));

          continue;
        }

        if (Partner.link(ArrivalData.partner_feed[i].cryptlink).
          priceRange > _optionsPriceRange) continue;

        if (_optionsBookmarks) {
          if (!(await prefs.isBookmarked(
            ArrivalData.partner_feed[i].datatype,
            ArrivalData.partner_feed[i].cryptlink
          ))) continue;
        }

        if (_highRatingFilter) {
          if (Partner.link(ArrivalData.partner_feed[i].cryptlink).rating < 5.0) continue;
        }

        if (_optionsArrivalDiscounts) {
          if (ArrivalData.partner_feed[i].datatype!=DataType.sale) continue;
        }

        if (_optionsAppointments) {

        }

        if (_optionsPickup) {

        }

        _filteredPartnerFeed.add(ArrivalData.partner_feed[i]);
      }
      catch (e) {
        print('''
        ==========================
        Filter List Error ${i}
        --------------------------
        $e
        ==========================
        ''');
      }
    }
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
          itemCount: _filteredPartnerFeed.length + 2,
          itemBuilder: (context, index) {
            if (index == 0) {
              return Column(
                children: [
                  PartnerFavorites(),

                  _filterOptions(),
                ],
              );
            } else if (index <= _filteredPartnerFeed.length) {
              return _filteredPartnerFeed[index-1].generate(prefs);
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



  bool _optionsPickup = false, _optionsBookmarks = false, _highRatingFilter = false,
    _optionsArrivalDiscounts = false, _optionsAppointments = false;
  int _optionsPriceRange = 1;
  String _optionsPriceText = '\$\$';

  Widget _filterOptions() {
    const _padding = const EdgeInsets.symmetric(
      horizontal: 6,
    );

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 4,
        vertical: 6,
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            Container(
              padding: _padding,
              child: FilterChip(
                label: Text('Bookmarks'),
                selected: _optionsBookmarks,
                onSelected: (bool value) {
                  setState(() => _optionsBookmarks = value);
                },
              ),
            ),

            Container(
              padding: _padding,
              child: ActionChip(
                label: Text(_optionsPriceText),
                onPressed: () {
                  Function(dynamic, int) _action = (context, input) {
                    Navigator.of(context).pop();

                    setState(() {
                      _optionsPriceRange = input;

                      const priceText = '\$';
                      _optionsPriceText = priceText;

                      for (int i=0;i<_optionsPriceRange;i++) {
                        _optionsPriceText += priceText;
                      }
                    });
                  };

                  showDialog<void>(context: context, builder: (context) => SimpleDialog(
                    title: Text('Choose Price Range'),
                    children: [
                      ArrivalDialogItem(
                        icon: Icons.attach_money,
                        color: _optionsPriceRange == 0 ? Styles.ArrivalPalletteRed : Styles.ArrivalPalletteGrey,
                        text: '\$',
                        onPressed: () => _action(context, 0),
                      ),
                      ArrivalDialogItem(
                        icon: Icons.attach_money,
                        color: _optionsPriceRange == 1 ? Styles.ArrivalPalletteRed : Styles.ArrivalPalletteGrey,
                        text: '\$\$',
                        onPressed: () => _action(context, 1),
                      ),
                      ArrivalDialogItem(
                        icon: Icons.attach_money,
                        color: _optionsPriceRange == 2 ? Styles.ArrivalPalletteRed : Styles.ArrivalPalletteGrey,
                        text: '\$\$\$',
                        onPressed: () => _action(context, 2),
                      ),
                      ArrivalDialogItem(
                        icon: Icons.attach_money,
                        color: _optionsPriceRange == 3 ? Styles.ArrivalPalletteRed : Styles.ArrivalPalletteGrey,
                        text: '\$\$\$\$',
                        onPressed: () => _action(context, 3),
                      ),
                    ],
                  ));
                },
              ),
            ),

            Container(
              padding: _padding,
              child: InputChip(
                avatar: Container(
                  child: _optionsArrivalDiscounts ? null : Text('A'),
                ),
                label: Text('Arrival Discounts', style: TextStyle(fontWeight: FontWeight.bold)),
                selected: _optionsArrivalDiscounts,
                onSelected: (bool value) {
                  setState(() => _optionsArrivalDiscounts = value);
                },
              ),
            ),

            Container(
              padding: _padding,
              child: FilterChip(
                label: Text('4.0 +'),
                selected: _highRatingFilter,
                onSelected: (bool value) {
                  setState(() => _highRatingFilter = value);
                },
              ),
            ),
          ],
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
