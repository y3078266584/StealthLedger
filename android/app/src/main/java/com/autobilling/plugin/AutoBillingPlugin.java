package com.autobilling.plugin;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.autobilling.service.BillingAccessibilityService;
import com.autobilling.service.BillingForegroundService;
import com.autobilling.service.ClipboardMonitor;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@CapacitorPlugin(name = "AutoBilling")
public class AutoBillingPlugin extends Plugin {

    private static final String TAG = "AutoBilling-Plugin";
    private static final String DATA_FILE = "captured_transactions.json";

    @Override
    public void load() {
        Log.i(TAG, "AutoBilling plugin loaded");
        // Auto-start foreground service when plugin loads
        try {
            if (!BillingForegroundService.isRunning) {
                BillingForegroundService.start(getContext());
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not auto-start foreground service", e);
        }
    }

    // ===== Accessibility Service =====

    @PluginMethod
    public void isAccessibilityEnabled(PluginCall call) {
        Context ctx = getContext();
        int enabled = 0;
        try {
            enabled = Settings.Secure.getInt(
                ctx.getContentResolver(),
                Settings.Secure.ACCESSIBILITY_ENABLED
            );
        } catch (Settings.SettingNotFoundException e) {
            enabled = 0;
        }

        boolean serviceEnabled = false;
        if (enabled == 1) {
            String services = Settings.Secure.getString(
                ctx.getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            );
            if (services != null) {
                serviceEnabled = services.toLowerCase().contains("autobilling");
            }
        }

        JSObject ret = new JSObject();
        ret.put("enabled", serviceEnabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void openAccessibilitySettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    // ===== Notification Listener =====

    @PluginMethod
    public void isNotificationListenerEnabled(PluginCall call) {
        String listeners = android.provider.Settings.Secure.getString(
            getContext().getContentResolver(),
            "enabled_notification_listeners"
        );
        boolean enabled = listeners != null && listeners.contains("autobilling");

        JSObject ret = new JSObject();
        ret.put("enabled", enabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void openNotificationListenerSettings(PluginCall call) {
        Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    // ===== Foreground Service =====

    @PluginMethod
    public void startForegroundService(PluginCall call) {
        try {
            BillingForegroundService.start(getContext());
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to start: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopForegroundService(PluginCall call) {
        try {
            BillingForegroundService.stop(getContext());
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to stop: " + e.getMessage());
        }
    }

    // ===== Battery Optimization =====

    @PluginMethod
    public void isIgnoringBatteryOptimizations(PluginCall call) {
        PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
        boolean ignoring = pm != null && pm.isIgnoringBatteryOptimizations(getContext().getPackageName());

        JSObject ret = new JSObject();
        ret.put("ignoring", ignoring);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimizations(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open battery settings: " + e.getMessage());
        }
    }

    // ===== All Services Status =====

        @PluginMethod
    public void getAllServiceStatus(PluginCall call) {
        JSObject ret = new JSObject();
        JSObject errors = new JSObject();

        // Foreground service
        try {
            ret.put("foregroundService", BillingForegroundService.isRunning);
        } catch (Exception e) {
            ret.put("foregroundService", false);
            errors.put("foregroundService", e.getMessage());
        }

        // Accessibility service
        try {
            ret.put("accessibilityService", BillingAccessibilityService.isRunning());
        } catch (Exception e) {
            ret.put("accessibilityService", false);
            errors.put("accessibilityService", e.getMessage());
        }

        // Notification listener
        try {
            String listeners = android.provider.Settings.Secure.getString(
                getContext().getContentResolver(),
                "enabled_notification_listeners"
            );
            boolean notifEnabled = listeners != null && listeners.contains("autobilling");
            ret.put("notificationListener", notifEnabled);
        } catch (Exception e) {
            ret.put("notificationListener", false);
            errors.put("notificationListener", e.getMessage());
        }

        // Clipboard monitor
        try {
            ClipboardMonitor clipMon = ClipboardMonitor.getInstance(getContext());
            ret.put("clipboardMonitor", clipMon != null && clipMon.isMonitoring());
        } catch (Exception e) {
            ret.put("clipboardMonitor", false);
            errors.put("clipboardMonitor", e.getMessage());
        }

        // Battery optimization
        try {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            ret.put("batteryOptimizationIgnored",
                pm != null && pm.isIgnoringBatteryOptimizations(getContext().getPackageName()));
        } catch (Exception e) {
            ret.put("batteryOptimizationIgnored", false);
            errors.put("batteryOptimizationIgnored", e.getMessage());
        }

        ret.put("_errors", errors);
        ret.put("_allOk", errors.length() == 0);
        call.resolve(ret);
    }

    // ===== Transaction Data =====

    @PluginMethod
    public void getPendingTransactions(PluginCall call) {
        try {
            File file = new File(getContext().getFilesDir(), DATA_FILE);
            JSObject ret = new JSObject();

            if (!file.exists()) {
                ret.put("transactions", new JSONArray());
                call.resolve(ret);
                return;
            }

            List<JSONObject> txs = new ArrayList<>();
            BufferedReader reader = new BufferedReader(new FileReader(file));
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                try {
                    txs.add(new JSONObject(line.trim()));
                } catch (Exception ignored) {}
            }
            reader.close();

            JSONArray arr = new JSONArray();
            for (JSONObject tx : txs) {
                arr.put(tx);
            }

            ret.put("transactions", arr);
            call.resolve(ret);

        } catch (Exception e) {
            Log.e(TAG, "Read transactions failed", e);
            call.reject("Read failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void clearPendingTransactions(PluginCall call) {
        try {
            File file = new File(getContext().getFilesDir(), DATA_FILE);
            if (file.exists()) {
                file.delete();
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Clear failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void isClipboardMonitorActive(PluginCall call) {
        ClipboardMonitor cm = ClipboardMonitor.getInstance(getContext());
        JSObject ret = new JSObject();
        ret.put("active", cm.isMonitoring());
        call.resolve(ret);
    }

    @PluginMethod
    public void exportXlsx(PluginCall call) {
        try {
            String base64 = call.getString("base64", "");
            String filename = call.getString("filename", "export.xlsx");
            if (base64 == null || base64.isEmpty()) {
                call.reject("Missing base64 content");
                return;
            }
            byte[] bytes = android.util.Base64.decode(base64, android.util.Base64.DEFAULT);
            java.io.OutputStream out = null;
            try {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                    android.content.ContentValues values = new android.content.ContentValues();
                    values.put(android.provider.MediaStore.Downloads.DISPLAY_NAME, filename);
                    values.put(android.provider.MediaStore.Downloads.MIME_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    values.put(android.provider.MediaStore.Downloads.RELATIVE_PATH, android.os.Environment.DIRECTORY_DOWNLOADS);
                    android.net.Uri uri = getContext().getContentResolver().insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri == null) { call.reject("Unable to create download"); return; }
                    out = getContext().getContentResolver().openOutputStream(uri);
                } else {
                    java.io.File dir = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS);
                    if (!dir.exists()) dir.mkdirs();
                    java.io.File file = new java.io.File(dir, filename);
                    out = new java.io.FileOutputStream(file);
                }
                out.write(bytes);
                out.flush();
                call.resolve();
            } finally {
                if (out != null) try { out.close(); } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            call.reject("Export failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getServiceStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("running", BillingAccessibilityService.isRunning());
        call.resolve(ret);
    }
}
