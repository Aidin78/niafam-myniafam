/**
 * فایل اصلی ماژول‌های utils
 * همه ماژول‌های مورد نیاز از این فایل export می‌شوند
 */

(function(window) {
    // در محیط Node.js (اگر از ماژول استفاده می‌شود)
    if (typeof module !== 'undefined' && module.exports) {
        var NiafamAlert = require('./alert');
        var NiafamValidation = require('./validation');
        
        var NiafamUtils = {
            Alert: NiafamAlert,
            Validation: NiafamValidation
        };
        
        module.exports = NiafamUtils;
    } 
    // در محیط مرورگر
    else {
        // اطمینان از دسترسی به ماژول‌ها در محیط مرورگر
        window.NiafamUtils = {
            Alert: window.NiafamAlert || {},
            Validation: window.NiafamValidation || {}
        };
    }
})(typeof window !== 'undefined' ? window : this);

