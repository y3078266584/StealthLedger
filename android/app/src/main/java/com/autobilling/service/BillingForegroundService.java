package com.autobilling.service;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.app.AlarmManager;
import android.provider.Settings;
import android.util.Log;

import com.autobilling.receiver.KeepAliveReceiver;

public class BillingForegroundService extends Service {

    private static final String TAG = "AutoBilling-FG";
    private static final String CHANNEL_ID = "autobilling_foreground";
    private static final int NOTIFICATION_ID = 1001;

    public static boolean isRunning = false;
    private PowerManager.WakeLock wakeLock;
    private Handler keepAliveHandler;
    private Runnable keepAliveRunnable;
    private static final long SELF_CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "Foreground service created");
        createNotificationChannel();
        acquireWakeLock();
        ClipboardMonitor.getInstance(this).startMonitoring();
        isRunning = true;
        startSelfCheckLoop();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "Foreground service starting");

        Intent notificationIntent = getPackageManager()
            .getLaunchIntentForPackage(getPackageName());
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            notification = new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("\u5f71\u8bb0 \u8bb0\u8d26\u76d1\u542c")
                .setContentText("\u670d\u52a1\u5df2\u542f\u52a8\uff0c\u652f\u4ed8\u540e\u81ea\u52a8\u8bb0\u8d26")
                .setSmallIcon(android.R.drawable.ic_menu_manage)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(Notification.PRIORITY_DEFAULT)
                .setCategory(Notification.CATEGORY_SERVICE)
                .build();
        } else {
            notification = new Notification.Builder(this)
                .setContentTitle("\u5f71\u8bb0 \u8bb0\u8d26\u76d1\u542c")
                .setContentText("\u670d\u52a1\u5df2\u542f\u52a8\uff0c\u652f\u4ed8\u540e\u81ea\u52a8\u8bb0\u8d26")
                .setSmallIcon(android.R.drawable.ic_menu_manage)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(Notification.PRIORITY_DEFAULT)
                .build();
        }

        startForeground(NOTIFICATION_ID, notification);

        // Schedule aggressive keep-alive checks
        KeepAliveReceiver.scheduleAlarm(this);

        // Ensure accessibility service stays alive
        ensureAccessibilityService();

        return START_STICKY;
    }

    private void ensureAccessibilityService() {
        try {
            int enabled = Settings.Secure.getInt(
                getContentResolver(),
                Settings.Secure.ACCESSIBILITY_ENABLED
            );
            if (enabled == 1) {
                String services = Settings.Secure.getString(
                    getContentResolver(),
                    Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
                );
                if (services != null && services.contains(getPackageName())) {
                    Log.d(TAG, "Accessibility service is enabled");
                } else {
                    Log.w(TAG, "Accessibility service not in enabled list");
                }
            } else {
                Log.w(TAG, "Accessibility is disabled system-wide");
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not check accessibility status", e);
        }
    }

    // Self-check loop: every 60s verify clipboard monitor is running
    private void startSelfCheckLoop() {
        keepAliveHandler = new Handler(Looper.getMainLooper());
        keepAliveRunnable = new Runnable() {
            @Override
            public void run() {
                try {
                    if (!ClipboardMonitor.getInstance(BillingForegroundService.this).isMonitoring()) {
                        Log.w(TAG, "Clipboard monitor not running, restarting");
                        ClipboardMonitor.getInstance(BillingForegroundService.this).startMonitoring();
                    }
                } catch (Exception e) {
                    Log.w(TAG, "Self-check error", e);
                }
                keepAliveHandler.postDelayed(this, SELF_CHECK_INTERVAL_MS);
            }
        };
        keepAliveHandler.postDelayed(keepAliveRunnable, SELF_CHECK_INTERVAL_MS);
    }

    @Override
    public void onDestroy() {
        Log.w(TAG, "Foreground service destroyed, scheduling restart");
        isRunning = false;
        releaseWakeLock();
        if (keepAliveHandler != null && keepAliveRunnable != null) {
            keepAliveHandler.removeCallbacks(keepAliveRunnable);
        }
        try {
            ClipboardMonitor.getInstance(this).stopMonitoring();
        } catch (Exception ignored) {}

        // Multiple restart mechanisms
        scheduleRestart();
        super.onDestroy();
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        Log.w(TAG, "Task removed, scheduling restart");
        scheduleRestart();
        super.onTaskRemoved(rootIntent);
    }

    private void scheduleRestart() {
        // 1. Broadcast restart signal
        Intent restartIntent = new Intent("com.autobilling.RESTART_SERVICE");
        restartIntent.setPackage(getPackageName());
        sendBroadcast(restartIntent);

        // 2. Direct restart via alarm (more reliable)
        try {
            android.app.AlarmManager alarmManager = (android.app.AlarmManager) getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null) {
                Intent serviceIntent = new Intent(this, BillingForegroundService.class);
                PendingIntent pendingIntent = PendingIntent.getService(
                    this, 999, serviceIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );
                long triggerTime = System.currentTimeMillis() + 1000; // 1 second
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
                } else {
                    alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
                }
                Log.i(TAG, "Scheduled alarm-based restart in 1s");
            }
        } catch (Exception e) {
            Log.w(TAG, "Alarm restart failed", e);
        }

        // 3. JobScheduler restart
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                android.app.job.JobScheduler jobScheduler =
                    (android.app.job.JobScheduler) getSystemService(Context.JOB_SCHEDULER_SERVICE);
                if (jobScheduler != null) {
                    android.app.job.JobInfo jobInfo = new android.app.job.JobInfo.Builder(
                        1001,
                        new android.content.ComponentName(this, com.autobilling.receiver.ServiceRestarter.class)
                    )
                    .setMinimumLatency(1000)
                    .setOverrideDeadline(3000)
                    .setRequiredNetworkType(android.app.job.JobInfo.NETWORK_TYPE_NONE)
                    .setPersisted(true)
                    .build();
                    jobScheduler.schedule(jobInfo);
                    Log.i(TAG, "Scheduled JobScheduler restart");
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "JobScheduler restart failed", e);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "\u8bb0\u8d26\u76d1\u542c",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("\u5f71\u8bb0 \u81ea\u52a8\u8bb0\u8d26\u540e\u53f0\u670d\u52a1");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void acquireWakeLock() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(
                    PowerManager.PARTIAL_WAKE_LOCK,
                    "AutoBilling:ServiceWakeLock"
                );
                wakeLock.acquire(24 * 60 * 60 * 1000L); // 24 hours
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not acquire wake lock", e);
        }
    }

    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception e) {
                Log.w(TAG, "Error releasing wake lock", e);
            }
        }
    }

    public static void start(Context context) {
        Intent intent = new Intent(context, BillingForegroundService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    public static void stop(Context context) {
        Intent intent = new Intent(context, BillingForegroundService.class);
        context.stopService(intent);
    }
}