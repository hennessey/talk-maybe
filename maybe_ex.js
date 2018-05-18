const Maybe = require("./maybe");

const yell = (str) => `${str}!`;
const makeLoud = (str) => str.toUpperCase();

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

// const safeYellToTheRooftops = (str) => Maybe.of(str)
//     .map(yell)
//     .map(makeLoud); 