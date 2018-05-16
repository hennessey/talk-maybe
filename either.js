class Either {
    constructor(val) {
        this.value = val;
    }

    static of(val) {
        return new Right(val)
    }
}

class Left extends Either {
    get isLeft() {
        return true;
    }

    get isRight() {
        return false;
    }

    fmap(fn) {
        return this; //Ignore the fn and do nothing
    } 

    join() {
        return this; //Left is an error so there's nothing to join
    } 
    
    chain() {
        return this; //Left represents an error so there's nothing to join
    }
}

class Right extends Either {
    get isLeft() {
        return false;
    }

    get isRight() {
        return true;
    }

    fmap(fn) {
        return Either.Of(fn(this.value))
    }

    chain(mFn) {
        return mFn(this.value)
    }
}
