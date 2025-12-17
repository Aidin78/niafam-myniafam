/**
 * کلاس مدیریت فرم‌های جزئیات
 * این کلاس برای مدیریت یکپارچه فرم‌های صفحات جزئیات مانند admindetail، orgDetail و غیره استفاده می‌شود
 */
export default class FormManager {
    /**
     * ایجاد نمونه جدید از مدیریت فرم
     * @param {Object} config - پیکربندی مدیریت فرم
     * @param {string} config.formId - شناسه فرم در HTML
     * @param {string} config.listPageUrl - آدرس صفحه لیست
     * @param {Object} config.fieldMap - نگاشت بین فیلدهای API و فیلدهای فرم
     * @param {Function} config.getFunction - تابع API برای دریافت اطلاعات
     * @param {Function} config.createFunction - تابع API برای ایجاد مورد جدید
     * @param {Function} config.updateFunction - تابع API برای به‌روزرسانی مورد موجود
     * @param {Object} config.messages - پیام‌های مختلف برای نمایش
     * @param {Object} config.validationRules - قوانین اعتبارسنجی فرم
     * @param {Object} config.validationMessages - پیام‌های خطای اعتبارسنجی
     */
    constructor(config) {
        this.config = config;
        this.isEditMode = false;
        this.currentId = null;
        this.formElement = null;
    }

    /**
     * راه‌اندازی اولیه فرم
     */
    init() {
        this.formElement = document.getElementById(this.config.formId);
        if (!this.formElement) {
            console.error(`فرم با شناسه ${this.config.formId} یافت نشد`);
            return;
        }

        // بررسی حالت صفحه (ایجاد یا ویرایش)
        this.initPageMode();
        
        // تنظیم رویدادهای فرم
        this.setupFormEvents();
        
        // راه‌اندازی اعتبارسنجی
        this.setupFormValidation();
    }

    /**
     * بررسی حالت صفحه (ایجاد یا ویرایش)
     */
    initPageMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentId = urlParams.get('id');
        this.isEditMode = !!this.currentId;
        
