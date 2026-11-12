package com.seamo.haircut;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createBookingAlertChannel();
    }

    /** Creates the high-importance booking-alert channel at first launch so
     *  owner alerts are loud even before the first FCM message arrives. */
    private void createBookingAlertChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = getSystemService(NotificationManager.class);
        Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.booking_alert);
        AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
        NotificationChannel channel = new NotificationChannel(
                SeamoMessagingService.CHANNEL_ID, "SEAMO Booking Alerts",
                NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Loud alerts for new salon bookings");
        channel.enableVibration(true);
        channel.setVibrationPattern(new long[]{0, 500, 200, 500, 200, 500});
        channel.setSound(soundUri, attrs);
        manager.createNotificationChannel(channel);
    }
}
