const Maybe = require("./maybe");

const yell = (str) => Maybe.of(`${str}!`);
const makeLoud = (str) => Maybe.of(str.toUpperCase());

const yellToTheRooftops = (str) => yell(makeLoud(str));
//const fancy_yellToTheRooftops = compose(yell, makeLoud);


// let maybePromise = (str) => new Promise((resolve, reject) => {
//     if (!str) reject("Nothing :(");

//     resolve(str);
// })

// async function YellToTheRooftops(str) {
//         return maybePromise(str) //wrap up the 'str' value into our Promise context
//             .then(s => makeLoud(s)) // the supplied callback to "then" will only get called if the previous promise resolved
//             .then(s => yell(s)) // ditto
//             .catch(e => e)  // only called if any of the promises in the chain threw or were exlicitly rejected
// }

// async function demoYell(str) {
//     let y = await YellToTheRooftops(str);

//     console.log(y);

//     return undefined;
// }

const safeYellToTheRooftops = (str) => Maybe.of(str)
    .chain(yell)
    .chain(makeLoud) 
    .getOrElse(':(');

// (int -> string) -> [int] -> [string]
const specialMap = (fn, array) => {
    var results = [];
    for(var i = 0; i <= array.length - 1; i++) {
        results.push(fn(array[i]))
    }
    return results;
}




// specialFlatMap :: (int -> [string]) -> [int] -> [string]
const specialFlatMap = (fn, array) => {
    var results = [];
    for(var i = 0; i <= array.length - 1; i++) {
        results.push(...fn(array[i]))
    }
    return results;
}

const stringToArray = int => {
    if(int === 0) return []; 

    return [int.toString(), ...stringToArray(int - 1)];
}

const stringToArrayTC = (int) => {
    return stringToArray2(int, int)
}

const stringToArray2 = (int, count) => {
    if(count === 0) return []; 

    return [int.toString(), ...stringToArray2(int, count - 1)];
}