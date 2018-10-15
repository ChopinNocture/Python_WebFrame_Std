//-------------- need include answer-comp.js file ---------------------
// section_title question_index question_count question_type

$(document).ready(onInit);


var qType_list = [];
var result_list = [];   // complete, result, answer
var qList_obj = null;
var cur_idx = -1;
var question_sum = 0;

function onInit(event) {  
    initRecorder();
    csrf_Setup();
    $('#btn_submit').click(onSubmitClk)
                    .mouseover(()=>{
                        $('#pen_icon').addClass('pen_finish').removeClass('pen_doing');
                    })
                    .mouseout(()=>{
                        $('#pen_icon').removeClass('pen_finish').addClass('pen_doing');
                    });

    $('#btn_next').click(onNextClk);
    $('#btn_Prev').click(onPrevClk);
    $('#btn_back_main').click(onBackMain);
    ajaxSubmitJson(document.getElementById('qlist_form'), onQuestionListGet, failFunc);
}

//----------------------------------------------------------------
function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    recorder = new Recorder(input);
}

function initRecorder() {
    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        window.URL = window.URL || window.webkitURL;
        
        audio_context = new AudioContext;
      } catch (e) {
        alert('No web audio support in this browser!');
      }
      
      navigator.mediaDevices.getUserMedia({audio: true}).then(startUserMedia).catch(function(e) {
        alert('No live audio input: ' + e);
      });
}

//----------------------------------------------------------------
function onSubmitClk(event) {
    checkAnswer();
}

function onNextClk(event) {
    var lastnextidx = cur_idx;
    cur_idx = Math.min(cur_idx + 1, question_sum - 1);
    if (lastnextidx != cur_idx) {
        update();
    }
    else {
        showFinalResult();
    }
}

function onPrevClk(event) {
    var lastnextidx = cur_idx;
    cur_idx = Math.max(cur_idx - 1, 0);
    if (lastnextidx != cur_idx) {
        update();
    }
}

function failFunc() {
    alert('失败');
}

var checkAnswerFunc;// = function(){ return {complete, result, answer}; };
function checkAnswer() {
    var result_json = checkAnswerFunc(qList_obj.qList[cur_idx].key);
    result_list[cur_idx] = result_json;
    //alert(cur_idx + '   ' + JSON.stringify(qList_obj.qList[cur_idx]) + '\n' + JSON.stringify(result_json));
    if( result_json.complete ) {
        showEffect(result_json.result); 
        updateStat();
        showKeyFunc(result_json, qList_obj.qList[cur_idx].key);
    }
    else{
        alert('提交之前请完成题目!');
    }
}

const LI_HTML = '<li><span class="gold-icon **"/></li>';

function updateStat() {
    var right_sum=0, wrong_sum = 0;
    var list_html = "";
    result_list.forEach(function(value,index,array) {
        var state_string = "";

        if (value['complete']) {
            if (value['result']) {
                ++right_sum;
                state_string = "succeed";
            } else {
                ++wrong_sum;
                state_string = "failed";
            }
        }
        else {
            state_string = "unfinished";
        }

        if (index == cur_idx) {
            state_string += " current";
        }

        list_html += LI_HTML.replace("**", state_string);
    });

    $('#progress_list').html(list_html);

    $('#stat_right').html(right_sum);
    $('#stat_wrong').html(wrong_sum);    
}

function showEffect(isCorrect) {
    $('#show_panel').show();
    var effectTime = 3;
    var finisheFunc = null;

    if(isCorrect) {
        $('#teacher').addClass('teacher-right');
        $('#effect_right').show().addClass("bg-scale-out");
        $('.icon-reward').addClass('win-effect');
        
        effectTime = 1.8;
        finisheFunc = ()=> {
            onNextClk();
        };
        $('#q_type_tips').html(QTYPE_TIPS_MAP["SUCCEED"]);
    }
    else {
        $('#teacher').addClass('teacher-wrong');
        effectTime = 1;
        $('#btn_submit').hide();
        $('#btn_next').show();
        $('#effect_wrong').show();
        $('#sheet_bg_in').addClass('effect-wrong');

        $('#q_type_tips').html(QTYPE_TIPS_MAP["ERROR"]);        
    }
    
    setTimeout(() => {
        $('.icon-reward').removeClass('win-effect');
        $('#effect_right').hide().removeClass('bg-scale-out');
        $('#effect_wrong').hide();
        $('#show_panel').hide();
        $('#sheet_bg_in').removeClass('effect-wrong');

        if(finisheFunc != null) {
            finisheFunc();
        }
        //$('#sheet_bg_out').removeClass('effect-wrong');
    }, effectTime * 1000);    
}

