package com.autobilling.service;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ClipboardMonitor {

    private static final String TAG = "AutoBilling-Clipboard";
    private static ClipboardMonitor instance;
    private ClipboardManager clipboardManager;
    private Context context;
    private boolean isMonitoring = false;
    private String lastText = "";

    private static final Pattern AMOUNT_PATTERN = Pattern.compile(
        "[\u00a5\uffe5]\\s*(\\d+\\.?\\d{0,2})" +
        "|付款金额[：:]\\s*(\\d+\\.?\\d{0,2})" +
        "|支付[：:]\\s*(\\d+\\.?\\d{0,2})" +
        "|扣款[：:]\\s*(\\d+\\.?\\d{0,2})" +
        "|消费[：:]\\s*(\\d+\\.?\\d{0,2})" +
        "|实付[：:]\\s*(\\d+\\.?\\d{0,2})" +
        "|(\\d+\\.?\\d{0,2})\\s*元"
    );

    private static final Pattern MERCHANT_PATTERN = Pattern.compile(
        "收款方[：:]\\s*(.+?)(?:\\n|$)" +
        "|商户[：:]\\s*(.+?)(?:\\n|$)" +
        "|商品说明[：:]\\s*(.+?)(?:\\n|$)" +
        "|付款给[：:]\\s*(.+?)(?:\\n|$)" +
        "|商品[：:]\\s*(.+?)(?:\\n|$)"
    );

    private ClipboardMonitor(Context context) {
        this.context = context.getApplicationContext();
    }

    public static ClipboardMonitor getInstance(Context context) {
        if (instance == null) {
            instance = new ClipboardMonitor(context);
        }
        return instance;
    }

    public void startMonitoring() {
        if (isMonitoring) return;

        try {
            clipboardManager = (ClipboardManager) context.getSystemService(Context.CLIPBOARD_SERVICE);
            if (clipboardManager == null) {
                Log.w(TAG, "ClipboardManager not available");
                return;
            }

            clipboardManager.addPrimaryClipChangedListener(clipListener);
            isMonitoring = true;
            Log.i(TAG, "Clipboard monitoring started");
        } catch (Exception e) {
            Log.e(TAG, "Failed to start clipboard monitoring", e);
        }
    }

    public void stopMonitoring() {
        if (!isMonitoring || clipboardManager == null) return;

        try {
            clipboardManager.removePrimaryClipChangedListener(clipListener);
            isMonitoring = false;
            Log.i(TAG, "Clipboard monitoring stopped");
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop clipboard monitoring", e);
        }
    }

    public boolean isMonitoring() {
        return isMonitoring;
    }

    private final ClipboardManager.OnPrimaryClipChangedListener clipListener = new ClipboardManager.OnPrimaryClipChangedListener() {
        @Override
        public void onPrimaryClipChanged() {
            try {
                if (clipboardManager == null || !clipboardManager.hasPrimaryClip()) return;

                ClipData clip = clipboardManager.getPrimaryClip();
                if (clip == null || clip.getItemCount() == 0) return;

                CharSequence text = clip.getItemAt(0).getText();
                if (text == null) return;

                String textStr = text.toString().trim();
                if (textStr.isEmpty() || textStr.equals(lastText)) return;
                if (textStr.length() > 2000) return;

                lastText = textStr;
                Log.d(TAG, "Clipboard changed: " + textStr.substring(0, Math.min(100, textStr.length())));

                TransactionInfo info = parseClipboardText(textStr);
                if (info != null && info.amount > 0) {
                    broadcastTransaction(info);
                    Log.i(TAG, "Captured from clipboard: " + info.merchant + " \u00a5" + info.amount);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error processing clipboard", e);
            }
        }
    };

    private TransactionInfo parseClipboardText(String text) {
        TransactionInfo info = new TransactionInfo();
        info.platform = guessPlatform(text);

        // Skip promotional clipboard content
        if (containsAny(text, "\u9001\u4f60", "\u8d60\u9001", "\u4f18\u60e0\u5238",
            "\u514d\u8d39", "\u798f\u5229", "\u8fd4\u73b0", "\u7b7e\u5230",
            "\u62bd\u5956", "\u5e7f\u544a", "\u63a8\u8350")) {
            Log.d(TAG, "Skipping ad clipboard: " + text);
            return null;
        }

        // Detect refund/cancellation
        if (containsAny(text, "\u9000\u6b3e", "\u5df2\u9000\u6b3e",
            "\u53d6\u6d88\u8ba2\u5355", "\u5df2\u53d6\u6d88",
            "\u6536\u5230\u9000\u6b3e")) {
            info.type = "income";
        }

        Matcher amountMatcher = AMOUNT_PATTERN.matcher(text);
        if (amountMatcher.find()) {
            for (int i = 1; i <= amountMatcher.groupCount(); i++) {
                String group = amountMatcher.group(i);
                if (group != null && !group.isEmpty()) {
                    try {
                        info.amount = Double.parseDouble(group);
                        break;
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        if (info.amount <= 0) return null;

        Matcher merchantMatcher = MERCHANT_PATTERN.matcher(text);
        if (merchantMatcher.find()) {
            for (int i = 1; i <= merchantMatcher.groupCount(); i++) {
                String group = merchantMatcher.group(i);
                if (group != null && !group.isEmpty()) {
                    info.merchant = group.trim();
                    break;
                }
            }
        }
        if (info.merchant.isEmpty()) {
            info.merchant = "unknown";
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        info.date = sdf.format(new Date());
        sdf = new SimpleDateFormat("HH:mm:ss", Locale.getDefault());
        info.time = sdf.format(new Date());

        return info;
    }

    private String guessPlatform(String text) {
        if (text.contains("支付宝") || text.contains("余额宝") || text.contains("花呗")) {
            return "alipay";
        }
        if (text.contains("微信") || text.contains("零钱")) {
            return "wechat";
        }
        return "unknown";
    }

    private void broadcastTransaction(TransactionInfo info) {
        Intent intent = new Intent("com.autobilling.TRANSACTION_CAPTURED");
        intent.setPackage(context.getPackageName());
        Bundle bundle = new Bundle();
        bundle.putDouble("amount", info.amount);
        bundle.putString("merchant", info.merchant);
        bundle.putString("date", info.date);
        bundle.putString("time", info.time);
        bundle.putString("platform", info.platform);
        bundle.putString("type", info.type);
        bundle.putString("counterparty", info.counterparty);
        bundle.putString("source", "clipboard");
        intent.putExtra("transaction_data", bundle);
        context.sendBroadcast(intent);
    }

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) { if (text.contains(kw)) return true; }
        return false;
    }

    private static class TransactionInfo {
        double amount = 0;
        String merchant = "";
        String date = "";
        String time = "";
        String platform = "";
        String type = "expense";
        String counterparty = "";
    }
}
