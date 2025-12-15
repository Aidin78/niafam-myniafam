import { getUserInfo } from './api/user.js';
import { submitTicket } from './api/ticket.js';

// ایمپورت کردن ماژول‌های utils
import './utils/index.js';

let NiafamValidation, NiafamAlert;

// اطمینان از بارگذاری ماژول‌ها
document.addEventListener('DOMContentLoaded', function() {
    // دریافت ماژول‌های ایمپورت شده
    if (window.NiafamUtils) {
        NiafamValidation = window.NiafamUtils.Validation;
        NiafamAlert = window.NiafamUtils.Alert;
    } else {
        console.error('ماژول‌های NiafamUtils در دسترس نیستند!');
    }
});

getUserInfo().then(user => {
    $("#user_fullname").text(user.firstname + " " + user.lastname);
    $("#user_username").text(user.username);
}).catch(err => {
    console.error("خطا در دریافت اطلاعات:", err);
});


// تعریف قوانین اعتبارسنجی برای فرم تیکت
const ticketValidationRules = {
    subj: {
        required: true,
        messages: {
            required: "لطفا موضوع تیکت را انتخاب کنید"
        }
    },
    priority: {
        required: true,
        messages: {
            required: "لطفا اولویت تیکت را انتخاب کنید"
        }
    },
    title: {
        required: true,
        minLength: 5,
        maxLength: 100,
        messages: {
            required: "عنوان تیکت اجباری است",
            minLength: "عنوان تیکت باید حداقل {0} کاراکتر باشد",
            maxLength: "عنوان تیکت نباید بیشتر از {0} کاراکتر باشد"
        }
    },
    description: {
        required: true,
        minLength: 10,
        messages: {
            required: "توضیحات تیکت اجباری است",
            minLength: "توضیحات تیکت باید حداقل {0} کاراکتر باشد"
        }
    }
};

// راه‌اندازی سیستم اعتبارسنجی روی فرم تیکت
document.addEventListener('DOMContentLoaded', function() {
    if ($("form#createticket").length) {
        NiafamValidation.init("form#createticket", ticketValidationRules, function($form) {
            // این تابع فقط زمانی اجرا می‌شود که فرم معتبر باشد
            const user = JSON.parse(sessionStorage.getItem('niafam_userinfo'));
            const formData = $form.serializeArray();
            const ticketData = {};
            const relationcode = (new Date().getTime());
            
            ticketData["userid"] = user.id;
            ticketData["relationcode"] = relationcode;
            ticketData["ticketing_system_acc"] = 'g:2';
            ticketData["status"] = '1';
            $("form#createticket .es-realuploader.help-unsaved").each(function (i) {

                var res = [], $target = $("#" + $(this).data("target"));
                $(this).find(".ax-file-name").each(function () {
                    res.push($(this).attr("title"));
                })
                $target.val(res.join(","));
                console.log($target)
                $(this).removeClass("help-unsaved");
            });
            formData.forEach(item => {
                ticketData[item.name] = item.value.trim();
            });
            
            console.log(ticketData);
            
            // ارسال اطلاعات به سرور
            submitTicket(ticketData)
                .then(response => {
                    if (response && (response.status === 'success' || response.msg === "فرم با موفقیت ثبت شد")) {
                        NiafamAlert.success('تیکت با موفقیت ثبت شد.', {
                            title: 'ثبت تیکت',
                            message: response.msg || 'اطلاعات با موفقیت ثبت شد',
                            onClosing: function() {
                                // پاک کردن فرم
                               $form[0].reset();
                                // انتقال به صفحه تیکت‌ها
                                window.location.href = '/ticketlist';
                            }
                        });
                    } else {
                        // نمایش پیام خطا با استفاده از سیستم هشدار جهانی
                        NiafamAlert.error('ثبت تیکت با مشکل مواجه شد. لطفا دوباره تلاش کنید.', {
                            title: 'خطای ثبت تیکت',
                            message: response.msg || 'خطا در ارسال اطلاعات'
                        });
                        console.error("پاسخ ناموفق:", response);
                    }
                })
                .catch(err => {
                    
                    NiafamAlert.error('ثبت تیکت با مشکل مواجه شد.', {
                        title: 'خطای ثبت تیکت',
                        message: err.message || 'خطای ناشناخته در ارسال اطلاعات'
                    });
                    console.error("خطا در ثبت تیکت:", err);
                });
        });
    }
});
