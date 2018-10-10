// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// Put your code here.


// Multiplication:
// 1. Start at sum = 0
// 2. Loop through R1 times
// 3. In each loop, add value of R0 to sum

@sum
M=0

(LOOP)

@R1
D=M
@END
D;JEQ // end program when R1 has been 'depleted'

@R0
D=M

@sum
M=M+D

@R1
M=M-1

@LOOP
0;JMP

(END)

@sum
D=M

@R2
M=D