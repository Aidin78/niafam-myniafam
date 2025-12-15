/**
 * سیستم اعتبارسنجی فرم‌ها
 * این سیستم برای اعتبارسنجی فرم‌های مختلف در برنامه استفاده می‌شود
 */
const NiafamValidation = {
    /**
     * پیام‌های خطای پیش‌فرض
     */
    defaultMessages: {
        required: "این فیلد اجباری است",
        email: "لطفا یک ایمیل معتبر وارد کنید",
        minLength: "طول این فیلد باید حداقل {0} کاراکتر باشد",
        maxLength: "طول این فیلد نباید بیشتر از {0} کاراکتر باشد",
        pattern: "مقدار وارد شده معتبر نیست",
        number: "لطفا یک عدد معتبر وارد کنید",
        tel: "لطفا یک شماره تلفن معتبر وارد کنید",
        match: "این فیلد با فیلد دیگر مطابقت ندارد"
    },
    
    /**
     * قوانین اعتبارسنجی
     */
    rules: {
        required: function(value, _, field) {
            // بررسی ویژه برای کامبوباکس‌ها
            if (field && $(field).is('select')) {
                // بررسی اینکه آیا مقدار انتخاب شده معتبر است یا فقط گزینه پیش‌فرض است
                const $select = $(field);
                const selectedIndex = $select[0].selectedIndex;
                const selectedOption = $select.find('option:selected');
                const optionValue = selectedOption.val();
                const optionText = selectedOption.text();
                
                // اگر گزینه اول انتخاب شده باشد یا متن آن 'انتخاب کنید' باشد، غیرمعتبر است
                if (selectedIndex === 0 || optionText === 'انتخاب کنید') {
                    return false;
                }
                
                // اگر مقدار خالی یا undefined باشد، غیرمعتبر است
                if (optionValue === '' || optionValue === undefined) {
                    return false;
                }
                
                return true;
            }
            
            // برای سایر فیلدها
            return value !== undefined && value !== null && value.toString().trim() !== '';
        },
        email: function(value) {
            if (!value) return true; // اگر خالی است، قانون required باید بررسی کند
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(value);
        },
        minLength: function(value, minLength) {
            if (!value) return true;
            return value.toString().length >= minLength;
        },
        maxLength: function(value, maxLength) {
            if (!value) return true;
            return value.toString().length <= maxLength;
        },
        pattern: function(value, pattern) {
            if (!value) return true;
            const regExp = new RegExp(pattern);
            return regExp.test(value);
        },
        number: function(value) {
            if (!value) return true;
            return !isNaN(Number(value));
        },
        tel: function(value) {
            if (!value) return true;
            // الگوی ساده برای شماره تلفن ایران
            const pattern = /^(\+98|0)?9\d{9}$|^0\d{10}$/;
            return pattern.test(value);
        },
        match: function(value, targetSelector) {
            if (!value) return true;
            const targetValue = $(targetSelector).val();
            return value === targetValue;
        }
    },
    
    /**
     * افزودن قانون سفارشی
     * @param {string} name - نام قانون
     * @param {function} rule - تابع بررسی قانون
     * @param {string} message - پیام خطا
     */
    addRule: function(name, rule, message) {
        this.rules[name] = rule;
        this.defaultMessages[name] = message;
    },
    
    /**
     * نمایش پیام خطا برای یک فیلد
     * @param {object} field - المنت فیلد
     * @param {string} message - پیام خطا
     */
    showError: function(field, message) {
        const $field = $(field);
        const $parent = $field.parent();
        const errorId = $field.attr('id') + '-error';
        
        // حذف پیام‌های خطای قبلی
        this.clearError(field);
        
        // افزودن کلاس خطا به فیلد
        $field.addClass('is-invalid');
        
        // ایجاد المنت پیام خطا
        const $error = $('<div></div>')
            .addClass('invalid-feedback')
            .attr('id', errorId)
            .text(message);
        
        // افزودن پیام خطا بعد از فیلد
        $parent.append($error);
    },
    
    /**
     * پاک کردن پیام خطا
     * @param {object} field - المنت فیلد
     */
    clearError: function(field) {
        const $field = $(field);
        const errorId = $field.attr('id') + '-error';
        
        // حذف کلاس خطا
        $field.removeClass('is-invalid');
        
        // حذف پیام خطا
        $('#' + errorId).remove();
    },
    
    /**
     * اعتبارسنجی یک فیلد
     * @param {object} field - المنت فیلد
     * @param {object} fieldRules - قوانین اعتبارسنجی
     * @returns {boolean} - آیا فیلد معتبر است یا خیر
     */
    validateField: function(field, fieldRules) {
        const $field = $(field);
        const value = $field.val();
        
        // بررسی هر قانون
        for (const ruleName in fieldRules) {
            if (fieldRules.hasOwnProperty(ruleName) && ruleName !== 'messages') {
                const ruleValue = fieldRules[ruleName];
                const rule = this.rules[ruleName];
                
                // اگر قانون وجود دارد
                if (rule) {
                    // بررسی قانون - پاس دادن خود فیلد به تابع قانون برای بررسی‌های ویژه
                    const isValid = rule(value, ruleValue, field);
                    
                    // اگر خطا وجود دارد
                    if (!isValid) {
                        // گرفتن پیام خطا (سفارشی یا پیش‌فرض)
                        let message = typeof fieldRules.messages === 'object' && fieldRules.messages[ruleName] ?
                            fieldRules.messages[ruleName] : this.defaultMessages[ruleName];
                        
                        // جایگزین کردن پارامترها در پیام
                        if (ruleValue !== true && message.includes('{0}')) {
                            message = message.replace('{0}', ruleValue);
                        }
                        
                        // نمایش پیام خطا
                        this.showError(field, message);
                        return false;
                    }
                }
            }
        }
        
        // اگر تمام قوانین برقرار بودند
        this.clearError(field);
        return true;
    },
    
    /**
     * اعتبارسنجی کل فرم
     * @param {string} formSelector - سلکتور فرم
     * @param {object} validationRules - قوانین اعتبارسنجی
     * @returns {boolean} - آیا فرم معتبر است یا خیر
     */
    validateForm: function(formSelector, validationRules) {
        const $form = $(formSelector);
        let isValid = true;
        
        // بررسی هر فیلد در فرم
        for (const fieldName in validationRules) {
            if (validationRules.hasOwnProperty(fieldName)) {
                const fieldRules = validationRules[fieldName];
                const $field = $form.find('[name="' + fieldName + '"]');
                
                if ($field.length) {
                    // اعتبارسنجی فیلد
                    const fieldValid = this.validateField($field[0], fieldRules);
                    isValid = isValid && fieldValid;
                }
            }
        }
        
        return isValid;
    },
    
    /**
     * افزودن اعتبارسنجی به فرم
     * @param {string} formSelector - سلکتور فرم
     * @param {object} validationRules - قوانین اعتبارسنجی
     * @param {function} onSuccess - تابع اجرا در صورت موفقیت
     */
    init: function(formSelector, validationRules, onSuccess) {
        const self = this;
        const $form = $(formSelector);
        
        // افزودن استایل برای نمایش پیام خطا
        if (!document.getElementById('niafam-validation-style')) {
            const style = document.createElement('style');
            style.id = 'niafam-validation-style';
            style.innerHTML = `
                .invalid-feedback {
                    display: block;
                    width: 100%;
                    margin-top: 0.25rem;
                    font-size: 80%;
                    color: #dc3545;
                }
                .is-invalid {
                    border-color: #dc3545;
                }
            `;
            document.head.appendChild(style);
        }
        
        // اعتبارسنجی در هنگام تغییر فیلدها
        for (const fieldName in validationRules) {
            if (validationRules.hasOwnProperty(fieldName)) {
                const $field = $form.find('[name="' + fieldName + '"]');
                $field.on('change blur', function() {
                    self.validateField(this, validationRules[fieldName]);
                });
            }
        }
        
        // اعتبارسنجی در هنگام ارسال فرم
        $form.on('submit', function(e) {
            e.preventDefault();
            
            // اعتبارسنجی کل فرم
            const isValid = self.validateForm(formSelector, validationRules);
            
            // اگر فرم معتبر است
            if (isValid && typeof onSuccess === 'function') {
                onSuccess($form);
            }
        });
    }
};

// افزودن به محیط جهانی در مرورگر
if (typeof window !== 'undefined') {
    window.NiafamValidation = NiafamValidation;
}

// برای استفاده در سایر فایل‌ها
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NiafamValidation;
}
