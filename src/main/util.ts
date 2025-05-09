/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

function isFileExists(filePath: string): boolean {
  const isExists = fs.existsSync(filePath);

  return isExists;
}

function getUserPath(): string {
  return app.getPath('userData');
}

function getModelPath(): string {
  return `${getUserPath()}/models`;
}

export { resolveHtmlPath, isFileExists, getUserPath, getModelPath };
