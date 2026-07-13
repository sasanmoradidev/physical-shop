import "server-only";

export async function sendOtpSms(phone: string, code: string): Promise<boolean> {
  const apiKey = process.env.SMS_IR_API_KEY;
  const templateId = process.env.SMS_IR_TEMPLATE_ID;

  // اگر کلیدها در .env نبودند، برای تست محلی پیام را در ترمینال لاگ می‌کنیم
  if (!apiKey || !templateId) {
    console.log(`\n============== [DEV OTP] ==============`);
    console.log(`📱 موبایل: ${phone}`);
    console.log(`🔑 کد یکبار مصرف: ${code}`);
    console.log(`=======================================\n`);
    return true;
  }

  try {
    const response = await fetch("https://api.sms.ir/v1/send/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        mobile: phone,
        templateId: Number(templateId),
        parameters: [
          {
            name: "Code", // نام متغیر در پنل الگو sms.ir شما (مثلاً Code)
            value: code,
          },
        ],
      }),
    });

    const result = await response.json();
    
    // در وب‌سرویس جدید sms.ir، وضعیت موفقیت‌آمیز بودن ارسال با کد status === 1 مشخص می‌شود
    if (!response.ok || result.status !== 1) {
      console.error("خطا در پاسخ وب‌سرویس SMS.ir:", result);
      return false;
    }

    return true;
  } catch (error) {
    console.error("خطا در برقراری ارتباط با وب‌سرویس SMS.ir:", error);
    return false;
  }
}