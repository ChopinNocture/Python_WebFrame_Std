$(document).ready(init);

var cls_url = "",
    cls_id = null;
var qType_list = [];
var prac_num_json_data = {};
const MAX_NUM = 20;

function init() {
    csrf_Setup();

    $("input[id^='prac_mode']").click(onModeChange);
    $('button[id^=QType_]').click(onNavTypeClk).each(function (index, elem) {
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
    // alert(JSON.stringify(prac_num_json_data));
    if (cls_url != "") {
        $.ajax({
            url: cls_url,
            type: 'post',
            data: {
                "ps": JSON.stringify(prac_num_json_data),
                "lock": $("#prac_mode_1").prop("checked") ? "True" : "False",
                "unlock_number": $("#id_unlock").val()
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
        unlock_num = jsonData["unlock_number"];
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
    if (prac_num_json_data[qtype] != null) {
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
var unlock_num = 3;

function updateModeSetting() {
    if (lock_mode) {
        $("#prac_mode_1").prop("checked", true);
        $("#id_unlock").val(unlock_num);
        $("#id_unlock_div").show();
    } 
    else {
        $("#prac_mode_0").prop("checked", true);
        $("#id_unlock").val(unlock_num);
        $("#id_unlock_div").hide();
    }
}

function onModeChange() {
    lock_mode = $("#prac_mode_1").prop("checked");
    updateModeSetting();
}



//=======================================================
// question filter
//=======================================================
var section_id = null;
var cur_list_url = "";
var QLIST_ITEM_STR = '<button class="list-group-item list-group-item-action list-group-item-warning inline-block text-truncate" \
                    tabindex="-1" data-qid=-1 data-toggle="tooltip" data-placement="left" onfocus="this.blur()" id="" title=""></button>';

var QLIST_BTN_ID = "qlist_id";

function onSectionClick(event) {
    if (event.target.dataset.section != section_id) {
        $('button[id^=course_]').removeClass('active');
        $(event.target).addClass('active');
        section_id = event.target.dataset.section;
        doRefreshQList();
    }

    //    $(event.target).blur();
    return true;
}


function doRefreshQList() {    
    if (section_id && cur_list_url) {
        $.get(cur_list_url + section_id.toString(), updateQList);
    }
    else {
        $("#Question_List").empty();
        $("#qlist_num").html('0');
    }
    $('#content_filer').collapse('hide');
}

function updateQList(jsonData) {
    var qListPanel = $("#Question_List");

    qListPanel.empty();

    var tempLine;
    var i = 0;
    jsonData.forEach(function (iter, index, array) {
        tempLine = $(QLIST_ITEM_STR)
            .clone()
            .attr({ "data-qid": iter.id, "id": QLIST_BTN_ID + i, "title": iter.desc })
            .html(iter.desc)
            .tooltip()
            .click(onQListBtnClick);

        //if (curr_qid == iter.id) tempLine.addClass('active');
        qListPanel.append(tempLine);
        ++i;
    });
    $("#qlist_num").html(i.toString());
}

var question_type ='';
function onNavTypeClk(event) {
    $("button[id^='QType_']").removeClass('active');

    question_type = event.target.dataset["qtype"];
    $(event.target).addClass('active');

    cur_list_url = event.target.dataset.qlistUrl;
    doRefreshQList();

    return false;
}

function onQListBtnClick(event) {
    //$('button[id^=' + QLIST_BTN_ID + ']').removeClass('active');
    if($(event.target).hasClass('active')) {
        $(event.target).removeClass('active');
    }
    else {
        $(event.target).addClass('active');    
    } 

    return false;
}