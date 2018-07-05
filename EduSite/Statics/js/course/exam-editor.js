$(document).ready(init);


var question_type = "FillInBlank";
function init() {
    csrf_Setup();

  //  $('#NavBtn_' + question_type).click();

    $('button[id^=NavBtn_]').click(onNavTypeClk);
    $('button[id^=QSelected_]').click(onSelectClk); 


    $('button[id^=NavBtn_]').each(function (index, elem) {
        elem.innerHTML = TYPE_TRANS_LIST[elem.innerHTML];
    });
   // $('button[id^=course_]:first').click();
}



function onSelectClk(event) {
    $('button[id^=QSelected_]').removeClass('active');
    $(this).addClass('active');
}


var current_url = "";
var cur_list_url = "";
var section_id = null;

function onNavTypeClk(event) {

    //alert(event.target.dataset["url"]);
    // alert(event.target.dataset["typeName"]);
    // question_type = event.target.dataset["typeName"];

    $('button[id^=NavBtn_]').each(function () {
        if (this.dataset["typeName"] == question_type) {
            $(this).addClass('active');
        }
        else {
            $(this).removeClass('active');
        }
    })
    current_url = event.target.dataset.url;
    cur_list_url = event.target.dataset.qlistUrl;
 
    // curr_qid = "";
    // with_value = false;
    // current_url = event.target.dataset.url;
    // cur_list_url = event.target.dataset.qlistUrl;
    // refreshOthers();
    doRefreshQList();

    return false;
}

function doRefreshQList() {    
    if (cur_list_url) {
        $.get(cur_list_url, updateQList);
    }
    else {
        $("#Question_List").empty();
        $("#qlist_num").html('0');
    }
    $('#content_filer').collapse('hide');
}

var QLIST_ITEM_STR = '<button class="list-group-item list-group-item-action list-group-item-info inline-block text-truncate" \
                    tabindex="-1" data-qid=-1 data-toggle="tooltip" data-placement="left" onfocus="this.blur()" id="" title=""></button>';

var QLIST_BTN_ID = "qlist_id";

function updateQList(jsonData) {  

    //alert("update " + jsonData + " QList ");
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
            alert(jsonData);
       // if (curr_qid == iter.id) tempLine.addClass('active');
        qListPanel.append(tempLine);
        //alert(value.id + "  " + value.desc);
        ++i;
    });   
    $("#qlist_num").html(i.toString());
}

function onQListBtnClick(event) {}