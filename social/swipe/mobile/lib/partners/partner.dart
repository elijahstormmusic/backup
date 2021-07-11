import 'dart:convert';

import 'sale.dart';
import 'contact.dart';
import 'display.dart';
import 'cache.dart';

import '../const.dart';


class LatLng {
  final double latitude = 0;
  final double longitude = 0;

  LatLng(latitude, longitude);
}

class Partner {
  final String name;
  final String cryptlink;
  final String shortDescription;
  final LatLng location;
  final List<String> images;
  final ContactList contact;
  final int priceRange;
  List<Sale> sales = <Sale>[];
  bool isFavorite;

  String priceRangeToString() {
    const priceText = '\$';
    String str = priceText;
    for (int i=0;i<priceRange;i++) {
      str += priceText;
    }
    return str;
  }

  dynamic toJson() {
    return {
      'name': name,
      'cryptlink': cryptlink,
      'info': shortDescription,
      'lat': location.latitude,
      'lng': location.longitude,
      'images': images,
      'contact': contact.toJson(),
      'priceRange': priceRange,
    };
  }
  bool isOpen() {
    return true;
  }

  Partner({
    required this.name,
    required this.cryptlink,
    required this.shortDescription,
    required this.location,
    required this.images,
    required this.contact,
    required this.priceRange,
    required this.sales,
    this.isFavorite = false,
  });

  static Partner json(var data) {
    return Partner(
      name: data['name'],
      cryptlink: data['cryptlink'],
      shortDescription: data['info'],
      location: LatLng(data['lat'], data['lng']),
      images: data['images'],
      contact: ContactList.json(data['contact']),
      priceRange: data['priceRange'],
      sales: <Sale>[],
    );
  }
  static Partner link(String input) {
    for (var i=0;i<PartnerCache.all.length;i++) {
      if (PartnerCache.all[i].cryptlink==input) {
        return PartnerCache.all[i];
      }
    }

    Partner P = Partner(
      cryptlink: input,
      name: 'none',
      shortDescription: 'description',
      location: LatLng(0, 0),
      images: <String>[Constants.loading_placeholder, Constants.loading_placeholder],
      contact: ContactList(),
      sales: <Sale>[],
      priceRange: 2,
    );

    // socket.emit('partners link', {
    //   'link': input,
    // });

    PartnerCache.add(P);

    return P;
  }

  PartnerDisplayPage navigateTo() {
    return PartnerDisplayPage(cryptlink);
  }
}
