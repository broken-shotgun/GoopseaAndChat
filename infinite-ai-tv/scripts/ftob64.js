/**
 * File to base64
 * 
 * Free TTS: https://cloudtts.com/
 * 
 * 1. Write script
 * 2. Generate audo for each line with CloudTTS.
 * 3. Base64 encode audio for each file, copy to episode.json
 * 
 */

import fs from 'fs';
// import mineType from 'mime-types';
import { streamToBase64String } from '../utils.js';

if (process.argv.length < 3) {
  throw new Error("Usage: node scripts/ftob64.js fileName");
}

const fileName = process.argv[2];

// console.log("File: ", fileName);
// console.log(mineType.lookup(fileName));
const fileReadStream = fs.createReadStream(fileName);
const base64str = await streamToBase64String(fileReadStream);

console.log(base64str);