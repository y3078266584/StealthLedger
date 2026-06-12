package com.autobilling.service;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BillingAccessibilityService extends AccessibilityService {

    private static final String TAG = "AutoBilling";
    private static boolean isServiceRunning = false;

    public static boolean isRunning() {
        return isServiceRunning;
    }

    private static final String ALIPAY_PACKAGE = "com.eg.android.AlipayGphone";
    private static final String WECHAT_PACKAGE = "com.tencent.mm";
    private static final String UNIONPAY_PACKAGE = "com.unionpay";

    // Broader amount pattern: catches more formats
    private static final Pattern AMOUNT_PATTERN = Pattern.compile(
        "[\u00a5\uffe5]\\s*(\\d+\\.?\\d{0,2})" +
        "|\u4ed8\u6b3e\u91d1\u989d[\uff1a:\u00a5\uffe5 ]*\\s*(\\d+\\.?\\d{0,2})" +
        "|\u8f6c\u8d26\u91d1\u989d[\uff1a:\u00a5\uffe5 ]*\\s*(\\d+\\.?\\d{0,2})" +
        "|\u652f\u4ed8[\uff1a:]\\s*(\\d+\\.?\\d{0,2})" +
        "|\u5b9e\u4ed8[\uff1a:\u00a5\uffe5 ]*\\s*(\\d+\\.?\\d{0,2})" +
        "|\u5b9e\u4ed8\u6b3e[\uff1a:\u00a5\uffe5 ]*\\s*(\\d+\\.?\\d{0,2})" +
        "|\u603b\u8ba1[\uff1a:\u00a5\uffe5 ]*\\s*(\\d+\\.?\\d{0,2})" +
        "|\u5408\u8ba1[\uff1a:\u00a5\uffe5 ]*\\s*(\\d+\\.?\\d{0,2})" +
        "|(\\d+\\.?\\d{0,2})\\s*\u5143"
    );

    private static final Pattern MERCHANT_PATTERN = Pattern.compile(
        "\u6536\u6b3e\u65b9[\uff1a:]\\s*(.+?)(?:\\n|$)" +
        "|\u5546\u6237[\uff1a:]\\s*(.+?)(?:\\n|$)" +
        "|\u5546\u54c1\u8bf4\u660e[\uff1a:]\\s*(.+?)(?:\\n|$)" +
        "|\u4ed8\u6b3e\u7ed9[\uff1a:]\\s*(.+?)(?:\\n|$)" +
        "|\u8f6c\u7ed9[\uff1a:]\\s*(.+?)(?:\\n|$)" +
        "|\u6536\u6b3e\u4eba[\uff1a:]\\s*(.+?)(?:\\n|$)" +
        "|\u5907\u6ce8[\uff1a:]\\s*(.+?)(?:\\n|$)"
    );

    public static final String ACTION_TRANSACTION_CAPTURED = "com.autobilling.TRANSACTION_CAPTURED";
    public static final String EXTRA_TRANSACTION_DATA = "transaction_data";

    private String lastAmount = "";
    private long lastCaptureTime = 0;
    private static final long DEBOUNCE_MS = 8000; // Reduced from 10s to 8s

    // Track consecutive empty reads to avoid processing non-payment pages
    private int emptyReadCount = 0;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";

        if (!isPaymentApp(packageName)) return;

        int eventType = event.getEventType();
        if (eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            && eventType != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED) {
            return;
        }

        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode == null) return;

        try {
            TransactionInfo info = null;

            // Strategy 1: Check for payment success pages (existing)
            if (isPaymentSuccessPage(rootNode, packageName)) {
                info = extractTransactionInfo(rootNode, packageName);
            }

            // Strategy 2: Check for payment confirmation/processing pages
            if (info == null && isPaymentConfirmPage(rootNode, packageName)) {
                info = extractTransactionInfo(rootNode, packageName);
            }

            // Strategy 3: Check for transfer pages
            if (info == null && isTransferPage(rootNode, packageName)) {
                info = extractTransactionInfo(rootNode, packageName);
            }

            // Strategy 4: Check for order/payment detail pages (amount visible)
            if (info == null && isOrderDetailPage(rootNode, packageName)) {
                info = extractTransactionInfo(rootNode, packageName);
            }

            // Strategy 5: Check for refund/cancellation pages
            if (info == null && isRefundPage(rootNode, packageName)) {
                info = extractTransactionInfo(rootNode, packageName);
                if (info != null) info.type = "income";
            }

            if (info != null && info.amount > 0) {
                String amountKey = packageName + ":" + info.amount;
                long now = System.currentTimeMillis();
                if (!amountKey.equals(lastAmount) || (now - lastCaptureTime) > DEBOUNCE_MS) {
                    lastAmount = amountKey;
                    lastCaptureTime = now;
                    broadcastTransaction(info);
                    Log.i(TAG, "Captured: " + info.merchant + " \u00a5" + info.amount
                        + " [scenario=" + info.scenario + "]");
                }
            }
        } finally {
            rootNode.recycle();
        }
    }

    @Override
    public void onInterrupt() {
        Log.w(TAG, "Service interrupted");
        isServiceRunning = false;
    }

    @Override
    public void onDestroy() {
        Log.w(TAG, "Accessibility service destroyed");
        isServiceRunning = false;

        // Try to keep foreground service alive
        try {
            if (!BillingForegroundService.isRunning) {
                BillingForegroundService.start(this);
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not start foreground service on destroy", e);
        }

        super.onDestroy();
    }

    @Override
    protected boolean onGesture(int gestureId) {
        return super.onGesture(gestureId);
    }

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                        | AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
                        | AccessibilityEvent.TYPE_VIEW_CLICKED
                        | AccessibilityEvent.TYPE_VIEW_SCROLLED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
                   | AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
                   | AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
                   | AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS;
        info.notificationTimeout = 50; // Faster response (was 100)
        setServiceInfo(info);
        isServiceRunning = true;

        // Start foreground service when accessibility service connects
        try {
            if (!BillingForegroundService.isRunning) {
                BillingForegroundService.start(this);
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not start foreground service on connect", e);
        }

        Log.i(TAG, "Accessibility service connected with enhanced detection");
    }

    private boolean isPaymentApp(String packageName) {
        return ALIPAY_PACKAGE.equals(packageName)
            || WECHAT_PACKAGE.equals(packageName)
            || UNIONPAY_PACKAGE.equals(packageName);
    }

    // ===== Payment success page detection (existing, improved) =====
    private boolean isPaymentSuccessPage(AccessibilityNodeInfo root, String packageName) {
        String pageText = getAllText(root);

        // Exclude history/bill list pages
        if (isHistoryPage(pageText)) return false;

        // Universal payment success indicators
        if (containsAny(pageText,
            "\u652f\u4ed8\u6210\u529f", "\u4ed8\u6b3e\u6210\u529f",
            "\u4ea4\u6613\u6210\u529f", "\u8ba2\u5355\u6210\u529f",
            "\u5df2\u652f\u4ed8", "\u5df2\u4ed8\u6b3e",
            "\u652f\u4ed8\u5b8c\u6210", "\u4ed8\u6b3e\u5b8c\u6210",
            "\u4ed8\u6b3e\u7ed3\u679c", "\u6210\u529f\u652f\u4ed8")
            && hasVisibleAmount(pageText)) {
            return true;
        }

        if (ALIPAY_PACKAGE.equals(packageName)) {
            // 瀹屾垚 button + amount (Alipay success often shows just 瀹屾垚)
            if (containsAny(pageText, "\u5b8c\u6210") && hasVisibleAmount(pageText)) return true;
            // Payment receipt / detail page
            if (containsAny(pageText, "\u4ea4\u6613\u8be6\u60c5", "\u4ed8\u6b3e\u8be6\u60c5",
                "\u8ba2\u5355\u8be6\u60c5") && hasVisibleAmount(pageText)) return true;
            // Any Alipay page with 楼 amount + payment context
            if (hasVisibleAmount(pageText) && containsAny(pageText,
                "\u652f\u4ed8\u5b9d", "\u4ed8\u6b3e", "\u6263\u6b3e")) return true;
        }

        if (WECHAT_PACKAGE.equals(packageName)) {
            // Payment receipt / detail
            if (containsAny(pageText, "\u4ed8\u6b3e\u8be6\u60c5", "\u4ea4\u6613\u8be6\u60c5",
                "\u5fae\u4fe1\u652f\u4ed8") && hasVisibleAmount(pageText)) return true;
            // Any WeChat page with 楼 amount
            if (hasVisibleAmount(pageText) && containsAny(pageText, "\u5fae\u4fe1")) return true;
        }

        if (UNIONPAY_PACKAGE.equals(packageName)) {
            return containsAny(pageText,
                "\u4ea4\u6613\u6210\u529f", "\u652f\u4ed8\u6210\u529f",
                "\u4ed8\u6b3e\u6210\u529f")
                && containsAny(pageText, "\u00a5", "\uffe5");
        }

        return false;
    }

    // ===== Payment confirmation/processing page =====
    private boolean isPaymentConfirmPage(AccessibilityNodeInfo root, String packageName) {
        String pageText = getAllText(root);
        if (isHistoryPage(pageText)) return false;

        // Look for the "payment in progress" or "confirm payment" pages
        // These pages show the amount before final confirmation
        if (ALIPAY_PACKAGE.equals(packageName)) {
            return containsAny(pageText,
                "\u786e\u8ba4\u4ed8\u6b3e", "\u786e\u8ba4\u652f\u4ed8",
                "\u8bf7\u786e\u8ba4\u4ed8\u6b3e", "\u8bf7\u786e\u8ba4\u652f\u4ed8",
                "\u7acb\u5373\u4ed8\u6b3e", "\u7acb\u5373\u652f\u4ed8",
                "\u7528\u6237\u4ed8\u6b3e")
                && containsAny(pageText, "\u00a5", "\uffe5");
        }

        if (WECHAT_PACKAGE.equals(packageName)) {
            return containsAny(pageText,
                "\u786e\u8ba4\u652f\u4ed8", "\u786e\u8ba4\u4ed8\u6b3e",
                "\u8bf7\u8f93\u5165\u652f\u4ed8\u5bc6\u7801",
                "\u652f\u4ed8\u5bc6\u7801", "\u6307\u7eb9\u652f\u4ed8",
                "\u9762\u5bb9\u8bc6\u522b\u652f\u4ed8")
                && containsAny(pageText, "\u00a5", "\uffe5");
        }

        return false;
    }

    // ===== Transfer page detection =====
    private boolean isTransferPage(AccessibilityNodeInfo root, String packageName) {
        String pageText = getAllText(root);
        if (isHistoryPage(pageText)) return false;

        if (ALIPAY_PACKAGE.equals(packageName)) {
            return containsAny(pageText,
                "\u786e\u8ba4\u8f6c\u8d26", "\u8f6c\u8d26\u5230",
                "\u8f6c\u8d26\u7ed9", "\u6b63\u5728\u8f6c\u8d26")
                && containsAny(pageText, "\u00a5", "\uffe5");
        }

        if (WECHAT_PACKAGE.equals(packageName)) {
            return containsAny(pageText,
                "\u8f6c\u8d26\u7ed9", "\u786e\u8ba4\u8f6c\u8d26",
                "\u53d1\u9001\u7ea2\u5305", "\u585e\u94b1\u8fdb\u7ea2\u5305")
                && containsAny(pageText, "\u00a5", "\uffe5");
        }

        return false;
    }

    // ===== Order detail / bill page detection =====
    private boolean isOrderDetailPage(AccessibilityNodeInfo root, String packageName) {
        String pageText = getAllText(root);
        if (isHistoryPage(pageText)) return false;

        // Alipay order detail or payment receipt
        if (ALIPAY_PACKAGE.equals(packageName)) {
            // Order detail with amount, merchant info
            if (containsAny(pageText, "\u8ba2\u5355\u8be6\u60c5", "\u4ea4\u6613\u8be6\u60c5",
                "\u4ed8\u6b3e\u8be6\u60c5", "\u6536\u6b3e\u65b9")
                && containsAny(pageText, "\u00a5", "\uffe5")) {
                return true;
            }
            // Scanning payment result (QR code payment)
            if (containsAny(pageText, "\u5411\u5546\u6237\u4ed8\u6b3e", "\u626b\u7801\u4ed8\u6b3e")
                && containsAny(pageText, "\u00a5", "\uffe5")) {
                return true;
            }
        }

        if (WECHAT_PACKAGE.equals(packageName)) {
            // WeChat payment receipt
            if (containsAny(pageText, "\u4ed8\u6b3e\u8be6\u60c5", "\u4ea4\u6613\u8be6\u60c5")
                && containsAny(pageText, "\u00a5", "\uffe5")) {
                return true;
            }
        }

        return false;
    }

    private boolean isRefundPage(AccessibilityNodeInfo root, String packageName) {
        String pageText = getAllText(root);
        if (pageText.isEmpty()) return false;
        return containsAny(pageText, "\u9000\u6b3e\u6210\u529f", "\u5df2\u9000\u6b3e",
            "\u9000\u6b3e\u5230\u8d26", "\u53d6\u6d88\u8ba2\u5355", "\u5df2\u53d6\u6d88",
            "\u9000\u6b3e\u5904\u7406", "\u9000\u6b3e\u8be6\u60c5");
    }

    private boolean isHistoryPage(String pageText) {
        return containsAny(pageText,
            "\u8d26\u5355\u660e\u7ec6", "\u6708\u8d26\u5355", "\u96f6\u94b1\u660e\u7ec6",
            "\u4ea4\u6613\u8bb0\u5f55", "\u8d26\u5355", "\u5386\u53f2\u8bb0\u5f55",
            "\u5168\u90e8\u8d26\u5355", "\u6d41\u6c34", "\u8d44\u91d1\u660e\u7ec6");
    }

    private boolean hasVisibleAmount(String text) {
        return text.contains("\u00a5") || text.contains("\uffe5")
            || java.util.regex.Pattern.compile("\\d+\\.\\d{2}").matcher(text).find();
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) return true;
        }
        return false;
    }

    private String getAllText(AccessibilityNodeInfo node) {
        StringBuilder sb = new StringBuilder();
        collectText(node, sb);
        return sb.toString();
    }

    private void collectText(AccessibilityNodeInfo node, StringBuilder sb) {
        if (node == null) return;
        CharSequence text = node.getText();
        if (text != null && text.length() > 0) {
            sb.append(text).append("\n");
        }
        CharSequence desc = node.getContentDescription();
        if (desc != null && desc.length() > 0) {
            sb.append(desc).append("\n");
        }
        // Also check view-id resource names for hints
        CharSequence viewId = node.getViewIdResourceName();
        if (viewId != null && viewId.length() > 0) {
            sb.append(viewId).append("\n");
        }
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                collectText(child, sb);
                child.recycle();
            }
        }
    }

    private TransactionInfo extractTransactionInfo(AccessibilityNodeInfo root, String packageName) {
        String allText = getAllText(root);
        TransactionInfo info = new TransactionInfo();
        info.platform = getPlatformName(packageName);

        Matcher amountMatcher = AMOUNT_PATTERN.matcher(allText);
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

        // Reject suspiciously large amounts (likely not real payments)
        if (info.amount > 99999) return null;

        Matcher merchantMatcher = MERCHANT_PATTERN.matcher(allText);
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

    private String getPlatformName(String packageName) {
        if (ALIPAY_PACKAGE.equals(packageName)) return "alipay";
        if (WECHAT_PACKAGE.equals(packageName)) return "wechat";
        if (UNIONPAY_PACKAGE.equals(packageName)) return "unionpay";
        return "unknown";
    }

    private void broadcastTransaction(TransactionInfo info) {
        Intent intent = new Intent(ACTION_TRANSACTION_CAPTURED);
        intent.setPackage(getPackageName());
        Bundle bundle = new Bundle();
        bundle.putDouble("amount", info.amount);
        bundle.putString("merchant", info.merchant);
        bundle.putString("date", info.date);
        bundle.putString("time", info.time);
        bundle.putString("platform", info.platform);
        bundle.putString("type", info.type);
        bundle.putString("counterparty", info.counterparty);
        bundle.putString("source", "accessibility");
        intent.putExtra(EXTRA_TRANSACTION_DATA, bundle);
        sendBroadcast(intent);
    }

    private static class TransactionInfo {
        double amount = 0;
        String merchant = "";
        String date = "";
        String time = "";
        String platform = "";
        String scenario = "";
        String type = "expense";
        String counterparty = "";
    }
}