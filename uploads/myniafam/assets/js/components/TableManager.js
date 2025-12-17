/**
 * کلاس مدیریت جداول
 * این کلاس برای یکپارچه‌سازی و مدیریت جداول داده‌های سیستم طراحی شده است
 * و امکان مدیریت پیشرفته جداول با استفاده از DataTables را فراهم می‌کند
 */

export default class TableManager {
    /**
     * سازنده کلاس مدیریت جدول
     * @param {Object} config - تنظیمات جدول
     * @param {string} config.tableId - شناسه HTML جدول
     * @param {Object} config.fieldMap - نگاشت بین فیلدهای جدول و شاخص‌های API
     * @param {string} config.detailPageUrl - آدرس صفحه جزئیات رکورد
     * @param {Function} config.apiFunction - تابع API برای دریافت داده‌ها
     * @param {Function} config.deleteFunction - تابع API برای حذف رکورد
     * @param {Array} config.columns - تنظیمات ستون‌های جدول
     * @param {Object} config.messages - پیام‌های نمایشی
     */
    constructor(config) {
        // تنظیمات پیش‌فرض
        this.defaultConfig = {
            tableId: '',
            fieldMap: {},
            detailPageUrl: '',
            apiFunction: null,
            deleteFunction: null,
            columns: [],
            messages: {
                loading: 'در حال بارگذاری...',
                deleteConfirm: 'آیا از حذف این رکورد اطمینان دارید؟',
                deleteTitle: 'تایید حذف',
                deleteSuccess: 'رکورد با موفقیت حذف شد',
                deleteError: 'خطا در حذف رکورد',
                apiError: 'خطا در دریافت اطلاعات',
                invalidResponse: 'پاسخ نامعتبر از سرور',
                confirmButton: 'بله، حذف شود',
                cancelButton: 'انصراف'
            }
        };

        // ترکیب تنظیمات پیش‌فرض با تنظیمات ورودی
        this.config = { ...this.defaultConfig, ...config };
        
        // تنظیم پیام‌ها
        this.config.messages = { ...this.defaultConfig.messages, ...(config.messages || {}) };
        
        // مقادیر اولیه
        this.dataTable = null;
        this.currentFilters = {
            search: '',
            status: ''
        };
    }

    /**
     * راه‌اندازی جدول
     * @returns {Promise} - نتیجه راه‌اندازی جدول
     */
    init() {
        // بررسی وجود جدول و تابع API
        if (!document.getElementById(this.config.tableId)) {
            console.warn(`جدول با شناسه ${this.config.tableId} در صفحه یافت نشد`);
            return Promise.resolve(false);
        }

        if (!this.config.apiFunction) {
            console.error('تابع API برای دریافت داده‌ها تعیین نشده است');
            return Promise.resolve(false);
        }

        // راه‌اندازی جدول
        this.initDataTable();

        // تنظیم رویدادها
        this.setupEvents();

        return Promise.resolve(true);
    }

