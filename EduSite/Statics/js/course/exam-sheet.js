$(document).ready(onInit);

var qType_list = [];
var cur_type = "FillInBlank";
var cur_idx = 0;
var question_sum = 0;
var examination = null;
var answer_info = null;

var t_start, t_end, t_duration, t_serv_now, t_exam_start, t_leftMSec, clock_start;
var user_id = -1;

function onInit(event) {
    csrf_Setup();
    checkCookie();
    $('#section_title').html($('#id_title').val());

    $('#btn_next').click(onNextClk);
    $('#btn_Prev').click(onPrevClk);
    onStopRecordingFunc = voiceRecEnd;
    initTime();
    initQuestion();
    recoverAnswerFromCookie();
    initRecorder();
    //examination.
    // ajaxSubmitJson(document.getElementById('qlist_form'), onQuestionListGet, failFunc);
    $("#nav_" + cur_type).click();
}

function checkCookie() {
    user_id = $("#id_user_id").val();
    var uid = getCookie('user_id');
    if (uid == undefined || user_id != uid) {
        document.cookie = 'user_id=' + user_id + ";path=cookieDir;";
        document.cookie = 'e_ans=empty;path=cookieDir;';
        document.cookie = 'e_st=0;path=cookieDir;';        
    }
}

//----------------------------------------------------------------
var recorder, audio_context;
function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    recorder = new Recorder(input);
}

function initRecorder() {
    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        window.URL = window.URL || window.webkitURL;

        audio_context = new AudioContext();
        
        var mediaFunc = null;
        if (navigator.MediaDevices) {
            mediaFunc = navigator.mediaDevices.getUserMedia;
            mediaFunc({ audio: true }).then(startUserMedia).catch(function (e) {
                alert('没有麦克风，语音题将无法完成！ ');
                console.log(e);
            });
        }
        else {
            mediaFunc = (function () {
                if (navigator.getUserMedia) {
                    return navigator.getUserMedia.bind(navigator)
                }
                if (navigator.webkitGetUserMedia) {
                    return navigator.webkitGetUserMedia.bind(navigator)
                }
                if (navigator.mozGetUserMedia) {
                    return navigator.mozGetUserMedia.bind(navigator)
                }
            })();
            mediaFunc({ audio: true }, startUserMedia, function (e) {
                alert('没有麦克风，语音题将无法完成！ ');
                console.log(e);
            });
        }
    } catch (e) {
        console.warn('浏览器音频设备不可用！将无法完成语音题！');
        alert('浏览器音频设备不可用！将无法完成语音题！');
    }
}

function initTime() {
    t_serv_now = new Date($("#id_server_time").val());

    t_start = new Date($("#id_start_time").val());
    t_end = new Date($("#id_end_time").val());
    t_duration = $("#exam-duration").val();
    t_exam_start = getCookie('e_st');
    if (t_exam_start == null || t_exam_start == 0) {
        t_exam_start = t_serv_now;
    }
    else {
        t_exam_start = new Date(t_exam_start);
    }
    saveStartTimeInCookie(t_exam_start);

    t_leftMSec = Math.min(t_duration * 60 * 1000 - Number(t_serv_now - t_exam_start), Number(t_end - t_serv_now));
    if (t_leftMSec > 0) {
        clock_start = Date.now();
        setInterval('refresh_clock()', 500);
    }
    else {
        submitExam();
    }
}

function refresh_clock() {
    var leftMS = Number(t_leftMSec - (Date.now() - clock_start));
    if (leftMS > 0) {
        leftMS = Math.floor(leftMS / 1000);
        var str = "";
        str = str + Math.floor(leftMS / 3600) + ":";
        leftMS = leftMS % 3600;
        str = str + Math.floor(leftMS / 60) + ":";
        leftMS = leftMS % 60;
        str = str + leftMS;
        $("#clock_time").html(str);
    }
    else {
        submitExam();
    }    
}

function update() {
    updatePageView();
    updateQuestion();
}
//---------------------------------------------------------------------------
// page
function onNextClk(event) {
    nextQuestion(cur_idx + 1);
}

function onPrevClk(event) {
    nextQuestion(cur_idx - 1);
}

function nextQuestion(nextIdx) {
    var n = Math.max(Math.min(nextIdx, question_sum - 1), 0)

    if (n != cur_idx) {
        checkCurrentAnswer();
        cur_idx = n;
        update();
    }
}

function updatePageView() {
    if (cur_idx <= 0) {
        $('#prev_panel').hide();
    }
    else {
        $('#prev_panel').show();
    }

    if (cur_idx < question_sum - 1) {
        $('#last_panel').hide();
        $('#next_panel').show();
        $('#next_index').html(cur_idx + 2);
    }
    else {
        $('#last_panel').show();
        $('#next_panel').hide();
    }
    $('#current_index').html(cur_idx + 1);
    $('#sum_label').html(question_sum);
}

//---------------------------------------------------------------------------
// exam part
var checkAnswerFunc;// = function(){ return {complete, result, answer}; };
var refreshQuestionFunc;
var refreshAnswerFunc;

