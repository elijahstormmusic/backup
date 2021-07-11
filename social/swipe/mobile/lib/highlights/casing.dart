import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../widgets/cards.dart';


class CasingFavorites extends StatefulWidget {

  void open(BuildContext context, Map<String, dynamic> data) {}
  Map<String, dynamic> generateListData(int index) => {};
  int listSize() => 0;
  void explore() => {};
  String getExploreText() => 'explore';

  @override
  State<CasingFavorites> createState() => _CasingCircle();
}
class CasingFavoritesBox extends StatefulWidget {

  void open(BuildContext context, Map<String, dynamic> data) {}
  Map<String, dynamic> generateListData(int index) => {};
  int listSize() => 0;
  void explore() => {};
  String getExploreText() => 'explore';
  int bookmarkableType() => 99;

  @override
  State<CasingFavoritesBox> createState() => _CasingBox();
}


class _CasingCircle extends State<CasingFavorites> {

  final double _fullSize = 75.0;
  double _fullBoxSizeHeight = 0;
  double _fullBoxSizeWidth = 0;
  double _fullCasingSize = 0;

  @override
  void initState() {
    _fullBoxSizeHeight = _fullSize;
    _fullBoxSizeWidth = _fullSize * 0.80;
    _fullCasingSize = _fullSize * .35;
    _bookmarkLabel = TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: _fullCasingSize / 2.5,
    );
    super.initState();
  }

  List<Map<String, dynamic>> _rowButtonListData = [];
  TextStyle _bookmarkLabel = TextStyle(
    fontWeight: FontWeight.bold,
    fontSize: 10.0,
  );

  Map<String, dynamic> _generateGenericListData(int index) {
    var result = widget.generateListData(index);
    // result['seen'] = false;
    return result;
  }
  String getNavigationLink(int index) {
    if (index<0 && index>=_rowButtonListData.length) return '';
    // _rowButtonListData[index]['seen'] = true;
    return _rowButtonListData[index]['cryptlink'];
  }
  void _openGenericAction(int index) {
    if (index<0 && index>=_rowButtonListData.length) return;
    widget.open(context, _rowButtonListData[index]);
  }
  String _capSize(String input) {
    int maxSize = 8;
    if (input.length>=maxSize) return input.substring(0, maxSize) + '...';
    return input;
  }

  Widget _buildBookmarkedIcon(BuildContext context, bool hasBeenSeen, Widget display) {
    return CircleAvatar(
      radius: hasBeenSeen ? _fullCasingSize - 3 : _fullCasingSize,
      backgroundColor: hasBeenSeen ? Colors.grey : Colors.red,
      child: CircleAvatar(
        radius: _fullCasingSize - 2,
        backgroundColor: Colors.white,
        child: CircleAvatar(
          radius: _fullCasingSize - 5,
          backgroundColor: Colors.black,
          child: display,
        ),
      ),
    );
  }
  Widget _buildBookmark(BuildContext context, int index) {
    return Container(
      width: _fullBoxSizeWidth * .9,
      child: Center(
        child: Column(
          children: [
            PressableCircle(
              onPressed: () {
                _openGenericAction(index);
              },
              downElevation: 1,
              upElevation: 5,
              radius: _fullCasingSize,
              shadowColor: Colors.black,
              child: _buildBookmarkedIcon(
                context,
                _rowButtonListData[index]['story'] == null ? false :
                  _rowButtonListData[index]['story'].seen,
                CircleAvatar(
                  radius: _fullCasingSize - 5,
                  backgroundImage: AssetImage(
                    _rowButtonListData[index]['icon'],
                  ),
                ),
              ),
            ),
            SizedBox(height: _fullBoxSizeHeight / 10.0),
            GestureDetector(
              onTap: () {
                _openGenericAction(index);
              },
              child: Text(
                _capSize(_rowButtonListData[index]['name']),
                style: _bookmarkLabel,
              ),
            ),
          ],
        ),
      ),
    );
  }
  Widget _buildSearchForMoreButton(BuildContext context) {
    return Container(
      width: _fullBoxSizeWidth * .9,
      child: Center(
        child: Column(
          children: [
            PressableCircle(
              onPressed: () {
                widget.explore();
              },
              downElevation: 1,
              upElevation: 5,
              radius: _fullCasingSize,
              shadowColor: Colors.black,
              child: _buildBookmarkedIcon(
                context,
                false,
                Icon(
                  Icons.add,
                  size: 25,
                  color: Colors.white,
                ),
              ),
            ),
            SizedBox(height: _fullBoxSizeHeight / 10.0),
            GestureDetector(
              onTap: () {
                widget.explore();
              },
              child: Text(
                widget.getExploreText(),
                style: _bookmarkLabel,
              ),
            ),
          ],
        ),
      ),
    );
  }
  List<Widget> _generateFavorites(BuildContext context) {
    List<Widget> yourFavs = <Widget>[];

    for (int i=0;i<_rowButtonListData.length;i++) {
      yourFavs.add(_buildBookmark(context, i));

      yourFavs.add(SizedBox(width: _fullBoxSizeHeight / 4.0));
    }

    yourFavs.add(_buildSearchForMoreButton(context));
    return yourFavs;
  }

  @override
  Widget build(BuildContext context) {

    _rowButtonListData = List<Map<String, dynamic>>.generate(
                            widget.listSize(), _generateGenericListData
                          );

    return Container(
      height: _fullBoxSizeHeight,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: _generateFavorites(context),
        ),
      ),
    );
  }
}
class _CasingBox extends State<CasingFavoritesBox> {

