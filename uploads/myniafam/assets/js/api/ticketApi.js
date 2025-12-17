/**
 * ticketApi.js
 * API تیکت‌های پشتیبانی
 * این فایل با استفاده از apiFactory ساخته شده و تمام عملیات مربوط به تیکت‌ها را مدیریت می‌کند
 */

import { createApi } from './apiFactory.js';

// تنظیمات API تیکت‌ها
const TICKET_CONFIG = {
    formId: 1,              // شناسه فرم تیکت‌ها
    userId: 3,              // شناسه کاربر پیش‌فرض
    entityName: 'تیکت'      // نام موجودیت برای نمایش در لاگ‌ها
};

// ایجاد API تیکت‌ها با استفاده از Factory
const ticketApi = createApi(TICKET_CONFIG);

// Export کردن API
export default ticketApi;

// Export کردن توابع به صورت جداگانه برای راحتی استفاده
export const {
    getList: getTickets,
    getItemById: getTicketById,
    createItem: createTicket,
    updateItem: updateTicket,
    deleteItem: deleteTicket
} = ticketApi;
