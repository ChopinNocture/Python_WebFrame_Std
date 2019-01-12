//import {Action} from './core';
var action_types = [
    {},
]

function newActionData(type_name) {
    return {
        type_name: type_name,
        show_list: []
    }
};

class SentenceAction extends Action {
    constructor(action_data) {
        super(action_data);
        this.show_list.push(new BubbleShow());
        this.show_list.push(new AvatarShow());
    }
}

class DialogAction extends Action {
    constructor(action_data) {
        super(action_data);
        this.sentence_list = new Array();
    }
}

class DecisionAction extends Action {
}

class GameAction extends Action {
}

//----------------------- Show -----------------------
class SceneShow extends Show {    
}

class AvatarShow extends Show {    
}

class BubbleShow extends Show {
}