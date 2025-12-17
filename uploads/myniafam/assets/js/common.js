const domain = "http://my.niafam.com";

var translates = {
        "fa": {
            You_Can_Add_Or_Drop_File_Hear: "فایلتان را اینجا بکشید",
            Add_Files: "افزودن فایل",
            Remove_All: "حذف همه"

        },
        "en": {
            You_Can_Add_Or_Drop_File_Hear: "You Can Add Or Drop File Hear",
            Add_Files: "Add File",
            Remove_All: "Remove All"
        }
    },
    pageLang = document.getElementsByTagName("html")[0].getAttribute("lang"),
    i18n = translates[pageLang],
    uploaderMainTemplate =
    '    <div class="ax-main-container es-col">\
          <div class="ax-main-title2 es-uploader-desc ">\
             {Description}\
          </div>\
          <div class="ax-main-buttons btn-group" role="group" aria-label="Basic example">\
              <button type="button" class="es-btn es-btn-info ax-browse-c ax-button" title="' + i18n.Add_Files + '">\
                  <span>' + i18n.Add_Files + '</span>\
                  <input type="file" multiple="multiple" class="ax-browse" name="file_{Field_Name}" >\
              </button>\
              <button type="button" class="es-btn es-btn-danger ax-clear ax-button" title="' + i18n.Remove_All + '">\
                  <i class="far fa-trash-alt white"></i>\
                  <span class="white">' + i18n.Remove_All + '</span>\
              </button>\
          </div>\
          <div class=" ax-file-list"> \
          </div>\
      </div>',
    fileTemplate =
    '    <div class="es-form-row">\
        <div class="ax-details es-col-md-8 es-col-xs-12">\
            <div class="es-form-row">\
                <div class="ax-file-size es-col-md-3">{sizebutnot}</div>\
                <div class="ax-file-name es-col-md-9" title="{axname}" >{axlink}</div>\
            </div>\
        </div>\
        <div class="ax-progress-data  es-col-md-3 es-col-xs-12">\
            <div class="ax-progress">\
                <div class="loader ax-progress-bar"></div>\
                <div class="ax-progress-info" title="{status}">{status}</div>\
            </div>\
            <div class="ax-progress-stat"></div>\
        </div>\
        <div class="ax-toolbar  es-col-md-1 es-col-xs-12">\
            <button type="button" class="ax-upload ax-button es-btn">\
                <span class="ax-btn-text"></span>\
            </button>\
            <button type="button" class="ax-remove ax-button es-btn es-btn-danger">\
                <i class="ax-clear-icon ax-icon es esprit-close"> </i>\
                <span class="ax-btn-text"></span>\
            </button>\
        </div>\
    </div>';

// مدیریت وضعیت منو همبرگر
$(document).on('click', '.hamburger', function (e) {
    e.preventDefault();
    const layout = document.querySelector('.layout');
    const isOpen = layout.getAttribute('data-menu-open') === 'true';
    layout.setAttribute('data-menu-open', (!isOpen).toString());
});

// بستن منو
$(document).on('click', '#menu-close', function (e) {
    e.preventDefault();
    const layout = document.querySelector('.layout');
    const isOpen = layout.getAttribute('data-menu-open') === 'true';
    layout.setAttribute('data-menu-open', (!isOpen).toString());

    document.querySelectorAll('.menu-list .collapse.show').forEach(el => {
        let collapseInstance = bootstrap.Collapse.getInstance(el);
        if (collapseInstance) collapseInstance.hide();
        else new bootstrap.Collapse(el, {
            toggle: false
        }).hide();
    });
});

// کلیک روی لینک‌های منو
$(document).on('click', '.menu-list a', function () {
    document.querySelector('.layout').setAttribute('data-menu-open', 'true');
});

// مدیریت آپلود فایل
$(document).on('change', '.file-upload .file-input', function () {
    const uploadBox = this.closest('.file-upload');
    const fileNameDiv = uploadBox.querySelector('.name');
    const button = uploadBox.querySelector('.button');

    if (this.files.length > 0) {
        const fileName = this.files[0].name;
        fileNameDiv.textContent = fileName;
        button.textContent = 'حذف فایل';
        button.appendChild(this);
        button.classList.add('remove-mode');
    }
});

