package com.autobilling.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.autobilling.service.BillingForegroundService;

public class BootReceiver extends BroadcastReceiver {

    private static final String TAG = "AutoBilling-Boot";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action == null) return;

        Log.i(TAG, "Received: " + action);

        switch (action) {
            case Intent.ACTION_BOOT_COMPLETED:
            case "android.intent.action.QUICKBOOT_POWERON":
                Log.i(TAG, "Boot completed, starting all services");
                startAllServices(context);
                break;
            case "com.autobilling.RESTART_SERVICE":
                Log.i(TAG, "Restart signal received");
                startAllServices(context);
                break;
            case Intent.ACTION_SCREEN_ON:
            case Intent.ACTION_USER_PRESENT:
                Log.i(TAG, "Screen on/user present, checking services");
                ensureForegroundService(context);
                break;
        }
    }

    private void startAllServices(Context context) {
        ensureForegroundService(context);

        // Re-request notification listener rebind
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                android.content.ComponentName cn = new android.content.ComponentName(
                    context, "com.autobilling.service.BillingNotificationListener"
                );
                android.service.notification.NotificationListenerService.requestRebind(cn);
            } catch (Exception e) {
                Log.w(TAG, "Could not request notification listener rebind", e);
            }
        }

        // Schedule JobScheduler as a safety net
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                android.app.job.JobScheduler jobScheduler =
                    (android.app.job.JobScheduler) context.getSystemService(Context.JOB_SCHEDULER_SERVICE);
                if (jobScheduler != null) {
                    android.app.job.JobInfo jobInfo = new android.app.job.JobInfo.Builder(
                        1002,
                        new android.content.ComponentName(context, ServiceRestarter.class)
                    )
                    .setMinimumLatency(5000)
                    .setOverrideDeadline(10000)
                    .setRequiredNetworkType(android.app.job.JobInfo.NETWORK_TYPE_NONE)
                    .setPersisted(true)
                    .build();
                    jobScheduler.schedule(jobInfo);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not schedule backup job", e);
        }
    }

    private void ensureForegroundService(Context context) {
        try {
            if (!BillingForegroundService.isRunning) {
                Log.i(TAG, "Starting foreground service");
                BillingForegroundService.start(context);
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to start foreground service", e);
        }
    }
}