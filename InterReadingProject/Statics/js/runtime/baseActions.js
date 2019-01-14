//import {Action} from './core';
var action_types = [
    {},
];

function SentenceActionData(data) {
    console.log(data);
    if(data) {
        data["avatar"] = "You";
        data["text"] = "--------------";
    }
}

class SentenceAction extends Action {
    constructor(action_data) {
        super(action_data);
        this.show_list.push(new BubbleShow());
        this.show_list.push(new AvatarShow());
    }
}


function DialogActionData(data) {
    if(data) {
        data["sent_list"] = [];
    }
}
class DialogAction extends Action {    
    constructor(action_data) {
        super(action_data);
        this.sentence_list = new Array();
    }
}


function DecisionActionData(data) {

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