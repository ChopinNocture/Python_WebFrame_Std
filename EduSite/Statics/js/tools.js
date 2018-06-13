var OPTION_SPLITER_SYMBOL = "|-|";
var KEY_SPLITER_SYMBOL = ",";

function ajaxSubmit(aform, sucFunc, failFunc) {
    //alert($(aform).serialize());
    $.ajax({
        url: aform.action,
        type: aform.method,
        data: $(aform).serialize(),
        dataType: "html",
        success: sucFunc,
        error: failFunc
    });
}

function ajaxSubmitJson(aform, sucFunc, failFunc) {
    $.ajax({
        url: aform.action,
        type: aform.method,
        data: $(aform).serialize(),
        dataType: "json",
        success: sucFunc,
        error: failFunc
    });
}

function tool_shuffle_list(list_len) {
    if (list_len<0) {
        return [];
    }
    alert(Math.floor(Math.random()*list_len));
    //var shuffled_list = new Array(list_len);
}