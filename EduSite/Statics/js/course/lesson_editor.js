$(document).ready(init);

function init() {
    csrf_Setup();
    // $('a[id^=NavBtn_]').click(onNavTypeClk);
    // $('a[id^=NavBtn_]').each(function (index, elem) {
    //     elem.innerHTML = TYPE_TRANS_LIST[elem.innerHTML];
    // });

    // $('#content_filer').on('hide.bs.collapse', function () {
    //     filterQList();
    // })
    
    // $('#content_filer').on('show.bs.collapse', function () {
    //     $('#filter_input').val("");
    // })

    // $('#NavBtn_' + question_type).click();
    // $('button[id^=course_]:first').click();
}

//=======================================================
// section Part
//=======================================================
function onSectionClick(event) {
    $('button[id^=course_]').removeClass('active');
    $(event.target).addClass('active');
    if (event.target.dataset.section != section_id) {

    //    section_id = event.target.dataset.section;
    //    doRefreshQList();
    }
    return true;
}