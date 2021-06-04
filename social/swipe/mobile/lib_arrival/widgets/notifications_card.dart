/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL Project

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:scoped_model/scoped_model.dart';

import '../styles.dart';
import './level_progress_bar.dart';
import './cards.dart';
import '../users/data.dart';
import '../users/page.dart';
import '../data/link.dart';
import '../data/preferences.dart';

class NotificationsCard extends StatefulWidget {

  @override
  _NotoCardState createState() => _NotoCardState();
}
class _NotoCardState extends State<NotificationsCard> {

  Widget _listCasing(BuildContext context, String label, {
    IconData icon,
    int value = 0,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(
        vertical: 8,
        horizontal: 6,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: MediaQuery.of(context).size.width * .20,

            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [

                icon == null ? Container() : Icon(icon, color: Styles.ArrivalPalletteRed),
                icon == null ? Container() : SizedBox(width: 6),

                Flexible(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ),

              ],
            ),
          ),

          value != 0
            ? Text(
              (value > 0 ? ' + ' : '') + value.toString(),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: value > 0 ? Styles.ArrivalPalletteGreen : Styles.ArrivalPalletteRed,
              ),
            )
            : Container()

        ],
      ),
    );
  }

  Widget _displayList(BuildContext context, Set<NotificationHolder> __history) {

    List<NotificationHolder> history = __history.toList().reversed.toList();
    List<Map<String, dynamic>> list = List<Map<String, dynamic>>();

    for (int i=0 ; i<history.length ; i++) {
      list.add({
        'label': history[i].label,
        'value': history[i].value,
        'icon': history[i].icon,
      });
    }

    if (list.isEmpty) {
      return Container(
        padding: EdgeInsets.all(13),
        child: Center(
          child: Text('Do things in the app to get points!'),
        ),
      );
    }

    return ListView.builder(
      itemCount: list.length,
      itemBuilder: (context, index) => _listCasing(context, list[index]['label'],
        value: list[index]['value'],
        icon: list[index]['icon'],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    var prefs = ScopedModel.of<Preferences>(context, rebuildOnChange: true);

    return PhysicalModel(
      elevation: 3,
      borderRadius: const BorderRadius.all(Radius.circular(18)),
      shape: BoxShape.rectangle,
      shadowColor: Styles.ArrivalPalletteGrey,
      color: Styles.ArrivalPalletteCream,
      child: Container(
        padding: const EdgeInsets.all(3),
        width: MediaQuery.of(context).size.width / 2.5,
        child: FutureBuilder<Set<NotificationHolder>>(
            future: prefs.notificationHistory,
            builder: (context, snapshot) {
              final data = snapshot.data ?? <NotificationHolder>{};
              return _displayList(context, data);
            }),
      ),
    );
  }
}
