$(function () {
    $('[data-toggle="tooltip"]').tooltip();
})

function closeModal() {
    $('#btn_confirm').click(null);
    $('#btn_cancel').click(null);
    $('#modal_confirm').modal('hide');
}

function OpenModal(content, confirmFunc, cancelFunc=null) {
    $('#id_modal_content').html(content);
    $('#modal_confirm').modal('show');
    $('#btn_confirm').click(confirmFunc);
    $('#btn_cancel').click(cancelFunc);
}

function ShowInfo(info, delay = 1, closeFunc = null) {
    delay = Math.max(Math.min(10, delay), 1)

    if (closeFunc != null) {
        $('#info_window').on('hidden.bs.modal', closeFunc);
    }

    $('#info_window_content').html(info);
    $('#info_window').modal('show');

    setTimeout(() => {$('#info_window').modal('hide');}, delay * 1000);
}
