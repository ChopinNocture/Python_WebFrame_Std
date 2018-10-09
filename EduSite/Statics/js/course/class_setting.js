$(document).ready(init);

var cls_url = "",
    cls_id = null;
var qType_list = [];
var prac_num_json_data = {};
const MAX_NUM = 20;

function init() {
    csrf_Setup();

    $('span[id^=QType_]').each(function (index, elem) {
        var typestr = $(elem).data("qtype");
        qType_list.push(typestr);
        prac_num_json_data[typestr] = 1;
        $(elem).html(TYPE_TRANS_LIST[typestr]);
    });

    updateNumberDisp();
    updateModeSetting();
    // Filter
}

function onConfirmSetting(event) {
    if (cls_url != "") {
        $.ajax({
            url: cls_url,
            type: 'post',
            data: {
                "ps": JSON.stringify(prac_num_json_data),
                "lock": $("#prac_mode_1").prop("checked") ? "True" : "False"
            },
            dataType: "json",
            success: sucPost,
            error: failPost
        });
    }
}

function onClassSelect(event) {
    if ($(event.target).hasClass('active')) return;

    $('button[id^=class_]').removeClass('active');
    $(event.target).addClass('active');

    cls_url = $(event.target).data("url");
    cls_id = $(event.target).data("clsId");
    cls_url = cls_url.replace("9999", cls_id);

    $.ajax({
        url: cls_url,
        type: 'get',
        dataType: "json",
        success: sucGet,
        error: failGet
    });
}


function sucGet(jsonData) {
    // alert("Get:" + jsonData);
    if (jsonData == "error") {
        resetJsonData();
    } else {
        prac_num_json_data = jsonData["ps"];
        lock_mode = jsonData["lock"];
    }
    updateNumberDisp();
    updateModeSetting();
}

function failGet(jsonData) {
    alert("Fail:");
}

function resetJsonData() {
    for (var iter in qType_list) {
        prac_num_json_data[qType_list[iter]] = 1;
    }
}

function sucPost(jsonData) {
    alert("修改成功！");
}

function failPost() {
    updateNumberDisp();
    updateModeSetting();
}

function onPerNumChange(event, qtype) {
    if (prac_num_json_data[qtype]) {
        prac_num_json_data[qtype] = Math.min(MAX_NUM, Math.max(0, event.target.value));
        event.target.value = prac_num_json_data[qtype];
    }
}

function updateNumberDisp() {
    for (var iter in qType_list) {
        $("#Q_NUM_" + qType_list[iter]).val(prac_num_json_data[qType_list[iter]]);
    }
}

var lock_mode = true;

function updateModeSetting() {
    if (lock_mode) {
        $("#prac_mode_1").prop("checked", true);
    } else {
        $("#prac_mode_0").prop("checked", true);
    }
}