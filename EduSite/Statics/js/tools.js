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
    var shuffled_list = new Array(list_len);
    recur_shuffle(0, list_len, shuffled_list);

    var rand_mid = Math.floor(Math.random() * list_len);
    var templist = shuffled_list.splice(0, rand_mid-1);

    shuffled_list = shuffled_list.concat(templist);
    
    return shuffled_list;
}

function recur_shuffle(rand_start, rand_end, random_list) {
    var tempNum = rand_end - rand_start;
    var rand_mid = Math.max(1, Math.floor(Math.random() * tempNum));

    random_list[rand_start] = rand_end - 1;
    random_list[rand_end - 1] = rand_start;

    if (tempNum > 2) {        
        recur_shuffle(rand_start, rand_start+rand_mid, random_list);
        recur_shuffle(rand_start+rand_mid, rand_end, random_list);
    }
    return;
}

//---------------------------------------------
// csrf method
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function csrf_Setup() {
    var csrftoken = $("[name=csrfmiddlewaretoken]").val();

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}