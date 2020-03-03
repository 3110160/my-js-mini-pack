import {add} from './demo/a.js'
import {add as add3} from './a.js'
import {add2} from './b.js'
const fn = (a,b,c)=>{
  return a+b*c
}
console.log(fn(1,2,3));
console.log(add(1,2));
console.log(add2(1,2));
console.log(add3(1,2))