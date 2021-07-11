import 'package:flutter/material.dart';

import 'package:stream_chat_flutter/stream_chat_flutter.dart';


class Chat {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: StreamChat.of(context).user!= null
        ? ChannelsBloc(
          child: ChannelListView(
            filter: {
              'members': {
                '\$in': [StreamChat.of(context).user!.id],
              },
            } as Filter?,
            sort: [SortOption('last_message_at')],
            pagination: PaginationParams(
              limit: 30,
            ),
            channelWidget: ChannelPage(),
          ),
        )
        : Center(
          child: Text(
            'Your query was null',
          ),
        ),
    );
  }
}

/// Displays the list of messages inside the channel
class ChannelPage extends StatelessWidget {
  const ChannelPage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: ChannelHeader(),
      body: Column(
        children: <Widget>[
          Expanded(
            child: MessageListView(),
          ),
          MessageInput(),
        ],
      ),
    );
  }
}
