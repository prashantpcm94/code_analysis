const Promise = require('bluebird');
const git = require('git-tools');
const isValid = require('is-valid-path');
const _ = require('lodash');
const Blamer = require('blamer');

//TODO : find why 'functions' is not working
var functions = require('../../functions');
const utils = functions.utils;

function blame(fileRef, repo, branch) {
	try {

		// console.log('++++++++++', fileRef);
		// var repo = new git(repo);
		// Promise.promisifyAll(repo);

		utils.validatePath(fileRef);

		var options = {
			path : fileRef
		}

		if(!_.isEmpty(branch)) {
			options.committish = branch;
		}

		return repo.blameAsync(options);

	} catch(error) {
		throw error;
	}
}


function blameReport (fileRef, repo, branch) {
	return blame(fileRef, repo, branch)
		.then(function (result) {
			return {
				success : true,
				fileName : fileRef,
				blame : result
			}
		}).catch(function (error) {
			return {
				success : false,
				fileName : fileRef,
				blame : null
			}
		})
}
module.exports = blameReport;

// example
// blame('/Users/shubham/Documents/farmguide/node_api/server/controllers/cropNotifications/cropNotifications.js',
//  '/Users/shubham/Documents/farmguide/node_api/', 'CenterCIMaster').then(function(result) {
//  	console.log(result);
//  })