$(document).on('click', '.file-upload .button.remove-mode', function (e) {
    e.preventDefault();
    const uploadBox = this.closest('.file-upload');
    const fileInput = uploadBox.querySelector('.file-input');
    const fileNameDiv = uploadBox.querySelector('.name');

    fileInput.value = '';
    fileNameDiv.textContent = 'نام فایل';
    this.textContent = 'آپلود فایل';
    this.appendChild(fileInput);
    this.classList.remove('remove-mode');
});

// Dropdown toggle
$(document).on('click', '.dropdown .dropdown-toggle', function (e) {
    e.stopPropagation();

    const dropdown = this.closest('.dropdown');
    const menu = dropdown.querySelector('.dropdown-menu');
    const rect = menu.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.top;
    const spaceAbove = rect.top;

    // تنظیم نمایش از بالا یا پایین
    if (spaceBelow < menu.offsetHeight && spaceAbove > menu.offsetHeight) {
        menu.classList.add('dropdown-up');
    } else {
        menu.classList.remove('dropdown-up');
    }

    // بستن سایر منوها
    document.querySelectorAll('.dropdown.show').forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('show');
            const otherMenu = d.querySelector('.dropdown-menu');
            if (otherMenu) otherMenu.classList.remove('show');
        }
    });

    dropdown.classList.toggle('show');
    menu.classList.toggle('show');
});

// بستن همه Dropdownها وقتی بیرون کلیک می‌شه
$(document).on('click', function (e) {
    document.querySelectorAll('.dropdown.show').forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) menu.classList.remove('show');
        }
    });
});

// راه‌اندازی اولیه فرم‌ها بعد از بارگذاری DOM
function initUIComponents() {
    initSelect2();
    initOverlayScrollbars();
    initSwitchery();
    initMCEexact();

    try {
        jalaliDatepicker.startWatch();
    } catch (error) {
        console.warn('JalaliDatepicker not available');
    }
}

document.addEventListener("DOMContentLoaded", initUIComponents);

// Select2
function initSelect2() {
    const selects = document.querySelectorAll('select:not(.select2-deactive)');
    selects.forEach(select => {
        $(select).select2({
            placeholder: "انتخاب کنید"
        });
    });
}

// اسکرول بار سفارشی
function initOverlayScrollbars() {
    document.querySelectorAll('.scrollbar').forEach(el => {
        OverlayScrollbars(el, {
            scrollbars: {
                autoHide: 'leave',
                theme: 'os-theme-dark'
            }
        });
    });
}

// سوییچری
function initSwitchery() {
    Array.from(document.querySelectorAll('.js-switch')).forEach(el => {
        new Switchery(el, {
            size: 'small'
        });
    });
}

// ادیتور متنی TinyMCE
function initMCEexact() {
    document.querySelectorAll(".tinymce").forEach(() => {
        tinymce.init({
            selector: ".tinymce",
            plugins: [
                "autolink lists link charmap preview anchor pagebreak searchreplace wordcount visualblocks visualchars nonbreaking save table directionality emoticons fullscreen casechange tableofcontents help accordion autosave codesample quickbars"
            ],
            toolbar2: "fontfamily fontsize | table bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify ltr rtl| hr nonbreaking pagebreak casechange | bullist numlist outdent indent",
            font_family_formats: "IRANSans=IRANSans,Arial,sans-serif; Tahoma=tahoma,arial,helvetica,sans-serif;",
            height: 400,
            convert_urls: false,
            content_style: "body { font-family:Vazir, sans-serif; font-size:14px }"
        });
    });
}

