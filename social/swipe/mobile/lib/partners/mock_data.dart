import 'package:flutter/material.dart';

import 'partner.dart';


class MockPartnerData {

  static List<Partner> get partners {
    List<Partner> list = [];

    for (int i=0;i<data.length;i++) {
      list.add(Partner.json(data[i]));
    }

    return list;
  }

  static final double _cardTextVerticalPadding = 8.0;
  static final double _cardMajorTextSize = 16.0;
  static final double _cardMinorTextSize = 12.0;
  static final double _cardIconSize = 13.0;

  static final double _cardSlicePadding = 10.0;
  static final double _cardSliceMajorTextSize = 13.0;
  static final double _cardSliceMinorTextSize = 10.0;
  static final double _cardSliceIconSize = 12.0;

  static List<Widget> cards(BuildContext context) {
    List<Widget> list = [];

    for (int i=0;i<data.length;i++) {
      try {
        Partner partner = Partner.json(data[i]);

        list.add(
          Container(
            width: 300.0,
            child: GestureDetector(
              child: Card(
                elevation: 6,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.0)),
                margin: EdgeInsets.all(12.0),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 300.0,
                          height: 160.0,
                          child: Image.asset(
                            partner.images[0],
                            fit: BoxFit.cover,
                          ),
                        ),

                        Container(
                          padding: EdgeInsets.symmetric(
                            vertical: _cardTextVerticalPadding,
                            horizontal: 16.0,
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(height: _cardTextVerticalPadding),

                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    partner.name,
                                    overflow: TextOverflow.ellipsis,
                                    maxLines: 1,
                                    textAlign: TextAlign.left,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: _cardMajorTextSize,
                                    ),
                                  ),

                                  Text(
                                    '\$20/hr',
                                    style: TextStyle(
                                      color: Colors.red,
                                      fontSize: _cardMinorTextSize,
                                    ),
                                  ),
                                ],
                              ),

                              SizedBox(height: _cardTextVerticalPadding - 2.0),

                              Container(
                                child: Text(
                                  partner.shortDescription,
                                  overflow: TextOverflow.ellipsis,
                                  maxLines: 2,
                                  textAlign: TextAlign.left,
                                  style: TextStyle(
                                    fontSize: _cardMinorTextSize,
                                  ),
                                ),
                              ),

                              SizedBox(height: _cardTextVerticalPadding - 2.0),

                              Row(
                                children: [
                                  Icon(
                                    Icons.location_on,
                                    color: Colors.grey,
                                    size: _cardIconSize,
                                  ),

                                  SizedBox(width: 4.0),

                                  Text(
                                    '1234 Address Blvd.',
                                    overflow: TextOverflow.ellipsis,
                                    maxLines: 1,
                                    style: TextStyle(
                                      fontSize: _cardMinorTextSize,
                                    ),
                                  ),
                                ],
                              ),

                              SizedBox(height: _cardTextVerticalPadding - 2.0),

                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.bed,
                                        color: Colors.grey,
                                        size: _cardIconSize,
                                      ),

                                      SizedBox(width: 4.0),

                                      Text(
                                        'food & bar',
                                        overflow: TextOverflow.ellipsis,
                                        maxLines: 1,
                                        style: TextStyle(
                                          fontSize: _cardMinorTextSize,
                                        ),
                                      ),
                                    ],
                                  ),

                                  Row(
                                    children: [
                                      Icon(
                                        Icons.people,
                                        color: Colors.grey,
                                        size: _cardIconSize,
                                      ),

                                      SizedBox(width: 4.0),

                                      Text(
                                        '4-8 people',
                                        overflow: TextOverflow.ellipsis,
                                        maxLines: 1,
                                        style: TextStyle(
                                          fontSize: _cardMinorTextSize,
                                        ),
                                      ),
                                    ],
                                  ),

                                  Row(
                                    children: [
                                      Icon(
                                        Icons.exposure,
                                        color: Colors.grey,
                                        size: _cardIconSize,
                                      ),

                                      SizedBox(width: 4.0),

                                      Text(
                                        '120 arces',
                                        overflow: TextOverflow.ellipsis,
                                        maxLines: 1,
                                        style: TextStyle(
                                          fontSize: _cardMinorTextSize,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),

                              SizedBox(height: _cardTextVerticalPadding),
                            ],
                          ),
                        ),
                      ],
                    ),

                    Positioned(
                      right: 16.0,
                      top: 16.0,
                      child: Opacity(
                        opacity: 0.9,
                        child: Chip(
                          avatar: Icon(
                            Icons.star,
                            color: Colors.yellow,
                          ),
                          label: Text(
                            '4.8',
                            style: TextStyle(
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => partner.navigateTo(),
                ),
              ),
            ),
          ),
        );
      }
      catch (e) {
        print('ERROR with Mock Data Partner');
        continue;
      }
    }

    return list;
  }

  static List<Widget> skinny_cards(BuildContext context) {
    List<Widget> list = [];

    for (int i=0;i<data.length;i++) {
      try {
        Partner partner = Partner.json(data[i]);

        list.add(
          Container(
            width: 300.0,
            child: GestureDetector(
              child: Card(
                elevation: 6,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.0)),
                margin: EdgeInsets.all(12.0),
                clipBehavior: Clip.antiAlias,
                child: Container(
                  padding: EdgeInsets.all(_cardSlicePadding),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(15.0),
                        child: Container(
                          width: 60.0,
                          height: 60.0,
                          child: Image.asset(
                            partner.images[0],
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),

                      Container(
                        height: 60.0,
                        width: 300.0 - 60.0 - (_cardSlicePadding * 4.0) - 12.0,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  partner.name,
                                  overflow: TextOverflow.ellipsis,
                                  maxLines: 1,
                                  textAlign: TextAlign.left,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: _cardSliceMajorTextSize,
                                  ),
                                ),

                                Text(
                                  '\$20/hr',
                                  style: TextStyle(
                                    color: Colors.red,
                                    fontSize: _cardSliceMajorTextSize,
                                  ),
                                ),
                              ],
                            ),

                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.location_on,
                                      color: Colors.grey,
                                      size: _cardSliceIconSize,
                                    ),

                                    SizedBox(width: 4.0),

                                    Text(
                                      '1234 Address Blvd.',
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                      style: TextStyle(
                                        fontSize: _cardSliceMinorTextSize,
                                      ),
                                    ),
                                  ],
                                ),

                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.star,
                                      size: _cardSliceIconSize,
                                      color: Colors.yellow,
                                    ),

                                    SizedBox(width: 4.0),

                                    Text(
                                      '4.8',
                                      style: TextStyle(
                                        fontSize: _cardSliceMinorTextSize,
                                        color: Colors.black,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),

                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.bed,
                                      color: Colors.grey,
                                      size: _cardSliceIconSize,
                                    ),

                                    SizedBox(width: 4.0),

                                    Text(
                                      'food & bar',
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                      style: TextStyle(
                                        fontSize: _cardSliceMinorTextSize,
                                      ),
                                    ),
                                  ],
                                ),

                                Row(
                                  children: [
                                    Icon(
                                      Icons.people,
                                      color: Colors.grey,
                                      size: _cardSliceIconSize,
                                    ),

                                    SizedBox(width: 4.0),

                                    Text(
                                      '4-8',
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                      style: TextStyle(
                                        fontSize: _cardSliceMinorTextSize,
                                      ),
                                    ),
                                  ],
                                ),

                                Row(
                                  children: [
                                    Icon(
                                      Icons.exposure,
                                      color: Colors.grey,
                                      size: _cardSliceIconSize,
                                    ),

                                    SizedBox(width: 4.0),

                                    Text(
                                      '120 arces',
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                      style: TextStyle(
                                        fontSize: _cardSliceMinorTextSize,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => partner.navigateTo(),
                ),
              ),
            ),
          ),
        );
      }
      catch (e) {
        print('ERROR with Mock Data Partner');
        continue;
      }
    }

    return list;
  }

  static List<Map<String, dynamic> > data = [
    {
      'name': 'Great Golf Place',
      'cryptlink': 'a',
      'info': 'This is a really great golf place.',
      'lat': 34.0,
      'lng': -94.0,
      'images': [
        'assets/demo/partners/greatplace/golf1.jpg',
        'assets/demo/partners/greatplace/golf2.jpg',
        'assets/demo/partners/greatplace/golf3.png',
      ],
      'contact': {
        'phoneNumber': '1234',
      },
      'priceRange': 3,
    },
    {
      'name': 'An Okay Golf Area',
      'cryptlink': 'b',
      'info': 'It\'s not good, but it\'s not bad.',
      'lat': 34.0,
      'lng': -95.0,
      'images': [
        'assets/demo/partners/okayplace/golf1.jpg',
        'assets/demo/partners/okayplace/golf2.jpg',
        'assets/demo/partners/okayplace/golf3.jpg',
      ],
      'contact': {
        'phoneNumber': '9876',
      },
      'priceRange': 2,
    },
    {
      'name': 'Pretty Bad Spot',
      'cryptlink': 'c',
      'info': 'You\'re definitely not gonna meet your love here.',
      'lat': 34.0,
      'lng': -96.0,
      'images': [
        'assets/demo/partners/badplace/golf1.jpg',
        'assets/demo/partners/badplace/golf2.jpg',
        'assets/demo/partners/badplace/golf3.jpg',
      ],
      'contact': {
        'phoneNumber': '0000',
      },
      'priceRange': 1,
    },
    {
      'name': 'We Legit Suck',
      'cryptlink': 'd',
      'info': 'Please just don\'t even come. We don\'t want to work.',
      'lat': 34.0,
      'lng': -97.0,
      'images': [
        'assets/demo/partners/dontcome/golf1.jpg',
        'assets/demo/partners/dontcome/golf2.jpg',
        'assets/demo/partners/dontcome/golf3.jpg',
      ],
      'contact': {
        'phoneNumber': '666',
      },
      'priceRange': 0,
    },
  ];
}
