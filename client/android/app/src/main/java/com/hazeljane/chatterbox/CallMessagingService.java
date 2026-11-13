package com.hazeljane.chatterbox;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;
public class CallMessagingService extends FirebaseMessagingService {
  @Override public void onMessageReceived(RemoteMessage message) {
    String type = message.getData().get("type");
    if ("incoming_call".equals(type) || "group_call".equals(type) || "call_ended".equals(type)) {
      IncomingCallNotifications.show(this, message);
    } else PushNotificationsPlugin.sendRemoteMessage(message);
  }
  @Override public void onNewToken(String token) { PushNotificationsPlugin.onNewToken(token); }
}
