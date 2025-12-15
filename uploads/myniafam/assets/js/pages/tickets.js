/**
 * جاوااسکریپت صفحه لیست تیکت‌ها
 * این فایل شامل کد لازم برای نمایش و مدیریت لیست تیکت‌ها با استفاده از DataTables است
 */

import { getTickets } from '../api/ticket.js';
import { formatDate } from '../utils/helpers.js';
import { deleteTicket } from '../api/ticket.js';

// نگهداری فیلترهای فعلی
let currentFilters = {
    search: '',
    status: ''
};

// وضعیت‌های تیکت و کلاس‌های مربوط به هر وضعیت
const TICKET_STATUSES = {
    1: { title: 'جدید', class: 'status-new' },
    2: { title: 'در حال بررسی', class: 'status-in-progress' },
    3: { title: 'نیاز به اطلاعات', class: 'status-need-info' },
    4: { title: 'ارجاع شده', class: 'status-referred' },
    5: { title: 'در حال انجام', class: 'status-doing' },
    6: { title: 'بسته شده', class: 'status-closed' },
    7: { title: 'بایگانی شده', class: 'status-archived' }
};
const TICKET_PRIORITIES = {
    1: { title: 'بحرانی', class: 'priority-crtical' },
    2: { title: 'بالا', class: 'priority-high' },
    3: { title: 'متوسط', class: 'priority-medium' },
    4: { title: 'کم', class: 'priority-low' }
};
// تنظیمات DataTables
const dataTableConfig = {
    serverSide: true, // فعال‌سازی پردازش سمت سرور
    processing: true, // نمایش نشانگر در حال بارگذاری
    responsive: true, // واکنش‌گرا بودن جدول
    paging: true, // فعال‌سازی صفحه‌بندی
    lengthChange: true, // امکان تغییر تعداد آیتم‌ها در هر صفحه
    searching: true, // امکان جستجو
    ordering: false, // امکان مرتب‌سازی
    info: true, // نمایش اطلاعات جدول (مثلاً "نمایش 1 تا 10 از 100 مورد")
    autoWidth: false, // عدم تنظیم خودکار عرض ستون‌ها
    pageLength: 10, // تعداد آیتم‌ها در هر صفحه
    stateSave: false, // عدم ذخیره وضعیت جدول بین بارگذاری‌ها
    
    // تنظیم زبان برای فارسی‌سازی DataTables
    language: {
        processing: "",
        search: "جستجو:",
        lengthMenu: "نمایش _MENU_ مورد",
        info: "نمایش _START_ تا _END_ از _TOTAL_ مورد",
        infoEmpty: "موردی یافت نشد",
        infoFiltered: "(فیلتر شده از _MAX_ مورد)",
        infoPostFix: "",
        loadingRecords: "در حال بارگذاری...",
        zeroRecords: "هیچ رکوردی یافت نشد",
        emptyTable: "جدول خالی است",
        paginate: {
            first: "ابتدا",
            previous: "قبلی",
            next: "بعدی",
            last: "انتها"
        },
        aria: {
            sortAscending: ": فعال‌سازی مرتب‌سازی صعودی ستون",
            sortDescending: ": فعال‌سازی مرتب‌سازی نزولی ستون"
        }
    },
    
    // تعریف ستون‌ها
    columns: [
        { 
            title: 'تیکت', 
            data: 'title',
            render: function(data, type, row) {
                return `
                    <div class="ticket-info">
                    <div class="ticket-meta"><span class="priority ${TICKET_PRIORITIES[row.priority || 4].class}">${TICKET_PRIORITIES[row.priority || 4].title}</span><span class="text-id text__10 text__500 text__gray">تیکت : ${row.id}</span></div>
                        <div class="ticket-title text__14 text__500">${row.title.length > 200 ? row.title.substring(0, 200) + '...' : row.title}</div>
                    </div>
                `;
            }
        },
        { 
            title: 'وضعیت', 
            data: 'status',
            className: 'text-center',
            render: function(data) {
                const status = TICKET_STATUSES[data] || { title: 'نامشخص', class: 'status-unknown' };
                return `<span class="status-badge ${status.class}">${status.title}</span>`;
            }
        },
        { 
            title: 'تاریخ ثبت', 
            data: 'created_at',
            className: 'text-center',
            render: function(data) {
                return formatDate(data);
            }
        },
        { 
            title: '', 
            data: null,
            orderable: false,
            searchable: false,
            className: 'text-center',
            render: function(data, type, row) {
                return `
                    <div class="dropdown">
                        <div class="dropdown-toggle text__12">
                            <div class="button button--sm text__white settings">
                                <img src="/uploads/myniafam/assets/img/ico-dots.png" alt="" width="16" height="16">
                            </div>
                        </div>
                        <div class="dropdown-menu text__600 bg__blur-7">
                            <ul>
                                <li>
                                    <a href="ticketdetail.html?id=${row.id}">
                                        <span class="title text__13">مشاهده</span>
                                    </a>
                                </li>
                                <li>
                                    <a data-ticket-id="${row.id}" class="delete-ticket" data-bs-confirm="true" data-bs-title="حذف" data-bs-message="آیا از حذف تیکت مطمئن هستید؟">
                                        <span class="title text__13">حذف</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                `;
            }
        }
    ],
    
    // دریافت داده‌ها از سرور
    ajax: function(data, callback, settings) {
        // نمایش لودینگ
        $('.dataTables_processing').show();
        
        // فیلترهای اضافی
        const additionalFilters = {};
        
        // اگر جستجوی متنی وارد شده باشد
        if (currentFilters.search && currentFilters.search.trim() !== '') {
            // نوشتن مقدار جستجو در فیلترها برای ارسال جداگانه
            additionalFilters.search = currentFilters.search;
        }
        
        // اگر فیلتر وضعیت انتخاب شده باشد
        if (currentFilters.status && currentFilters.status !== 'انتخاب کنید') {
            additionalFilters.status = currentFilters.status;
        }
        
        // ثبت لاگ برای بررسی
        console.log('DataTables Request:', data);
        console.log('Additional Filters:', additionalFilters);
        
        // درخواست به API
        getTickets(data, additionalFilters)
            .then(response => {
                console.log('API Response:', response);
                // مخفی کردن لودینگ
                $('.dataTables_processing').hide();
                callback(response);
            })
            .catch(error => {
                console.error('خطا در دریافت لیست تیکت‌ها:', error);
                // مخفی کردن لودینگ
                $('.dataTables_processing').hide();
                // نمایش خطا به کاربر
                if (window.NiafamAlert) {
                    window.NiafamAlert.error('خطا در دریافت لیست تیکت‌ها');
                }
                // بازگرداندن داده خالی به DataTables
                callback({
                    draw: data.draw,
                    recordsTotal: 0,
                    recordsFiltered: 0,
                    data: []
                });
            });
    },
    
    // تنظیمات اضافی
    drawCallback: function() {
        // فعال‌سازی مجدد dropdown‌ها بعد از بارگذاری جدول
    }
};

