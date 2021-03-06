## Using Maybe to reduce branching in code

The goal of this talk is not to persuade anyone to use this pattern
exclusively, but to introduce another way to refactor code that depends on
heavily nested conditional logic for null checks. As with everything, there are
tradeoffs and most of the time imperative conditional logic is the simplest way
to convey a branch in code. 

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
    //Boolean '&&' expression short-ciruiting let printName = function(name) {
    //&& evaluates from left to right, returning false if the first expression
    returns a falsy value //and only evaluates the next expression if it's
    truthy.  name && console.log(name); }

    //Boolean '||' expression short-ciruiting (often used for assignment) const
    window = window || {};

    //Ternary expressions const window = window ? window : {};
    
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
  let TourPageHeader = ({ tourPageContext }) =>
    <header> 
      <h1>{tourPageContext && tourPageContext.tourCode}</h1> 
    </header> 
```

Conditional logic (branching) is pervasive in imperative code and can lead to
some sticky situations that make the code much more difficult to reason about
when the conditions start piling up. Deeply nested conditions are a code smell
that we all are familiar with and there are a variety of different strategies
for reducing the need to do so. Here's one more!

Nesting 
```javascript 
  let makeLoud = (str) => str.toUpperCase(); 

  let yell = (str) => `${str}!`;

  let yellToTheRooftops = (str) => { 
    if (str) { 
      return yell(makeItLoud(str));
    } else { 
      return undefined; 
    } 
  }

  yellToTheRoofTops("It's gucci"); // -> "IT'S GUCCI!" 
```

In 99.99999999% of cases, using early returns should be sufficient. Even in
this contrived example this is a lot easier to reason about in a linear way:
```javascript 
  let makeLoud = (str) => str.toUpperCase(); 

  let yell = (str) => `${str}!`;

  let yellToTheRooftops = (str) => { 
    if (!str) return undefined;

    return yell(makeItLoud(str)); 
  }

  yellToTheRoofTops("It's Gucci"); // -> "IT'S GUCCI!" 
```

But what if decided that null checking was for the birds and decided that we
didn't want to do any more?  We would need some way to encapsulate the concept
of a null check pipeline.

One way to accomplish this would be to use a promise like so:

```javascript 
  let makeLoud = (str) => str.toUpperCase(); 
  let yell = (str) => `${str}!`;

  let maybePromise = (str) => 
    new Promise((resolve, reject) => { 
      if (!str) reject("Nothing");

      resolve(str); 
    });

  async function YellToTheRooftops(str) { 
    return maybePromise(str) //wrap up the 'str' value into our Promise context 
      .then(s => makeLoud(s)) // the supplied callback to "then" will only get called if the previous promise resolved 
      .then(s => yell(s)) // ditto 
      .catch(e => e)  // only called if any of the promises in the chain threw or were exlicitly rejected 
    }

  async function demoYell(str) { 
    let y = await YellToTheRooftops(str);

    console.log(y);

    return undefined; 
  }

  demoYell("it's gucci") // -> IT'S GUCCI 
  demoYell(undefined) // Nothing :( 
```

The above will work, but it feels kind of wrong to force something synchronous
into a language construct meant for asynchronous actions and having to update
all of our calling code to ``await`` it. What if we could create a wrapper that
did basically the same thing synchronously?

Using our new hypothetical `Maybe` object 
```javascript 
  let makeLoud = (str) => str.toUpper(); 

  let yell = (str) => `${str}!`;

  let yellToTheRooftops = (str) => 
    Maybe.of(str)    // wrap up the 'str' value in our Maybe context 
      .map(makeLoud) // the supplied callback to map will only get called if str is not null/undefined 
      .map(yell) 
      .getOrElse(undefined); //return the value, if not returned the supplied value

    yellToTheRoofTops("It's Gucci"); // -> "IT'S GUCCI!"
    yellToTheRoofTops(undefined); // -> undefined 
```

This looks a lot like a promise! For all intents and purposes promises can be
though of as monads with some extra runtime specific behavior (added to the
event queue and executed once the main thread is available) You can think of a
monad as a functional way to chain computations. Let's see how we can chain a
null check.

Our "Maybe" context:

```javascript 
  class Maybe { 
    constructor(val) { 
      this.value = val; 
    }

    // "lifts" a value into the Maybe context 
    // a.k.a. "Return" 
    // of :: a -> Maybe a 
    static of(val) { //Wrap up a value in a new context return new
      return Maybe(val); 
    }

    get isNothing() { 
      return this.value === null || this.value === undefined; 
    }

    //"lifts" a function into a context ("functor map") and gives us a way to inject the value our context wraps into functions 
    //a.k.a. "fmap" 
    //map :: (a -> b) -> Maybe a -> Maybe b 
    map(fn) { 
      //If our context is wrapping nothing, return a context wrapping nothing 
      if (this.isNothing) return Maybe.of(null); 

      //Otherwise apply the function argument to our wrapped value and wrap it up in a new context 
      return Maybe.of(fn(this.value)); 
    }

    //join :: Maybe Maybe a ->  Maybe a 
    //"flattens" or "unwraps" our context by a layer 
    join() { 
      //If we're wrapping nothing, return a context wrapping nothing. Otherise return our value 
      return this.isNothing ? Maybe.of(null) : this.value; 
    }
      

    //"Chain" a function that returns a context and flattens it into this context and gives us a way 
    //to chain functions together that return Maybes
    //a.k.a. "FlatMap", "Chain" 
    //chain :: (a -> Maybe b) -> Maybe a -> Maybe b
    chain(fn) { 
      //Lifts the function into our context, calls it with our wrapped value(fmap) and then flattens it(join) 
      return this.map(f).join(); 
    }

    getOrElse(elseVal) { 
      return this.isNothing ? elseVal : this.value; 
    } 
  } 
