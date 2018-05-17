const Maybe = require("./maybe");
const { map, curry, compose, chain } = require('ramda');

const yell = (str) => `${str}!`;
const makeLoud = (str) => str.toUpperCase();

const yellToTheRooftops = (str) => yell(makeLoud(str));
//const fancy_yellToTheRooftops = compose(yell, makeLoud);

const safeYellToTheRooftops = (str) => Maybe.of(str)
    .map(yell)
    .map(makeLoud); 
 //const fancy_safeYellToTheRooftops = compose(map(yell), map(makeLoud), Maybe.of);