/**
 * راه‌اندازی DataTables
 */
function initTicketTable() {
    // حذف نمونه DataTables قبلی اگر وجود دارد
    if ($.fn.dataTable.isDataTable('.datatable')) {
        $('.datatable').DataTable().destroy();
    }
    
    // راه‌اندازی مجدد DataTables
    $('.datatable').DataTable(dataTableConfig);
    
    // اضافه کردن کلاس به container برای استایل دادن
    $('.dataTables_wrapper').addClass('niafam-datatable-wrapper');
}

/**
 * به‌روزرسانی وضعیت فیلترها و بارگذاری مجدد جدول
 */
function updateFiltersAndReloadTable() {
    // دریافت مقادیر فیلترهای فعلی
    currentFilters.search = $('.filters input[type="text"]').val();
    currentFilters.status = $('#status-filter').val();
    
    console.log('Filters updated:', currentFilters);
    
    // بارگذاری مجدد جدول با فیلترهای جدید
    const dataTable = $('.datatable').DataTable();
    dataTable.ajax.reload();
}

/**
 * راه‌اندازی فیلترها
 */
function initFilters() {
    // اضافه کردن شناسه به فیلتر جستجوی متنی
    $('.filters input[type="text"]').attr('id', 'text-search');
    
    // فیلتر جستجوی متنی - تایپینگ با تاخیر 300 میلی‌ثانیه
    let searchTimeout;
    $('#text-search').on('keyup', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            updateFiltersAndReloadTable();
        }, 300); // تاخیر 300 میلی‌ثانیه برای جلوگیری از درخواست‌های مکرر
    });
    
    // اضافه کردن آیدی به فیلتر وضعیت
    $('#relate_module').attr('id', 'status-filter');
    
    // فیلتر وضعیت
    $('#status-filter').on('change', function() {
        updateFiltersAndReloadTable();
    });
}

/**
 * حذف تیکت با شناسه مشخص
 * @param {string|number} ticketId - شناسه تیکت برای حذف
 */
function deleteTicketById(ticketId) {
    // نمایش لودینگ
    $('.page-content').addClass('loading');
    
    // درخواست حذف تیکت
    deleteTicket(ticketId)
        .then(response => {
            // نمایش پیام موفقیت
            if (window.NiafamAlert) {
                window.NiafamAlert.success('تیکت با موفقیت حذف شد');
            }
            
            // بروزرسانی جدول تیکت‌ها با حفظ فیلترهای فعلی
            const dataTable = $('.datatable').DataTable();
            dataTable.ajax.reload(null, false); // false برای حفظ صفحه فعلی pagination
        })
        .catch(error => {
            // نمایش پیام خطا
            console.error('خطا در حذف تیکت:', error);
            if (window.NiafamAlert) {
                window.NiafamAlert.error(error.message || 'خطا در حذف تیکت');
            }
        })
        .finally(() => {
            // حذف حالت لودینگ
            $('.page-content').removeClass('loading');
        });
}

/**
 * راه‌اندازی دکمه حذف تیکت
 */
function initDeleteTickets() {
    // متغیر برای نگهداری شناسه تیکت انتخاب شده برای حذف
    let selectedTicketId = null;
    
    // رویداد کلیک روی دکمه حذف
    $(document).on('click', '.delete-ticket', function(e) {
        e.preventDefault();
        selectedTicketId = $(this).data('ticket-id');
        
        // نمایش مدال تأیید حذف
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteTicketModal'));
        deleteModal.show();
    });
    
    // رویداد کلیک روی دکمه تأیید حذف در مدال
    $(document).on('click', '#confirmDeleteTicket', function() {
        if (selectedTicketId) {
            // بستن مدال
            const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteTicketModal'));
            deleteModal.hide();
            
            // حذف تیکت
            deleteTicketById(selectedTicketId);
            
            // پاک کردن شناسه تیکت انتخاب شده
            selectedTicketId = null;
        }
    });
}

/**
 * راه‌اندازی کامل صفحه لیست تیکت‌ها
 */
function initTicketListPage() {
    initTicketTable();
    initFilters();
    initDeleteTickets();
}

// اجرای کد با بارگذاری صفحه
document.addEventListener('DOMContentLoaded', function() {
    initTicketListPage();
});

// صادر کردن تابع برای استفاده در فایل‌های دیگر
export default {
    init: initTicketListPage
};
