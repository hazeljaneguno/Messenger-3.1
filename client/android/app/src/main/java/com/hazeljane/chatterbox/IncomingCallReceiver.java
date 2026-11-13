package com.hazeljane.chatterbox;
import android.content.*;
import java.net.*;
import java.io.*;
import org.json.JSONObject;
public class IncomingCallReceiver extends BroadcastReceiver {
  @Override public void onReceive(Context context, Intent intent) {
    if (!IncomingCallNotifications.ACTION_DECLINE.equals(intent.getAction())) return;
    String callId = intent.getStringExtra("callId");
    if (callId == null || !callId.matches("[a-fA-F0-9]{24}")) return;
    IncomingCallNotifications.dismiss(context,callId);
    PendingResult result = goAsync();
    new Thread(() -> {
      HttpURLConnection connection = null;
      try {
        SharedPreferences prefs = context.getSharedPreferences("chatterbox_incoming_call",Context.MODE_PRIVATE);
        String token = prefs.getString("token", ""), base = prefs.getString("apiUrl", "");
        if (token.isEmpty() || !base.startsWith("https://")) return;
        connection = (HttpURLConnection) new URL(base + "/api/call-actions/" + callId + "/decline").openConnection();
        connection.setRequestMethod("POST"); connection.setConnectTimeout(3000); connection.setReadTimeout(3000);
        connection.setRequestProperty("Authorization", "Bearer " + token);
        connection.setRequestProperty("Content-Type", "application/json"); connection.setDoOutput(true);
        JSONObject body = new JSONObject();
        if (intent.hasExtra("groupId")) body.put("groupId",intent.getStringExtra("groupId"));
        try (OutputStream out = connection.getOutputStream()) { out.write(body.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)); }
        if (connection.getResponseCode() >= 400) android.util.Log.w("ChatterboxCalls", "Decline was not accepted by server");
      } catch(Exception e) { android.util.Log.w("ChatterboxCalls", "Decline could not reach server",e); }
      finally { if (connection != null) connection.disconnect(); result.finish(); }
    }).start();
  }
}
