export function getUserInfo() {
    const cached = sessionStorage.getItem('niafam_userinfo');
    if (cached) {
        return Promise.resolve(JSON.parse(cached));
    }

    return sendApiRequest("query", {
        qid: 2,
        temp_user_id: 3
    }).then(response => {
        if (response.status && response.status === "success") {
            sessionStorage.setItem('niafam_userinfo', JSON.stringify(response.info));
            return response.info;
        } else {
            throw new Error("خطا در دریافت اطلاعات کاربر");
        }
    });
}

