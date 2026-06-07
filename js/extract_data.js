const fs = require('fs');

const dataFile = fs.readFileSync('data.js', 'utf8');

// A very naive eval to extract the data
const mockWindow = {};
const script = `
  const window = {};
  ${dataFile}
  module.exports = { vocabularyData: window.vocabularyData, ciaTriadArticleData: window.ciaTriadArticleData };
`;

fs.writeFileSync('extract.js', script);
const data = require('./extract.js');

const w9Vocab = {
  w9d1: data.vocabularyData.w9d1,
  w9d2: data.vocabularyData.w9d2,
  w9d3: data.vocabularyData.w9d3,
  w9d4: data.vocabularyData.w9d4,
  w9d5: data.vocabularyData.w9d5,
};

fs.writeFileSync('week9_extracted.json', JSON.stringify({
  vocab: w9Vocab,
  article: data.ciaTriadArticleData
}, null, 2));

console.log("Extraction complete.");