//audio
function initAllAudioPlugins() {
    const plugins = document.querySelectorAll('.audio-plugin');

    plugins.forEach(plugin => {
        let isRecording = false;
        let mediaRecorder;
        let audioChunks = [];

        const recordButton = plugin.querySelector('#record-audio');
        const audioOutput = plugin.querySelector('#audio-output');

        if (!recordButton || !audioOutput) return;

        recordButton.addEventListener('click', async () => {
            if (!isRecording) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });
                    mediaRecorder = new MediaRecorder(stream);

                    audioChunks = [];
                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, {
                            type: 'audio/webm'
                        });
                        const audioUrl = URL.createObjectURL(audioBlob);

                        const audioElement = document.createElement('audio');
                        audioElement.classList.add('plyr');
                        audioElement.controls = true;
                        audioElement.src = audioUrl;

                        // اضافه به خروجی
                        audioOutput.innerHTML = '';
                        audioOutput.appendChild(audioElement);

                        // فعال‌سازی پلیر Plyr
                        new Plyr(audioElement, {
                            controls: ['play', 'progress', 'current-time', 'mute', 'volume'],
                        });
                    };

                    mediaRecorder.start();
                    recordButton.textContent = 'در حال ضبط...';
                    recordButton.classList.add('recording');
                    isRecording = true;
                } catch (err) {
                    console.error('خطا در دسترسی به میکروفن:', err);
                    alert('دسترسی به میکروفن رد شده یا پشتیبانی نمی‌شود.');
                }
            } else {
                mediaRecorder.stop();
                recordButton.textContent = 'ضبط مجدد';
                recordButton.classList.remove('recording');
                isRecording = false;
            }
        });
    });
}


// تغییر سایز صفحه
function handleResize() {
    const layout = document.querySelector('.layout');
    layout.setAttribute('data-menu-open', window.innerWidth < 992 ? 'false' : 'true');

    if (window.innerWidth < 992) {
        const chck_footer = document.querySelector(".form__buttons.fixed");
        if (chck_footer) document.querySelector(".wrapper").style.paddingBottom = "90px";
    }
}
window.addEventListener('resize', handleResize);

// تم‌ها
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.body.className = themeName;
    updateActiveTheme(themeName);
}

function updateActiveTheme(themeName) {
    document.querySelectorAll('.theme .dropdown-menu li').forEach(item => {
        item.classList.toggle('active', item.dataset.theme === themeName);
    });
}

// اعمال تم ذخیره‌شده
(function () {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;
    updateActiveTheme(savedTheme);
})();
var renderMustache = function ($opt) {
    var allMustache = $opt.html.match(/\{[\w,\d]+\}/g),
        html = $opt.html;
    if (allMustache != null)
        allMustache.map(matchElem => {
            let replaceMent = $opt[/[a-z,A-Z,0-9,_]+/g.exec(matchElem)[0]];
            html = html.replace(matchElem, (replaceMent || ""))
        })
    // I love Recursive Functon
    if ($opt.html.match(/\{[\w,\d]+\}/g) == null) return html;
    else return renderMustache($.extend($opt, {
        html: html
    }))
};

