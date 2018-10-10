'use strict';

const fs = require('fs');
const codeModule = require('./code');

const filename = process.argv[2];
if (!filename.endsWith('.asm')) {
    throw new Error('Please use the .asm file extension. Aborting...');
}

fs.readFile(process.argv[2], 'utf8', (err,data) => {
    if (err) throw err;

    fs.writeFile(filename.split('.')[0] + '.hack', parse(data), () => {
        console.log('Done writing.');
    });
});

function parse(fileInput) {
    const lines = fileInput.split(/\r?\n/)
                           .filter(l => l && !l.startsWith('//'));
    return linesToBinary(lines).join('\n');
}

function linesToBinary(linesArray, outputArray = []) {
    if (linesArray.length) {
        outputArray.push(translate(linesArray.shift()));
        return linesToBinary(linesArray, outputArray);
    } else {
        return outputArray;
    }
}

function translate(line) {
    const commandLookup = {
        'A_COMMAND': symbol,
        'C_COMMAND': cInstruction,
        'L_COMMAND': () => 'to be implemented'
    };

    return commandLookup[commandType(line)](line); // gross.
}

function commandType(line) {
    // todo: types for different commands?
    // todo: safe to default to C_COMMAND? 
    //       what about throwing errors for syntax?

    if (line.startsWith('@')) {
        return 'A_COMMAND';
    } else if (line.startsWith('(')) {
        return 'L_COMMAND';
    } else {
        return 'C_COMMAND';
    }
}

function symbol(line) {
    // todo: replace symbol-less version
    return parseInt(line.substring(1)).toString(2).padStart(16, '0');
}

function dest(line) {
    if (line.includes('=')) {
        return codeModule.dest(line.substring(0, line.indexOf('=')));
    } else {
        return codeModule.dest('null');
    }
}

function comp(line) {
    // either AFTER an '=' or BEFORE a ';' depending on if jump or dest are omitted
    const segment = line.includes(';') ? 
                    line.substring(0, line.indexOf(';')) :
                    line.substring(line.indexOf('=') + 1);

    return codeModule.comp(segment);
}

function jump(line) {
    if (line.includes(';')) {
        return codeModule.jump(line.substring(line.indexOf(';') + 1));
    } else {
        return codeModule.jump('null');
    }
}

function cInstruction(line) {
    return '111' + comp(line) + dest(line) + jump(line);
}