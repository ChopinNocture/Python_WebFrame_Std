class Show {
    constructor(){}
    start() {}
    onFinish() {}
}


class Action {
    constructor(action_data, next_action_func) {
        this.next_action_func = null;
        this.show_list = new Array();
        if (action_data && action_data.show_list) {
            for (const iterator of action_data.show_list) {
                this.show_list.push(iterator);
            }
        }
    }

    trigger_next(id_next) {
        this.finish();
        if(this.next_action) {
            this.next_action(id_next);
        }
    }

    start() {
        for (const iterator of this.show_list) {
            iterator.start();
        }
    }

    finish() {
        for (const iterator of this.show_list) {
            iterator.onFinish();
        }
    }
}


class StoryLine {
    constructor() {
    }

    generate_action(id) {
        var nextAction = new Action(this.get_actionData(id), this.nextAction);
        return nextAction;
    }

    get_actionData(id) {
        return {};
    }

    
    nextAction(id_next) {
        this.generate_action(id_next).start();
    }
}
