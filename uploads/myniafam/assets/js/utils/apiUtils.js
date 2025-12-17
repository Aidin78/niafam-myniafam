/**
 * apiUtils.js
 * توابع عمومی برای ارسال درخواست به API
 * این فایل برای استفاده در تمام بخش‌های پنل مدیریت طراحی شده است
 */

/**
 * ارسال درخواست به سرور با متد GET
 * @param {string} url - آدرس API
 * @param {object} params - پارامترهای درخواست
 * @returns {Promise} - پرامیس حاوی نتیجه درخواست
 */
export function sendGetRequest(url, params = {}) {
    // افزودن پارامترها به URL
    const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    
    const requestUrl = queryString ? `${url}?${queryString}` : url;
    
    return fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`خطای HTTP: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('خطا در ارسال درخواست GET:', error);
        throw error;
    });
}

/**
 * ارسال درخواست به سرور با متد POST
 * @param {string} url - آدرس API
 * @param {object} data - داده‌های ارسالی
 * @returns {Promise} - پرامیس حاوی نتیجه درخواست
 */
export function sendPostRequest(url, data = {}) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`خطای HTTP: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('خطا در ارسال درخواست POST:', error);
        throw error;
    });
}

/**
 * ارسال درخواست به سرور با متد PUT
 * @param {string} url - آدرس API
 * @param {object} data - داده‌های ارسالی
 * @returns {Promise} - پرامیس حاوی نتیجه درخواست
 */
export function sendPutRequest(url, data = {}) {
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`خطای HTTP: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('خطا در ارسال درخواست PUT:', error);
        throw error;
    });
}

/**
 * ارسال درخواست به سرور با متد DELETE
 * @param {string} url - آدرس API
 * @param {object} params - پارامترهای درخواست
 * @returns {Promise} - پرامیس حاوی نتیجه درخواست
 */
export function sendDeleteRequest(url, params = {}) {
    // افزودن پارامترها به URL
    const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    
    const requestUrl = queryString ? `${url}?${queryString}` : url;
    
    return fetch(requestUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`خطای HTTP: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('خطا در ارسال درخواست DELETE:', error);
        throw error;
    });
}

/**
 * ارسال درخواست به سرور با فرمت FormData (برای آپلود فایل)
 * @param {string} url - آدرس API
 * @param {FormData} formData - داده‌های فرم
 * @returns {Promise} - پرامیس حاوی نتیجه درخواست
 */
export function sendFormDataRequest(url, formData) {
    return fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`خطای HTTP: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('خطا در ارسال درخواست FormData:', error);
        throw error;
    });
}

/**
 * ساخت آدرس کامل API با استفاده از پارامترهای مسیر
 * @param {string} baseUrl - آدرس پایه API
 * @param {object} pathParams - پارامترهای مسیر
 * @returns {string} - آدرس کامل API
 */
export function buildApiUrl(baseUrl, pathParams = {}) {
    let url = baseUrl;
    
    // جایگزینی پارامترهای مسیر (مثلا /api/{id}/detail)
    for (const [key, value] of Object.entries(pathParams)) {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
    }
    
    return url;
}

/**
 * پردازش پاسخ‌های استاندارد API
 * @param {object} response - پاسخ API
 * @param {function} successCallback - تابع اجرا در صورت موفقیت
 * @param {function} errorCallback - تابع اجرا در صورت خطا
 */
export function handleApiResponse(response, successCallback, errorCallback) {
    if (response && response.status === 'success') {
        successCallback(response);
    } else {
        errorCallback(response?.message || 'خطایی رخ داده است.');
    }
}

/**
 * تنظیمات پیش‌فرض برای تمامی درخواست‌های API
 */
export const API_CONFIG = {
    baseUrl: '/api', // آدرس پایه API
    timeout: 30000,  // زمان انتظار به میلی‌ثانیه
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};
