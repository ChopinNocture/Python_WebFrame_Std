$(document).ready(init);

var cls_url="", cls_id = null;
var cur_index = -1;

function init() {
    csrf_Setup();

    $('span[id^=QType_]').each(function (index, elem) { 
        var typestr = $(elem).data("qtype");
        // qType_list.push(typestr); 
        $(elem).html(TYPE_TRANS_LIST[typestr]);        
    });    
    // Filter
}


function onConfirmSetting(event) {
    if( cls_url!="") {
        $.ajax({        
            url: cls_url,
            type: 'post',
            data: { "ps": "" },
            dataType: "json",
            success: sucPost,
            error: failFunc
        });
    }    
}

function onClassSelect(event) {
    if ($(event.target).hasClass('active')) return;

    $('button[id^=class_]').removeClass('active');
    $(event.target).addClass('active');

    cls_url = $(event.target).data("url");
    cls_id = $(event.target).data("clsId");
    alert(cls_id);
    cls_url = cls_url.replace("9999", cls_id);

    $.ajax({        
        url: cls_url,
        type: 'get',
        dataType: "json",
        success: sucGet,
        error: failFunc
    });
}

function sucGet(jsonData) {
    alert(jsonData);
}

function sucPost(jsonData) {
    alert(jsonData);
}

function failFunc(){
    alert("failed!");
}