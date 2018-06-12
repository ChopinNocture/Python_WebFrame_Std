var OPTION_SPLITER_SYMBOL = "|-|";

function ajaxSubmit(aform, sucFunc, failFunc) {
    alert($(aform).serialize());

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
    alert(aform);

    $.ajax({
        url: aform.action,
        type: aform.method,
        data: $(aform).serialize(),
        dataType: "json",
        success: sucFunc,
        error: failFunc
    });
}