        if (this.isEditMode) {
            // console.log(`حالت ویرایش: شناسه ${this.currentId}`);
            this.loadData(this.currentId);
            this.setupEditMode();
        } else {
            // console.log('حالت ایجاد مورد جدید');
            this.setupCreateMode();
        }
    }

    /**
     * تنظیم حالت ایجاد مورد جدید
     */
    setupCreateMode() {
        const pageTitleElement = document.querySelector('.page-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = this.config.messages.createPageTitle || "ایجاد جدید";
        }

        const submitButton = document.querySelector('.main-content button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = this.config.messages.createButtonText || "ثبت";
        }

        // تنظیمات اضافی برای حالت ایجاد
        if (this.config.passwordField) {
            const passwordField = document.getElementById(this.config.passwordField);
            if (passwordField) {
                passwordField.setAttribute('required', 'required');
            }
        }

        // فراخوانی تابع سفارشی در صورت وجود
        if (this.config.onSetupCreateMode) {
            this.config.onSetupCreateMode();
        }
    }

    /**
     * تنظیم حالت ویرایش مورد موجود
     */
    setupEditMode() {
        const pageTitleElement = document.querySelector('.page-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = this.config.messages.editPageTitle || "ویرایش";
        }

        const submitButton = document.querySelector('button[type="submit"]:not(#exit-logout)');
        if (submitButton) {
            submitButton.textContent = this.config.messages.editButtonText || "به‌روزرسانی";
        }

        // تنظیمات اضافی برای حالت ویرایش
        if (this.config.passwordField) {
            const passwordField = document.getElementById(this.config.passwordField);
            if (passwordField) {
                passwordField.removeAttribute('required');
                passwordField.value = 'Pass@123'; // مقدار پیش‌فرض برای پسورد در حالت ویرایش
            }
        }

        // فراخوانی تابع سفارشی در صورت وجود
        if (this.config.onSetupEditMode) {
            this.config.onSetupEditMode();
        }
    }

    /**
     * بارگذاری اطلاعات با استفاده از API
     * @param {string} id - شناسه مورد
     */
    loadData(id) {
        this.showLoading(true);
        
        // دریافت اطلاعات از API
        this.config.getFunction(id)
            .then(response => {
                if (response && response.data && response.data.length > 0) {
                    // تبدیل پاسخ API به فرمت مناسب
                    const data = this.convertApiResponseToData(response);
                    
                    // پر کردن فرم با داده‌های دریافتی
                    this.fillFormWithData(data);
                } else {
                    this.showErrorMessage(this.config.messages.loadDataError || 'خطا در دریافت اطلاعات');
                }
            })
            .catch(error => {
                console.error('خطا در دریافت اطلاعات:', error);
                this.showErrorMessage(this.config.messages.loadDataError || 'خطا در دریافت اطلاعات');
            })
            .finally(() => {
                this.showLoading(false);
            });
    }

    /**
     * تبدیل پاسخ API به آبجکت قابل استفاده در فرم
     * @param {Object} apiResponse - پاسخ API 
     * @return {Object} آبجکت داده‌ها
     */
    convertApiResponseToData(apiResponse) {
        const result = {};
        const fields = apiResponse.Fields;
        const data = apiResponse.data[0]; // فرض می‌کنیم فقط یک رکورد داریم
        
        // تبدیل آرایه به آبجکت با استفاده از فیلدهای Fields
        fields.forEach((field, index) => {
            const value = data[index];
            const fieldInfo = this.config.fieldMap[field];
            
            if (fieldInfo) {
                result[fieldInfo.fieldName] = value; // مقدار را بدون تغییر ذخیره می‌کنیم
            } else {
                // اگر نگاشت مشخصی نداشت، از نام خود فیلد استفاده می‌کنیم
                result[field] = value;
            }
        });
        
        return result;
    }

    /**
     * پر کردن فرم با داده‌های دریافتی
     * @param {object} data - داده‌های دریافتی
     */
    fillFormWithData(data) {
        try {
            // برای هر فیلد در نقشه فیلدها
            for (const apiField in this.config.fieldMap) {
                const fieldInfo = this.config.fieldMap[apiField];
                
                // اگر فیلد فرم مشخص شده باشد
                if (fieldInfo.formId && data[fieldInfo.fieldName] !== undefined) {
                    const formElement = document.getElementById(fieldInfo.formId);
                    if (formElement) {
                        // مقدار را دیکود می‌کنیم اگر لازم باشد
                        const value = fieldInfo.encoded ? 
                            decodeBase64(data[fieldInfo.fieldName] || '') : 
                            data[fieldInfo.fieldName];
                            
                        // بررسی نوع المان فرم برای تنظیم صحیح مقدار
                        if (formElement.type === 'checkbox') {
                            formElement.checked = (value === '1' || value === 1 || value === true);
                        } else if (formElement.tagName === 'SELECT' && window.jQuery && $.fn.select2) {
                            // اگر از select2 استفاده می‌کند
                            $(formElement).val(this.decodeBase64(value)).trigger('change');
                        } else {
                            formElement.value = this.decodeBase64(value);
                        }
                    }
                }
            }
            
            // فراخوانی تابع سفارشی در صورت وجود
            if (this.config.onFillFormWithData) {
                this.config.onFillFormWithData(data);
            }

            // console.log('اطلاعات با موفقیت در فرم بارگذاری شد');
        } catch (error) {
            console.error('خطا در پر کردن فرم:', error);
            this.showErrorMessage(this.config.messages.fillFormError || 'خطا در نمایش اطلاعات');
        }
    }

    /**
     * تنظیم رویدادهای فرم
     */
    setupFormEvents() {
        if (!this.formElement) return;
        
        // رویداد ارسال فرم
        this.formElement.addEventListener('submit', event => {
            event.preventDefault();
            
            // بررسی اعتبار فرم به صورت دستی یا با استفاده از jQuery Validator
            let isValid = true;
            
            // اگر jQuery Validator در دسترس است از آن استفاده می‌کنیم
            if (window.jQuery && $.fn.validate && $(this.formElement).validate) {
                isValid = $(this.formElement).valid();
            }
            
            // در صورت معتبر بودن، ارسال فرم
            if (isValid) {
                this.submitForm(this.formElement);
            }
        });
        
        // دکمه بازگشت
        const backButton = document.querySelector('[data-type="dismiss"]');
        if (backButton) {
            backButton.addEventListener('click', event => {
                event.preventDefault();
                window.location.href = this.config.listPageUrl;
            });
        }

        // فراخوانی تابع سفارشی در صورت وجود
        if (this.config.onSetupFormEvents) {
            this.config.onSetupFormEvents();
        }
    }

    /**
     * ارسال فرم به سرور
     * @param {HTMLFormElement} form - المان فرم
     */
    submitForm(form) {
        this.showLoading(true);
        
        // اجرای هوک onBeforeSubmit در صورت وجود
        if (typeof this.config.onBeforeSubmit === 'function') {
            const result = this.config.onBeforeSubmit(form);
            if (result === false) {
                this.showLoading(false);
                return false;
            }
        }
        
        const formData = new FormData(form);
        const data = {};
        
        // تبدیل FormData به آبجکت ساده
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // افزودن اطلاعات ضروری
        data.userid = this.getUserId();
        
        // افزودن تاریخ‌ها
        const now = new Date().toISOString();
        
        if (this.isEditMode) {
            // در حالت ویرایش، شناسه مورد را اضافه می‌کنیم
            data.id = this.currentId;
            data.last_update = now;
            
            this.config.updateFunction(data)
                .then(response => this.handleSubmitResponse(response))
                .catch(error => this.handleSubmitError(error))
                .finally(() => this.showLoading(false));
        } else {
            // در حالت ایجاد جدید، تاریخ ایجاد را تنظیم می‌کنیم
            data.create_date = now;
            data.last_update = now;
            
            this.config.createFunction(data)
                .then(response => this.handleSubmitResponse(response))
                .catch(error => this.handleSubmitError(error))
                .finally(() => this.showLoading(false));
        }
    }

    /**
     * مدیریت پاسخ موفق از API پس از ارسال فرم
     * @param {object} response - پاسخ API
     */
    handleSubmitResponse(response) {
        // بررسی پاسخ موفق با فرمت‌های مختلف
        if (response && (
            response.status === 'success' || 
            response.success === true || 
            response.msg === "فرم با موفقیت ثبت شد"
        )) {
            const successMessage = this.isEditMode ? 
                (this.config.messages.updateSuccess || 'اطلاعات با موفقیت به‌روزرسانی شد') : 
                (this.config.messages.createSuccess || 'اطلاعات جدید با موفقیت ثبت شد');
            
            if (window.NiafamAlert) {
                // نمایش پیام موفقیت با تنظیمات سریع‌تر
                NiafamAlert.success(successMessage, {
                    title: this.isEditMode ? 'ویرایش' : 'ثبت',
                    message: response.msg || 'عملیات با موفقیت انجام شد',
                    timeout: 1500, // کاهش زمان نمایش پیام به 1.5 ثانیه
                    progressBar: false, // حذف نوار پیشرفت برای سرعت بیشتر
                    onClosing: () => {
                        // انتقال به صفحه لیست
                        window.location.href = this.config.listPageUrl;
                    }
                });
                
                // ریدایرکت اضافی با تاخیر کم برای اطمینان
                setTimeout(() => {
                    window.location.href = this.config.listPageUrl;
                }, 1600);
                
            } else {
                // ریدایرکت فوری بدون alert در صورت عدم وجود NiafamAlert
                // alert(successMessage);
                window.location.href = this.config.listPageUrl;
            }
        } else {
            this.showErrorMessage(response.msg || (this.config.messages.submitError || 'خطا در ثبت اطلاعات'));
        }
    }

    /**
     * مدیریت خطاهای ارسال فرم
     * @param {Error} error - خطای رخ داده
     */
    handleSubmitError(error) {
        console.error('خطا در ارسال اطلاعات:', error);
        this.showErrorMessage(error.message || (this.config.messages.submitError || 'خطا در ارسال اطلاعات به سرور'));
    }

    /**
     * نمایش پیام خطا
     * @param {string} message - پیام خطا
     */
    showErrorMessage(message) {
        if (window.NiafamAlert) {
            NiafamAlert.error(message, {
                title: 'خطا',
                message: message
            });
        } else {
            alert('خطا: ' + message);
        }
    }

    /**
     * نمایش یا مخفی کردن نشانگر بارگذاری
     * @param {boolean} show - نمایش یا عدم نمایش
     */
    showLoading(show) {
        // پیاده‌سازی نمایش لودینگ
        // console.log(show ? 'نمایش لودینگ' : 'مخفی کردن لودینگ');
        
        const loadingElement = document.getElementById('loading-overlay');
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * دریافت شناسه کاربر جاری
     * @returns {string} - شناسه کاربر
     */
    getUserId() {
        // می‌توان شناسه کاربر را از sessionStorage یا مکانی دیگر دریافت کرد
        const userInfo = JSON.parse(sessionStorage.getItem('village_userinfo') || '{}');
        return userInfo.id || '13808'; // مقدار پیش‌فرض در صورت عدم وجود
    }

    /**
     * راه‌اندازی اعتبارسنجی فرم
     */
    setupFormValidation() {
        // اگر jQuery و پلاگین validate موجود باشند
        if (window.jQuery && $.fn.validate && this.config.validationRules) {
            $(this.formElement).validate({
                rules: this.config.validationRules,
                messages: this.config.validationMessages || {},
                errorElement: "div",
                errorPlacement: function(error, element) {
                    error.addClass("invalid-feedback");
                    if (element.prop("type") === "checkbox") {
                        error.insertAfter(element.parent("label"));
                    } else if (element.hasClass('select2') || element.hasClass('select2-hidden-accessible')) {
                        error.insertAfter(element.next('.select2-container'));
                    } else {
                        error.insertAfter(element);
                    }
                },
                highlight: function(element, errorClass, validClass) {
                    $(element).addClass("is-invalid").removeClass("is-valid");
                    $(element).closest('.item').addClass('has-error');
                },
                unhighlight: function(element, errorClass, validClass) {
                    $(element).removeClass("is-invalid").addClass("is-valid");
                    $(element).closest('.item').removeClass('has-error');
                }
            });
        }
    }

    /**
     * رمزگشایی متن از Base64
     * @param {string} data - متن رمزنگاری شده
     * @returns {string} - متن رمزگشایی شده
     */
    decodeBase64(value) {
        try {
            // اگر مقدار null یا undefined باشد، رشته خالی برگردان
            if (value === null || value === undefined) {
                return '';
            }
    
            // تبدیل به رشته در صورت نیاز
            const str = value.toString().trim();
    
            // اگر با B64: شروع نمی‌شود، همان مقدار را برگردان
            if (!str.startsWith('B64:')) {
                return str;
            }
    
            // حذف پیشوند B64: و رمزگشایی
            const base64 = str.substring(4);
    
            try {
                // رمزگشایی با پشتیبانی از UTF-8
                const decoded = atob(base64);
    
                // تبدیل رشته‌ی باینری به آرایه‌ی بایت‌ها
                const bytes = new Uint8Array(decoded.length);
                for (let i = 0; i < decoded.length; i++) {
                    bytes[i] = decoded.charCodeAt(i);
                }
    
                // رمزگشایی UTF-8
                const decoder = new TextDecoder('utf-8');
                return decoder.decode(bytes);
            } catch (innerError) {
                // اگر رمزگشایی با UTF-8 با خطا مواجه شد، روش قدیمی را امتحان کن
                console.warn('خطا در رمزگشایی UTF-8:', innerError);
                return atob(base64);
            }
        } catch (error) {
            console.error('خطا در رمزگشایی Base64:', error);
            return value || ''; // در صورت خطا مقدار اصلی را برگردان
        }
    }

    /**
     * رمزنگاری متن به Base64
     * @param {string} data - متن ورودی
     * @returns {string} - متن رمزنگاری شده
     */
    encodeBase64(data) {
        try {
            if (!data) return '';
            return window.btoa(unescape(encodeURIComponent(data)));
        } catch (e) {
            console.error('خطا در رمزنگاری base64:', e);
            return data; // در صورت خطا، داده اصلی را برمی‌گردانیم
        }
    }
}

// Export کلاس FormManager
export { FormManager };
