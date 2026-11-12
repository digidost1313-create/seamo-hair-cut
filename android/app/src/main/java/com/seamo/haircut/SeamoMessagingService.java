package com.seamo.haircut;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.speech.tts.TextToSpeech;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Locale;
import java.util.Map;

/**
 * SEAMO Voice Box — native FCM handler (Java, no Kotlin plugin required).
 *
 * Delivers booking alerts WITHOUT depending on an open app, browser JS or a
 * WebSocket: FCM wakes this service even when the app is closed; it posts a
 * high-importance notification on channel `seamo_booking_alerts` (loud sound
 * + vibration) and speaks the booking aloud with Android TextToSpeech.
 *
 * Example: "Attention! New booking received. Customer Nitin Verma has booked
 * Haircut for 10 November at 10 AM. Token number 4. Please check your booking."
 *
 * HONEST LIMITS:
 * - Android battery optimisation / Doze can delay background work: salon
 *   owners must exempt SEAMO from battery optimisation (explained in the app
 *   under Owner > Voice Settings). Some OEMs need autostart permission.
 * - Background TTS is best-effort; the loud notification is the reliable part.
 * - iOS: Apple notification / Focus rules apply; no TTS from a notification.
 * - Requires google-services.json in android/app/ (Firebase project) — NOT
 *   committed. Without it, FCM cannot register and the app falls back to
 *   in-app notifications only.
 */
public class SeamoMessagingService extends FirebaseMessagingService {

    public static final String CHANNEL_ID = "seamo_booking_alerts";
    private static final String TAG = "SeamoFCM";
    private TextToSpeech tts;

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        // The JS layer reads the token via @capacitor/push-notifications and
        // registers it in Supabase device_tokens (see README).
        Log.d(TAG, "FCM token refreshed (length " + token.length() + ")");
        getSharedPreferences("seamo", Context.MODE_PRIVATE).edit()
                .putString("fcm_token", token).apply();
    }

    @Override
    public void onMessageReceived(RemoteMessage message) {
        Map<String, String> data = message.getData();
        String title = data.get("title");
        if (title == null && message.getNotification() != null) title = message.getNotification().getTitle();
        if (title == null) title = "SEAMO HAIR CUT";
        String body = data.get("body");
        if (body == null && message.getNotification() != null) body = message.getNotification().getBody();
        if (body == null) body = "New booking received";
        String bookingId = data.get("booking_id") == null ? "" : data.get("booking_id");
        String tokenNo = data.get("token") == null ? "" : data.get("token");
        String speak = data.get("speak") == null ? body : data.get("speak");
        boolean loud = !"false".equals(data.get("loud"));

        showBookingNotification(title, body, bookingId, loud);
        speakAnnouncement(speak);
        Log.d(TAG, "Booking alert delivered: booking=" + bookingId + " token=" + tokenNo + " loud=" + loud);
    }

    private void showBookingNotification(String title, String body, String bookingId, boolean loud) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.booking_alert);
            AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "SEAMO Booking Alerts", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("Loud alerts for new salon bookings");
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 500, 200, 500, 200, 500});
            if (loud) channel.setSound(soundUri, attrs);
            manager.createNotificationChannel(channel);
        }
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra("booking_id", bookingId);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pending = PendingIntent.getActivity(this, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        android.app.Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_seamo)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setAutoCancel(false)
                .setOngoing(true) // stays until the owner acknowledges it
                .setContentIntent(pending)
                .build();
        manager.notify(bookingId.hashCode(), notification);
    }

    private void speakAnnouncement(final String text) {
        try {
            tts = new TextToSpeech(getApplicationContext(), status -> {
                if (status == TextToSpeech.SUCCESS && tts != null) {
                    tts.setLanguage(new Locale("en", "IN"));
                    tts.setSpeechRate(1.0f);
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "seamo-booking");
                }
            });
        } catch (Exception e) {
            Log.w(TAG, "TTS failed (notification still delivered): " + e.getMessage());
        }
    }

    @Override
    public void onDestroy() {
        if (tts != null) tts.shutdown();
        super.onDestroy();
    }
}
