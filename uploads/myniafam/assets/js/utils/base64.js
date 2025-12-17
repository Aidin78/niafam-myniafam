/**
 * utils/base64.js
 * توابع مرتبط با رمزگذاری و رمزگشایی base64
 * استفاده از native browser functions (atob/btoa)
 */

/**
 * رمزگشایی رشته base64 به UTF-8
 * @param {string} str - رشته رمزگذاری شده با base64
 * @returns {string} - رشته رمزگشایی شده
 */
export function decodeBase64(str) {
    if (!str) return '';
    try {
        // تصحیح فضاهای خالی با +
        str = str.replace(/ /g, '+');
        
        // استفاده از atob برای decode
        const decoded = atob(str);
        
        // تبدیل به UTF-8
        return decodeURIComponent(escape(decoded));
    } catch (e) {
        console.error('خطا در رمزگشایی base64:', e, 'Input:', str);
        return str;
    }
}

/**
 * رمزگذاری رشته UTF-8 به base64
 * @param {string} str - رشته معمولی
 * @returns {string} - رشته رمزگذاری شده با base64
 */
export function encodeBase64(str) {
    if (!str) return '';
    try {
        // تبدیل UTF-8 به binary string
        const utf8Str = unescape(encodeURIComponent(str));
        
        // استفاده از btoa برای encode
        return btoa(utf8Str);
    } catch (e) {
        console.error('خطا در رمزگذاری base64:', e);
        return str;
    }
}

// قرار دادن توابع در اسکوپ عمومی برای استفاده در non-module scripts
if (typeof window !== 'undefined') {
    window.decodeBase64 = decodeBase64;
    window.encodeBase64 = encodeBase64;
}
