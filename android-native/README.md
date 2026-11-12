# SEAMO HAIR CUT — Android native additions
# Apply after `npx cap add android` (files are copied into android/app/src/main/...).
# Kept here so a fresh `cap add` does not lose them; a post-sync script copies them in.

## 1) AndroidManifest.xml — add inside <manifest> (permissions) and <application>

Permissions:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
```

Inside <application>:
```xml
<service
    android:name=".SeamoMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="seamo_booking_alerts" />
```

## 2) Files to copy
- `android-native/SeamoMessagingService.kt` →
  `android/app/src/main/java/com/seamo/haircut/SeamoMessagingService.kt`
- `android-native/booking_alert.mp3` (owner alert tone) →
  `android/app/src/main/res/raw/booking_alert.mp3`
  (Generate a loud bell tone; a placeholder tone must be replaced before release.)
- App icon: `public/icon.png` → Capacitor generates mipmap icons via
  `npx @capacitor/assets generate` (needs `@capacitor/assets`).

## 3) Firebase
- Add `google-services.json` (from the Firebase console) to `android/app/`.
  NEVER commit it. Without it, FCM registration fails and the app falls back
  to in-app notifications only — the Voice Box will not ring when closed.
- Add to `android/app/build.gradle` (after `cap add`): the Google Services
  plugin + `com.google.firebase:firebase-messaging` dependency, or use the
  `@capacitor/push-notifications` Firebase setup.

## 4) Signing (Play release)
```bash
keytool -genkey -v -keystore seamo-release.keystore -alias seamo -keyalg RSA -keysize 2048 -validity 10000
# then android/app/build.gradle signingConfigs + ./gradlew bundleRelease
```
Keep the keystore + passwords OUT of the repo (CI secrets).
