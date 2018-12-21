

new Vue({
    el: '#root',
    data: {
        message: 'strory!'
    }
});

var action = new Action();
action.trigger_next();


action.next = function name() { alert("hahaha");}
action.trigger_next();