// { "total_num": 0, "total_score": 0, "choice" :{ 'per_score': 1, 'num': 0, 'sum_score': 0, index, qlist:[ids], questions:[], answers:[{complete, result, answer}] }}
function initQuestion() {
    examination = $.parseJSON($('#id_question_list').val());
    $(".qtype").each(function (index, elem) {
        var typestr = $(elem).data("qtype");
        qType_list.push(typestr);
        $(elem).html(TYPE_TRANS_LIST[typestr]).click(onTypeChanged);

    });

    if (examination) {
        question_sum = examination.total_num;
        for (var i in qType_list) {
            if (examination[qType_list[i]]) {
                examination[qType_list[i]]["index"] = 0;
            }
        }
    }

    answer_info = standardizeExam();
}

function onTypeChanged(event) {
    $(".qtype").removeClass("actived");
    updateTypeChanged($(event.target).addClass("actived").data("qtype"));
}

function updateTypeChanged(newType) {
    examination[cur_type]["index"] = cur_idx;
    //alert(newType+"--" + examination[cur_type]["questions"]);
    checkCurrentAnswer();

    cur_type = newType;
    cur_idx = examination[cur_type]["index"];
    question_sum = examination[cur_type]["num"];

    eval('checkAnswerFunc = check' + cur_type);
    eval('refreshQuestionFunc = refresh' + cur_type);
    eval('refreshAnswerFunc = refreshAnswer' + cur_type);
    if (examination[cur_type]["questions"] == undefined) {
        if (examination[cur_type]['qlist'].length > 0) {
            var jsonlist = JSON.stringify({ 'qlist': examination[cur_type]['qlist'] });

            $.ajax({
                url: $("#exam_form").data("typelisturl"),
                type: 'post',
                data: { "qtype": cur_type, "jsonlist": jsonlist },
                dataType: "json",
                success: onQuestionGet,
            });
        }
        else {
            examination[cur_type]["questions"] = [];
        }
    }
    else {
        update();
    }
}

function onQuestionGet(jsonData) {
    var getType = jsonData['qtype'];
    //alert(getType+ " ** " +  JSON.stringify(jsonData));
    examination[getType]["questions"] = jsonData['questions'];
    recoverTypeAnswer(getType);
    update();
}

function recoverTypeAnswer(qtype) {
    if (answer_info) {
        var ans = answer_info[qtype]['re']
        if (ans) {
            examination[qtype]["answers"] = new Array(ans.length);
            for (var i in ans) {
                examination[qtype]["answers"][i] = {
                    "complete": ans[i]['c'],
                    "result": ans[i]['r'],
                    "answer": ans[i]['a']
                };
            }
        }
    }
}

function updateQuestion() {
    //alert(examination[cur_type].qlist[cur_idx]);
    if (examination[cur_type]["questions"][cur_idx] != undefined) {
        refreshQuestionFunc(examination[cur_type]["questions"][cur_idx]);
        if (examination[cur_type]["answers"] && examination[cur_type]["answers"][cur_idx]) {
            refreshAnswer(examination[cur_type]["answers"][cur_idx].answer, examination[cur_type]["questions"][cur_idx]);
        }
    }
    else {
        $('#q_description').html("本该题型没有题目，请选择其它题型继续！");
        $('#q_type_sheet').html("");
    }
}

function checkCurrentAnswer() {
    if (examination[cur_type] == undefined || examination[cur_type]["questions"] == undefined) {
        return;
    }

    if (examination[cur_type]["answers"] && examination[cur_type]["questions"][cur_idx]) {
        examination[cur_type]["answers"][cur_idx] = checkAnswerFunc(examination[cur_type]["questions"][cur_idx].key, examination[cur_type]["answers"][cur_idx]);
        saveAnswerInCookie();
    }
}

function refreshAnswer(answerString, question) {
    refreshAnswerFunc(answerString, question);
}


//----------------------------------------------------------------------------
function refreshAnswerFillInBlank(answerString) {
    var keyArray = answerString.split(KEY_SPLITER_SYMBOL)
    $('input[id^=blank_]').each(function (idx, elem) {
        $(elem).val(keyArray[idx]);
    });
}

function refreshAnswerTrueOrFalse(answerString) {
    if (answerString != undefined) {
        if (answerString) {
            $('#TF_Right').prop('checked', "checked");
        }
        else {
            $('#TF_Wrong').prop('checked', "checked");
        }
    }
}

function refreshAnswerChoice(answerString) {
    $('input[id^=id_option_]').each(function (idx, elem) {
        if (answerString == elem.value) {
            $(elem).prop('checked', 'checked');
            return false;
        }
    });
}

function refreshAnswerMultiChoice(answerString) {
    $('input[id^=id_option_]').each(function (idx, elem) {
        if (answerString.indexOf(elem.value) != -1) {
            $(elem).prop('checked', 'checked');
        }
    });
}

function refreshAnswerPair(answerString, question) {
    refreshAnswerSort(answerString, question);
}

