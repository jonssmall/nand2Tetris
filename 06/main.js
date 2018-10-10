'use strict';
const fs = require('fs');
const codeModule = require('./code');

fs.readFile(process.argv[2], 'utf8', (err,data) => {
  if (err) throw err;
  parse(data);
});


// remove whitespace
// remove commented lined

// todo: constructor w/ file input?
// todo: types for different commands?

function parse(fileInput) {
    const lines = fileInput.split(/\r?\n/)
                           .filter(l => l && !l.startsWith('//'));

    console.log(lines);
}

const parser = {};
parser.currentCommand = '';
parser.lines = [];

parser.new = function(linesArray) {
    this.lines = linesArray;
    if (this.hasMoreCommands()) { // non-empty
        this.advance();
    }
}

parser.hasMoreCommands = function() {
    return this.lines.length;
}

parser.advance = function() {
    this.currentCommand = this.lines.shift();
}

parser.commandType = function() {
    // currentCommand type :
    // A_COMMAND @Xxx is either symbol or decimal number
    // C_COMMAND dest=comp;jump
    // L_COMMAND (Xxx) psuedo command w/ Xxx symbol
}

parser.symbol = function() {
    // returns symbol or number from A or L commmands
}

parser.dest = function() {
    // dest mnemonic (8 types to lookup) of current C command
    // CHECK IF C COMMAND
}

parser.comp = function() {
    // comp mnemonic (28 types to lookup) of current C command
    // CHECK IF C COMMAND
}

parser.jump = function() {
    // jump mnemonic (8 types to lookup) of current C command
    // CHECK IF C COMMAND
}

