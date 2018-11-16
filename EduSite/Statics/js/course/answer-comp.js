
//=======================================================
// FillInBlank TrueOrFalse Choice MultiChoice Pair Sort
//=======================================================
//-------------------------------------------------------
// Question type: FillInBlank
//-------------------------------------------------------
//---- refresh ----
var BLANK_HTML = '<input type="text" class="blank-input" id="blank_**" placeholder=""></input>';

var fill_desc = "";

var blank_key_list = [];

function refreshFillInBlank(question) {
    blank_key_list = [];
    var i=0;

    fill_desc = question.description.replace(FillInBlank_Key_Reg, function ($0, $1) {
        blank_key_list.push($1);
        //blank_key_list
        var htmltext = BLANK_HTML.replace("**", i.toString());
        ++i;
        return htmltext;
    });

    $('#q_description').html(fill_desc);

    html_str = '<div id="FIB-key-panel"></div>';
    $('#q_type_sheet').html(html_str);
}

function checkFillInBlank(key_str) {
    var result_json = { 'complete': false };
    var blank_num = -1;
    var answer_str = $('input[id^=blank_]').map(function () { ++blank_num; return $(this).val(); }).get().join(KEY_SPLITER_SYMBOL);

    result_json.complete = (answer_str.length>blank_num);

    result_json['answer'] = answer_str;
    result_json['result'] = (answer_str == key_str);

    return result_json;
}

//-------------------------------------------------------
// Question type: TrueOrFalse
//-------------------------------------------------------
function refreshTrueOrFalse(question) {
    $('#q_description').html(question.description);
    var html_str = '';
    // html_str += '<input type="radio" name="TF_Answer" id="TF_Right" value="Right"/><label>Right</label>';
    // html_str += '<input type="radio" name="TF_Answer" id="TF_Wrong" value="Wrong"/><label>Wrong</label>';

    html_str = '<div class="option-group">\
                    <span id="span_r"/><input type="radio" name="inlineRadioOptions" id="TF_Right" value="Right"/>\
                    <label for="TF_Right" class="full-line">正 确</label>\
                </div>\
                <div class="option-group">\
                    <span id="span_w"/><input type="radio" name="inlineRadioOptions" id="TF_Wrong" value="Wrong"/>\
                    <label for="TF_Wrong" class="full-line">错 误</label> </div>';

    $('#q_type_sheet').html(html_str);
}

function checkTrueOrFalse(key_bool) {
    var result_json = { 'complete': false }

    result_json.complete = $('#TF_Right').prop('checked') || $('#TF_Wrong').prop('checked');
    if(result_json.complete) {
        result_json['answer'] = $('#TF_Right').prop('checked');
        result_json['result'] = (key_bool == result_json['answer']);
    }   

    return result_json;
}

//-------------------------------------------------------
// Question type: Choice MultiChoice
//-------------------------------------------------------
//---- refresh ----
var OPTION_HTML = '<div class="option-group">\
                        <span id="id_span_cc"/>\
                        <input type="$$" name="QuestionOptions" id="id_option_cc" value="cc">\
                        <label class="full-line" for="id_option_cc">##</label>\
                    </div>';

function generateOptions(question, CheckOrRadio = 'radio') {
    var html_str = '';
    var option_list = question.options.split(OPTION_SPLITER_SYMBOL);

    for (var i = 0; i < option_list.length; ++i) {
        html_str += OPTION_HTML.replace('$$', CheckOrRadio)
            .replace('cc', i).replace('cc', i).replace('cc', i).replace('cc', i)
            .replace('##', getOptionLabelChar(i) + " " + option_list[i]);
    }
    return html_str;
}

function refreshChoice(question) {
    $('#q_description').html(question.description);
    $('#q_type_sheet').html(generateOptions(question));
}

function refreshMultiChoice(question) {
    $('#q_description').html(question.description);
    $('#q_type_sheet').html(generateOptions(question, 'checkbox'));
}

//---- check ----
function chk_Opt(key_str, key_type) {
    var result_json = { 'complete': false };
    var answer_str = $('input:' + key_type + ':checked').map(function () { return $(this).val(); }).get().join(KEY_SPLITER_SYMBOL);

    result_json.complete = (answer_str.length>0);
    result_json['answer'] = answer_str;
    result_json['result'] = (answer_str == key_str);

    return result_json;
}

function checkChoice(key_str) {
    return chk_Opt(key_str, 'radio');
}

function checkMultiChoice(key_str) {
    return chk_Opt(key_str, 'checkbox');
}

//-------------------------------------------------------
// Question type: Pair
//-------------------------------------------------------
var id_replace_reg = new RegExp( 'cc' , "g" );

var PAIR_OPTION_HTML = '<div class="pair-line option-group" id="id_option_cc">\
                            <span id="id_span_cc"></span>\
                            <label class="option-item pair-left" id="pair_l_cc">##</label>\
                            <label class="option-item pair-right" ondragenter="dragenter(event)" ondragleave="dragleave(event)" dropzone="move" ondrop="drop(event)" ondragover="allowDrop(event)" draggable="true" ondragstart="drag(event)" id="sort_item_cc" data-sortid="cc" data-opidx="~~">$$</label>\
                        </div>';

