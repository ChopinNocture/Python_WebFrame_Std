//------------------------------------------------
// storyboard
function makeStorylineEdData(data) {
    var storyline_ed = {
        sl_data: data,
        cur_action: -1,
        cur_show: -1
    }
    return storyline_ed;
}

var newActionComponent = {
    props: ['action_types'],
    template: '<div><button>+</button>\
        <button v-for="iter in action_types">{{iter}}</button>\
    </div>',
}

Vue.component('panel-storyline', {
    data: function () {
        return {
            types:["空", "对话"]
        };
    },
    components: { "new-btn": newActionComponent },
    props: ['actions', ''],
    template: '<div class=panel-storyline>故事板{{actions}}\
        <component v-for="action in actions" v-bind:is="action.type_name"></component>\
        <new-btn v-bind:action_types=types>+</new-btn>\
    </div>'
})

Vue.component()

//------------------------------------------------
// actions
Vue.component('panel-action', {
    props: ['action'],
    template: '<div class=panel-action>行动编辑\
    <p>{{action}}</p>\
    </div>'
})

Vue.component('action', {
    data: function () {
        return {content:'action'};
    },
    template:'<h1>{{content}}</h1>'
})

Vue.component('action-sentence',{
    template:'<h1>sentence</h1>'
})

Vue.component('action-dialog', {})
Vue.component('action-decision', {})
Vue.component('action-game', {})

//------------------------------------------------
// shows
Vue.component('panel-show', {
    template: '<div class=panel-show>演出编辑\
    </div>'
})

Vue.component('show-scene',{})
Vue.component('show-avatar',{})
Vue.component('show-buble',{})