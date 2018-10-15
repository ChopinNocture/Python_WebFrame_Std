var OPTION_SPLITER_SYMBOL = "|-|";
var KEY_SPLITER_SYMBOL = ",";
var FillInBlank_Key_Reg = /{@([\…\w\u4e00-\u9fa5]+)@}/g;

var type_HTML = {
    'image': '<img src="***" alt="图片文件，需要支持HTML5 的浏览器" id="prev_control"/>',
    'video': '<video controls="controls" id="prev_control"> <source src="***" type="video/mp4">需要支持HTML5 的浏览器" </video>',
    'audio': '<audio src="***" alt="音频文件，需要支持HTML5 的浏览器" id="prev_control" controls="controls"/>'
}


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

function ajaxSubmitWithFile(aform, sucFunc, failFunc) {
    //alert($(aform).serialize());
    $.ajax({
        url: aform.action,
        type: aform.method,
        data: new FormData($(aform)[0]),
        processData: false,
        contentType: false,
        success: sucFunc,
        error: failFunc
    });
}

function random_pick_list(list, num) {
    if(Array.isArray(list)) {
        var randNum = Math.max(0, Math.min(list.length, num));
        var random_list = list.sort(function(){
            return Math.random() - 0.5;     
        });
        return random_list.slice(0, randNum);  
    }
    return null;
}
// var numArr = getNum().sort(function () {
//     return Math.random() - 0.5;
// });
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


//---------------------------------------------
// A:65  1:49
function getOptionLabelChar(idx, isChar=true) {
    var label_label = isChar ? 65: 49;
    return String.fromCharCode(label_label + idx);
}

//---------------------------------------------
// minute to 01:01
function formatTime(time) {
    //分钟
    var minutes = Math.floor(time / 60);
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    //秒
    var seconds = Math.floor(time % 60);
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return "" + minutes + "" + ":" + "" + seconds + "";
}