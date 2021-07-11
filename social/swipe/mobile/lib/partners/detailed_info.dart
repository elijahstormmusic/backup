import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import 'partner.dart';
import '../widgets/unicorn_border.dart';
import '../const.dart';


class PartnerDetailedInfo extends StatefulWidget {
  final String cryptlink;

  PartnerDetailedInfo(this.cryptlink);

  @override
  _PartnerDetailedInfoState createState() => _PartnerDetailedInfoState();
}

class _PartnerDetailedInfoState extends State<PartnerDetailedInfo> {

  BoxDecoration _selectedDecoration = BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [Colors.pink, Colors.purple],
    ),
    // border: Border.all(
    //   color: Colors.black26,
    //   width: 2.0,
    // ),
  );
  BoxDecoration _unselectedDecoration = BoxDecoration(
    color: Colors.black87,
  );
  BoxDecoration _materialDecoration = BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [Colors.black26, Colors.black87],
    ),
    // border: Border.all(
    //   color: Colors.black26,
    //   width: 2.0,
    // ),
  );
  BoxDecoration _specialDecoration = BoxDecoration(
    image: DecorationImage(
      image: AssetImage(Constants.special_design_asset),
      fit: BoxFit.cover,
    ),
  );

  TextStyle _cardTextStyle = TextStyle(
    color: Colors.white,
    fontWeight: FontWeight.bold,
    fontSize: 12.0,
    letterSpacing: 2.5,
  );

  Widget _buildHeaderAndContentText(String header, String content) => Column(
    children: [
      Text(
        header,
        overflow: TextOverflow.ellipsis,
        maxLines: 1,
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 16.0,
          fontWeight: FontWeight.bold,
            color: Colors.black,
        ),
      ),

      SizedBox(height: 4.0),

      Text(
        content,
        overflow: TextOverflow.ellipsis,
        maxLines: 1,
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 10.0,
          color: Colors.black54,
        ),
      ),
    ],
  );

  Widget _buildContentContainer({
    required Widget child,
    BoxDecoration? decoration,
  }) => ClipRRect(
    borderRadius: BorderRadius.circular(30.0),
    child: Container(
      decoration: decoration,
      padding: EdgeInsets.all(16.0),
      child: child,
    ),
  );

  Widget _buildSpacedContent({
    required Widget child,
  }) => Container(
    margin: EdgeInsets.only(bottom: 20.0),
    child: child,
  );

  Widget _buildBlurredBackgroundButton({
    required Widget child,
    double sigmaX = 0.0, // from 0-10
    double sigmaY = 0.0, // from 0-10
    double opacity = 0.1, // from 0-1.0
  }) => Container(
    child: BackdropFilter(
      filter: ImageFilter.blur(sigmaX: sigmaX, sigmaY: sigmaY),
      child: Container(
        color: Colors.black.withOpacity(opacity),
        child: child,
      ),
    ),
  );

  @override
  Widget build(BuildContext context) => Container(
    child: Stack(
      children: [
        Positioned(
          left: 0,
          right: 0,
          top: 0,
          child: Container(
            height: 240.0,
            child: Image.asset(
              Partner.link(widget.cryptlink).images[2],
              fit: BoxFit.cover,
            ),
          ),
        ),

        Positioned(
          left: 0,
          right: 0,
          top: 0,
          child: Container(
            height: 240.0,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.center,
                colors: [Colors.transparent, Colors.white],
              ),
            ),
          ),
        ),

        Positioned(
          left: 0,
          right: 0,
          top: 0,
          child: Container(
            padding: EdgeInsets.fromLTRB(
              20.0,
              40.0,
              20.0,
              10.0,
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  _buildSpacedContent(
                    // child: UnicornOutlineButton(
                    //   strokeWidth: 3.0,
                    //   radius: 30.0,
                    //   gradient: LinearGradient(colors: [Colors.black, Colors.redAccent]),
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: Colors.red,
                            width: 3.0,
                          ),
                          borderRadius: BorderRadius.all(Radius.circular(30.0)),
                        ),
                        width: 100.0,
                        height: 100.0,
                        padding: EdgeInsets.all(4.0),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(28.0),
                          child: Container(
                            child: Image.asset(
                              Partner.link(widget.cryptlink).images[1],
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ),
                    // ),
                  ),

                  _buildSpacedContent(
                    child: _buildHeaderAndContentText(
                      Partner.link(widget.cryptlink).name,
                      Partner.link(widget.cryptlink).shortDescription,
                    ),
                  ),

                  _buildSpacedContent(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildHeaderAndContentText(
                          '10.7k',
                          'followers',
                        ),

                        _buildHeaderAndContentText(
                          '1.2k',
                          'following',
                        ),
                      ],
                    ),
                  ),

                  _buildSpacedContent(
                    child: Row(
                      children: [
                        Expanded(
                          child: _buildContentContainer(
                            decoration: _unselectedDecoration,
                            child: Center(
                              child: Text(
                                'Left',
                                style: _cardTextStyle,
                              ),
                            ),
                          ),
                        ),

                        SizedBox(width: 20.0),

                        Expanded(
                          child: _buildContentContainer(
                            decoration: _selectedDecoration,
                            child: Center(
                              child: Text(
                                'Right',
                                style: _cardTextStyle,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  _buildSpacedContent(
                    child: _buildContentContainer(
                      decoration: _materialDecoration,
                      child: Container(
                        child: Row(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(15.0),
                                  child: Container(
                                    padding: EdgeInsets.all(6.0),
                                    decoration: _unselectedDecoration,
                                    child: Center(
                                      child: Icon(
                                        FontAwesomeIcons.trophy,
                                        size: 20.0,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),

                                SizedBox(width: 8.0),

                                Text(
                                  'Achievements',
                                  style: _cardTextStyle,
                                ),
                              ],
                            ),

                            Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(45.0),
                                  child: Container(
                                    padding: EdgeInsets.all(4.0),
                                    decoration: _unselectedDecoration,
                                    child: Icon(
                                      FontAwesomeIcons.solidSmile,
                                      color: Colors.yellow,
                                      size: 12.0,
                                    ),
                                  ),
                                ),

                                SizedBox(width: 4.0),

                                ClipRRect(
                                  borderRadius: BorderRadius.circular(45.0),
                                  child: Container(
                                    padding: EdgeInsets.all(4.0),
                                    decoration: _unselectedDecoration,
                                    child: Icon(
                                      FontAwesomeIcons.solidHeart,
                                      color: Colors.red,
                                      size: 12.0,
                                    ),
                                  ),
                                ),

                                SizedBox(width: 4.0),

                                ClipRRect(
                                  borderRadius: BorderRadius.circular(45.0),
                                  child: Container(
                                    padding: EdgeInsets.all(4.0),
                                    decoration: _unselectedDecoration,
                                    child: Icon(
                                      FontAwesomeIcons.solidThumbsUp,
                                      color: Colors.white,
                                      size: 10.0,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  _buildSpacedContent(
                    child: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 8.0,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildContentContainer(
                            decoration: _selectedDecoration,
                            child: Center(
                              child: Icon(
                                FontAwesomeIcons.save,
                                size: 24.0,
                                color: Colors.white,
                              ),
                            ),
                          ),

                          _buildContentContainer(
                            decoration: _materialDecoration,
                            child: Center(
                              child: Icon(
                                FontAwesomeIcons.cameraRetro,
                                size: 24.0,
                                color: Colors.white,
                              ),
                            ),
                          ),

                          _buildContentContainer(
                            decoration: _materialDecoration,
                            child: Center(
                              child: Icon(
                                FontAwesomeIcons.featherAlt,
                                size: 24.0,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  _buildSpacedContent(
                    child: _buildContentContainer(
                      decoration: _specialDecoration,
                      child: Container(
                        height: 120.0,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(28.0),
                          child: Container(
                            padding: EdgeInsets.all(20.0),
                            height: 40.0,
                            decoration: _selectedDecoration,
                            child: Text(
                              'Demo Text Demo Text Demo Text Demo Text Demo Text Demo Text Demo Text',
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              style: _cardTextStyle,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    ),
  );
}
