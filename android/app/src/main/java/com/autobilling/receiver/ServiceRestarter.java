package com.autobilling.receiver;

import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.autobilling.service.BillingForegroundService;

import androidx.annotation.RequiresApi;

@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
public class ServiceRestarter extends JobService {

    private static final String TAG = "AutoBilling-Restarter";

    @Override
    public boolean onStartJob(JobParameters params) {
        Log.i(TAG, "JobScheduler triggered, restarting foreground service");

        try {
            if (!BillingForegroundService.isRunning) {
                BillingForegroundService.start(this);
                Log.i(TAG, "Foreground service restarted via JobScheduler");
            }

            // Also re-request notification listener rebind
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                try {
                    android.content.ComponentName cn = new android.content.ComponentName(
                        this, "com.autobilling.service.BillingNotificationListener"
                    );
                    android.service.notification.NotificationListenerService.requestRebind(cn);
                    Log.i(TAG, "Requested notification listener rebind");
                } catch (Exception e) {
                    Log.w(TAG, "Could not rebind notification listener", e);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to restart service", e);
        }

        return false; // Job is done
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        return true; // Reschedule if interrupted
    }
}