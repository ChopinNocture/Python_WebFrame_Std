//------------------------------------------------
// storyboard
function makeStorylineEdData(data) {
    var storyline_ed = {
        sl_data: data,
        cur_action: null,
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
// 行动编辑
Vue.component('panel-action', {
    props: ['action'],
    template: '#action-editor',
})

//--------------------------------
// 分类编辑
Vue.component('ed-', {
    props: ['action'],
    template: '',
})

Vue.component('ed-sentence', {
    props: ['action'],
    template: '#ed-sentence',
})
Vue.component('ed-dialog', {
    props: ['action'],
    template: '#ed-dialog',
})
Vue.component('ed-decision', {
    props: ['action'],
    template: '#ed-decision',
})
Vue.component('ed-game', {
    props: ['action'],
    template: '#ed-game',
})

//------------------------------------------------
// 行动元素
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
            let arr = this.ed_data.sl_data.actions;
            let idx = arr.indexOf(this.action);
            if (idx != -1) {
                arr.splice(idx, 1);
            }
        },
        onSelected: function () {
            console.log("---------------------");
            this.ed_data.cur_action = this.action;
        }
    }
})

//------------------------------------------------
//--------------------------------
// 分类编辑
Vue.component('action-',{
    props: ['action'],
    template: "",
})

Vue.component('action-sentence', {
    props: ['action'],
    template: '#sl-sentence',
    methods: {}
})

Vue.component('action-dialog', {
    props: ['action'],
    template: '#sl-dialog',
})

Vue.component('action-decision', {
    props: ['action'],
    template: '#sl-decision',
})

Vue.component('action-game', {
    props: ['action'],
    template: '#sl-game',
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