package com.seamo.haircut

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.speech.tts.TextToSpeech
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.util.Locale

/**
 * SEAMO Voice Box — native FCM handler.
 *
 * Delivers booking alerts WITHOUT depending on an open app, browser JS or a
 * WebSocket: FCM wakes this service even when the app is closed, it posts a
 * high-importance notification on channel `seamo_booking_alerts` (loud sound
 * + vibration) and speaks the booking aloud with Android TextToSpeech.
 *
 * Example announcement: "Attention! New booking received. Customer Nitin
 * Verma has booked Haircut for 10 November at 10 AM. Token number 4.
 * Please check your booking."
 *
 * HONEST LIMITS:
 * - Android battery optimisation / Doze can delay background work: salon
 *   owners must exempt SEAMO from battery optimisation (the app explains this
 *   in Owner > Voice Settings). Some OEMs (Xiaomi/Oppo/Vivo) need autostart.
 * - Background audio/TTS is best-effort on some devices; the loud notification
 *   itself is the reliable part, TTS is the enhancement.
 * - iOS: Apple notification / Focus rules apply; no TTS from a notification.
 */
class SeamoMessagingService : FirebaseMessagingService() {

    companion object {
        const val CHANNEL_ID = "seamo_booking_alerts"
        const val TAG = "SeamoFCM"
    }

    private var tts: TextToSpeech? = null

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Register/refresh in Supabase device_tokens (via the app's API layer).
        Log.d(TAG, "FCM token refreshed (length ${token.length})")
        getSharedPreferences("seamo", Context.MODE_PRIVATE).edit()
            .putString("fcm_token", token).apply()
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data
        val title = data["title"] ?: message.notification?.title ?: "SEAMO HAIR CUT"
        val body = data["body"] ?: message.notification?.body ?: "New booking received"
        val bookingId = data["booking_id"] ?: ""
        val tokenNo = data["token"] ?: ""
        val speak = data["speak"] ?: body
        val loud = data["loud"] != "false"
        showBookingNotification(title, body, bookingId, loud)
        speakAnnouncement(speak, tokenNo)
        Log.d(TAG, "Booking alert delivered: booking=$bookingId token=$tokenNo loud=$loud")
        // Delivery logging: the app posts to notification_deliveries via Supabase
        // when it next opens; the Edge Function logs the FCM send itself.
    }

    private fun showBookingNotification(title: String, body: String, bookingId: String, loud: Boolean) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val soundUri = Uri.parse(
                "android.resource://${packageName}/${R.raw.booking_alert}")
            val attrs = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
            val channel = NotificationChannel(
                CHANNEL_ID, "SEAMO Booking Alerts",
                NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Loud alerts for new salon bookings"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 500)
                if (loud) setSound(soundUri, attrs)
            }
            manager.createNotificationChannel(channel)
        }
        val intent = Intent(this, MainActivity::class.java).apply {
            putExtra("booking_id", bookingId)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pending = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_seamo)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(false)
            .setOngoing(true) // stays until the owner acknowledges it
            .setContentIntent(pending)
            .build()
        manager.notify(bookingId.hashCode(), notification)
    }

    private fun speakAnnouncement(text: String, tokenNo: String) {
        try {
            tts = TextToSpeech(applicationContext) { status ->
                if (status == TextToSpeech.SUCCESS) {
                    tts?.language = Locale("en", "IN")
                    tts?.setSpeechRate(1.0f)
                    tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "seamo-booking-$tokenNo")
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "TTS failed (notification still delivered): ${e.message}")
        }
    }

    override fun onDestroy() {
        tts?.shutdown()
        super.onDestroy()
    }
}
