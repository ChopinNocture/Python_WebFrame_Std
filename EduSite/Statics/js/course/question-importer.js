$(document).ready(init);

var PROGFRESS_STRING = "正在导入，请稍后";
var pro_str;
var progress = 0;

function init() {
    csrf_Setup();
    $('a[id^=NavBtn_]').click(onNavTypeClk);
    $('a[id^=NavBtn_]').each(function (index, elem) {
        elem.innerHTML = TYPE_TRANS_LIST[elem.innerHTML];
    });    
    $('#progressing').hide();
    $('#excel_file').on('change', onFileSelect);
}

function onFileSelect(event) {
    //alert(event.target.files[0].name + ' ---- ' + event.target.files[0].type + ' - ');
    if($('#excel_file')[0].files[0].type.indexOf('application/vnd.ms-excel')!=-1) {
        $('#fsel_label').html($('#excel_file')[0].files[0].name);
        $('#check_btn').prop('disabled', false);
        $('#import_btn').prop('disabled', false);
        $('#import_list_btn').prop('disabled', false);
    }
    else {
        $('#fsel_label').html("请选择Excel文件......");
        $('#check_btn').prop('disabled', true);
        $('#import_btn').prop('disabled', true);
        $('#import_list_btn').prop('disabled', true);
    }
}

function onBtnClk(event) {
    $('#op_id').val('normal');
    $('#check_btn').prop('disabled', true);
    $('#import_btn').prop('disabled', true);
    $('#import_list_btn').prop('disabled', true);
    start_progress();
    $('#quest_importer_fm').submit();
}

function onListBtnClk(event) {
    $('#op_id').val('ListImport');
    $('#check_btn').prop('disabled', true);
    $('#import_btn').prop('disabled', true);
    $('#import_list_btn').prop('disabled', true);
    start_progress();
    $('#quest_importer_fm').submit();
}

function onCheckClk(event) {
    $('#op_id').val('check');
    $('#check_btn').prop('disabled', true);
    $('#import_btn').prop('disabled', true);
    $('#import_list_btn').prop('disabled', true);
    start_progress();
    $('#quest_importer_fm').submit();
}

function start_progress() {
    $('#progressing').show();
    pro_str = PROGFRESS_STRING;
    setInterval( progressing, 200);
}

function progressing() {
    progress = progress + 1;
    if (progress == 10) {
        progress = 0;
        pro_str = PROGFRESS_STRING;
    }
    else {
        pro_str = pro_str + "..";
    } 
    $('#progressing').html(pro_str);    
}


var question_type = "FillInBlank";
var cur_list_url = "";
var section_id;

var qid_list = [];

function onNavTypeClk(event) {
    question_type = event.target.dataset["typeName"];

    $('ul.nav-pills').find('a').each(function () {
        if (this.dataset["typeName"] == question_type) {
            $(this).addClass('active');
        }
        else {
            $(this).removeClass('active');
        }
    })

    with_value = false;
    cur_list_url = event.target.dataset.qlistUrl;
    refreshOthers();
    doRefreshQList();

    return false;
}


//=======================================================
// section Part
//=======================================================
function onSectionClick(event) {
    if (event.target.dataset.section != section_id) {
        $('button[id^=course_]').removeClass('active');
        $(event.target).addClass('active');
        section_id = event.target.dataset.section;
        doRefreshQList();
    }
    return true;
}

//=======================================================
// Update question list
//=======================================================
var QLIST_ITEM_STR = '<button class="list-group-item list-group-item-action list-group-item-warning inline-block text-truncate" \
                    tabindex="-1" data-qid=-1 data-toggle="tooltip" data-placement="left" onfocus="this.blur()" id="" title=""></button>';

var QLIST_BTN_ID = "qlist_id";

function onQListBtnClick(event) {
    if ($(this).hasClass('active') ) {
        $(this).removeClass('active');
    }
    else {
        $(this).addClass('active');
    }
    refreshOthers();

    return false;
}

function refreshOthers() {
    $('#btn_deleteQ').attr("disabled", section_id == "");
    $('#btn_selall').attr("disabled", section_id == "");
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

        qListPanel.append(tempLine);
        ++i;
    });
    $("#qlist_num").html(i.toString());
}

function doRefreshQList() {    
    if (section_id && cur_list_url) {
        $.get(cur_list_url + section_id.toString(), updateQList);
    }
    else {
        $("#Question_List").empty();
        $("#qlist_num").html('0');
    }
}

function delSucFunc() {
    qid_list = [];
    closeModal();
    doRefreshQList();
    refreshOthers();
}
//----------------
function onDeleteConfirm() {
    var urlStr = $("#btn_deleteQ").data('url');
    urlStr = urlStr.replace("qqqq", question_type);

    $.ajax({
        url: urlStr,
        type: 'post',
        data: {'q_list': JSON.stringify(qid_list)},
        dataType: 'json',
        success: delSucFunc
    });
}

function onDeleteQuestionClick(event) {
    qid_list = [];
    $('button[id^=' + QLIST_BTN_ID + '].active').each(function (index, elem) {
        qid_list.push(elem.dataset["qid"]);        
    });  
    if(qid_list.length>0){
        OpenModal("确认要删除选中的题目吗？删除后不可恢复！", onDeleteConfirm);
    }
}