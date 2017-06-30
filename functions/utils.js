const Promise = require('bluebird');
const isValid = require('is-valid-path');
const git = require('git-tools');

module.exports = {
	validatePath : validatePath,
	getRepo : getRepo
}

function validatePath(filePath) {
	if(!isValid(filePath)) {
		throw new Error('Invalid path : '+filePath);
	}
}

function getRepo(repoPath) {	
	
	var repo = new git(repoPath);
	Promise.promisifyAll(repo);

	return repo.isRepoAsync().then(function (flag) {
		if(flag) {
			return repo;
		}
		throw new Error('Not a valid repo');
	})
}