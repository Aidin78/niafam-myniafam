/**
 * ticketList.js
 * صفحه لیست تیکت‌های پشتیبانی
 * استفاده از DataTables با server-side processing و ticketApi
 */

import ticketApi from '../api/ticketApi.js';
import { formatDate } from '../utils/helpers.js';
import { decodeBase64 } from '../utils/base64.js';

// نگهداری فیلترهای فعلی
let currentFilters = {
    search: '',
    status: ''
};

// وضعیت‌های تیکت
const TICKET_STATUSES = {
    1: { title: 'جدید', class: 'status-new' },
    2: { title: 'در حال بررسی', class: 'status-in-progress' },
    3: { title: 'نیاز به اطلاعات', class: 'status-need-info' },
    4: { title: 'ارجاع شده', class: 'status-referred' },
    5: { title: 'در حال انجام', class: 'status-doing' },
    6: { title: 'بسته شده', class: 'status-closed' },
    7: { title: 'بایگانی شده', class: 'status-archived' }
};

// اولویت‌های تیکت
const TICKET_PRIORITIES = {
    1: { title: 'بحرانی', class: 'priority-critical' },
    2: { title: 'بالا', class: 'priority-high' },
    3: { title: 'متوسط', class: 'priority-medium' },
    4: { title: 'کم', class: 'priority-low' }
};

/**
 * رمزگشایی فیلد اگر Base64 encoded باشد
 */
function decodeField(value) {
    if (!value) return '';
    
    // اگر با "B64:" شروع شود، رمزگشایی کن
    if (typeof value === 'string' && value.startsWith('B64:')) {
        try {
            return decodeBase64(value.substring(4)); // حذف "B64:" و decode
        } catch (e) {
            console.error('خطا در decode:', e);
            return value;
        }
    }
    
    return value;
}

/**
 * تبدیل آرایه داده‌ها به آبجکت
 * ساختار: ["id","B64:createtime","B64:relationcode","status","subject","priority","B64:title"]
 * Fields: ["#","createtime","relationcode","وضعیت تیکت","موضوع تیکت","اولویت تیکت","عنوان تیکت"]
 */
function transformRowData(row) {
    return {
        id: decodeField(row[0]),                     // # (id)
        created_at: decodeField(row[1]),             // createtime
        relationcode: decodeField(row[2]),           // relationcode
        status: parseInt(decodeField(row[4])) || 1,  // وضعیت تیکت
        subject: parseInt(decodeField(row[5])) || 1, // موضوع تیکت
        priority: parseInt(decodeField(row[6])) || 3, // اولویت تیکت
        title: decodeField(row[7])                   // عنوان تیکت
    };
}

