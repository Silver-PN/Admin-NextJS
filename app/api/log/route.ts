import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

const logDir = path.join(process.cwd(), 'lib', 'log');

export async function GET(res: Request) {
  try {
    const logFiles = [
      'info.stream.out',
      'debug.stream.out',
      'fatal.stream.out',
      'error.stream.out'
    ];

    const logs = logFiles.map((fileName) => {
      const filePath = path.join(logDir, fileName);
      const fileContent = fs.existsSync(filePath)
        ? fs.readFileSync(filePath, 'utf8')
        : '';
      return {
        fileName,
        content: fileContent.split('\n').filter((line) => line.trim() !== '') // Exclude empty lines
      };
    });

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.error();
  }
}
