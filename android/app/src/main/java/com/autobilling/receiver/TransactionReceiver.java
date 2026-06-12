package com.autobilling.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;

import com.autobilling.service.BillingAccessibilityService;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
public class TransactionReceiver extends BroadcastReceiver {

    private static final String TAG = "AutoBilling-Receiver";
    private static final String DATA_FILE = "captured_transactions.json";
    private static final String DEDUP_PREFS = "tx_dedup";
    private static final int MAX_RECENT = 50;
    private static final long DEDUP_WINDOW_MS = 30_000;
    private static final int MAX_DEDUP_CACHE = 200;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!BillingAccessibilityService.ACTION_TRANSACTION_CAPTURED.equals(intent.getAction())) {
            return;
        }

        Bundle data = intent.getBundleExtra(BillingAccessibilityService.EXTRA_TRANSACTION_DATA);
        if (data == null) return;

        double amount = data.getDouble("amount", 0);
        String merchant = data.getString("merchant", "");
        String date = data.getString("date", "");
        String time = data.getString("time", "");
        String platform = data.getString("platform", "");
        String source = data.getString("source", "");
        String type = data.getString("type", "expense");

        if (amount <= 0) return;

        String fingerprint = String.format("%.2f|%s|%s|%s", amount, merchant, date, platform);

        if (isDuplicateRecent(context, fingerprint)) {
            Log.d(TAG, "Skipping duplicate (recent): " + amount);
            return;
        }

        if (isDuplicateInFile(context, fingerprint)) {
            Log.d(TAG, "Skipping duplicate (in file): " + amount);
            recordRecent(context, fingerprint);
            return;
        }

        recordRecent(context, fingerprint);

        Log.i(TAG, String.format("New: %s \u00a5%.2f [%s] via %s", merchant, amount, platform, source));

        saveToFile(context, amount, merchant, date, time, platform, source);
    }

    private boolean isDuplicateRecent(Context context, String fingerprint) {
        SharedPreferences prefs = context.getSharedPreferences(DEDUP_PREFS, Context.MODE_PRIVATE);
        String key = "fp_" + Math.abs(fingerprint.hashCode() % MAX_DEDUP_CACHE);
        String cached = prefs.getString(key, "");
        long cachedTime = prefs.getLong(key + "_t", 0);
        long now = System.currentTimeMillis();
        return fingerprint.equals(cached) && (now - cachedTime) < DEDUP_WINDOW_MS;
    }

    private void recordRecent(Context context, String fingerprint) {
        SharedPreferences prefs = context.getSharedPreferences(DEDUP_PREFS, Context.MODE_PRIVATE);
        String key = "fp_" + Math.abs(fingerprint.hashCode() % MAX_DEDUP_CACHE);
        prefs.edit()
            .putString(key, fingerprint)
            .putLong(key + "_t", System.currentTimeMillis())
            .apply();
    }

    private boolean isDuplicateInFile(Context context, String fingerprint) {
        try {
            File file = new File(context.getFilesDir(), DATA_FILE);
            if (!file.exists()) return false;

            BufferedReader reader = new BufferedReader(new FileReader(file));
            java.util.ArrayList<String> allLines = new java.util.ArrayList<>();

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                allLines.add(line.trim());
            }
            reader.close();

            // Only check last MAX_RECENT entries
            int startIdx = Math.max(0, allLines.size() - MAX_RECENT);
            java.util.List<String> recentLines = allLines.subList(startIdx, allLines.size());

            for (String entry : recentLines) {
                try {
                    JSONObject tx = new JSONObject(entry);
                    String entryFp = String.format("%.2f|%s|%s|%s",
                        tx.optDouble("amount", 0),
                        tx.optString("merchant", ""),
                        tx.optString("date", ""),
                        tx.optString("platform", "")
                    );
                    if (fingerprint.equals(entryFp)) return true;
                } catch (Exception ignored) {}
            }
            return false;
        } catch (Exception e) {
            Log.w(TAG, "File dup check failed", e);
            return false;
        }
    }

    private void saveToFile(Context context, double amount, String merchant,
                            String date, String time, String platform, String source) {
        try {
            File file = new File(context.getFilesDir(), DATA_FILE);

            String id = Long.toString(System.currentTimeMillis(), 36)
                      + Long.toString(Math.round(Math.random() * 1000000), 36);

            JSONObject tx = new JSONObject();
            tx.put("id", id);
            tx.put("amount", amount);
            tx.put("merchant", merchant);
            tx.put("date", date);
            tx.put("time", time);
            tx.put("platform", platform);
            tx.put("type", type);
            tx.put("source", source != null && !source.isEmpty() ? source : "auto");
            tx.put("category", "other_expense");
            tx.put("note", "");

            FileWriter writer = new FileWriter(file, true);
            writer.close();

            // Use append mode properly
            FileWriter appender = new FileWriter(file, true);
            if (file.exists() && file.length() > 0) {
                appender.write("\n");
            }
            appender.write(tx.toString());
            appender.close();

            Log.d(TAG, "Saved: " + tx.optString("id"));
        } catch (Exception e) {
            Log.e(TAG, "Save failed", e);
        }
    }
}