function onQuestionListGet(jsonData) {
    //alert('' + jsonData.qType_list.length + ' ' + jsonData.qList.length);
    qType_list = jsonData.qType_list;
    qList_obj = jsonData;
    
    question_sum = qList_obj.qList.length;    
    result_list = Array.apply(null, Array(question_sum)).map(() => {return {'complete':false};});
    
    cur_idx = 0;
    //updateStat();
    update();
}

function update() {    
    $('#teacher').removeClass('teacher-right').removeClass('teacher-wrong');
    if (qList_obj != null && qList_obj.qList != null) {
        $('#question_index').html(cur_idx + 1);

        if (cur_idx >= 0 && cur_idx < qList_obj.qList.length) {
            $('#btn_submit').show();
            $('#btn_next').hide();

            var qtype = qList_obj.qList[cur_idx].qType;
            $('#question_count').html('/' + qList_obj.qList.length);
            $('#question_type').html(TYPE_TRANS_LIST[qtype]);
            $('#q_type_tips').html(QTYPE_TIPS_MAP[qtype]);

            $('#q_type_sheet').empty();
            if (qType_list.indexOf(qtype) != -1) {
                // framework [set:check answer] and [refresh page]                
                eval('refresh' + qtype + '(qList_obj.qList[cur_idx])');
                // 设置check函数
                eval('checkAnswerFunc = check' + qtype);
                eval('showKeyFunc = showKey' + qtype);                
            }
            //
        }
    }
    updateStat();
}

//=======================================================
// tips part
//-----------
const QTYPE_TIPS_MAP = {
    "FillInBlank": "请把你的答案，输入在输入框中哦！回答完毕点“确定”",
    "TrueOrFalse": "上面的描述是“正确”还是“错误”呢，点相应按钮哦。回答完毕点“确定”",
    "Choice": "在上面的选项中选一个正确的，回答完毕点“确定”",
    "MultiChoice": "上面的选项会有至少一个正确，要全选出来哦。回答完毕点“确定”",
    "Pair": "拖拽右边的选项，来和左边选项的配对。",
    "Sort": "拖拽选项到正确的位置，进行顺序！",
    "CaseAnalyse": "案例与简答题",
    "Voice": "点击上面的录音按钮，并对着麦克风说出你的回答",
    "ERROR": "回答错误, 正确的答案是这样噢！",
    "SUCCEED": "恭喜你回答正确！"
}


//=======================================================
// key display part
//-----------
var FIB_KEY_HTML = '<font class="correct-text">**</font>';
function showKeyFillInBlank(result, keyObject) {
    var keyArray = keyObject.split(KEY_SPLITER_SYMBOL)
    $('input[id^=blank_]').each(function (idx, elem) {
        $(elem).attr("disabled", true).addClass(($(elem).val() == keyArray[idx]) ? 'correct' : 'wrong');
    });

    key_desc = qList_obj.qList[cur_idx].description.replace(FillInBlank_Key_Reg, function ($0, $1) {
        return FIB_KEY_HTML.replace("**", $1);;
    });

    $('#FIB-key-panel').html(key_desc);   
    //alert("xxx");
}

function showKeyTrueOrFalse(result, keyObject) {
    //alert("???????????");
    refreshOptionByResult($('#TF_Right'), keyObject, $('#span_r'));
    refreshOptionByResult($('#TF_Wrong'), !keyObject, $('#span_w'));    
}

function showKeyChoice(result, keyObject) {
    $('input[id^=id_option_]').each(function(idx, elem){
        refreshOptionByResult($(elem), keyObject == elem.value, $('#id_span_'+idx));
    });
}

function showKeyMultiChoice(result, keyObject) {
    $('input[id^=id_option_]').each(function(idx, elem){
        refreshOptionByResult($(elem), keyObject.indexOf(elem.value)!=-1, $('#id_span_'+idx));
    });
}

function showKeyPair(result, keyObject) {
    var key_list = keyObject.split(OPTION_SPLITER_SYMBOL);
    $('label[id^=' + SORT_OP_ID + ']').each(function (index, elem) {
        //alert('  0  ' + index + '  ' + this.dataset['opidx']);
        refreshSortByResult($(elem), (index == elem.dataset['opidx']), $('#id_span_'+index), key_list[index]);
    });
}