// تنظیمات DataTables
const dataTableConfig = {
    serverSide: true,
    processing: true,
    responsive: true,
    paging: true,
    lengthChange: true,
    searching: true,
    ordering: false,
    info: true,
    autoWidth: false,
    pageLength: 10,
    stateSave: false,
    
    // زبان فارسی
    language: {
        processing: "",
        search: "جستجو:",
        lengthMenu: "نمایش _MENU_ مورد",
        info: "نمایش _START_ تا _END_ از _TOTAL_ مورد",
        infoEmpty: "موردی یافت نشد",
        infoFiltered: "(فیلتر شده از _MAX_ مورد)",
        loadingRecords: "در حال بارگذاری...",
        zeroRecords: "هیچ رکوردی یافت نشد",
        emptyTable: "جدول خالی است",
        paginate: {
            first: "ابتدا",
            previous: "قبلی",
            next: "بعدی",
            last: "انتها"
        }
    },
    
    // تعریف ستون‌ها
    columns: [
        { 
            title: 'تیکت', 
            data: 'title',
            render: function(data, type, row) {
                const priorityInfo = TICKET_PRIORITIES[row.priority] || TICKET_PRIORITIES[3];
                const displayTitle = data && data.length > 200 ? data.substring(0, 200) + '...' : data;
                
                return `
                    <div class="ticket-info">
                        <div class="ticket-meta">
                            <span class="priority ${priorityInfo.class}">${priorityInfo.title}</span>
                            <span class="text-id text__10 text__500 text__gray">تیکت : ${row.id}</span>
                        </div>
                        <div class="ticket-title text__14 text__500">${displayTitle || 'بدون عنوان'}</div>
                    </div>
                `;
            }
        },
        { 
            title: 'وضعیت', 
            data: 'status',
            className: 'text-center',
            render: function(data) {
                const statusInfo = TICKET_STATUSES[data] || { title: 'نامشخص', class: 'status-unknown' };
                return `<span class="status-badge ${statusInfo.class}">${statusInfo.title}</span>`;
            }
        },
        { 
            title: 'تاریخ ثبت', 
            data: 'created_at',
            className: 'text-center',
            render: function(data) {
                return data ? formatDate(data) : '-';
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
                                    <a data-ticket-id="${row.id}" class="delete-ticket">
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
        $('.dataTables_processing').show();
        
        // فیلترهای اضافی به فرمت DataTables columns
        const filters = {};
        
        // جستجوی متنی در ستون تیکت (ستون 0)
        if (currentFilters.search && currentFilters.search.trim() !== '') {
            filters['columns[6][search][value]'] = currentFilters.search;
        }
        
        // فیلتر وضعیت در ستون وضعیت (ستون 1)
        if (currentFilters.status && currentFilters.status !== '0') {
            filters['columns[3][search][value]'] = currentFilters.status;
        }
        
        console.log('DataTables Request:', data);
        console.log('Filters (DataTables format):', filters);
        
        // درخواست به ticketApi
        ticketApi.getList(data, filters)
            .then(response => {
                console.log('API Response:', response);
                
                // پردازش داده‌ها
                const processedData = {
                    draw: parseInt(response.draw) || 0,
                    recordsTotal: parseInt(response.recordsTotal) || 0,
                    recordsFiltered: parseInt(response.recordsFiltered) || 0,
                    data: []
                };
                
                // تبدیل آرایه‌ها به آبجکت‌ها
                if (response.data && Array.isArray(response.data)) {
                    processedData.data = response.data.map(row => transformRowData(row));
                }
                
                console.log('Processed Data:', processedData);
                
                $('.dataTables_processing').hide();
                callback(processedData);
            })
            .catch(error => {
                console.error('خطا در دریافت لیست تیکت‌ها:', error);
                $('.dataTables_processing').hide();
                
                if (window.NiafamAlert) {
                    window.NiafamAlert.error('خطا در دریافت لیست تیکت‌ها');
                }
                
                callback({
                    draw: data.draw,
                    recordsTotal: 0,
                    recordsFiltered: 0,
                    data: []
                });
            });
    },
    
    drawCallback: function() {
        // فعال‌سازی مجدد dropdown‌ها
    }
};

/**
 * راه‌اندازی DataTables
 */
function initTicketTable() {
    if ($.fn.dataTable.isDataTable('#ticketList')) {
        $('#ticketList').DataTable().destroy();
    }
    
    $('#ticketList').DataTable(dataTableConfig);
    $('.dataTables_wrapper').addClass('niafam-datatable-wrapper');
}

/**
 * به‌روزرسانی فیلترها و بارگذاری مجدد جدول
 */
function updateFiltersAndReloadTable() {
    currentFilters.search = $('#search-input').val() || '';
    currentFilters.status = $('#status-filter').val() || '0';
    
    console.log('Filters updated:', currentFilters);
    
    const dataTable = $('#ticketList').DataTable();
    dataTable.ajax.reload();
}

/**
 * راه‌اندازی فیلترها
 */
function initFilters() {
    // فیلتر جستجوی متنی
    let searchTimeout;
    $('#search-input').on('keyup', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            updateFiltersAndReloadTable();
        }, 300);
    });
    
    // فیلتر وضعیت
    $('#status-filter').on('change', function() {
        updateFiltersAndReloadTable();
    });
    
    console.log('فیلترها راه‌اندازی شدند');
}

/**
 * حذف تیکت
 */
function deleteTicketById(ticketId) {
    $('.page-content').addClass('loading');
    
    ticketApi.deleteItem([ticketId])
        .then(response => {
            if (window.NiafamAlert) {
                window.NiafamAlert.success('تیکت با موفقیت حذف شد');
            }
            
            const dataTable = $('#ticketList').DataTable();
            dataTable.ajax.reload(null, false);
        })
        .catch(error => {
            console.error('خطا در حذف تیکت:', error);
            if (window.NiafamAlert) {
                window.NiafamAlert.error(error.message || 'خطا در حذف تیکت');
            }
        })
        .finally(() => {
            $('.page-content').removeClass('loading');
        });
}

/**
 * راه‌اندازی دکمه حذف
 */
function initDeleteTickets() {
    let selectedTicketId = null;
    
    $(document).on('click', '.delete-ticket', function(e) {
        e.preventDefault();
        selectedTicketId = $(this).data('ticket-id');
        
        // نمایش تایید
        if (confirm('آیا از حذف این تیکت اطمینان دارید؟')) {
            deleteTicketById(selectedTicketId);
        }
    });
}

/**
 * راه‌اندازی کامل صفحه
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

export default {
    init: initTicketListPage
};
