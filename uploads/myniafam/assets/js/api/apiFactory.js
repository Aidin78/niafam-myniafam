/**
 * apiFactory.js
 * 
 * این ماژول یک کارخانه (Factory) برای ایجاد API های مختلف فراهم می‌کند
 * با استفاده از این کارخانه می‌توان به سادگی API های جدید با رفتار یکسان اما پارامترهای متفاوت ایجاد کرد
 */

import { sendFormDataRequest } from '../utils/apiUtils.js';

// آدرس پایه API
const API_BASE_URL = "https://my.niafam.com/inc/ajax.ashx";

/**
 * تبدیل آبجکت به FormData
 * @param {object} obj - آبجکت ورودی
 * @returns {FormData} - آبجکت FormData
 */
function objectToFormData(obj) {
    const formData = new FormData();
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            formData.append(key, obj[key]);
        }
    }
    
    return formData;
}

/**
 * ارسال درخواست به API با استفاده از FormData
 * @param {string} action - نام عملیات API
 * @param {object} data - داده‌های مورد نیاز برای درخواست
 * @returns {Promise} - پاسخ API
 */
function sendRequest(action, data = {}) {
    const url = `${API_BASE_URL}?action=${action}`;
    const formData = objectToFormData(data);
    
    return sendFormDataRequest(url, formData)
        .then(data => {
            if (data.status === "error") {
                throw new Error(data.msg || "خطا در عملیات");
            }
            return data;
        })
        .catch(error => {
            console.error(`API Error [${action}]:`, error);
            throw error;
        });
}

/**
 * ایجاد کننده API برای یک فرم مشخص
 * @param {Object} config - تنظیمات API
 * @param {number} config.formId - شناسه فرم
 * @param {number} config.userId - شناسه کاربر
 * @param {string} config.entityName - نام موجودیت (برای نمایش در لاگ‌ها)
 * @returns {Object} - آبجکت حاوی توابع API
 */
export function createApi(config) {
    const { formId, userId = 3, entityName = 'آیتم' } = config;

    return {
        /**
         * دریافت لیست آیتم‌ها با پشتیبانی از DataTables
         * @param {object} dtParams - پارامترهای DataTables
         * @param {object} filters - فیلترهای اضافی
         * @returns {Promise} - پاسخ API
         */
        getList: function(dtParams, filters = {}) {
            const apiParams = {
                formid: formId,
                draw: dtParams.draw || 0,
                start: dtParams.start || 0,
                length: dtParams.length || 10,
                search: dtParams.search?.value || '',
                userid: userId
            };
            
            // افزودن فیلترها به پارامترها
            Object.assign(apiParams, filters);
            
            return sendRequest("load_submit_data_v2", apiParams)
                .then(response => {
                    return {
                        draw: parseInt(dtParams.draw),
                        recordsTotal: response.recordsTotal || 0,
                        recordsFiltered: response.recordsFiltered || 0,
                        data: response.data || []
                    };
                });
        },

        /**
         * دریافت اطلاعات یک آیتم با شناسه
         * @param {number|string} id - شناسه آیتم
         * @returns {Promise} - پاسخ API
         */
        getItemById: function(id) {
            const apiParams = {
                rowid: id,
                formid: formId,
                draw: 0,
                start: 0,
                length: 1,  // فقط یک رکورد نیاز داریم
                search: '',
                userid: userId
            };
            
            return sendRequest("load_submit_data_v2", apiParams);
        },

        /**
         * افزودن آیتم جدید
         * @param {object} data - داده‌های آیتم جدید
         * @returns {Promise} - پاسخ API
         */
        createItem: function(data) {
            return sendRequest("submit_form", {
                formid: formId,
                userid: userId,
                ...data
            });
        },

        /**
         * به‌روزرسانی اطلاعات آیتم
         * @param {object} data - داده‌های به‌روز شده آیتم
         * @returns {Promise} - پاسخ API
         */
        updateItem: function(data) {
            return sendRequest("submit_form", {
                formid: formId,
                userid: userId,
                ...data
            });
        },

        /**
         * حذف آیتم
         * @param {number|string|Array} ids - شناسه یا شناسه‌های آیتم (می‌تواند یک آیدی یا آرایه‌ای از آیدی‌ها باشد)
         * @returns {Promise} - پاسخ API
         */
        deleteItem: function(ids) {
            // تبدیل آیدی یا آرایه‌ای از آیدی‌ها به رشته با جداکننده کاما
            const deleteIds = Array.isArray(ids) ? ids.join(',') : ids.toString();
            const apiParams = {
                formid: formId,
                draw: 0,
                start: 0,
                length: 1,
                search: '',
                userid: userId,
                delete: deleteIds
            };
            
            // ارسال درخواست با استفاده از load_submit_data_v2 و فیلد delete
            return sendRequest("load_submit_data_v2", apiParams);
        }
    };
}