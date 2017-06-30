var Promise = require('bluebird'),
    escomplex = require('escomplex'),
    treeWalker = require('escomplex-ast-moz'),
    esprima = require('esprima'),
    fs = require('fs'),
    readFileAsync = Promise.promisify(fs.readFile, fs);

module.exports = report;

function analyse(fileRef) {
	return readFileAsync(fileRef, 'utf8')
    .then(function(fileData){
		  return escomplex.analyse(
        esprima.parse(fileData, {loc : true}),
        treeWalker
      );
		}).then(function(report){
      return report;
    });
}

function report (fileRef) {

  return Promise.resolve(fileRef)

    .then(analyse)

    .then(function(result){

      return {
        success : true,
        report : result
      };

    })

    .caught(function(err){

      return {
        success : false,
        error : err
      };

    });

};