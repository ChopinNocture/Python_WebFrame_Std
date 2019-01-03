$(document).ready(init);

var cls_url = "",
    cls_id = null;
var qType_list = [];
var prac_num_json_data = {};
var quests_filter = {};
const MAX_NUM = 20;

function init() {
    csrf_Setup();

    $('#content_filer').on('hide.bs.collapse', function () {
        filterQList();
    });
    
    $('#content_filer').on('show.bs.collapse', function () {
        $('#filter_input').val("");
    });

    $("input[id^='prac_mode']").click(onModeChange);
    $('button[id^=QType_]').click(onNavTypeClk).each(function (index, elem) {
        var typestr = $(elem).data("qtype");
        qType_list.push(typestr);
        prac_num_json_data[typestr] = 1;
        quests_filter[typestr] = [];
        $(elem).html(TYPE_TRANS_LIST[typestr]);
    });

    updateNumberDisp();
    updateModeSetting();
    // Filter
}

function onConfirmSetting(event) {
    updateFilter();
    // alert(JSON.stringify(prac_num_json_data));
    if (cls_url != "") {
        $.ajax({
            url: cls_url,
            type: 'post',
            data: {
                "ps": JSON.stringify(prac_num_json_data),
                "lock": $("#prac_mode_1").prop("checked") ? "True" : "False",
                "unlock_number": $("#id_unlock").val(),
                "qf": JSON.stringify(quests_filter)
            },
            dataType: "json",
            success: sucPost,
            error: failPost
        });
    }
}

function onClassSelect(event) {
    if ($(event.target).hasClass('active')) return;
    $("#id_mode_setting").show();
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
        if( jsonData["qf"] != 'none' ) {
            quests_filter = jsonData["qf"];
        }        
    }
    updateNumberDisp();
    updateModeSetting();
}

function failGet(jsonData) {
    alert("Fail:");
}

function resetJsonData() {
    for (var iter of qType_list) {
        prac_num_json_data[iter] = 1;
        quests_filter[iter] = [];
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
                    tabindex="-1" data-qid=-1 data-toggle="tooltip" data-placement="left" data-desc="" onfocus="this.blur()" id="" title=""></button>';

var QLIST_BTN_ID = "qlist_id";
var question_type ='';

function onSectionClick(event) {
    updateFilter();
    if (event.target.dataset.section != section_id) {
        $('button[id^=course_]').removeClass('active');
        $(event.target).addClass('active');
        section_id = event.target.dataset.section;
        doRefreshQList();
    }

    return true;
}

function updateFilter() {
    $('button[id^=' + QLIST_BTN_ID + ']').each(function (index, elem) {
        let qid = Number(elem.dataset["qid"]);
        let idx = $.inArray(qid, quests_filter[question_type]);
        if ($(elem).hasClass('active')) {
            if (idx == -1) {
                quests_filter[question_type].push(qid);
            }
        } else {
            if (idx != -1) {
                quests_filter[question_type].splice(idx, 1);
            }
        }
    });
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
            .attr({
                "data-qid": iter.id,
                "id": QLIST_BTN_ID + i,
                "title": iter.desc
            })
            .tooltip()
            .data('desc', iter.desc)
            .click(onQListBtnClick);

        if ($.inArray(Number(iter.id), quests_filter[question_type]) != -1) {
            tempLine.html('✔' + iter.desc).addClass('active');
        } else {
            tempLine.html(iter.desc);
        }
        //if (curr_qid == iter.id) tempLine.addClass('active');
        qListPanel.append(tempLine);
        ++i;
    });
    $("#qlist_num").html(i.toString());
}

function onNavTypeClk(event) {
    updateFilter();
    $("button[id^='QType_']").removeClass('active');
    $("#q_setting").show();

    question_type = event.target.dataset["qtype"];
    $(event.target).addClass('active');

    cur_list_url = event.target.dataset.qlistUrl;
    doRefreshQList();

    return false;
}

function onQListBtnClick(event) {
    //$('button[id^=' + QLIST_BTN_ID + ']').removeClass('active');
    var jqItem = $(event.target);
    if(jqItem.hasClass('active')) {
        jqItem.removeClass('active').html(jqItem.data('desc'));
    }
    else {
        jqItem.addClass('active').html('✔' + jqItem.data('desc'));
    } 

    return false;
}

//----------------
// filter
function onFilterInput(event) {
    filterQList(event.target.value);
}

function filterQList(words = null) {
    if (words) {
        var hidden_num = 0;
        $("#qlist_num").html(
            $('button[id^=' + QLIST_BTN_ID + ']').each(function (index, elem) {
                var missed = false;
                var word_list = words.split(" ");                
                word_list.forEach((item, idx, arr) => {
                    missed = missed || (elem.innerHTML.indexOf(item) == -1);
                    return missed;
                });

                if(missed) {
                    ++hidden_num;                    
                }
                $(elem).attr("hidden", missed);
            }).length - hidden_num);
    }
    else {
        $("#qlist_num").html($('button[id^=' + QLIST_BTN_ID + ']').attr("hidden", false).length);
    }
}