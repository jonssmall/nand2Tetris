'use strict';

const fs = require('fs');
const codeModule = require('./code');
const symbolTable = require('./symbolTable');

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

    buildSymbols(lines);

    return linesToBinary(lines).join('\n');
}

// function linesToBinary(linesArray, outputArray = []) { // MAXIMUM CALL STACK, TAIL CALLS WHERE ARE YOU?!
//     if (!linesArray.length) {
//         return outputArray;
//     } else {
//         const cleanLine = sanitizeLine(linesArray.shift());
//         if (commandType(cleanLine) !== 'L_COMMAND') { // pseudo-commands stripped out on 2nd pass
//             outputArray.push(translate(cleanLine));
//         }
//         return linesToBinary(linesArray, outputArray);
//     }
// }

function linesToBinary(linesArray) { // MAXIMUM CALL STACK, TAIL CALLS WHERE ARE YOU?!
    const binaryArray = [];
    
    linesArray.forEach(l => {
        const cleanLine = sanitizeLine(l);
        if (commandType(cleanLine) !== 'L_COMMAND') { // pseudo-commands stripped out on 2nd pass
            binaryArray.push(translate(cleanLine));
        }
    });
    
    return binaryArray;
}

function translate(line) {

    const commandLookup = {
        'A_COMMAND': symbol,
        'C_COMMAND': cInstruction
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

let nextRam = 16; // mysterious closure, used and mutated by symbol();

function symbol(line) {
    const segment = line.substring(1);

    if (!isNaN(segment)) {
        return binary16(segment);
    } else {
        const tryGet = symbolTable.getAddress(segment);
        if (tryGet) {
            return binary16(tryGet);
        } else {
            const address = symbolTable.addEntry(segment, nextRam.toString());
            nextRam++
            return binary16(address);
        }
    }

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

function buildSymbols(lineArray) {
    let romAddress = 0;
    lineArray.forEach(line => {
        if (commandType(line) === 'L_COMMAND') {
            const symbol = line.substring(1, line.length - 1);
            symbolTable.addEntry(symbol, romAddress);
        } else {
            romAddress++;
        }
    });
}

function binary16(numString) {
    return parseInt(numString).toString(2).padStart(16, '0');
}

function sanitizeLine(line) { // remove comments and whitespace within a line
    return line.replace(/\/\/.*/, '').trim();
}