function swapData(curidx, taridx) {
    var curhtml = $('#sort_item_' + curidx).html();
    var curdata = $('#sort_item_' + curidx).get(0).dataset['opidx'];
    
    var tarhtml = $('#sort_item_' + taridx).html();
    var tardata = $('#sort_item_' + taridx).get(0).dataset['opidx'];   

    $('#sort_item_' + curidx).html(tarhtml);
    $('#sort_item_' + curidx).get(0).dataset['opidx'] = tardata;
    $('#sort_item_' + taridx).html(curhtml).get(0).dataset['opidx'] = curdata;
}

function onUpClick(event) {
    var curidx = parseInt(event.target.dataset['sortid']);
    swapData(curidx, curidx-1);
}
         
function onDownClick(event) {
    var curidx = parseInt(event.target.dataset['sortid']);    
    swapData(curidx, curidx+1);
}

function refreshPair(question) {
    $('#q_description').html(question.description);
    question['key'] = question.rightOptions;

    var option_list_l = question.leftOptions.split(OPTION_SPLITER_SYMBOL);
    var option_list_r = question.rightOptions.split(OPTION_SPLITER_SYMBOL);

    var shuffled_op = tool_shuffle_list(option_list_r.length);
    
    var html_str = '';
    for (var i = 0; i < shuffled_op.length; ++i) {
        html_str += PAIR_OPTION_HTML.replace(id_replace_reg, i)
                                    .replace('##', option_list_l[i])
                                    .replace('$$', option_list_r[shuffled_op[i]])
                                    .replace('~~', shuffled_op[i]);
    }
    $('#q_type_sheet').html(html_str);
    $('#up_0').css('visibility','hidden');
    $('#down_'+(option_list_r.length-1)).css('visibility','hidden');    
}

function checkPair(key_str) { 
    return checkSort(key_str);
}
//-------------------------------------------------------
// Question type: Sort
//-------------------------------------------------------

var SORTABLE_OPTION_HTML = '<div class="option-group" id="id_option_cc" dropzone="move" ondrop="drop(event)" ondragover="allowDrop(event)" data-sortid="cc">\
                                <span id="id_span_cc"></span>\
                                <label class="option-item full-line" draggable="true" ondragstart="drag(event)" ondragenter="dragenter(event)" ondragleave="dragleave(event)" id="sort_item_cc" data-sortid="cc" data-opidx="~~"> \
                                        ##\
                                </label>\
                            </div>';

function dragenter(event) {
    $(event.target).addClass('dropable');
}

function dragleave(event) {
    $(event.target).removeClass('dropable');
}

function drag(event) {
    if(event.target.dataset['sortid']==null) return false;
    event.dataTransfer.setData('sortid', event.target.dataset['sortid']);// parentNode.id);
    event.dataTransfer.effectAllowed = 'copy'; 
}

function drop(event) {    
    event.preventDefault();
    $(event.target).removeClass('dropable');
    if(event.target.dataset['sortid']== null) return false;
    //alert(event.target);
    var id = event.dataTransfer.getData("sortid");

    if(id==''||id==null) return false;

    swapData(id, event.target.dataset['sortid']);
}

function allowDrop(event){
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    return false;
}

var SORT_OP_ID = 'sort_item_';

function refreshSort(question) {
    $('#q_description').html(question.description);
    question['key'] = question.options;

    var option_list = question.options.split(OPTION_SPLITER_SYMBOL);    
    var shuffled_op = tool_shuffle_list(option_list.length);
    
    var html_str = '';
    for (var i = 0; i < shuffled_op.length; ++i) {
        html_str += SORTABLE_OPTION_HTML.replace(id_replace_reg, i)
                                        .replace('##', option_list[shuffled_op[i]])
                                        .replace('~~', shuffled_op[i]);
    }
    $('#q_type_sheet').html(html_str);
    //alert(shuffled_op);
}

function checkSort(key_str) { 
    //alert("hgaha");
    var suc = true;
    $('label[id^=' + SORT_OP_ID + ']').each(function (index) {
        //alert('  0  ' + index + '  ' + this.dataset['opidx']);
        suc = (index == this.dataset['opidx']);
        return suc;
    });

    var result_json = { 'complete': true };
    var idx = 0;
    var anse_str="";
    while( $("#" + SORT_OP_ID + idx.toString())[0]!=undefined) {
        anse_str = anse_str + $("#" + SORT_OP_ID + idx.toString()).data('opidx') + KEY_SPLITER_SYMBOL;
        ++idx;
    }
    anse_str = anse_str.substring(0, anse_str.length-KEY_SPLITER_SYMBOL.length );
    result_json['answer'] = anse_str;//$('label[id^=' + SORT_OP_ID + ']').map(function(){ return this.dataset['opidx'];}).get().join(KEY_SPLITER_SYMBOL);
    result_json['result'] = suc;

    return result_json;
}

