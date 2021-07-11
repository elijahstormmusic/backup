import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../widgets/cards.dart';
import '../widgets/slide_in_card.dart';
// import '../maps/maps.dart';
import '../maps/maps_placeholder.dart';

import 'partner.dart';
import 'detailed_info.dart';


class PartnerDisplayPage extends StatefulWidget {
  final String cryptlink;

  PartnerDisplayPage(this.cryptlink);

  @override
  _PartnerDisplayPageState createState() => _PartnerDisplayPageState();
}

class _PartnerDisplayPageState extends State<PartnerDisplayPage> {

  Widget _floatingActionButton({
    required IconData icon,
    required VoidCallback onTap,
  }) => Container(
    padding: EdgeInsets.symmetric(
      vertical: 14.0,
      horizontal: 10.0,
    ),
    child: GestureDetector(
      onTap: onTap,
      child: Card(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(45.0),
          side: BorderSide(
            color: Colors.black.withOpacity(0.6),
            width: 2.0,
          ),
        ),
        color: Colors.greenAccent,
        elevation: 10.0,
        child: Container(
          padding: EdgeInsets.all(8.0),
          child: Center(
            child: Icon(
              icon,
              size: 20.0,
            ),
          ),
        ),
      ),
    ),
  );

  SlideUpController _slideUpController = SlideUpController();

  @override
  void dispose() {
    _slideUpController.dispose();
    super.dispose;
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [

            Positioned( // background image
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              child: Container(
                color: Colors.yellow,
                child: Image.asset(
                  Partner.link(widget.cryptlink).images[0],
                  fit: BoxFit.cover,
                ),
              ),
            ),

            Positioned( // right-hand hover actions
              right: 0.0,
              top: 100.0,
              child: Container(
                width: 100.0,
                height: 400.0,
                child: Stack(
                  children: [
                    Positioned(
                      right: 0,
                      child: Container(
                        width: 50.0,
                        height: 60.0,
                        color: Colors.green,
                      ),
                    ),

                    Positioned(
                      right: 25.0,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(30.0),
                        child: Container(
                          color: Colors.green,
                          child: Column(
                            children: [
                              _floatingActionButton(
                                icon: FontAwesomeIcons.phone,
                                onTap: () {},
                              ),
                              _floatingActionButton(
                                icon: FontAwesomeIcons.calendar,
                                onTap: () {},
                              ),
                              _floatingActionButton(
                                icon: FontAwesomeIcons.info,
                                onTap: () {},
                              ),
                              _floatingActionButton(
                                icon: FontAwesomeIcons.locationArrow,
                                onTap: () {},
                              ),
                              _floatingActionButton(
                                icon: FontAwesomeIcons.instagram,
                                onTap: () {},
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            Positioned( // bottom action buttons
              left: 12.0,
              right: 12.0,
              bottom: 30.0,
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: 12.0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    GestureDetector(
                      onTap: () {
                        if (_slideUpController.slideIn == null) return;

                        _slideUpController.slideIn!();
                      },
                      // onTap: _slideUpController.slideIn,
                      child: Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.0)),
                        elevation: 6.0,
                        color: Colors.purple,
                        child: Container(
                          padding: EdgeInsets.symmetric(
                            vertical: 8.0,
                            horizontal: 12.0,
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                'MORE',
                                style: TextStyle(
                                  fontSize: 16.0,
                                  color: Colors.white,
                                ),
                              ),

                              Icon(
                                FontAwesomeIcons.angleDoubleUp,
                                size: 24.0,
                                color: Colors.white,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    Card(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.0)),
                      elevation: 6.0,
                      color: Colors.green,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          vertical: 12.0,
                          horizontal: 12.0,
                        ),
                        child: Center(
                          child: Text(
                            'BOOK',
                            style: TextStyle(
                              fontSize: 24.0,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            Positioned( // top bar title and buttons
              left: 12.0,
              top: 12.0,
              right: 12.0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [

                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Card(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(45.0)),
                      elevation: 8.0,
                      child: Container(
                        padding: EdgeInsets.all(6.0),
                        child: Center(
                          child: Icon(
                            Icons.arrow_back,
                            size: 24.0,
                          ),
                        ),
                      ),
                    ),
                  ),

                  Container(
                    child: Text(
                      Partner.link(widget.cryptlink).name,
                      style: TextStyle(
                        fontSize: 30.0,
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(45.0)),
                    elevation: 8.0,
                    child: Container(
                      padding: EdgeInsets.all(6.0),
                      child: Center(
                        child: Icon(
                          Icons.bookmark_outline,
                          size: 24.0,
                        ),
                      ),
                    ),
                  ),

                ],
              ),
            ),

            SlideInCard(
              height: 100.0,
              controller: _slideUpController,
              child: PartnerDetailedInfo(widget.cryptlink),
            ),

          ],
        ),
      ),
    );
  }
}
