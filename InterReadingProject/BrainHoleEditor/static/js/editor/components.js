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
        addAction: function (type_name) {
            console.log(type_name);
            this.ed_data.sl_data.actions.push(newActionData(type_name))
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
    props: ['action', 'ed_data'],
    template: '#action-editor',
})

Vue.component('action', {
    props: ['action', 'ed_data', 'action_types'],
    template: '#id-action',
    computed: {
        display_name: function () {
            for (const iter of this.action_types) {
                if(iter.type_name == this.action.type_name)
                {
                    return iter.display_name;
                }
            }            
            return "";
        }        
    },
    methods: {
        remove: function () {
            console.log("---------------------");
            let arr = this.ed_data.sl_data.actions;
            let idx = arr.indexOf(this.action);
            if (idx != -1) {
                arr.splice(idx, 1);
            }
        },
    }
})

Vue.component('action-sentence', {
    props: ['action'],
    template: '#id-action-sentence',
    methods: {}
})

Vue.component('action-dialog', {
    props: ['action'],
    template: '#id-action-dialog',
})
Vue.component('action-decision', {
    props: ['action', 'ed_data'],
    template: '#id-action-decision',
})
Vue.component('action-game', {
    props: ['action', 'ed_data'],
    template: '#id-action-game',
})

//------------------------------------------------
// shows
Vue.component('panel-show', {
    template: '<div class=panel-show>演出编辑\
    </div>'
})

Vue.component('show-scene', {})
Vue.component('show-avatar', {})
Vue.component('show-buble', {})