/**
 * ticketCreate.js
 * صفحه ایجاد/ویرایش تیکت پشتیبانی
 * این صفحه از FormManager برای مدیریت فرم استفاده می‌کند
 */

import FormManager from '../components/FormManager.js';
import ticketApi from '../api/ticketApi.js';

/**
 * تنظیمات فرم تیکت
 */
const formConfig = {
    formId: 'createticket',
    listPageUrl: 'ticketlist.html',
    
    // نگاشت بین فیلدهای API و فیلدهای فرم
    fieldMap: {
        'subj': { fieldName: 'subj', formId: 'subj', encoded: true },
        'priority': { fieldName: 'priority', formId: 'priority', encoded: true },
        'title': { fieldName: 'title', formId: 'title', encoded: true },
        'description': { fieldName: 'description', formId: 'description', encoded: true },
        'relate_module': { fieldName: 'relate_module', formId: 'relate_module', encoded: true },
        'problem_place': { fieldName: 'problem_place', formId: 'problem_place', encoded: true },
        'approx_time': { fieldName: 'approx_time', formId: 'approx_time', encoded: true },
        'version': { fieldName: 'version', formId: 'version', encoded: true },
        'attachments': { fieldName: 'attachments', formId: 'attachments', encoded: true }
    },
    
    // توابع API
    getFunction: (id) => ticketApi.getItemById(id),
    createFunction: (data) => ticketApi.createItem(data),
    updateFunction: (data) => ticketApi.updateItem(data),
    
    // پیام‌های سفارشی
    messages: {
        createPageTitle: 'ثبت تیکت جدید',
        editPageTitle: 'ویرایش تیکت',
        createButtonText: 'ثبت تیکت',
        editButtonText: 'به‌روزرسانی تیکت',
        createSuccess: 'تیکت با موفقیت ثبت شد',
        updateSuccess: 'تیکت با موفقیت به‌روزرسانی شد',
        loadDataError: 'خطا در بارگذاری اطلاعات تیکت',
        fillFormError: 'خطا در نمایش اطلاعات تیکت',
        submitError: 'خطا در ثبت تیکت'
    },
    
    // قوانین اعتبارسنجی
    validationRules: {
        subj: {
            required: true
        },
        priority: {
            required: true
        },
        title: {
            required: true,
            minlength: 5,
            maxlength: 100
        },
        description: {
            required: true,
            minlength: 10
        }
    },
    
    // پیام‌های خطای اعتبارسنجی
    validationMessages: {
        subj: {
            required: 'لطفا موضوع تیکت را انتخاب کنید'
        },
        priority: {
            required: 'لطفا اولویت تیکت را انتخاب کنید'
        },
        title: {
            required: 'عنوان تیکت اجباری است',
            minlength: 'عنوان تیکت باید حداقل 5 کاراکتر باشد',
            maxlength: 'عنوان تیکت نباید بیشتر از 100 کاراکتر باشد'
        },
        description: {
            required: 'توضیحات تیکت اجباری است',
            minlength: 'توضیحات تیکت باید حداقل 10 کاراکتر باشد'
        }
    },
    
    // تابع قبل از ارسال فرم
    onBeforeSubmit: function(form) {
        // جمع‌آوری فایل‌های آپلود شده
        const uploaders = form.querySelectorAll('.es-realuploader.help-unsaved');
        uploaders.forEach(uploader => {
            const target = document.getElementById(uploader.dataset.target);
            if (target) {
                const fileNames = [];
                uploader.querySelectorAll('.ax-file-name').forEach(fileName => {
                    fileNames.push(fileName.getAttribute('title'));
                });
                target.value = fileNames.join(',');
                uploader.classList.remove('help-unsaved');
            }
        });
        
        // افزودن اطلاعات اضافی
        const user = JSON.parse(sessionStorage.getItem('niafam_userinfo') || '{}');
        const relationcode = new Date().getTime();
        
        // اضافه کردن فیلدهای مخفی به فرم
        const hiddenFields = {
            userid: user.id || '3',
            relationcode: relationcode,
            ticketing_system_acc: 'g:2',
            status: '1'
        };
        
        for (const [key, value] of Object.entries(hiddenFields)) {
            let input = form.querySelector(`input[name="${key}"]`);
            if (!input) {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                form.appendChild(input);
            }
            input.value = value;
        }
        
        return true; // ادامه عملیات ارسال
    }
};

/**
 * راه‌اندازی صفحه فرم تیکت
 */
function initTicketFormPage() {
    // ایجاد نمونه FormManager
    const ticketForm = new FormManager(formConfig);
    
    // راه‌اندازی فرم
    ticketForm.init();
    
    console.log('فرم تیکت با موفقیت راه‌اندازی شد');
}

// راه‌اندازی صفحه بعد از بارگذاری DOM
document.addEventListener('DOMContentLoaded', initTicketFormPage);

// Export برای استفاده در جاهای دیگر
export default {
    init: initTicketFormPage
};