    /**
     * راه‌اندازی جدول داده‌ها
     */
    initDataTable() {
        // اضافه کردن ستون چک‌باکس برای انتخاب چندگانه
        const selectColumn = {
            title: '<input type="checkbox" id="select-all-checkbox" class="form-check-input">',
            data: null,
            orderable: false,
            searchable: false,
            width: '40px',
            className: 'text-center',
            render: function(data, type, row) {
                const recordId = TableManager.decodeBase64(row[0]);
                return `<input type="checkbox" class="row-select-checkbox form-check-input" value="${recordId}">`;
            }
        };
        
        // اضافه کردن ستون انتخاب به ابتدای لیست ستون‌ها
        const columnsWithSelect = [selectColumn, ...this.config.columns];
        
        // تنظیمات DataTables
        this.dataTable = $(`#${this.config.tableId}`).DataTable({
            serverSide: true,
            processing: true,
            responsive: true,
            paging: true,
            lengthChange: false,
            searching: false,
            ordering: false,
            info: true,
            autoWidth: false,
            pageLength: 10,
            stateSave: false,
            
            // تنظیم زبان برای فارسی‌سازی DataTables
            language: {
                processing: "در حال پردازش...",
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
            columns: columnsWithSelect,
            
            // تنظیمات AJAX برای دریافت داده‌ها
            ajax: (data, callback, settings) => {
                // ترکیب پارامترهای DataTables با فیلترها
                const params = {
                    ...data,
                    ...this.currentFilters
                };
                
                // فراخوانی API
                this.config.apiFunction(params)
                    .then(response => {
                        callback(response);
                    })
                    .catch(error => {
                        console.error(this.config.messages.apiError, error);
                        // نمایش خطا به کاربر
                        if (typeof NiafamAlert !== 'undefined') {
                            NiafamAlert.error(this.config.messages.apiError);
                        } else {
                            alert(this.config.messages.apiError);
                        }
                        
                        // ارسال داده خالی به DataTables
                        callback({
                            draw: parseInt(data.draw),
                            recordsTotal: 0,
                            recordsFiltered: 0,
                            data: []
                        });
                    });
            },
            
            // اجرای کد بعد از رندر جدول
            drawCallback: () => {
                // اضافه کردن رویداد کلیک برای دکمه‌های حذف
                this.setupDeleteButtons();
            }
        });
    }

    /**
     * تنظیم رویدادهای صفحه
     */
    setupEvents() {
        this.setupFilterEvents();
        this.setupActionEvents();
    }

    /**
     * تنظیم رویدادهای فیلتر
     */
    setupFilterEvents() {
        // رویداد جستجو
        const searchInput = document.getElementById(`${this.config.tableId.replace('List', '')}-search`);
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.currentFilters.search = searchInput.value.trim();
                    this.reloadTable();
                }
            });
        }
        
        // دکمه جستجو
        const searchButton = document.getElementById(`${this.config.tableId.replace('List', '')}-search-btn`);
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchInput = document.getElementById(`${this.config.tableId.replace('List', '')}-search`);
                if (searchInput) {
                    this.currentFilters.search = searchInput.value.trim();
                    this.reloadTable();
                }
            });
        }
        
        // فیلتر وضعیت
        const statusFilter = document.getElementById(`${this.config.tableId.replace('List', '')}-status-filter`);
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentFilters.status = statusFilter.value;
                this.reloadTable();
            });
        }
        
        // دکمه پاک کردن فیلترها
        const clearFiltersButton = document.getElementById('clear-filters');
        if (clearFiltersButton) {
            clearFiltersButton.addEventListener('click', () => {
                // پاک کردن مقادیر فیلتر
                const searchInput = document.getElementById(`${this.config.tableId.replace('List', '')}-search`);
                if (searchInput) {
                    searchInput.value = '';
                }
                
                const statusFilter = document.getElementById(`${this.config.tableId.replace('List', '')}-status-filter`);
                if (statusFilter) {
                    statusFilter.value = '';
                }
                
                // پاک کردن فیلترهای جاری
                this.currentFilters = {
                    search: '',
                    status: ''
                };
                
                // بارگذاری مجدد جدول
                this.reloadTable();
            });
        }
    }

    /**
     * تنظیم رویدادهای عمومی صفحه
     */
    setupActionEvents() {
        // دکمه ایجاد رکورد جدید
        const prefix = this.config.tableId.replace('List', '');
        const createButton = document.getElementById(`create-${prefix}-btn`);
        if (createButton) {
            createButton.addEventListener('click', () => {
                window.location.href = this.config.detailPageUrl;
            });
        }

        // تنظیم رویدادهای چک‌باکس‌ها
        this.setupCheckboxEvents();
        
        // دکمه حذف چندگانه
        this.setupBulkDeleteButton();
    }

    /**
     * تنظیم رویدادهای چک‌باکس‌ها
     */
    setupCheckboxEvents() {
        // رویداد انتخاب همه
        $(document).on('change', '#select-all-checkbox', (e) => {
            const isChecked = e.target.checked;
            $('.row-select-checkbox').prop('checked', isChecked);
            this.updateBulkDeleteButton();
        });

        // رویداد انتخاب ردیف‌های منفرد
        $(document).on('change', '.row-select-checkbox', () => {
            this.updateSelectAllCheckbox();
            this.updateBulkDeleteButton();
        });
    }

    /**
     * تنظیم دکمه حذف چندگانه
     */
    setupBulkDeleteButton() {
        // ایجاد دکمه حذف چندگانه اگر وجود ندارد
        const prefix = this.config.tableId.replace('List', '');
        let bulkDeleteBtn = document.getElementById(`bulk-delete-${prefix}-btn`);
        
        if (!bulkDeleteBtn) {
            // ایجاد دکمه حذف چندگانه
            const createButton = document.getElementById(`create-${prefix}-btn`);
            if (createButton && createButton.parentElement) {
                bulkDeleteBtn = document.createElement('button');
                bulkDeleteBtn.id = `bulk-delete-${prefix}-btn`;
                bulkDeleteBtn.className = 'btn btn-danger me-2';
                bulkDeleteBtn.style.display = 'none';
                bulkDeleteBtn.innerHTML = '<i class="fas fa-trash"></i> حذف موارد انتخاب شده';
                
                createButton.parentElement.insertBefore(bulkDeleteBtn, createButton);
            }
        }

        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleBulkDelete();
            });
        }
    }

    /**
     * بروزرسانی وضعیت چک‌باکس انتخاب همه
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.row-select-checkbox').length;
        const checkedCheckboxes = $('.row-select-checkbox:checked').length;
        
        const selectAllCheckbox = $('#select-all-checkbox');
        if (checkedCheckboxes === 0) {
            selectAllCheckbox.prop('indeterminate', false);
            selectAllCheckbox.prop('checked', false);
        } else if (checkedCheckboxes === totalCheckboxes) {
            selectAllCheckbox.prop('indeterminate', false);
            selectAllCheckbox.prop('checked', true);
        } else {
            selectAllCheckbox.prop('indeterminate', true);
        }
    }

    /**
     * بروزرسانی نمایش دکمه حذف چندگانه
     */
    updateBulkDeleteButton() {
        const checkedCheckboxes = $('.row-select-checkbox:checked').length;
        const prefix = this.config.tableId.replace('List', '');
        const bulkDeleteBtn = document.getElementById(`bulk-delete-${prefix}-btn`);
        
        if (bulkDeleteBtn) {
            if (checkedCheckboxes > 0) {
                bulkDeleteBtn.style.display = 'flex';
            } else {
                bulkDeleteBtn.style.display = 'none';
            }
        }
    }

    /**
     * مدیریت حذف چندگانه
     */
    handleBulkDelete() {
        const selectedIds = [];
        $('.row-select-checkbox:checked').each(function() {
            selectedIds.push($(this).val());
        });

        if (selectedIds.length === 0) {
            return;
        }

        const confirmMessage = `آیا از حذف ${selectedIds.length} مورد انتخاب شده اطمینان دارید؟`;
        
        if (typeof NiafamAlert !== 'undefined') {
            NiafamAlert.confirm(confirmMessage, {
                title: 'تایید حذف چندگانه',
                confirmText: 'بله، حذف شود',
                cancelText: 'انصراف',
                onConfirm: () => {
                    this.deleteBulkRecords(selectedIds);
                }
            });
        } else {
            if (confirm(confirmMessage)) {
                this.deleteBulkRecords(selectedIds);
            }
        }
    }

    /**
     * حذف چندگانه رکوردها
     * @param {Array} recordIds - آرایه شناسه‌های رکوردها
     */
    deleteBulkRecords(recordIds) {
        if (!this.config.deleteFunction) {
            console.error('تابع حذف تعیین نشده است');
            return;
        }

        this.showLoading(true);
        
        // ذخیره تعداد رکورد‌های قبلی برای مقایسه
        let previousRecordCount = 0;
        if (this.dataTable && this.dataTable.page.info()) {
            previousRecordCount = this.dataTable.page.info().recordsTotal;
        }
        
        // جمع‌آوری داده‌های رکوردهای انتخاب شده برای onDeleteSuccess
        const selectedRowsData = recordIds.map(recordId => this.findRowDataById(recordId)).filter(data => data !== null);
        
        // ارسال لیست آیدی‌ها به صورت رشته جدا شده با کاما
        const idsString = recordIds.join(',');
        
        // فراخوانی API با لیست آیدی‌ها
        this.config.deleteFunction(idsString)
            .then(response => {
                if (response && response.recordsTotal !== undefined) {
                    // بررسی اینکه آیا تعداد رکوردها کم شده است
                    const isDeleted = response.recordsTotal < previousRecordCount;
                    
                    if (isDeleted) {
                        // نمایش پیام موفقیت
                        if (typeof NiafamAlert !== 'undefined') {
                            NiafamAlert.success(this.config.messages.deleteSuccess);
                        } else {
                            alert(this.config.messages.deleteSuccess);
                        }
                        
                        // اجرای تابع onDeleteSuccess برای هر رکورد حذف شده
                        if (this.config.onDeleteSuccess && typeof this.config.onDeleteSuccess === 'function') {
                            selectedRowsData.forEach(rowData => {
                                this.config.onDeleteSuccess(rowData);
                            });
                        }
                        
                        // بارگذاری مجدد جدول
                        this.reloadTable();
                        
                        // پاک کردن انتخاب‌ها
                        $('.row-select-checkbox').prop('checked', false);
                        $('#select-all-checkbox').prop('checked', false);
                        this.updateBulkDeleteButton();
                    } else {
                        // نمایش پیام خطا در صورت عدم تغییر در تعداد رکوردها
                        if (typeof NiafamAlert !== 'undefined') {
                            NiafamAlert.error(this.config.messages.deleteError);
                        } else {
                            alert(this.config.messages.deleteError);
                        }
                    }
                } else {
                    // اگر ساختار پاسخ درست نباشد
                    if (typeof NiafamAlert !== 'undefined') {
                        NiafamAlert.error(this.config.messages.invalidResponse);
                    } else {
                        alert(this.config.messages.invalidResponse);
                    }
                    console.error(this.config.messages.invalidResponse, response);
                }
            })
            .catch(error => {
                // نمایش پیام خطا
                console.error(this.config.messages.deleteError, error);
                if (typeof NiafamAlert !== 'undefined') {
                    NiafamAlert.error(error.message || this.config.messages.deleteError);
                } else {
                    alert(error.message || this.config.messages.deleteError);
                }
            })
            .finally(() => {
                // پنهان کردن لودر
                this.showLoading(false);
            });
    }

    /**
     * تنظیم رویدادهای دکمه‌های حذف
     */
    setupDeleteButtons() {
        // اضافه کردن رویداد کلیک برای دکمه‌های حذف
        const prefix = this.config.tableId.replace('List', '');
        document.querySelectorAll(`.delete-${prefix}`).forEach(button => {
            button.addEventListener('click', () => {
                const recordId = button.getAttribute('data-id');
                if (!recordId) {
                    return;
                }
                
                // نمایش مدال تایید حذف
                this.showDeleteConfirmation(recordId);
            });
        });
    }

    /**
     * نمایش پنجره تایید حذف
     * @param {string} recordId - شناسه رکورد
     */
    showDeleteConfirmation(recordId) {
        // استفاده از کامپوننت هشدار سفارشی یا کتابخانه SweetAlert
        if (typeof NiafamAlert !== 'undefined') {
            NiafamAlert.confirm(this.config.messages.deleteConfirm, {
                title: this.config.messages.deleteTitle,
                confirmText: this.config.messages.confirmButton,
                cancelText: this.config.messages.cancelButton,
                onConfirm: () => {
                    this.deleteRecord(recordId);
                }
            });
        } else {
            // استفاده از confirm استاندارد اگر کامپوننت سفارشی موجود نباشد
            if (confirm(this.config.messages.deleteConfirm)) {
                this.deleteRecord(recordId);
            }
        }
    }

    /**
     * حذف رکورد از طریق API
     * @param {string} recordId - شناسه رکورد
     */
    deleteRecord(recordId) {
        if (!this.config.deleteFunction) {
            console.error('تابع حذف تعیین نشده است');
            return;
        }

        // نمایش لودر
        this.showLoading(true);
        
        // ذخیره تعداد رکورد‌های قبلی برای مقایسه
        let previousRecordCount = 0;
        
        if (this.dataTable && this.dataTable.page.info()) {
            previousRecordCount = this.dataTable.page.info().recordsTotal;
        }
        
        // فراخوانی API
        this.config.deleteFunction(recordId)
            .then(response => {
                if (response && response.recordsTotal !== undefined) {
                    // بررسی اینکه آیا تعداد رکوردها کم شده است
                    const isDeleted = response.recordsTotal < previousRecordCount;
                    
                    if (isDeleted) {
                        // نمایش پیام موفقیت
                        if (typeof NiafamAlert !== 'undefined') {
                            NiafamAlert.success(this.config.messages.deleteSuccess);
                        } else {
                            alert(this.config.messages.deleteSuccess);
                        }
                        
                        // اجرای تابع سفارشی بعد از حذف موفق (اگر وجود دارد)
                        if (this.config.onDeleteSuccess && typeof this.config.onDeleteSuccess === 'function') {
                            // پیدا کردن داده‌های رکورد حذف شده
                            const deletedRowData = this.findRowDataById(recordId);
                            if (deletedRowData) {
                                this.config.onDeleteSuccess(deletedRowData);
                            }
                        }
                        
                        // بارگذاری مجدد جدول
                        this.reloadTable();
                    } else {
                        // نمایش پیام خطا در صورت عدم تغییر در تعداد رکوردها
                        if (typeof NiafamAlert !== 'undefined') {
                            NiafamAlert.error(this.config.messages.deleteError);
                        } else {
                            alert(this.config.messages.deleteError);
                        }
                    }
                } else {
                    // اگر ساختار پاسخ درست نباشد
                    if (typeof NiafamAlert !== 'undefined') {
                        NiafamAlert.error(this.config.messages.invalidResponse);
                    } else {
                        alert(this.config.messages.invalidResponse);
                    }
                    console.error(this.config.messages.invalidResponse, response);
                }
            })
            .catch(error => {
                // نمایش پیام خطا
                console.error(this.config.messages.deleteError, error);
                if (typeof NiafamAlert !== 'undefined') {
                    NiafamAlert.error(error.message || this.config.messages.deleteError);
                } else {
                    alert(error.message || this.config.messages.deleteError);
                }
            })
            .finally(() => {
                // پنهان کردن لودر
                this.showLoading(false);
            });
    }

    /**
     * بارگذاری مجدد جدول
     */
    reloadTable() {
        if (this.dataTable) {
            this.dataTable.ajax.reload();
        }
    }

    /**
     * نمایش یا مخفی کردن نشانگر بارگذاری
     * @param {boolean} show - نمایش یا عدم نمایش
     */
    showLoading(show) {
        // پیاده‌سازی نمایش لودینگ
        // console.log(shows ? 'نمایش لودینگ' : 'مخفی کردن لودینگ');
        
        // مثالی از پیاده‌سازی:
        const loadingElement = document.getElementById('loading-overlay');
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * پیدا کردن داده‌های یک ردیف بر اساس شناسه
     * @param {string} recordId - شناسه رکورد
     * @returns {Array|null} - داده‌های ردیف یا null
     */
    findRowDataById(recordId) {
        if (!this.dataTable) {
            return null;
        }
        
        // جستجو در تمام ردیف‌های جدول
        const rows = this.dataTable.rows().data();
        for (let i = 0; i < rows.length; i++) {
            const rowData = rows[i];
            // بررسی شناسه رکورد (معمولاً در اولین ستون)
            const rowId = TableManager.decodeBase64(rowData[0]);
            if (rowId === recordId) {
                return rowData;
            }
        }
        
        return null;
    }

    /**
     * رمزگشایی از متن Base64 
     * @param {string} encodedValue - متن کدگذاری شده با Base64
     * @returns {string} - متن رمزگشایی شده
     */
    static decodeBase64(value) {
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
}
