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
        this.trigger_list.push(new Bubbletrigger());
        this.trigger_list.push(new Avatartrigger());
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

function GameActionData(data) {

}
class GameAction extends Action {
}

//----------------------- trigger -----------------------
class SceneShow extends Trigger {    
}

class AvatarShow extends Trigger {    
}

class Bubble extends Trigger {
}