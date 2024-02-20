/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date: 2024 - 02 - 13
 * Author: Myeonghyun "Austin" Park
 *
 */
// main function should use then and catch to handle errors

const { unzip, readDir, grayScale} = require('./IOhandler');
const path  = require("path");
const pathIn = path.join(__dirname, "myfile.zip");
const pathOut = path.join(__dirname, "unzipped");
const grayscaled = path.join(__dirname, "grayscaled");

unzip(pathIn, pathOut) 
  .then(() => readDir(pathOut))
  .then(filtered => {
    for (const file of filtered) {
      grayScale(file, grayscaled);
    }
  }).catch(err => {
    console.error(err);
  });