//-------------------------------------------------------
// Question type: Voice
//-------------------------------------------------------
//-------------- refresh --------------
function refreshVoice(question) {    
    is_recording = false;
    $('#q_description').html(question.description 
                            + VOICE_CONTROL_HTML.replace('***', question.qVoice ) );
    $('#q_type_sheet').html(VOICE_ANSWER_HTML);
    $("#au_q_voice").on('play', updateController).on('ended', updateController).on('pause', updateController);
    $("#qvoice_play").click(playQVoice);
}

//-------------- question player --------------
var file_tester = /audio\/\w/;
var VOICE_CONTROL_HTML = '<br><audio src="/uploaded/***" alt="音频文件，需要支持HTML5 的浏览器" id="au_q_voice">音频文件，需要支持HTML5 的浏览器</audio> \
                            <button id="qvoice_play" class="qvoice_play paused" onfocus="this.blur()" tabindex="-1" /> \
                            <div class="progress_frame"> \
                            <div class="progress">\
                                <div id="qvoice_progress" class="progress-bar progress-bar-striped bg-danger" role="progressbar" style="width: 0%"></div>\
                            </div></div>';

var timer, duration_str;
function playQVoice() {
    var audio = $("#au_q_voice")[0];
    if(audio.paused) {
        audio.play();        
        timer = setInterval(updateProgress, 20)
    }
    else{
        audio.pause();
        clearInterval(timer);
    }
}

function updateProgress() {
    var audio = $("#au_q_voice")[0];
    if(audio==undefined || audio==null ) {
        clearInterval(timer);
        return;
    }
    else {
        var perNum = (audio.currentTime / audio.duration) * 100
        $("#qvoice_progress").css("width", perNum.toString() + "%").html( formatTime(audio.currentTime) +" / " + duration_str );
    }
}

function updateController() {
    var audio = $("#au_q_voice")[0];
    duration_str = formatTime(audio.duration);
    if(audio.paused) {
        $("#qvoice_play").removeClass("playing").addClass("paused");
        $("#qvoice_progress").removeClass("progress-bar-animated");
    }
    else {
        $("#qvoice_play").addClass("playing").removeClass("paused");
        $("#qvoice_progress").addClass("progress-bar-animated");
    }
}

//-------------- answer recorder --------------
var VOICE_ANSWER_HTML = '<div id="frame_recorder">\
                        <button id="voice_recorder" class="voice_recorder" onfocus="this.blur()" onclick="onToggleRecord(this);" tabindex="-1" /> \
                        <div id="voice_reviewer"></div>\
                    </div>';
var recorder, audio_context;
var is_recording = false;
var maxTime = 60, rtime = 0;
var re_timer;
var answer_audio;
function onToggleRecord(button) {
    if(is_recording) {
        stopRecording();
    }
    else {
        startRecording();
    }
}

var onStartRecordingFunc, onStopRecordingFunc;

function startRecording() {
    if (recorder != undefined) {
        if(onStartRecordingFunc) {
            onStartRecordingFunc();
        }        
        is_recording = true;
        $("#voice_recorder").addClass("recording");
        recorder.clear();
        recorder && recorder.record();
        rtime = 0;
        re_timer = setInterval(updateRecordTime, 1000);
    }
}

function updateRecordTime() {
    rtime = rtime + 1;
    $('#voice_reviewer').html("" + rtime + "秒/" + maxTime + "秒");
    if( rtime>= maxTime ) {
        stopRecording();
    }    
}

function stopRecording() {
    if (is_recording) {   
        clearInterval(re_timer);
        is_recording = false;
        $("#voice_recorder").removeClass("recording");
        
        recorder && recorder.stop();
        // create WAV download link using audio data blob
        $('#voice_reviewer').html("");
        createReviewer();
        recorder.clear();
    }
}

var cur_voice_blob = null;
function createReviewer() {
    recorder && recorder.exportWAV(function (blob) {
        cur_voice_blob = blob;
        var url = URL.createObjectURL(blob);
        var au = document.createElement('audio');

        au.controls = true;
        au.src = url;
        $('#voice_reviewer')[0].appendChild(au);
        answer_audio = au;
        if(onStopRecordingFunc) {
            onStopRecordingFunc();
        }
    });
}


//-------------------------------------------------------
// Question type: CaseAnalyse
//-------------------------------------------------------
function refreshCaseAnalyse(question) {
    $('#q_description').html(question.description);
    var html_str = '';
    // html_str += '<input type="radio" name="TF_Answer" id="TF_Right" value="Right"/><label>Right</label>';
    // html_str += '<input type="radio" name="TF_Answer" id="TF_Wrong" value="Wrong"/><label>Wrong</label>';

    html_str = '';

    $('#q_type_sheet').html(html_str);
}

function checkCaseAnalyse(key_bool) {
    var result_json = { 'complete': false }

    result_json.complete = false;
    if(result_json.complete) {
        result_json['answer'] = $('#TF_Right').prop('checked');
        result_json['result'] = (key_bool == result_json['answer']);
    }   

    return result_json;
}