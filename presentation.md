## Using Maybe to reduce branching in code

The goal of this talk is not to persuade anyone to use this pattern exclusively, but to introduce another way to refactor code that depends on heavily nested conditional logic. As with everything, there are tradeoffs and oftentimes conditional logic is the simplest way to convey a branch in code. 

### Different ways we can branch in Javascipt:
```javascript
    //If...Else statements
    let printName = function(name) {
        if (name) {
            console.log(name);
            return;
        } else {
            return;
        }
    }

    //Boolean '&&' expression short-ciruiting
    let printName = function(name) {
        //&& evaluates from left to right, returning false if the first expression returns a falsy value
        //and only evaluates the next expression if it's truthy.
        name && console.log(name); 
    }

    //Boolean '||' expression short-ciruiting (often used for assignment)
    const window = window || {};

    //Ternary expressions
    const window = window ? window : {};
    
```

### Some examples in code:
```javascript
    //Branching if a value is present in the DOM or not

    //getElementById :: string -> Element
    let getFromDOMById = function(id) {
        return document.getElementById(id);
    };

    //appendToElement :: Element -> string -> Element
    let setInnerHTML = function(element, string) {
        element.innerHTML = string;
        return element;
    };

    let updateElement = function() {
        var element = getFromDOMById('#someId');

        if (element) {
            setInnerHTML(element, "Hey FED Chapter");
        } else {
            return;
        }
    };

   //Branching on the presence of an object property 
    let tourPageContext = {
        tourCode: 'LPR',
        product: 'ETUS',
        year: 2019
    }    

    //... somewhere else in code
    let TourPageHeader = ({ tourPageContext }) => ({
        <header>
            // if tourPageContext.tourCode is undefined the expression is implicitly set to undefined as well
            <h1>{tourPageContext && tourPageContext.tourCode}</h1> 
        </header>
    });

```

Conditional logic (branching) is pervasive in imperative code and can lead to some sticky situations that make the code much more difficult to reason about when the conditions start piling up. Deeply nested conditions are a code smell that we all are familiar with and there are a variety of different strategies for reducing the need to do so. Here's one more!


```javascript
        app.post("user/:username", function(req, res)
        {
            if (req.username) {
                const user = _userResository.getByUserName(req.username);
                if (!_userResository.getByUserName(req.username)) {
                    if (req != null && req.roles != null) {
                        let newUser = _userRepository.add({ req.username, req.roles });
                        if (newUser) {
                            return res.status(200).send(newUser.id);
                        } else {
                            return res.status(500).send("Unable to create user.");
                        }
                    } else {
                        return res.status(400).send("User must be created with at least one role.");
                    }
                } else {
                    return res.status(400).send("User already exists.");
                }
            } else {
                return res.status(400).send("Username cannot be empty.");
            }
        });
```

Small Brain : Early returns / Fail fast handling
```javascript
        app.post("user/:username", function(req, res)
        {
            if (!req.username)
                return res.status(400).send("Username cannot be empty.");

            const user = _userResository.getByUserName(req.username);

            if (user)
                return res.status(400).send("User already exists.");

            if (req == null || req.roles == null)
                return res.status(400).send("User must be created with at least one role.");

            let newUser = _userRepository.add({ req.username, req.roles });

            if (newUser)
                return res.status(200).send(newUser.id);

            else
                return res.status(500).send("Unable to create user.");
        });
```

Large Brain : Maybe

Our "Maybe" context:
```javascript
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
    

    //"Bind" a function that returns a context and flattens it into this context and gives us a way
    //to chain functions together that return Maybes 
    //a.k.a. "FlatMap", "Chain"
    //chain :: (a -> Maybe b) -> Maybe a -> Maybe b
    bind(fn) {
        //Lifts the function into our context, calls it with our wrapped value(fmap) and then flattens it(join)
        return this.fmap(f).join();
    }
}
```

Nesting
```javascript
    app.post("user/:username", function(req, res)
    {
        if (req && req.username) {
            try {
                let user = _userRepository.getUser(username);
                
                if (user) {
                    return res.status(200).send(user);
                } else {
                    return res.status(404).send("Username not found");
                }
            } catch(e) {
                //log stuff 
                return res.status(500).send("Internal Server Error");
            }
        } else {
            return res.status(400).send("Bad request");
        }
    });
```

Early Return
```javascript
    app.post("user/:username", function(req, res)
    {
        if (!req || !req.username) return res.status(400).send("Bad request");

        try {
            let user = _userRepository.getUser(username);
            return (user) 
                ? res.status(200).send(user);
                : res.status(404).send("Username not found");
            
        } catch(e) {
            //log stuff 
            return res.status(500).send("Internal Server Error");
        }
    });
```

Using Either>
```javascript
    app.post("user/:username", function(req, res)
    {
        let req = Maybe.of(req)
            .map(req => Maybe.of(req.response))
            .orElse();

        if (!req || !req.username) return res.status(400).send("Bad request");

        try {
            let user = _userRepository.getUser(username);
            return (user) 
                ? res.status(200).send(user);
                : res.status(404).send("Username not found");
            
        } catch(e) {
            //log stuff 
            return res.status(500).send("Internal Server Error");
        }
    });
```
```javascript
    app.post("user/:username/roles", function(req, res)
    {
        let user = Maybe.of(req.username)
            .map(username => _userRepository.getByUserName(username))
            .map(user => _roleRepository.getRolesForUser(user))
            .getOrElse({status: 404, message: "Unable to get user"})

        return Maybe.
    });
```

Cosmic brain : Realizing the human beings are incapable of writing bug free code and throwing your laptop into the Charles
