class Maybe {
    constructor(val) {
        this.value = val;
    }

    //"lifts" a value into the Maybe context
    //a.k.a. "Return"
    //of :: a -> Maybe a
    static of(val) {
        //Wrap up a value in a new context
        return new Maybe(val);
    }

    isNothing() {
        this.value === null || this.value === undefined;
    }

    //"lifts" a function into a context ("functor map") and gives us a way to inject the value our context wraps into functions
    //a.k.a. "Map"
    //fmap :: (a -> b) -> Maybe a -> Maybe b
    fmap(fn) {
        //If our context is wrapping nothing, return a context wrapping nothing
        if (this.isNothing) return Maybe.of(null); 

        //Otherwise apply the function argument to our wrapped value and wrap it up in a new context
        return Maybe.of(fn(this.value));
    }

    //join :: Maybe Maybe a ->  Maybe a
    //"flattens" or "unwraps" our context by a layer
    join() {
        //If we're wrapping nothing, return a context wrapping nothing. Otherise return our value
        return this.isNothing() ? Maybe.of(null) : this.value;
    }

    //"Bind" a function that returns a context and flattens it into this context and gives us a way
    //to chain functions together that return Maybes 
    //a.k.a. "FlatMap", "Chain"
    //chain :: (a -> Maybe b) -> Maybe a -> Maybe b
    bind(fn) {
        //Lifts the function into our context, calls it with our wrapped value(fmap) and then flattens it(join)
        return this.fmap(f).join();
    }

    getOrElse(elseVal) {
        return this.isNothing() ? elseVal : this.value;
    }
}

module.exports = Maybe;