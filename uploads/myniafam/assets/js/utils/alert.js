/**
 * سیستم هشدار سراسری
 * این سیستم برای نمایش هشدارهای مختلف در برنامه استفاده می‌شود
 */
const NiafamAlert = {
    /**
     * نمایش هشدار موفقیت
     * @param {string} message - متن پیام
     * @param {object} options - تنظیمات اضافی
     */
    success: function(message, options = {}) {
        iziToast.success({
            title: options.title || 'موفقیت',
            message: message,
            position: options.position || 'topRight',
            rtl: true,
            timeout: options.timeout || 5000,
            ...options
        });
    },
    
    /**
     * نمایش هشدار خطا
     * @param {string} message - متن پیام
     * @param {object} options - تنظیمات اضافی
     */
    error: function(message, options = {}) {
        iziToast.error({
            title: options.title || 'خطا',
            message: message,
            position: options.position || 'topRight',
            rtl: true,
            timeout: options.timeout || 5000,
            ...options
        });
    },
    
    /**
     * نمایش هشدار هشدار
     * @param {string} message - متن پیام
     * @param {object} options - تنظیمات اضافی
     */
    warning: function(message, options = {}) {
        iziToast.warning({
            title: options.title || 'هشدار',
            message: message,
            position: options.position || 'topRight',
            rtl: true,
            timeout: options.timeout || 5000,
            ...options
        });
    },
    
    /**
     * نمایش هشدار اطلاعات
     * @param {string} message - متن پیام
     * @param {object} options - تنظیمات اضافی
     */
    info: function(message, options = {}) {
        iziToast.info({
            title: options.title || 'اطلاعات',
            message: message,
            position: options.position || 'topRight',
            rtl: true,
            timeout: options.timeout || 5000,
            ...options
        });
    },
    
    /**
     * نمایش هشدار بارگذاری
     * @param {string} message - متن پیام
     * @param {object} options - تنظیمات اضافی
     * @returns {object} - آبجکت toast برای کنترل بعدی
     */
    loading: function(message = 'در حال بارگذاری...', options = {}) {
        return iziToast.info({
            title: options.title || 'در حال بارگذاری',
            message: message,
            position: options.position || 'topRight',
            rtl: true,
            timeout: false,
            icon: 'fa fa-spinner fa-spin',
            ...options
        });
    },
    
    /**
     * مخفی کردن یک هشدار
     * @param {object} toast - آبجکت toast
     */
    hide: function(toast) {
        iziToast.hide({}, toast);
    }
};

// افزودن به محیط جهانی در مرورگر
if (typeof window !== 'undefined') {
    window.NiafamAlert = NiafamAlert;
}

// برای استفاده در سایر فایل‌ها
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NiafamAlert;
}
