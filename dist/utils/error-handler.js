'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
var errorHandler = function(err, req, res, next) {
  console.log('internal server error: ');
  console.log(err);
  res.status(err.status || 500).send({error: err});
};
exports.default = errorHandler;
