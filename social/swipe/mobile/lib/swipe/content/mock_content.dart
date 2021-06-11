
import '../swipe.dart';

class MockContent {

  static List<Map<String, dynamic> > get all {
    List<Map<String, dynamic> > list = [];

    for (int i=0;i<data.length;i++) {
      list.add(data[i]);
    }

    return list;
  }

  static List<Map<String, dynamic> > data = [
    {
      'type': CONTENT.PROFILE,
      'text': 'Jennie',
      'caption': 'Just a girl from the UK who moved to Korea to follow my passion',
      'pictures': [
        'jennie/1.jpg',
        'jennie/2.jpg',
        'jennie/3.png',
        'jennie/4.jpg',
      ],
      'sex': 'female',
      'online': true,
      'verified': true,
      'id': 'jennie',
    },
    {
      'type': CONTENT.PROFILE,
      'text': 'donghee',
      'caption': 'I\'m an actor, but I will never be fake with you ;)',
      'pictures': [
        'donghee/1.jpg',
        'donghee/2.jpg',
        'donghee/3.jpg',
      ],
      'sex': 'male',
      'online': false,
      'verified': true,
      'id': 'donghee',
    },
    {
      'type': CONTENT.PROFILE,
      'text': 'Lee Ji-eun',
      'caption': 'Some people call me IU, but you can call me love',
      'pictures': [
        'iu/1.jpg',
        'iu/2.jpg',
        'iu/3.jpg',
        'iu/4.jpg',
        'iu/5.jpg',
      ],
      'sex': 'female',
      'online': true,
      'verified': true,
      'id': 'iu',
    },
    {
      'type': CONTENT.PROFILE,
      'text': 'Jack Black',
      'caption': 'We came to ROCK!',
      'pictures': [
        'jackblack/1.png',
        'jackblack/2.jpg',
        'jackblack/3.jpg',
        'jackblack/4.jpg',
      ],
      'sex': 'male',
      'online': true,
      'verified': true,
      'id': 'jackblack',
    },
    {
      'type': CONTENT.PROFILE,
      'text': 'Paige',
      'caption': 'let\'s play some golf',
      'pictures': [
        'paige/1.jpg',
      ],
      'sex': 'female',
      'online': false,
      'verified': false,
      'id': 'paige',
    },
    {
      'type': CONTENT.PROFILE,
      'text': 'Snoop Doggy Dog',
      'caption': 'if you dont bring some smoke to the golf course... dont worry ill bring it',
      'pictures': [
        'snoop/1.png',
        'snoop/2.jpg',
        'snoop/3.jpg',
      ],
      'sex': 'male',
      'online': false,
      'verified': true,
      'id': 'snoop',
    },
    {
      'type': CONTENT.PROFILE,
      'text': 'Tiger Woods',
      'caption': 'I know you know who I am',
      'pictures': [
        'tigerwoods/1.jpg',
        'tigerwoods/2.jpg',
        'tigerwoods/3.jpg',
      ],
      'sex': 'male',
      'online': true,
      'verified': false,
      'id': 'tigerwoods',
    },
    {
      'type': CONTENT.PROFILE,
      'text': 'Dorothy Oz',
      'caption': 'I don\'t think I\'m in Kansas anymore...',
      'pictures': [
        'dorothy/1.jpeg',
      ],
      'sex': 'female',
      'online': false,
      'verified': false,
      'id': 'dorothy',
    },
  ];
}