```

So `Maybe` is designed for handling cases where we either have a value
(`Just(value)`) or we don't (`Nothing`). What if we wanted to handle not just
nulls, but different errors as well?

Consider the following hypothetical code Nesting 
```javascript
  app.get("user/:username", function(req, res) { 
    if (req && req.username) { 
      try {
        let user = _userRepository.getUser(username);
                
        if (user) { return res.status(200).send(user); 
      } else { 
        return res.status(404).send("Username not found"); } } catch(e) {
                //log stuff return res.status(500).send("Internal Server
                Error"); } } else { return res.status(400).send("Bad request");
                } }); ```

As with before, early returns make this 99.999999999% more readable:
```javascript app.post("user/:username", function(req, res) { if (!req ||
!req.username) return res.status(400).send("Bad request");

        try { let user = _userRepository.getUser(username); return (user) 
                ? res.status(200).send(user);
                : res.status(404).send("Username not found");
            
        } catch(e) { //log stuff return res.status(500).send("Internal Server
        Error"); } }); ```

What if we could write some sort of container like `Maybe` that instead of just
handling cases where a value was `null` or `undefined` it took care of
sitations where something returned and error?  ```javascript

    //safeGetFromRequest :: request -> property -> Either Error Username const
    safeGetFromRequest = (property) => (req) =>
    Maybe.of(req[property]).toEither({message: 'Bad request', code: 400})

    //safeGetFromUserName :: request -> Either Error Username const
    safeGetUserName = safeGetFromRequest('username');
    
    //getUserFromRepo :: Username -> Either Error User const getUserFromRepo =
    (userName) => { try { return Maybe.of(_userRepository.getUser(userName))
    .toEither({ message:'User not found', code: 404 }) } catch (e) { return
    Either.left({ message: 'Internal Server Error', code: 500 }); } }

    app.post("user/:username", function(req, res) { return safeGetUserName(req)
    .flatMap(username => getUserFromRepo(userName)) .cata( (failure) =>
    res.status(failure.code).message(failure.message), (user) =>
    res.status(200).message(user)); }); ```

```javascript let makeLoud = (str) => str.toUpperCase(); let yell = (str) =>
`${str}!`;

    let yellToTheRooftops = (str) => { if (str) { return yell(makeItLoud(str));
    } else { return undefined; } }

    yellToTheRoofTops(""); // "" ```

Early return ```javascript let makeLoud = (str) => str.toUpperCase(); let yell
= (str) => `${str}!`;

    let yellToTheRooftops = (str) => { if (!str) return undefined;

        return yell(makeItLoud(str)); }

    yellToTheRoofTops(""); // "" ```

Maybe monad ```javascript let makeLoud = (str) => str.toUpperCase(); let yell =
(str) => `${str}!`;

    let yellToTheRooftops = (str) => Maybe.of(str) //wrap up the 'str' value in
    our Maybe context .map(makeLoud) // the supplied callback to map will only
    get called if str is not null/undefined .map(yell) .getOrElse(undefined)
    //return the value, if not returned the supplied value

    yellToTheRoofTops(""); // "" ```

This looks alot like a promise! For all intents and purposes promises can be
though of as monads with some extra runtime specific behavior (added to the
event queue and executed once the main thread is available) ```javascript let
makeLoud = (str) => str.toUpperCase(); let yell = (str) => `${str}!`;

    async function YellToTheRooftops(str) { Promise.resolve(str) //wrap up the
    'str' value into a Promise context .then(makeLoud) // the supplied callback
    to then will only get called if the previous promise resolved .then(yell)
    // ditto .catch(/*handle*/)  // only called if any of the promises in the
    chain threw or were exlicitly rejected }

    await YellToTheRoofTops(""); // "" ```

It might be helpful to think of monads as special, synchronous promises, that
is, a chain of computations to be executed in a context. For a promise, this
means a chain of operations to call when a particular promise is resolved or
rejected. For Maybe it means a chain of operations to call when a particlar
value is not null/undefined

Early Return ```javascript app.post("user/:username", function(req, res) { if
(!req || !req.username) return res.status(400).send("Bad request");

        try { let user = _userRepository.getUser(username); return (user) 
                ? res.status(200).send(user);
                : res.status(404).send("Username not found");
            
        } catch(e) { //log stuff return res.status(500).send("Internal Server
        Error"); } }); ``` Using Either ```javascript
        app.post("user/:username", function(req, res) { return Maybe.of(req)
        .map(req => req.username) .map(username =>
        userRepository.getUser(userName)) .map(user =>) .getOrElse("");

        if (!req || !req.username) return res.status(400).send("Bad request");

        try { let user = _userRepository.getUser(username); return (user) 
                ? res.status(200).send(user);
                : res.status(404).send("Username not found");
            
        } catch(e) { //log stuff return res.status(500).send("Internal Server
        Error"); } }); ``` ```javascript app.post("user/:username/roles",
        function(req, res) { let user = Maybe.of(req.username) .map(username =>
        _userRepository.getByUserName(username)) .map(user =>
        _roleRepository.getRolesForUser(user)) .getOrElse({status: 404,
        message: "Unable to get user"})

        return Maybe.  }); ```

Cosmic brain : Realizing the human beings are incapable of writing bug free
code and throwing your laptop into the Charles
