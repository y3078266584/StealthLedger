package com.autobilling.receiver;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.autobilling.service.BillingForegroundService;

public class KeepAliveReceiver extends BroadcastReceiver {

    private static final String TAG = "AutoBilling-KeepAlive";
    private static final long CHECK_INTERVAL_MS = 3 * 60 * 1000;

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "Keep-alive check running");

        if (!BillingForegroundService.isRunning) {
            Log.w(TAG, "Foreground service not running, restarting");
            BillingForegroundService.start(context);
        }

        checkAccessibilityService(context);
        scheduleAlarm(context);
    }

    private void checkAccessibilityService(Context context) {
        try {
            int enabled = Settings.Secure.getInt(
                context.getContentResolver(),
                Settings.Secure.ACCESSIBILITY_ENABLED
            );
            if (enabled != 1) return;

            String services = Settings.Secure.getString(
                context.getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            );
            if (services == null || !services.contains(context.getPackageName())) {
                Log.w(TAG, "Our accessibility service is NOT enabled!");
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not check accessibility status", e);
        }
    }

    public static void scheduleAlarm(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, KeepAliveReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        try {
            long triggerTime = System.currentTimeMillis() + CHECK_INTERVAL_MS;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent
                );
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent
                );
            }
            Log.i(TAG, "Keep-alive scheduled for " + (CHECK_INTERVAL_MS / 60000) + " min");
        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule alarm", e);
        }
    }
}