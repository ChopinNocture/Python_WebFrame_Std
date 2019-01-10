//------------------------------------------------
// storyboard
Vue.component('ed-storyline', {
    data: function () {
        return {
            actions:[{type:"ed-action"}],
        };
    },
    template: '<div>storyline\
        <component v-for="action in actions" v-bind:is="action.type"></component>\
    </div>'
})

//------------------------------------------------
// actions
Vue.component('ed-action', {
    data: function () {
        return {content:'action'};
    },
    template:'<h1>{{content}}</h1>'
})

Vue.component('ed-sentence',{
    data: function () {
        return 'action';
    }
})

Vue.component('ed-dialog',{})
Vue.component('ed-decision',{})
Vue.component('ed-game',{})

//------------------------------------------------
// shows
Vue.component('ed-scene-show',{})
Vue.component('ed-avatar-show',{})
Vue.component('ed-buble-show',{})