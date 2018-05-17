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


const safeString = (fn) => (str) => Maybe.of(fn(str));

//safeYell :: string -> Maybe string
const safeYell = safeString((str) => `${str}`);

//safeMakeLoud :: string -> Maybe string
const safeMakeLoud = safeString((str) => str.toUpperCase());

const debug = (val) => { console.log(val); return val; };

const extra_safeYellToTheRooftops = compose(map(safeYell), map(safeMakeLoud), debug);

const extra_fancy_safeYellToTHeRooftops = compose(chain(safeYell), debug, chain(safeMakeLoud), debug);