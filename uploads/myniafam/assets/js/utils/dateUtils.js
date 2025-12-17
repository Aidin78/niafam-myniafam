/**
 * ماژول تبدیل تاریخ‌ها
 * این ماژول توابع مختلف تبدیل تاریخ را ارائه می‌کند
 */

/**
 * تبدیل تاریخ میلادی به تاریخ شمسی
 * @param {string} gregorianDate - تاریخ میلادی به فرمت استاندارد
 * @returns {string} - تاریخ شمسی به فرمت سال/ماه/روز
 */
export function convertToJalali(gregorianDate) {
    // اگر تاریخ خالی باشد، مقدار - را برگشت می‌دهیم
    if (!gregorianDate) return '-';
    
    try {
        // تبدیل رشته به تاریخ
        const date = new Date(gregorianDate);
        
        // اگر تاریخ نامعتبر باشد
        if (isNaN(date.getTime())) return '-';
        
        // استفاده از API تبدیل تاریخ میلادی به شمسی
        const jalaliDate = jalaali.toJalaali(date);
        // اگر تبدیل با موفقیت انجام شد
        if (jalaliDate) {
            // تبدیل به فرمت سال/ماه/روز
            return `${jalaliDate.jy}/${jalaliDate.jm}/${jalaliDate.jd}`;
        }
        
        // اگر کتابخانه JalaliDate موجود نبود، از فرمت اصلی استفاده می‌کنیم
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    } catch (error) {
        console.error('خطا در تبدیل تاریخ میلادی به شمسی:', error);
        return '-';
    }
}

/**
 * تبدیل تاریخ شمسی به میلادی
 * @param {string} jalaliDate - تاریخ شمسی به فرمت سال/ماه/روز
 * @returns {Date} - شی تاریخ میلادی
 */
export function convertToGregorian(jalaliDate) {
    if (!jalaliDate) return null;

    try {
        // جدا کردن سال، ماه و روز
        const parts = jalaliDate.split('/');
        if (parts.length !== 3) return null;

        const jy = parseInt(parts[0]);
        const jm = parseInt(parts[1]);
        const jd = parseInt(parts[2]);

        // استفاده از کتابخانه تبدیل
        const gregorianDate = jalaali.toGregorian(jy, jm, jd);
        return new Date(gregorianDate.gy, gregorianDate.gm - 1, gregorianDate.gd);
    } catch (error) {
        console.error('خطا در تبدیل تاریخ شمسی به میلادی:', error);
        return null;
    }
}

/**
 * فرمت‌کننده تاریخ میلادی
 * @param {Date} date - تاریخ میلادی
 * @param {string} format - فرمت مورد نظر (مثلا: YYYY-MM-DD)
 * @returns {string} - تاریخ فرمت شده
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day);
}
