import 'package:flutter/material.dart';

import '../partners/mock_data.dart';

import 'users_highlights.dart';


class Explore extends StatefulWidget {
  @override
  _ExploreState createState() => _ExploreState();
}

class _ExploreState extends State<Explore> {

  final double _widthPadding = 24.0;
  final double _heightPadding = 42.0;

  @override
  Widget build(BuildContext context) => Container(
    color: Colors.white,
    child: ListView(
      children: [

        Container(
          padding: EdgeInsets.symmetric(
            horizontal: _widthPadding,
          ),
          margin: EdgeInsets.only(
            top: _heightPadding,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Location',
                    style: TextStyle(
                      color: Colors.red,
                      fontSize: 14.0,
                    ),
                  ),

                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        color: Colors.red,
                        size: 14.0,
                      ),

                      Text(
                        'Seoul, South Korea',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      Icon(
                        Icons.expand_more,
                        color: Colors.red,
                      ),
                    ],
                  ),
                ],
              ),

              Card(
                elevation: 3.0,
                child: Container(
                  padding: EdgeInsets.all(6.0),
                  child: Center(
                    child: Icon(
                      Icons.notifications,
                      color: Colors.grey,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        Container(
          padding: EdgeInsets.symmetric(
            vertical: _heightPadding / 2.0,
          ),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                SizedBox(width: _widthPadding),

                UserProfilesHighlights(),

                SizedBox(width: _widthPadding),
              ],
            ),
          ),
        ),

        Container(
          padding: EdgeInsets.only(
            bottom: _heightPadding,
          ),
          child: Column(
            children: [
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: _widthPadding,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Recomended',
                      style: TextStyle(
                        fontSize: 22.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    Text(
                      'More',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 12.0,
                      ),
                    ),
                  ],
                ),
              ),

              Container(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      SizedBox(width: 12.0),

                      Row(
                        children: MockPartnerData.cards(context),
                      ),

                      SizedBox(width: 12.0),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        Container(
          padding: EdgeInsets.only(
            bottom: _heightPadding,
          ),
          child: Column(
            children: [
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: _widthPadding,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Nearby your location',
                      style: TextStyle(
                        fontSize: 22.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    Text(
                      'More',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 12.0,
                      ),
                    ),
                  ],
                ),
              ),

              Container(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      SizedBox(width: 12.0),

                      Row(
                        children: MockPartnerData.skinny_cards(context),
                      ),

                      SizedBox(width: 12.0),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

      ],
    ),
  );
}
