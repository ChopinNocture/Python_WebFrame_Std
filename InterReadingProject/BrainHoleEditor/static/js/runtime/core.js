class Show {
    constructor(){}
    start() {}
    onFinish() {}
}


class Action {
    constructor() {
        this.next_action_func = null;
        this.show_list = new Array();
    }

    parse_data(action_data) {
        if (action_data && action_data.show_list) {
            for (const iterator of action_data.show_list) {
                this.show_list.push(iterator);
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
