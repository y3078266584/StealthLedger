package com.autobilling.service;

import android.content.Intent;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BillingNotificationListener extends NotificationListenerService {

    private static final String TAG = "AutoBilling-Notif";

    private static final String ALIPAY_PACKAGE = "com.eg.android.AlipayGphone";
    private static final String WECHAT_PACKAGE = "com.tencent.mm";
    // Ride-hailing & transit auto-debit
    private static final String DIDI_PACKAGE = "com.sdu.didi.psnger";
    private static final String DIDI_GLOBAL_PACKAGE = "com.didi.global.taximeter";
    private static final String[] AUTO_DEBIT_PACKAGES = {
        "com.sdu.didi.psnger", "com.didi.global.taximeter",
        "com.sankuai.meituan", "com.taobao.taobao",
        "com.eg.android.AlipayGphone", "com.tencent.mm"
    };

    // Expanded amount pattern
    private static final Pattern AMOUNT_PATTERN = Pattern.compile(
        "[\u00a5\uffe5]\\s*(\\d+\\.?\\d{0,2})" +
        "|\u652f\u4ed8[\uff1a:]\\s*(\\d+\\.?\\d{0,2})" +
        "|\u4ed8\u6b3e[\uff1a:]\\s*(\\d+\\.?\\d{0,2})" +
        "|\u6263\u6b3e[\uff1a:]\\s*(\\d+\\.?\\d{0,2})" +
        "|\u6d88\u8d39[\uff1a:]\\s*(\\d+\\.?\\d{0,2})" +
        "|\u5b9e\u4ed8[\uff1a:\u00a5\uffe5 ]*\\s*(\\d+\\.?\\d{0,2})" +
        "|\u8f6c\u8d26[\uff1a:]\\s*(\\d+\\.?\\d{0,2})" +
        "|\u7ea2\u5305[\uff1a:]\\s*(\\d+\\.?\\d{0,2})" +
        "|(\\d+\\.?\\d{0,2})\\s*\u5143"
    );

    // 收款方/付款方/转出/转入 pattern for counterparty extraction
    private static final Pattern COUNTERPARTY_PATTERN = Pattern.compile(
        "\u6536\u6b3e\u65b9[\uff1a:]\\s*(.+?)(?:\\s|\\u00a5|$)" +
        "|\u6536\u6b3e\u4eba[\uff1a:]\\s*(.+?)(?:\\s|\\u00a5|$)" +
        "|\u4ed8\u6b3e\u65b9[\uff1a:]\\s*(.+?)(?:\\s|\\u00a5|$)" +
        "|\u8f6c\u51fa[\uff1a:]\\s*(.+?)(?:\\s|\\u00a5|$)" +
        "|\u8f6c\u5165[\uff1a:]\\s*(.+?)(?:\\s|\\u00a5|$)");

    private static final Pattern MERCHANT_PATTERN = Pattern.compile(
        "\u5546\u6237[\uff1a:]\\s*(.+?)(?:\\s|$)" +
        "|\u6536\u6b3e\u65b9[\uff1a:]\\s*(.+?)(?:\\s|$)" +
        "|\u5bf9\u65b9[\uff1a:]\\s*(.+?)(?:\\s|$)" +
        "|\u5230\u8d26[\uff1a:]\\s*(.+?)(?:\\s|$)" +
        "|\u5546\u54c1[\uff1a:]\\s*(.+?)(?:\\s|$)"
    );

    private String lastAmount = "";
    private long lastCaptureTime = 0;
    private static final long DEBOUNCE_MS = 10000;

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();

        if (!ALIPAY_PACKAGE.equals(packageName) && !WECHAT_PACKAGE.equals(packageName)) {
            return;
        }

        Bundle extras = sbn.getNotification().extras;
        String title = extras.getString("android.title", "");
        String text = extras.getString("android.text", "");
        String bigText = "";
        CharSequence bigTextCs = extras.getCharSequence("android.bigText");
        if (bigTextCs != null) {
            bigText = bigTextCs.toString();
        }
        // Read additional text fields (some notifications put content here)
        String subText = extras.getString("android.subText", "");
        String infoText = extras.getString("android.infoText", "");
        String summaryText = extras.getString("android.summaryText", "");
        // Combine all available text
        String fullText = (title + " " + text + " " + bigText
            + " " + subText + " " + infoText + " " + summaryText).trim();

        if (fullText.isEmpty()) return;

        Log.d(TAG, "Payment notification from " + packageName + ": " + fullText);

        TransactionInfo info = extractFromNotification(fullText, packageName);
        if (info != null && info.amount > 0) {
            long now = System.currentTimeMillis();
            String amountKey = packageName + ":" + info.amount;
            if (!amountKey.equals(lastAmount) || (now - lastCaptureTime) > DEBOUNCE_MS) {
                lastAmount = amountKey;
                lastCaptureTime = now;
                broadcastTransaction(info);
                Log.i(TAG, "Captured from notification: " + info.merchant + " \u00a5" + info.amount);
            }
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.i(TAG, "Notification listener connected");
    }

    @Override
    public void onListenerDisconnected() {
        Log.w(TAG, "Notification listener disconnected, requesting rebind");
        try {
            requestRebind(new android.content.ComponentName(this, BillingNotificationListener.class));
        } catch (Exception e) {
            Log.w(TAG, "Could not request rebind", e);
        }
    }

    private TransactionInfo extractFromNotification(String text, String packageName) {
        TransactionInfo info = new TransactionInfo();

        if (ALIPAY_PACKAGE.equals(packageName)) {
            info.platform = "alipay";
        } else if (WECHAT_PACKAGE.equals(packageName)) {
            info.platform = "wechat";
        } else if (DIDI_PACKAGE.equals(packageName) || DIDI_GLOBAL_PACKAGE.equals(packageName)) {
            info.platform = "didi";
            info.merchant = "滴滴出行";
        } else {
            // Try to extract from any app with payment patterns (ride-hailing, transit auto-debit, etc.)
            // If we get here, check if it has auto-debit patterns and extract anyway
            info.platform = "auto";
        }

        // Check if text has a ¥/￥ amount (quick pre-check)
        boolean hasYuanAmount = text.contains("\u00a5") || text.contains("\uffe5");

        // Skip notifications that look like history/bill summaries or promos
        // (but NOT if they have a ¥ amount — auto-debit notifications may mention "账单")
        if (!hasYuanAmount && containsAny(text, "\u8d26\u5355", "\u4ea4\u6613\u8bb0\u5f55",
            "\u6708\u8d26\u5355", "\u660e\u7ec6",
            "\u9001\u4f60", "\u8d60\u9001", "\u4f18\u60e0", "\u514d\u8d39",
            "\u798f\u5229", "\u8fd4\u73b0", "\u7b7e\u5230", "\u79ef\u5206",
            "\u6708\u652f\u51fa", "\u6708\u6536\u5165", "\u5168\u90e8\u8d26\u5355")) {
            return null;
        }

        // Payment keyword check:
        // For Alipay/WeChat: if there's a ¥ amount, auto-debit is highly likely — skip keyword check
        // For other apps: require at least one payment keyword
        boolean isKnownApp = ALIPAY_PACKAGE.equals(packageName) || WECHAT_PACKAGE.equals(packageName);
        boolean hasPaymentKeyword = containsAny(text, "\u652f\u4ed8", "\u4ed8\u6b3e", "\u6263\u6b3e",
            "\u6d88\u8d39", "\u00a5", "\uffe5", "\u8f6c\u8d26",
            "\u7ea2\u5305", "\u5230\u8d26", "\u5df2\u6536\u5230",
            "\u5546\u6237\u626b\u7801", "\u5411\u4f60\u4ed8\u6b3e",
            "\u6536\u5230\u8f6c\u8d26", "\u5206\u671f", "\u82b1\u5457",
            "\u4fe1\u7528\u5361\u8fd8\u6b3e",
            "\u9000\u6b3e", "\u53d6\u6d88\u8ba2\u5355", "\u5df2\u53d6\u6d88",
            "\u81ea\u52a8\u6263\u6b3e", "\u514d\u5bc6\u652f\u4ed8", "\u5df2\u6263\u6b3e",
            "\u884c\u7a0b", "\u4e58\u8f66", "\u51fa\u884c", "\u5730\u94c1",
            "\u516c\u4ea4", "\u5148\u4e58\u540e\u4ed8", "\u4e58\u8f66\u7801");

        if (!hasPaymentKeyword) {
            // For known apps with ¥ amount, still accept (auto-debit notifications)
            if (!isKnownApp || !hasYuanAmount) {
                return null;
            }
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

        // Reject suspiciously large amounts
        if (info.amount > 99999) return null;

        // Skip tiny amounts likely from leaked promos
        if (info.amount < 0.5 && !containsAny(text, "\u652f\u4ed8", "\u4ed8\u6b3e", "\u6263\u6b3e",
            "\u6d88\u8d39", "\u8f6c\u8d26", "\u5546\u6237\u626b\u7801")) {
            return null;
        }

        // Detect refund/cancellation -> set as income
        boolean isRefund = containsAny(text, "\u9000\u6b3e", "\u5df2\u9000\u6b3e",
            "\u53d6\u6d88\u8ba2\u5355", "\u5df2\u53d6\u6d88", "\u9000\u8d27",
            "\u6536\u5230\u9000\u6b3e", "\u9000\u56de");
        if (isRefund) {
            Log.d(TAG, "Refund detected: " + text);
            info.type = "income";
        }

        // Detect incoming money (non-refund)
        if (!isRefund && containsAny(text, "\u5230\u8d26", "\u5df2\u6536\u5230",
            "\u6536\u5230\u8f6c\u8d26", "\u6536\u6b3e")) {
            info.type = "income";
        }

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
            info.merchant = guessMerchantFromTitle(text);
        }

        // Auto-debit merchant guessing (地铁/公交/打车)
        if (info.merchant.isEmpty() || "unknown".equals(info.merchant)) {
            if (containsAny(text, "\u5730\u94c1", "\u516c\u4ea4", "\u4e58\u8f66\u7801", "\u5148\u4e58\u540e\u4ed8")) {
                info.merchant = "\u5730\u94c1/\u516c\u4ea4";
            } else if (containsAny(text, "\u884c\u7a0b", "\u51fa\u884c")) {
                info.merchant = "\u51fa\u884c";
            } else if (containsAny(text, "\u81ea\u52a8\u6263\u6b3e", "\u514d\u5bc6\u652f\u4ed8")) {
                info.merchant = "\u81ea\u52a8\u6263\u6b3e";
            }
        }

        // Extract counterparty (payee/payer)
        try {
            Matcher cpMatcher = COUNTERPARTY_PATTERN.matcher(text);
            if (cpMatcher.find()) {
                for (int j = 1; j <= cpMatcher.groupCount(); j++) {
                    String g = cpMatcher.group(j);
                    if (g != null && !g.isEmpty()) {
                        info.counterparty = g.trim();
                        break;
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Counterparty extraction failed", e);
        }

        if (info.merchant.isEmpty()) {
            info.merchant = isRefund ? "\u9000\u6b3e" : "unknown";
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        info.date = sdf.format(new Date());
        sdf = new SimpleDateFormat("HH:mm:ss", Locale.getDefault());
        info.time = sdf.format(new Date());

        return info;
    }

    private String guessMerchantFromTitle(String text) {
        String cleaned = text
            .replaceAll("[\u00a5\uffe5]\\s*\\d+\\.?\\d{0,2}", "")
            .replaceAll("\\d{4,}", "")
            .replaceAll("\u652f\u4ed8\u6210\u529f|\u5df2\u652f\u4ed8|\u4ed8\u6b3e\u6210\u529f", "")
            .trim();

        if (cleaned.length() > 1 && cleaned.length() <= 30) {
            return cleaned;
        }
        return "";
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) return true;
        }
        return false;
    }

    private void broadcastTransaction(TransactionInfo info) {
        Intent intent = new Intent("com.autobilling.TRANSACTION_CAPTURED");
        intent.setPackage(getPackageName());
        Bundle bundle = new Bundle();
        bundle.putDouble("amount", info.amount);
        bundle.putString("merchant", info.merchant);
        bundle.putString("date", info.date);
        bundle.putString("time", info.time);
        bundle.putString("platform", info.platform);
        bundle.putString("type", info.type);
        bundle.putString("counterparty", info.counterparty);
        bundle.putString("source", "notification");
        intent.putExtra("transaction_data", bundle);
        sendBroadcast(intent);
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