var initRealUploader = function ($, $opt) {
    $("#" + $opt.name).val("");
    $("#" + $opt.max).val("");
    let uploader_unicIds = new Array();
    var currentContainer = null,
        currentQueue = null;
    var uploader = new RealUploader($opt.elem, {
        accept: $opt.accept,
        url: domain + "/inc/ajax.ashx",
        data: {
            action: "form_uploadfile",
            formid: ($opt.formid || (typeof formid != "undefined" ? formid : 0)),
            fieldname: $opt.fieldname || $opt.name
        },
        autoStart: true,
        mainTemplate: renderMustache({
            "html": uploaderMainTemplate,
            "Description": $opt.description,
            "Mainname": $opt.fieldname,
            "Field_Name": $opt.name
        }),
        fileTemplate: fileTemplate,
        hideUploadButton: true,
        chunkSize: 1000000000,
        maxFileSize: $opt.maxsize,
        minFileSize: $opt.minsize || "0",
        maxFiles: $opt.max,
        allowedExtensions: ($opt.ext != "" ? $opt.ext.split(",") : []),
        resizeImage: ($opt.resize ? $opt.resizeImage : {}),
        listeners: {
            init: function () {
                if ($($opt.elem).find(".ax-clear")) {
                    var $removeBtn = $($opt.elem).find(".ax-clear");
                    $removeBtn.on("click", function () {
                        console.log("IDs to remove:", uploader_unicIds); // بررسی مقدارها
                        if (uploader_unicIds.length > 0) {
                            removeAllFiles(uploader_unicIds, $opt.name);
                            uploader_unicIds = []
                        }
                    })
                }
            },
            dragEnter: function (e, element) {
                console.log("Drag Enter Event", e);
            },
            dragLeave: function (e, element) {
                console.log("Drag Leave Event", e);
            },
            error: function (error, file) {
                console.log(error, file)
            },
            progressFile: function (file, percent) {
                if (file.xhr != null) {
                    file.xhr.onloadend = function (res) {
                        (res.target.response);
                        uploader_unicIds.push(file.name);
                    };
                    file.xhr.onerror = function (res) {
                    };
                    file.xhr.onload = function (res) {
                        try {
                            var response = JSON.parse(res.target.response);

                            if (response.error != undefined && response.error != '') {
                                var fileElement = $($opt.elem).closest('.ax-uploader').find('.ax-file-wrapper[title="' + file.name + '"]');
                                if (fileElement.length > 0) {
                                    fileElement[0].querySelector('.ax-remove').click();
                                }
                            } else {
                                console.log(file.file.name)
                                const $fileWrapper = $($opt.elem).closest('.ax-uploader').find(`.ax-file-wrapper[title="${file.name}"]`);
                                $fileWrapper.find(".ax-file-name[title='" + response.name + "']").html(file.file.name)
                            }
                        } catch (error) {
                            var fileElement = $($opt.elem).closest('.ax-uploader').find('.ax-file-wrapper[title="' + file.name + '"]');
                            console.log(fileElement)

                            if (fileElement.length > 0) {
                                $(fileElement).css("background", "#8f0000")
                                $(fileElement).find(".ax-progress-data").html(`<strong style="color:#FFF">Error</strong>`)
                            }
                        }
                    };
                }
            },
            errorFile: function (error, file) {
                //console.log(error, file)
                var htmlError = '<em class="error es-form-text-danger">  ';

                error.map(function (item) {
                    htmlError += /* '<span> '+file+'</span>'+ */
                        '<span> ' + item.message + '</span>'
                })
                $($opt.elem).closest('.ax-uploader').append(htmlError);
                setTimeout(function () {
                    $($opt.elem).closest('.ax-uploader').find(".error.es-form-text-danger").remove()
                }, 5000)

            },
            afterRenderFile: function (e, elem) {
                //console.log(elem)
                if (e.xhr == null || typeof e.xhr == "undefined") {
                    // console.log(uploader.config);
                    e.stopQueue();
                    //e.deleteFile();
                }
                $(elem.container).find(".ax-remove").on("click", function () {
                    let unicid = $(elem.container).attr('title');
                    uploader_unicIds = uploader_unicIds.filter(item => item != unicid);
                    removeFile(unicid, this, $opt.name);
                })

            },
            chunkUpload: function (file, name, size, xhr) {
                //console.log(file, name, size, xhr);
                try {
                    var response = JSON.parse(xhr.response);
                    if (response.status == "error" || response.error) {
                        var htmlError = '<em class="error es-form-text-danger"> <span> ' + (response.error || response.msg) + '</span> </em>';
                        $($opt.elem).closest('.ax-uploader').append(htmlError);
                        //uploader.stopQueue();
                        setTimeout(function () {
                            $($opt.elem).closest('.ax-uploader').find(".error.es-form-text-danger").remove();
                        }, 5000);
                        setTimeout(function () {
                            //uploader.clearQueue();
                        }, 1000)
                        return false;
                    }

                } catch (e) {
                    console.log("Error: ", e)
                }

            }
        }
    });


};

//Requests

function sendApiRequest(action, data = {}) {
    const url = domain + `/inc/ajax.ashx?action=${action}`;
    return fetch(url, {
            method: 'POST',
            body: objectToForm(data),
        })
        .then((res) => res.json())
        .catch((err) => {
            console.error(`API Error [${action}]:`, err);
            return null;
        });
}

function objectToForm(obj) {
    const formData = new FormData();
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            formData.append(key, obj[key]);
        }
    }
    return formData;
}