  final double _fullSize = 75.0;
  double _fullBoxSizeHeight = 0;
  double _fullBoxSizeWidth = 0;
  double _fullCasingSize = 0;

  @override
  void initState() {
    _fullBoxSizeHeight = _fullSize;
    _fullBoxSizeWidth = _fullSize * 0.80;
    _fullCasingSize = _fullSize * .35;
    _bookmarkLabel = TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: _fullCasingSize / 2.0,
      color: Colors.white,
    );
    super.initState();
  }

  List<Map<String, dynamic>> _rowButtonListData = [];
  TextStyle _bookmarkLabel = TextStyle(
    fontWeight: FontWeight.bold,
    fontSize: 12.0,
    color: Colors.white,
  );

  Map<String, dynamic> _generateGenericListData(int index) {
    var result = widget.generateListData(index);
    result['seen'] = false;
    return result;
  }
  String getNavigationLink(int index) {
    if (index<0 && index>=_rowButtonListData.length) return '';
    _rowButtonListData[index]['seen'] = true;
    return _rowButtonListData[index]['cryptlink'];
  }
  void _openGenericAction(int index) {
    if (index<0 && index>=_rowButtonListData.length) return;
    widget.open(context, _rowButtonListData[index]);
  }
  String _capSize(String input) {
    int maxSize = 16;
    if (input.length>=maxSize) return input.substring(0, maxSize) + '...';
    return input;
  }

  Widget _buildBookmarkedIcon(BuildContext context, bool hasBeenSeen, Widget display) {
    return CircleAvatar(
      radius: hasBeenSeen ? _fullCasingSize - 3 : _fullCasingSize,
      backgroundColor: hasBeenSeen ? Colors.grey : Colors.red,
      child: CircleAvatar(
        radius: _fullCasingSize - 3,
        backgroundColor: Colors.white60,
        child: CircleAvatar(
          radius: _fullCasingSize - 5,
          backgroundColor: Colors.black,
          child: display,
        ),
      ),
    );
  }
  Widget _buildBookmark(BuildContext context, int index) {
    return Container(
      child: PressableCard(
        onPressed: () {
          _openGenericAction(index);
        },
        downElevation: 1,
        upElevation: 5,
        shadowColor: Colors.black,
        child: Stack(
          children: [
            Container(
              width: _fullBoxSizeWidth,
              height: _fullBoxSizeHeight,
              child: ColorFiltered(
                colorFilter: ColorFilter.mode(
                  _rowButtonListData[index]['color'],
                  BlendMode.hardLight,
                ),
                child: Image.asset(
                  _rowButtonListData[index]['icon'],
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Positioned(
              top: 8,
              left: 8,
              child: Container(
                width: _fullBoxSizeWidth * .85,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    SizedBox(height: _fullBoxSizeHeight / 10.0),

                    Text(
                      _capSize(_rowButtonListData[index]['name']),
                      style: _bookmarkLabel,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  Widget _buildSearchForMoreButton(BuildContext context) {
    return Container(
      child: PressableCard(
        onPressed: () {
          widget.explore();
        },
        downElevation: 1,
        upElevation: 5,
        shadowColor: Colors.black,
        child: Stack(
          children: [
            Container(
              width: _fullBoxSizeWidth,
              height: _fullBoxSizeHeight,
              color: Colors.red,
            ),
            Positioned(
              top: 8,
              left: 8,
              child: Container(
                width: _fullBoxSizeWidth * .85,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.add,
                      color: Colors.white,
                    ),
                    SizedBox(height: _fullBoxSizeHeight / 10.0),
                    Text(
                      widget.getExploreText(),
                      style: _bookmarkLabel,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  List<Widget> _generateFavorites(BuildContext context) {
    List<Widget> yourFavs = <Widget>[];

    for (int i=1;i<_rowButtonListData.length;i++) {
      yourFavs.add(_buildBookmark(context, i));
    }

    yourFavs.add(_buildSearchForMoreButton(context));
    return yourFavs;
  }

  @override
  Widget build(BuildContext context) {

    _rowButtonListData = List<Map<String, dynamic>>.generate(
                            widget.listSize(), _generateGenericListData
                          );

    return Container(
      height: _fullBoxSizeHeight,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: _generateFavorites(context),
        ),
      ),
    );
  }
}
