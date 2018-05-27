var MAX_OPTION_NUMBER = 12;
var MIN_OP_N = 1;

var op_Label = $('<label id="">A: </label>');
var ID_LABEL = 'lb_option';

var op_text = $('<input type="text" form="Form_OptionEditor" id=""/>');
var ID_TEXT = 'text_option';

var op_keyRadio = $("<input type='radio' name='QuestionOption' id=''/>");
var ID_RADIO = 'radio_option';
//$("<p><button type='button' id='Btn_KeyAdd'>Add Option</button></p>")

var iOptionNumber = 4;


var op_addBtn = $('#Btn_OptionAdd');
var btn_Panel = $('#BtnLine');

op_addBtn.click(onAddOptionClick);
$('#Btn_OptionDelete').click(onDeleteOptionClick);


updateOptions();

alert(URL);

function updateOptions() {
    var opPanel = $("#OptionPanel");
    var opList = opPanel.find("p[id^=elem]");
    //alert(opList.length);
    var needNumber = Math.max(iOptionNumber, opList.length)

    for (var i = 0; i < needNumber; ++i) {
        if (i >= opList.length) {
            var optionLine = $("<p id=''></p>");
            optionLine.attr("id", "elem" + i);
            optionLine.append(op_Label.clone().attr("id", ID_LABEL + i));
            optionLine.append(op_text.clone().attr("id", ID_TEXT + i));
            optionLine.append(op_keyRadio.clone().attr("id", ID_RADIO + i));

            btn_Panel.before(optionLine);
        }
        if (i >= iOptionNumber) {
            opList[i].remove();
        }
    }
    //opPanel.append(op_addBtn);
}

function onAddOptionClick(event) {
    //alert(event.target.enable);
    ++iOptionNumber;
    iOptionNumber = Math.min(MAX_OPTION_NUMBER, iOptionNumber);
    updateOptions();
}

function onDeleteOptionClick(event) {
    --iOptionNumber;
    iOptionNumber = Math.max(MIN_OP_N, iOptionNumber);
    updateOptions();
}

function checkQuestion() {
    var ret = true;
    alert($('#id_description').val());
    ret = ret && ($('#id_description').val().length != 0);
    $('#id_sectionID').val("A");
    $('#id_flag').val(0x01);
    $('#id_star').val(3);

    //------------------check type
    $('#id_options').val('xuanze');
    $('#id_key').val(1);
    
    return ret;
}

function onSubmitCheck() {
    if (checkQuestion()) {
        alert("121212!");
        document.getElementById('Form_QuestionEditor').submit();
    }
    else {
        alert("!!!");
    }
}