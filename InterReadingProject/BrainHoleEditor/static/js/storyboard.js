// import {StoryLine} from './runtime/core';




var storyline_editor = new Vue({
    el: '#id_editor',
    data: function () {
        return makeStorylineEdData(storyline_data);
    }
});


storyline_editor.sl_data.actions.push({type_name:"action-sentence"})

storyline_editor.cur_action = -1;



// var story = new StoryLine();

// story.nextAction();
// console.log(storyline_editor);
// storyline_editor.actions.push({type:"ed-sentence"})
