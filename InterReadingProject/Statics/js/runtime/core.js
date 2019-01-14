var storyline_data = {
    actions: []
};

var trigger_data = {};

class Trigger {
    constructor() {}
    start() {}
    onFinish() {}
}

function ActionData(data) {}
class Action {
    constructor() {
        this.next_action_func = null;
        this.trigger_list = new Array();
    }

    parse_data(action_data) {
        if (action_data && action_data.trigger_list) {
            for (const iterator of action_data.trigger_list) {
                this.trigger_list.push(iterator);
            }
        }
    }

    serialize() {
        return {};
    }

    set_next_func(next_func) {
        this.next_action_func = next_func;
    }

    trigger_next(id_next) {
        this.finish();
        if(this.next_action) {
            this.next_action(id_next);
        }
    }

    start() {
        for (const iterator of this.trigger_list) {
            iterator.start();
        }
    }

    finish() {
        for (const iterator of this.trigger_list) {
            iterator.onFinish();
        }
    }
}

var idMaker = function(){
     return -1;
}

function newActionData(type_name) {
    var newAction = {
        id: idMaker(),
        type_name: type_name,
        next_id: -1,
        trigger_list: []
    };
    eval(type_name + "ActionData(newAction)");    
    return newAction;
};

//----------------------------------------------------------------
class StoryLine {
    constructor() {
    }

    generate_action(id) {
        var nextAction = new Action();
        nextAction.parse_data(this.get_actionData(id));
        nextAction.set_next_func(this.nextAction);
        return nextAction;
    }

    get_actionData(id) {
        return {};
    }

    nextAction(id_next) {
        this.generate_action(id_next).start();
    }
}
