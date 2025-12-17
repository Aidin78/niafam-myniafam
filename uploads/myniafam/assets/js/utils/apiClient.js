/**
 * apiClient.js
 * کلاس مدیریت درخواست‌های API برای تمام بخش‌های پنل مدیریتی
 * این کلاس یک رابط یکسان برای تمام انواع درخواست‌های API فراهم می‌کند
 */

import { sendFormDataRequest, sendPostRequest, sendGetRequest, handleApiResponse } from './apiUtils.js';

// آدرس پایه API
const API_BASE_URL = "https://my.niafam.com/inc/ajax.ashx";

/**
 * کلاس مدیریت درخواست‌های API
 */
export class ApiClient {
    /**
     * ساختن نمونه‌ای از کلاس ApiClient
     * @param {string} baseUrl - آدرس پایه API (اختیاری)
     */
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * تبدیل آبجکت به FormData
     * @param {object} obj - آبجکت ورودی
     * @returns {FormData} - آبجکت FormData
     * @private
     */
    _objectToFormData(obj) {
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
    sendRequest(action, data = {}) {
        const url = `${this.baseUrl}?action=${action}`;
        const formData = this._objectToFormData(data);
        
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
     * ارسال درخواست برای دریافت داده‌های یک فرم با پشتیبانی از DataTables
     * @param {number} formId - شناسه فرم
     * @param {object} dtParams - پارامترهای DataTables
     * @param {object} filters - فیلترهای اضافی
     * @returns {Promise} - پاسخ API
     */
    getFormData(formId, dtParams = {}, filters = {}) {
        const apiParams = {
            formid: formId,
            draw: dtParams.draw || 0,
            start: dtParams.start || 0,
            length: dtParams.length || 10,
            search: dtParams.search?.value || '',
            userid: 3
        };
        
        // افزودن فیلترها به پارامترها
        Object.assign(apiParams, filters);
        
        return this.sendRequest("load_submit_data_v2", apiParams)
            .then(response => {
                return {
                    draw: parseInt(dtParams.draw || 0),
                    recordsTotal: response.recordsTotal || 0,
                    recordsFiltered: response.recordsFiltered || 0,
                    data: response.data || []
                };
            });
    }

    /**
     * دریافت اطلاعات یک آیتم با شناسه
     * @param {number} formId - شناسه فرم
     * @param {number|string} rowId - شناسه آیتم
     * @param {object} labels - برچسب‌های نمایشی فیلدها (اختیاری)
     * @returns {Promise} - پاسخ API
     */
    getItemById(formId, rowId, labels = null) {
        const apiParams = {
            rowid: rowId,
            formid: formId,
            draw: 0,
            start: 0,
            length: 10,
            search: '',
            userid: 3
        };

        if (labels) {
            apiParams.labels = labels;
        }
        
        return this.sendRequest("load_submit_data_v2", apiParams);
    }

    /**
     * افزودن آیتم جدید
     * @param {number} formId - شناسه فرم
     * @param {object} itemData - داده‌های آیتم جدید
     * @returns {Promise} - پاسخ API
     */
    createItem(formId, itemData) {
        return this.sendRequest("submit_form", {
            formid: formId,
            ...itemData
        });
    }

    /**
     * به‌روزرسانی اطلاعات آیتم
     * @param {number} formId - شناسه فرم
     * @param {object} itemData - داده‌های به‌روز شده آیتم
     * @returns {Promise} - پاسخ API
     */
    updateItem(formId, itemData) {
        return this.sendRequest("submit_form", {
            formid: formId,
            ...itemData
        });
    }

    /**
     * حذف آیتم
     * @param {number} queryId - شناسه کوئری حذف
     * @param {number|string} itemId - شناسه آیتم
     * @returns {Promise} - پاسخ API
     */
    deleteItem(queryId, itemId) {
        return this.sendRequest("query", {
            qid: queryId,
            id: itemId
        });
    }
}

// Export a default instance for convenience
export default new ApiClient();
