/**
 * توابع کمکی برای استفاده در کل پروژه
 */

/**
 * تبدیل تاریخ میلادی به شمسی
 * @param {string|Date} date - تاریخ میلادی (رشته یا آبجکت Date)
 * @param {boolean} includeTime - آیا زمان هم نمایش داده شود یا خیر
 * @returns {string} - تاریخ شمسی فرمت شده
 */
export function formatDate(date, includeTime = false) {
    if (!date) return '---';

    try {
        // تبدیل رشته به آبجکت Date
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        // اگر تاریخ نامعتبر است
        if (isNaN(dateObj.getTime())) return '---';
        
        // تنظیمات محلی برای زبان فارسی
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            calendar: 'persian'
        };
        
        // اضافه کردن زمان اگر درخواست شده باشد
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        // استفاده از Intl برای تبدیل تاریخ به شمسی
        return new Intl.DateTimeFormat('fa-IR', options).format(dateObj);
    } catch (error) {
        console.error('خطا در تبدیل تاریخ:', error);
        return '---';
    }
}

/**
 * تولید شناسه منحصر به فرد
 * @returns {string} - شناسه منحصر به فرد
 */
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * اعتبارسنجی ایمیل
 * @param {string} email - ایمیل برای اعتبارسنجی
 * @returns {boolean} - معتبر بودن ایمیل
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * محدود کردن متن به تعداد مشخص کاراکتر
 * @param {string} text - متن اصلی
 * @param {number} length - حداکثر تعداد کاراکتر
 * @param {string} suffix - پسوند برای متن کوتاه شده (مثلاً ...)
 * @returns {string} - متن کوتاه شده
 */
export function truncateText(text, length = 100, suffix = '...') {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + suffix;
}

/**
 * تبدیل اعداد به فرمت پول (با جداکننده هزارگان)
 * @param {number} amount - مبلغ
 * @param {string} currency - واحد پول (مثلاً تومان)
 * @returns {string} - مبلغ فرمت شده
 */
export function formatMoney(amount, currency = 'تومان') {
    if (amount === undefined || amount === null) return '---';
    
    const formattedAmount = new Intl.NumberFormat('fa-IR').format(amount);
    return `${formattedAmount} ${currency}`;
}

// صادر کردن توابع برای استفاده در فایل‌های دیگر
export default {
    formatDate,
    generateUniqueId,
    isValidEmail,
    truncateText,
    formatMoney
};
