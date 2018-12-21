class Action {
    constructor() {
        this.next = null;
    }

    trigger_next() {
        if(this.next) {
            this.next();
        }
    }
}


class StoryLine {
    constructor() {
    }
}