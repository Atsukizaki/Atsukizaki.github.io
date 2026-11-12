const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source=fs.readFileSync('assets/app.js','utf8').split('const menu =')[0];
const context=vm.createContext({URL});
vm.runInContext(source,context);
const validate=(items)=>{context.items=items;return vm.runInContext('validateRecords(items,["AI","統計学"])',context);};
test('records are sorted by date without mutating the input',()=>{
 const records=[{title:'test',category:'AI',description:'text',date:'2024-01-01'},{title:'test2',category:'統計学',description:'text',date:'2024-02-29'}];
 assert.equal(validate(records)[0].title,'test2');assert.equal(records[0].title,'test');
});
test('empty records are allowed; malformed records and dates are rejected',()=>{
 assert.equal(validate([]).length,0);
 for(const value of [null,{},[null],[{title:'x',category:'AI',description:'x',date:'2025-02-29'}],[{title:'x',category:'unknown',description:'x',date:'2024-01-01'}],[{title:'',category:'AI',description:'x',date:'2024-01-01'}]]) assert.throws(()=>validate(value));
});
test('external links allow only http and https',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,test','file:///test',undefined,'/relative']){context.value=url;assert.equal(vm.runInContext('safeURL(value)',context),null);}
 context.value='https://example.com';assert.equal(vm.runInContext('safeURL(value)',context),'https://example.com/');
});
