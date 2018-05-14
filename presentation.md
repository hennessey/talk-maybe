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
