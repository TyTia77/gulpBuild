'use strict';



let a = [
	{name: "name1", age: "1"},
	{name: "name2", age: "2"},
	{name: "name3", age: "3"},
	{name: "name4", age: "4"},
	{name: "name5", age: "5"}
];

let b = a.map( i => i.age);
// let c = _.pluck(a, 'name');