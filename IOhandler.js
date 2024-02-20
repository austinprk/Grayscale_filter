/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date: 2024 - 02 - 13
 * Author: Myeonghyun "Austin" Park
 *
 */

const path = require("path");
const PNG = require("pngjs").PNG;
const yauzl = require('yauzl-promise');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const readline = require('readline');

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * 
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */

async function unzip(pathIn, pathOut) {
  return new Promise(async (resolve, reject) => {
    const zip = await yauzl.open(pathIn);
    try { 
      for await (const entry of zip) {
        if (entry.filename.endsWith('/')) {
          await fs.promises.mkdir(`${pathOut}/${entry.filename}`);
        } else {
          const readStream = await entry.openReadStream();
          const writeStream = fs.createWriteStream(`${pathOut}/${entry.filename}`);
          await pipeline(readStream, writeStream); 
        }
      } console.log('Extraction has been completed');
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      await zip.close();
    }
  });
}

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */

async function readDir(pathOut) {
  return new Promise((resolve, reject) => {
    fs.readdir(pathOut, (err, files) => {
      if (err) {
        reject(err);
        console.log(err);
      }
      const filtered = [];
      files.forEach(file => {
        if (path.extname(file).toLowerCase() === '.png') {
          filtered.push(path.join(pathOut, file));
        }
      });
      resolve(filtered);
    });
  });
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */

async function grayScale(pathIn, pathOut) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(pathIn).pipe(
        new PNG({
          filterType: 4,
        })
      ).on('parsed', function () {
        for (var y = 0; y < this.height; y++) {
          for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;

            const gray = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;
            this.data[idx] = gray;
            this.data[idx + 1] = gray;
            this.data[idx + 2] = gray;
          }
        }
        this.pack().pipe(fs.createWriteStream(path.join(pathOut, path.basename(pathIn))))
          .on('finish', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });
  });
}

module.exports = {unzip, readDir, grayScale};
