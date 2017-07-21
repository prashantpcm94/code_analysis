const Promise = require('bluebird');
const fs = require('fs');
const globby = require('globby');
const path = require('path');
const parser = require('gitignore-parser');
const recursive = require("recursive-readdir");
const ignore = require('ignore');
const _ = require('lodash');

const functions = require('../../functions');
const utils = functions.utils;

const blameReport = require('./blame');
const complexity = require('./complexity');
const reportAnalysis = require('./consolidatedReport')

Promise.promisifyAll(fs);

var recursiveAsync = Promise.promisify(recursive);
// const globbyAsync = Promise.promisify(globby);


var authors = {};

function analyzeRepo(arguments) {
	var repoPath = arguments.repoPath;
	var committish = arguments.committish;
	var exceptions = arguments.exceptions || [];

	Promise.coroutine(function *() {
		var repo = yield utils.getRepo(repoPath);
		// console.log('------', typeof repo);
		Promise.promisifyAll(repo);

		var files = yield recursiveAsync(repoPath);
		
		var gitIgnoreFilePath = path.join(repoPath, '.gitignore');


		var gitIgnoreData = yield fs.readFileAsync(gitIgnoreFilePath, 'utf8');
		// gitIgnoreData += '\n .git';

		var ig = ignore().add(gitIgnoreData).add('.git');


		var files = ig.filter(files);
		files = files.filter(function(fileName) {
			return path.extname(fileName) === '.js' ? fileName:null;
		})

		// console.log(files);


		var reports = yield Promise.map(files, function(fileName) {
			// console.log(';;;;;;', fileName);

			var blame = blameReport(fileName, repo, committish);
			var qualityReport = complexity(fileName);
			return Promise.join(blame, qualityReport, function(blame, qualityReport) {
				var report = {
					fileName : fileName,
					blame : blame,
					qualityReport : qualityReport
				}
				return reportAnalysis.fileAnalysis(report)
			})
		}, {concurrency : 100});
		console.log(JSON.stringify(reportAnalysis.projectAnalysis(reports)));
	})().catch(function(error) {
			console.log(error);
			return error;
	})
}

var arguments = {
	repoPath : '/Users/shubham/Documents/farmguide/node_api/',
	committish : 'CenterCIMaster',
	exceptions : [
		'**/node_modules/**',
		'logs'
	]
}

analyzeRepo(arguments);