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