function refreshAnswerSort(answerString, question) {
    var answer_list = answerString.split(KEY_SPLITER_SYMBOL);
    var option_list = question.options.split(OPTION_SPLITER_SYMBOL);

    $('label[id^=' + SORT_OP_ID + ']').each(function (index, elem) {
        $(elem).html(option_list[answer_list[index]]).data('opidx', answer_list[index]);
    });
}

function refreshAnswerVoice(answerString) {
    if (answerString.length > 0) {
        $("#voice_recorder").hide();
        var au = document.createElement('audio');

        au.controls = true;
        au.src = answerString;
        $('#voice_reviewer')[0].appendChild(au);
        $('#voice_reviewer')[0].appendChild($('<p>答案已经上传，不能修改。</p>')[0]);
    }
}

function refreshAnswerContract(answerString) {
    var keyArray = answerString.split(KEY_SPLITER_SYMBOL)
    $('input[id^=blank_]').each(function (idx, elem) {
        $(elem).val(keyArray[idx]);
    });
}

let sub_blob = null;
function checkVoice(keyString, result_obj) {
    var result_json = { 'complete': !is_recording };

    if (result_obj != undefined && result_obj['answer'] != '') {
        result_json['answer'] = result_obj['answer'];
    }
    else {
        result_json['answer'] = "";
        if (cur_voice_blob != null) {
            sub_blob = cur_voice_blob;
            var formData = new FormData();            
            formData.append("type", cur_type);
            formData.append("index", cur_idx);
            formData.append("voice", sub_blob);
            cur_voice_blob = null;
            $.ajax({
                url: $("#exam_form").data("voiceAnswerUrl"),
                type: 'post',
                data: formData,
                processData: false,
                contentType: false,
                success: onVoiceFileSubmitted,
            });
        }
    }
    result_json['result'] = 1;
    return result_json;
}

var VOICE_SUBMIT_HTML = '<p id="btn_voice_submit">继续考试或者提交试卷，答案将上传。</p>'; //'<button id="btn_voice_submit" onclick="voiceSubmit(event)" class="btn-round-sky" onfocus="this.blur()" tabindex="-1" >上传语音答案</button>';
function voiceRecEnd() {
    if ($("#btn_voice_submit")[0] == undefined || $("#btn_voice_submit")[0] == null) {
        $("#frame_recorder")[0].appendChild($(VOICE_SUBMIT_HTML)[0]);
    }
}

function onVoiceFileSubmitted(jsonData) {
    examination[jsonData['type']]["answers"][jsonData['index']]['answer'] = jsonData['fileName'];
}

function voiceSubmit(event) {
    checkCurrentAnswer();
}

//----------------------------------------------------------
function standardizeExam() {
    var final_answer = { "ts": 0 };
    var total_score = 0;

    for (var i in qType_list) {
        var current = examination[qType_list[i]];

        if (current) {
            var ar_result = new Array();
            var right_res = 0;

            for (var j in current.answers) {
                if (current.answers[j]) {
                    ar_result.push({
                        "c": current.answers[j].complete,
                        "r": current.answers[j].result,
                        "a": current.answers[j].answer
                    });
                    right_res += Number(current.answers[j].result);
                }
                else {
                    ar_result.push({ "c": false, "r": false, "a": '' });
                }
            }
            right_res = current.per_score * right_res;
            final_answer[qType_list[i]] = { "sc": right_res, "re": ar_result };
            total_score += right_res;
        }
    }
    final_answer.ts = total_score;

    return final_answer;
}

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return (arr[2]);
    else
        return null;
}

function recoverAnswerFromCookie() {
    var ansStr = getCookie('e_ans');
    if (ansStr && ansStr!='empty') {
        answer_info = $.parseJSON(ansStr);
        for (var i in qType_list) {
            recoverTypeAnswer(qType_list[i]);
        }
    }
}

function saveAnswerInCookie() {
    var result_JSON = JSON.stringify(standardizeExam());
    document.cookie = 'e_ans=' + result_JSON + ";path=cookieDir;expires=" + t_end.toString();
}

function saveStartTimeInCookie(sttime) {
    document.cookie = 'e_st=' + sttime + ";path=cookieDir;expires=" + t_end.toString();
}

function submitExam() {
    var result_dict = standardizeExam();
    var result_JSON = JSON.stringify(result_dict);

    $.ajax({
        url: '.',
        type: 'post',
        data: { "exam": result_JSON, "score": result_dict['ts'] },
        dataType: 'json',
        success: onSubmitSuccess
    });
}

function onSubmitClick(event) {
    checkCurrentAnswer();
    showModel();
}

function showModel() {
    $("#model_bg").show();
    $("#show_panel").show();
}

function hideModel() {
    $("#model_bg").hide();
    $("#show_panel").hide();
}

function onConfirmClick(event) {
    submitExam();
}

function onCancelClick(event) {
    hideModel();
}

function onSubmitSuccess(data) {
    $(location).attr('href', data['url']);
}