function showKeySort(result, keyObject) {
    var key_list = keyObject.split(OPTION_SPLITER_SYMBOL);

    $('label[id^=' + SORT_OP_ID + ']').each(function (index, elem) {
        //alert('  0  ' + index + '  ' + this.dataset['opidx']);
        refreshSortByResult($(elem), (index == elem.dataset['opidx']), $('#id_span_'+index), key_list[index]);
    });    
}

function refreshSortByResult(jq_elem, isKey, jq_icon, key_html) {
    var cssName = isKey ? 'checked-key': 'no-key';
    jq_elem.addClass(cssName);
    cssName = isKey ? 'checked-key': 'checked-no';
    jq_icon.addClass('icon-' + cssName);
    jq_elem.html(key_html).attr("draggable", false).addClass('option-item-disabled');
}

//-----------------------------------------------------
// 答案揭晓，更新选项框
function refreshOptionByResult(jq_elem, isKey, jq_icon) {
    jq_elem.attr("disabled", true);

    var cssName = jq_elem.prop('checked') ? 'checked' : 'no';
    cssName += '-';
    cssName += isKey ? 'key' : 'no';

    jq_elem.addClass(cssName);
    jq_icon.addClass('icon-' + cssName);
}

//-----------------------------------------------------
// 语音题目
function showKeyVoice(result, keyObject) {
    $('#q_type_sheet').html(VOICE_KEY_HTML.replace('***', keyObject));
    $("#au_key_voice").on('play', updateKeyController).on('ended', updateKeyController).on('pause', updateKeyController);
    $("#keyvoice_play").click(playKeyVoice);
    if(answer_audio!=undefined) {
        $('#answer_voice_key')[0].appendChild(answer_audio);
    }
    
    alert("showKeyVoice");
}

var VOICE_KEY_HTML = '<div id="voice_key_frame"><div id="answer_voice_key"></div><audio src="/uploaded/***" alt="音频文件，需要支持HTML5 的浏览器" id="au_key_voice">音频文件，需要支持HTML5 的浏览器</audio> \
                            <p>参考的回答是：</p> \
                            <div class="progress">\
                                <div id="keyvoice_progress" class="progress-bar progress-bar-striped bg-key" role="progressbar" style="width: 0%"></div>\
                            </div> \
                            <button id="keyvoice_play" class="keypaused" onfocus="this.blur()" tabindex="-1" /></div>';

var k_timer, k_duration_str;
function playKeyVoice() {
    var audio = $("#au_key_voice")[0];
    if(audio.paused) {
        audio.play();        
        k_timer = setInterval(updateKeyProgress, 20)
    }
    else{
        audio.pause();
        clearInterval(k_timer);
    }
}

function updateKeyProgress() {
    var audio = $("#au_key_voice")[0];
    var perNum = (audio.currentTime / audio.duration) * 100
    $("#keyvoice_progress").css("width", perNum.toString() + "%").html( formatTime(audio.currentTime) +" / " + duration_str );
}

function updateKeyController() {
    var audio = $("#au_key_voice")[0];
    duration_str = formatTime(audio.duration);
    if(audio.paused) {
        $("#keyvoice_play").removeClass("keyplaying").addClass("keypaused");
        $("#keyvoice_progress").removeClass("progress-bar-animated");
    }
    else {
        $("#keyvoice_play").addClass("keyplaying").removeClass("keypaused");
        $("#keyvoice_progress").addClass("progress-bar-animated");
    }
}

//-----------------------------------------------------
// 最后统计
function showFinalResult() {
    $('#btn_submit').hide();
    $('#btn_next').hide();

    $('#final_panel').show();
    
    right_sum = $('#stat_right').html();
    unlock_number = $('#final_panel').data("unlock");
    if( right_sum >= unlock_number ) {
        $.ajax({
            url: $('#btn_back_main').data('progurl'),
            type: 'post',
            data: { "progress":  $('#btn_back_main').data('progress') },
            dataType: 'json',
            success: SucFunc
        });
    }    
}

function onBreakClick(event) {
    showFinalResult();
}

function onBackMain(event) {
    $.ajax({
        url: $('#btn_back_main').data('url'),
        type: 'post',
        data: { "gold": $('#stat_right').html() },
        dataType: 'json',
        success: SucFunc
    });
    $(location).attr('href', $('#btn_back').attr('href') );
}

function SucFunc(){

}
