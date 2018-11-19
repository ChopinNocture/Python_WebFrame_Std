
//=======================================================
// key display part
//-----------
var FIB_KEY_HTML = '<font class="correct-text">**</font>';
function showKeyFillInBlank(result, keyObject) {
    var keyArray = keyObject.split(KEY_SPLITER_SYMBOL)
    $('input[id^=blank_]').each(function (idx, elem) {
        $(elem).attr("disabled", true).addClass(($(elem).val() == keyArray[idx]) ? 'correct' : 'wrong');
    });

    key_desc = result["qDesc"].replace(FillInBlank_Key_Reg, function ($0, $1) {
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
    if (answer_audio != undefined) {
        $('#answer_voice_key')[0].appendChild(answer_audio);
    }
}

var VOICE_KEY_HTML = '<div id="voice_key_frame"><div id="answer_voice_key"></div><audio src="/uploaded/***" alt="音频文件，需要支持HTML5 的浏览器" id="au_key_voice">音频文件，需要支持HTML5 的浏览器</audio> \
                            <p>参考的回答是：</p> \
                            <button id="keyvoice_play" class="keyvoice_play keypaused" onfocus="this.blur()" tabindex="-1" /> \
                            <div class="progress_frame"> \
                            <div class="progress">\
                                <div id="keyvoice_progress" class="progress-bar progress-bar-striped bg-key" role="progressbar" style="width: 0%"></div>\
                            </div> </div> </div>';

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
