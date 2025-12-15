/**
 * ارسال تیکت جدید
 * @param {object} props - مشخصات تیکت
 * @returns {Promise} - پاسخ API
 */
export function submitTicket(props) {
    return sendApiRequest("submit_form", {
        formid: 1,
        ...props
    }).then(response => {
        if (response.status === "success" || response.msg == "فرم با موفقیت ثبت شد") {
            return response;
        } else {
            throw new Error("خطا در ثبت تیکت");
        }
    });
}

/**
 * دریافت لیست تیکت‌ها با پشتیبانی از DataTables
 * @param {object} dtParams - پارامترهای DataTables
 * @param {object} filters - فیلترهای اضافی
 * @returns {Promise} - پاسخ API
 */
export function getTickets(dtParams, filters = {}) {
    // تبدیل پارامترهای DataTables به فرمت flat (بدون ساختار تودرتو)
    const apiParams = {
        qid: 3,
        temp_user_id: 3,
        draw: dtParams.draw, // شماره درخواست برای همگام‌سازی
        start: dtParams.start || 0, // شروع از چه ردیفی
        length: dtParams.length || 10, // تعداد ردیف در هر صفحه
        search: dtParams.search?.value || '', // عبارت جستجو
    };
    
    // اضافه کردن مرتب‌سازی به صورت flat
    if (dtParams.order && dtParams.order.length > 0) {
        const order = dtParams.order[0]; // فقط اولین مرتب‌سازی را در نظر می‌گیریم
        apiParams['order_column'] = dtParams.columns[order.column].data;
        apiParams['order_dir'] = order.dir; // asc یا desc
    }
    
    // اضافه کردن فیلترهای اضافی به صورت flat
    // این کار باعث می‌شود هر فیلتر به صورت یک کلید-مقدار جداگانه ارسال شود
    for (const key in filters) {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
            apiParams['filter_' + key] = filters[key];
        }
    }
    
    // ارسال درخواست به API
    return sendApiRequest("query", apiParams)
        .then(response => {
            console.log(response)
            // بررسی خطاها
            if (!response || response.status === "error") {
                throw new Error(response?.msg || "خطا در دریافت لیست تیکت‌ها");
            }
            
            // فرمت پاسخ برای DataTables
            return {
                draw: parseInt(dtParams.draw), // استفاده از شماره درخواست اصلی
                recordsTotal: response.recordsTotal || 0,
                recordsFiltered: response.recordsFiltered || 0,
                data: response.data || []
            };
        });
}

/**
 * حذف تیکت با شناسه مشخص
 * @param {number|string} ticketId - شناسه تیکت
 * @returns {Promise} - پاسخ API
 */
export function deleteTicket(ticketId) {
    // پارامترهای مورد نیاز برای حذف تیکت
    const apiParams = {
        qid: 5, // شناسه عملیات حذف تیکت
        id: ticketId
    };
    
    // ارسال درخواست به API
    return sendApiRequest("query", apiParams)
        .then(response => {
            console.log('Delete Response:', response);
            // بررسی خطاها
            if (!response || response.status === "error") {
                throw new Error(response?.msg || "خطا در حذف تیکت");
            }
            
            return response;
        });
}