const wait = require('node:timers/promises').setTimeout;

/**
 * https://stackoverflow.com/questions/58204155/splitting-a-string-based-on-max-character-length-but-keep-words-into-account
 * @param {string} input 
 * @param {number} maxChunkSize 
 * @returns 
 */
function chunkify(input, maxChunkSize=200) {
  if (!input || input === "") return [""];
  const temp = input.split(' ').reduce((acc, c) => {
    // Get the number of nested arrays
    const currIndex = acc.length - 1;
    // Join up the last array and get its length
    const currLen = acc[currIndex].join(' ').length;
    // If the length of that content and the new word
    // in the iteration exceeds 20 chars push the new
    // word to a new array
    if (currLen + c.length > maxChunkSize) {
      acc.push([c]);
    } else { // otherwise add it to the existing array
      acc[currIndex].push(c);
    }
    return acc;
  }, [[]]);
  return temp.map(arr => arr.join(' '));
}

/**
 * Gets a random integer between [0, max) if max is positive, or (max, 0] if max is negative.
 * @param {integer} max 
 * @returns a random integer between 0 (inclusive) and max (exclusive)
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Generate an integer hash for provided string.
 * 
 * @param {string} str 
 * @returns 32 bit integer hash for provided string
 */
function hash(str) {
  var hash = 0,
    i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function json(response) {
  return response.json();
}

/**
 * The de-facto unbiased shuffle algorithm: the Fisher-Yates (aka Knuth) Shuffle.
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @param {Array} array 
 * @returns shuffled version of the array
 */
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

/**
 * https://stackoverflow.com/questions/10623798/how-do-i-read-the-contents-of-a-node-js-stream-into-a-string-variable
 * @param {stream} stream 
 * @returns base64 encoded string of stream bytes
 */
function streamToBase64String(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
  });
}

module.exports = { 
  chunkify, 
  getRandomInt, 
  hash, 
  json, 
  shuffle,
  streamToBase64String, 
  wait 
};
