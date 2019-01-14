// import {StoryLine} from './runtime/core';


var action_types = [
    { display_name: "空", type_name: "" },
    { display_name: "单句", type_name: "Sentence" },
    { display_name: "对话", type_name: "Dialog" },
    { display_name: "决策", type_name: "Decision" },
    { display_name: "游戏", type_name: "Game" },
]

var storyline_editor = new Vue({
    el: '#id_editor',
    data: function () {
        return {
            ed_data : makeStorylineEdData(storyline_data),
            action_types : action_types
        };
    }
});

var previewer = new Vue({
    el: '#id_previewer',
    data: function () {
        return { testData: storyline_editor.ed_data };
    }
});

// var story = new StoryLine();

// story.nextAction();
// console.log(storyline_editor);
// storyline_editor.actions.push({type:"ed-sentence"})
