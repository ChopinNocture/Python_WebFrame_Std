class Show {
    constructor(){}
    show(){}
}


class Action {
    constructor(action_data, next_action_func) {
        this.next_action = null;
        this.show_list = new Array();
        if (action_data && action_data.show_list) {
            for (const iterator of action_data.show_list) {
                this.show_list.push(iterator);
            }
        }
    }

    trigger_next(id_next) {
        if(this.next_action) {
            this.next_action(id_next);
        }
    }

    run() {
        for (const iterator of action_data.show_list) {
            iterator.show();
        }
    }
}


class StoryLine {
    constructor() {
    }

    nextAction(id_next) {
        generate_action(id_next).run();
    }

    generate_action(id) {
        var nextAction = new Action(this.nextAction);
    }
}