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
    template: "#newAction-btn",
    props: ['action_types', 'ed_data'],
    methods: {
        addAction: function (action_info) {
            console.log(action_info);
            this.ed_data.sl_data.actions.push(newActionData(action_info.type_name))
        }
    },
}

Vue.component('panel-storyline', {
    template: '#panel-storyline',
    components: { "newAction-btn": newActionComponent },
    props: { ed_data: Object, action_types: Array },
})

//------------------------------------------------
// actions
Vue.component('panel-action', {
    props: ['action'],
    template: '#action-elem'
})

Vue.component('action-', {
    data: function () {
        return {content:'action'};
    },
    template:'<h1>{{content}}</h1>'
})

Vue.component('action-sentence',{
    template:'<h1>单句</h1>'
})

Vue.component('action-dialog', {
    template:'<h1>对话</h1>'
})
Vue.component('action-decision', {
    template:'<h1>决策</h1>'
})
Vue.component('action-game', {
    template:'<h1>游戏</h1>'
})

//------------------------------------------------
// shows
Vue.component('panel-show', {
    template: '<div class=panel-show>演出编辑\
    </div>'
})

Vue.component('show-scene',{})
Vue.component('show-avatar',{})
Vue.component('show-buble',{})