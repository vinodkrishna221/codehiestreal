import { NextResponse } from 'next/server';
import { writeFile, mkdir, rm } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();
    
    // Generate a unique ID for this execution
    const executionId = uuidv4();
    const workDir = path.join(process.cwd(), 'tmp', executionId);
    
    // Create working directory
    await mkdir(workDir, { recursive: true });
    
    try {
      // Write code to file
      const filename = getFilename(language);
      const filePath = path.join(workDir, filename);
      await writeFile(filePath, code);
      
      // Execute code
      const result = await executeCode(language, filePath);
      
      return NextResponse.json({ 
        success: true,
        output: result.stdout || result.stderr,
        executionTime: 0 // TODO: Add execution time measurement
      });
    } finally {
      // Cleanup: Remove temporary directory
      await rm(workDir, { recursive: true, force: true });
    }
    
  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Code execution failed' 
      },
      { status: 500 }
    );
  }
}

function getFilename(language: string): string {
  switch (language) {
    case 'javascript':
      return 'solution.js';
    case 'python':
      return 'solution.py';
    case 'typescript':
      return 'solution.ts';
    default:
      throw new Error('Unsupported language');
  }
}

async function executeCode(language: string, filePath: string) {
  const command = getExecutionCommand(language, filePath);
  const timeout = 5000; // 5 second timeout
  
  return await execAsync(command, { timeout });
}

function getExecutionCommand(language: string, filePath: string): string {
  switch (language) {
    case 'javascript':
      return `node ${filePath}`;
    case 'python':
      return `python ${filePath}`;
    case 'typescript':
      return `ts-node ${filePath}`;
    default:
      throw new Error('Unsupported language');
  }
}