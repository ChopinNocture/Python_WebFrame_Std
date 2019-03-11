$(document).ready(init);

var course_list = [];
var cls_url = "",
    cls_id = null;
var qType_list = [];
var prac_num_json_data = {};
var quests_filter = {};
const MAX_NUM = 20;

function init() {
    csrf_Setup();

    course_list = [];
    $('button[id^=course_]').each((idx, elem) => {
        course_list.push({
            id: $(elem).data('section'),
            desc: $(elem).html(),
        });
    });

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

    $("#btn_chpt_setting").click(onChapterSetting);
    updateNumberDisp();
    updateModeSetting();
    // Filter
}

function onConfirmSetting(event) {
    updateFilter();
    // alert(JSON.stringify(prac_num_json_data));
    if (cls_url != "") {
        let order = [];
        for(let iter of lesson_order) {
            order.push({id: iter.id, c: iter.c});
        }

        $.ajax({
            url: cls_url,
            type: 'post',
            data: {
                "ps": JSON.stringify(prac_num_json_data),
                "lock": $("#prac_mode_1").prop("checked") ? "True" : "False",
                "unlock_number": $("#id_unlock").val(),
                "order": JSON.stringify(order),
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
    if (jsonData == "error") {
        resetJsonData();
    } else {
        prac_num_json_data = jsonData["ps"];
        lock_mode = jsonData["lock"];
        unlock_num = jsonData["unlock_number"];
        if (jsonData["qf"] != 'none') {
            quests_filter = jsonData["qf"];
        }
        lesson_order = jsonData['order'];
        console.log("Get:", course_list, lesson_order);
        if (!lesson_order || lesson_order == "") {
            lesson_order = [];
            course_list.forEach((elem, idx) => {
                lesson_order.push({ id: elem.id, c: true, i: idx });
            });
        }
        else {
            for (let iter of lesson_order) {
                iter['i'] = course_list.findIndex((val, idx) => {
                    return (val.id == iter.id);
                });
            }
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
    lesson_order = [];
    course_list.forEach((elem, idx) => {
        lesson_order.push({ id: elem.id, c: true, i: idx });
    });
    console.log("resetJsonData:", course_list, lesson_order);
}

function sucPost(jsonData) {
    //alert("修改成功！");
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
var question_type = '';

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
    $("#chapter_panel").hide();
    $("#question_panel").show();
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
    if (jqItem.hasClass('active')) {
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

                if (missed) {
                    ++hidden_num;
                }
                $(elem).attr("hidden", missed);
            }).length - hidden_num);
    }
    else {
        $("#qlist_num").html($('button[id^=' + QLIST_BTN_ID + ']').attr("hidden", false).length);
    }
}

//-------------------------------------------------------
// Q
//-------------------------------------------------------
var lesson_order = [];

function onChapterSetting() {
    refreshChapterOrder();
    $("#chapter_panel").show();
    $("#question_panel").hide();
}

//----------------------------------
var CHAPTER_HTML = '<div class="input-group" id="id_chapter_cc" dropzone="move" ondrop="drop(event)" ondragover="allowDrop(event)" data-sortid="cc">\
                        <div class="input-group-prepend"><span class="input-group-text" id="id_span_cc">cc</span></div>\
                        <div class="form-control" draggable="true" ondragstart="drag(event)" ondragenter="dragenter(event)" ondragleave="dragleave(event)" id="chapter_item_cc" data-sortid="cc"> \
                            ##</div>\
                        <div class="input-group-append"><div class="input-group-text"><input type="checkbox" id="chpt_check_cc" data-sortid="cc" onchange="onChapterCheck(event)" ~~ /></div></div>\
                    </div>';
var id_replace_reg = new RegExp('cc', "g");

function dragenter(event) {
    $(event.target).addClass('dropable');
}

function dragleave(event) {
    $(event.target).removeClass('dropable');
}

function drag(event) {
    if (event.target.dataset['sortid'] == null) return false;
    event.dataTransfer.setData('sortid', event.target.dataset['sortid']);// parentNode.id);
    event.dataTransfer.effectAllowed = 'copy';
}

function drop(event) {
    event.preventDefault();
    $(event.target).removeClass('dropable');
    if (event.target.dataset['sortid'] == null) return false;
    //alert(event.target);
    var id = event.dataTransfer.getData("sortid");

    if (id == '' || id == null) return false;

    swapData(id, event.target.dataset['sortid']);
}

function swapData(curidx, taridx) {
    var curhtml = $('#'+ CHPT_ID + curidx).html();
    var curdata = lesson_order[curidx];
    lesson_order[curidx] = lesson_order[taridx];
    lesson_order[taridx] = curdata;

    var tarhtml = $('#'+ CHPT_ID + taridx).html();
    $('#'+ CHPT_ID + curidx).html(tarhtml);
    $('#'+ CHPT_ID + taridx).html(curhtml);

    $('#chpt_check_' + curidx).get(0).checked = lesson_order[curidx].c;
    $('#chpt_check_' + taridx).get(0).checked = lesson_order[taridx].c;    
}

function allowDrop(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    return false;
}

function onChapterCheck(event) {
    lesson_order[event.target.dataset['sortid']].c = event.target.checked;
}

var CHPT_ID = 'chapter_item_';

//{ id: elem.id, c: true, i:idx } course_list
function refreshChapterOrder() {
    var html_str = '';
    for (var i in lesson_order) {
        html_str += CHAPTER_HTML.replace(id_replace_reg, i)
            .replace('##', course_list[lesson_order[i].i].desc)
            .replace('~~', lesson_order[i].c ? "checked" : "");
    }
    $('#order_panel').html(html_str);
    //alert(shuffled_op);
}

