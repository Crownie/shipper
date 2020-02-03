'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
var rand = function() {
  return Math.random()
    .toString(36)
    .substr(2); // remove `0.`
};
exports.generateToken = function() {
  return rand() + rand(); // to make it longer
};
