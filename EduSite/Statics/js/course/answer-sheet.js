//-------------- need include answer-comp.js file ---------------------
// section_title question_index question_count question_type

$(document).ready(onInit);


var qType_list = [];
var result_list = [];   // complete, result, answer
var qList_obj = null;
var cur_idx = -1;
var question_sum = 0;

function onInit(event) {  
    csrf_Setup();
    initRecorder();
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

    onStartRecordingFunc = function() {
        $('#btn_submit').hide();
    }
    onStopRecordingFunc = function() {
        $('#btn_submit').show();
    }
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
        console.log('浏览器音频设备不可用！将无法完成语音题！');
    }
    
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(startUserMedia).catch(function (e) {
            alert('没有麦克风，语音题将无法完成！ ');
            console.log(e);
        });
    }
    else {
        alert('浏览器不支持录音设备，语音题将无法完成！');
    }
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
    result_json["qDesc"] = qList_obj.qList[cur_idx].description;
    //alert(cur_idx + '   ' + JSON.stringify(qList_obj.qList[cur_idx]) + '\n' + JSON.stringify(result_json));
    if( result_json.complete ) {
        showEffect(result_json.result, result_json["Voice"]); 
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

function showEffect(isCorrect, isVoice) {
    $('#show_panel').show();
    var effectTime = 3;
    var finisheFunc = null;

    if(isVoice) {
        $('#show_panel').hide();
        $('#btn_submit').hide();
        $('#btn_next').show();
        $('#q_type_tips').html(QTYPE_TIPS_MAP["VoiceRef"]);
    }
    else {
        if(isCorrect) {
            $('#teacher').addClass('teacher-right');
            $('#effect_right').show().addClass("bg-scale-out");
            $('.icon-reward').addClass('win-effect');
            
            effectTime = 1.8;
            finisheFunc = ()=> {
                onNextClk();
            };
            $('#q_type_tips').html(QTYPE_TIPS_MAP["SUCCEED"]);
            playUIAudio("GetStar.mp3");
        }
        else {
            $('#teacher').addClass('teacher-wrong');
            effectTime = 1;
            $('#btn_submit').hide();
            $('#btn_next').show();
            $('#effect_wrong').show();
            $('#sheet_bg_in').addClass('effect-wrong');

            $('#q_type_tips').html(QTYPE_TIPS_MAP["ERROR"]);        
            playUIAudio("bilose.mp3");
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
}

function onQuestionListGet(jsonData) {
    console.log('' + jsonData.qType_list.length + ' ' + jsonData.qList.length);
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
                updateSound();
                // 设置check函数
                eval('checkAnswerFunc = check' + qtype);
                eval('showKeyFunc = showKey' + qtype);                
            }
            //
            console.log("-----");
            
        }
    }
    updateStat();
}

function updateSound() {
    $("input").click(function(){
        playUIAudio('fenlei.mp3');
    });
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
    "SUCCEED": "恭喜你回答正确！",
    "VoiceRef": "点击按钮听参考答案！"
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
    playUIAudio("luckygift.mp3");
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

//--------------------------------------------------
//-------------- check --------------
function checkVoice() { 
    var result_json = { 'complete': !is_recording };

    result_json['answer'] = "";
    result_json['result'] = true;
    result_json["Voice"] = true;
    return result_json;
}