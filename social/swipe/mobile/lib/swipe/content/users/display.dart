import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../../../widgets/slide_in_card.dart';
import '../../../const.dart';

import '../swipeable_profile.dart';


class UserContentDisplayPage extends StatefulWidget {
  final String cryptlink;

  UserContentDisplayPage(this.cryptlink);

  @override
  _UserContentDisplayPageState createState() => _UserContentDisplayPageState();
}

class _UserContentDisplayPageState extends State<UserContentDisplayPage> {

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
                  Constants.demo_source + ContentProfile.link(widget.cryptlink).pictures[0],
                  fit: BoxFit.cover,
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
                            'PLAY',
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
                      ContentProfile.link(widget.cryptlink).text,
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
              child: Text(
                ContentProfile.link(widget.cryptlink).caption,
              ),
            ),

          ],
        ),
      ),
    );
  }
}
