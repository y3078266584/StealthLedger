package com.autobilling.service;
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
    private static final long DEBOUNCE_MS = 10000; // Reduced from 15s to 10s

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
        // Combine all available text
        String fullText = (title + " " + text + " " + bigText).trim();

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
        } else {
            return null;
        }

        // Skip notifications that look like history/bill summaries
        if (containsAny(text, "\u8d26\u5355", "\u4ea4\u6613\u8bb0\u5f55",
            "\u6708\u8d26\u5355", "\u660e\u7ec6", \n            "\u9001\u4f60", "\u8d60\u9001", "\u4f18\u60e0", "\u514d\u8d39", \n            "\u798f\u5229", "\u8fd4\u73b0", "\u7b7e\u5230", "\u79ef\u5206", "\u6708\u652f\u51fa",
            "\u6708\u6536\u5165", "\u5168\u90e8\u8d26\u5355")) {
            return null;
        }

        // Expanded payment keywords
        if (!containsAny(text, "\u652f\u4ed8", "\u4ed8\u6b3e", "\u6263\u6b3e",
            "\u6d88\u8d39", "\u00a5", "\uffe5", "\u8f6c\u8d26",
            "\u7ea2\u5305", "\u5230\u8d26", "\u5df2\u6536\u5230",
            "\u5546\u6237\u626b\u7801", "\u5411\u4f60\u4ed8\u6b3e",
            "\u6536\u5230\u8f6c\u8d26", "\u5206\u671f", "\u82b1\u5457",
            "\u4fe1\u7528\u5361\u8fd8\u6b3e", \n            "\u9000\u6b3e", "\u53d6\u6d88\u8ba2\u5355", "\u5df2\u53d6\u6d88")) {
            return null;
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
        if (info.amount < 0.5 && !containsAny(text, "支付", "付款", "扣款",
            "消费", "转账", "商户扫码")) {
            return null;
        }

        // Detect refund/cancellation → set as income
        boolean isRefund = containsAny(text, "退款", "已退款",
            "取消订单", "已取消", "退货",
            "收到退款", "退回");
        if (isRefund) {
            Log.d(TAG, "Refund: " + text);
            info.type = "income";
        }

        // Detect incoming money (non-refund)
        if (!isRefund && containsAny(text, "到账", "已收到",
            "收到转账", "收款")) {
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
            // Try to extract merchant from title (e.g., "支付宝 - 商家名称")
            info.merchant = guessMerchantFromTitle(text);
        }
        if (info.merchant.isEmpty()) {
            info.merchant = isRefund ? "退款" : "unknown";
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        info.date = sdf.format(new Date());
        sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
        info.time = sdf.format(new Date());

        return info;
    }

    private String guessMerchantFromTitle(String text) {
        // Try to extract meaningful merchant info from the notification text
        // Remove common prefixes/suffixes and keep the rest
        String cleaned = text
            .replaceAll("[\u00a5\uffe5]\\s*\\d+\\.?\\d{0,2}", "")
            .replaceAll("\\d{4,}", "") // Remove long numbers
            .replaceAll("\u652f\u4ed8\u6210\u529f|\u5df2\u652f\u4ed8|\u4ed8\u6b3e\u6210\u529f", "")
            .trim();

        // If remaining text is short enough, use as merchant
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