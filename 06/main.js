'use strict';
const fs = require('fs');
const codeModule = require('./code');

fs.readFile(process.argv[2], 'utf8', (err,data) => {
  if (err) throw err;
  parse(data);
});

// todo: constructor w/ file input?

function parse(fileInput) {
    const lines = fileInput.split(/\r?\n/)
                           .filter(l => l && !l.startsWith('//'));
    parser.new(lines);
    parser.toBinary();
}

const parser = {};
parser.currentCommand = '';
parser.lines = [];
parser.output = [];

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
    // todo: types for different commands?
    // todo: safe to default to C_COMMAND? 
    //       what about throwing errors for syntax?

    if (this.currentCommand.startsWith('@')) {
        return 'A_COMMAND';
    } else if (this.currentCommand.startsWith('(')) {
        return 'L_COMMAND';
    } else {
        return 'C_COMMAND';
    }
}

parser.symbol = function() {    
    // todo: replace symbol-less version
    return parseInt(this.currentCommand.substring(1)).toString(2).padStart(16, '0');
}

parser.dest = function() {
    if (this.currentCommand.includes('=')) {
        return codeModule.dest(this.currentCommand.substring(0, this.currentCommand.indexOf('=')));
    } else {
        return codeModule.dest('null');
    }
}

parser.comp = function() {
    // either AFTER an '=' or BEFORE a ';' depending on if jump or dest are omitted
    const segment = this.currentCommand.includes(';') ? 
                    this.currentCommand.substring(0, this.currentCommand.indexOf(';')) :
                    this.currentCommand.substring(this.currentCommand.indexOf('=') + 1);

    return codeModule.comp(segment);
}

parser.jump = function() {
    if (this.currentCommand.includes(';')) {
        return codeModule.jump(this.currentCommand.substring(this.currentCommand.indexOf(';') + 1));
    } else {
        return codeModule.jump('null');
    }
}

parser.toBinary = function() {
    while(this.hasMoreCommands()) {
        if (this.commandType() === 'A_COMMAND') {
            this.output.push(this.symbol());
        } else if (this.commandType() === 'L_COMMAND') {
            // label magic goes here
        } else {
            this.output.push('111' + this.comp() + this.dest() + this.jump());
        }


        // this.output.push(translate(this.currentCommand));
        this.advance();
    }
    console.log('Done');
    console.log(this.output.join('\n'));
}