const moment = require('moment');
const _ = require('lodash');

function fileAnalysis(report) {
	var analysisData = {
		fileName : report.fileName,
		authorWise : {},
		aggregate : {}
	};

	try {
		let blame = report.blame;
		let qualityReport = report.qualityReport;

		fileWise.aggregateReport(analysisData, qualityReport);
		fileWise.authorWiseReport(analysisData, qualityReport, blame);

		return analysisData;
	} catch(error) {
		throw error;
	}
}

let fileWise = {
	aggregateReport : function (analysisData, qualityReport) {
		if(qualityReport.success) {
			var report = qualityReport.report;
			analysisData.aggregate.cyclomatic = report.aggregate.cyclomatic;
			analysisData.aggregate.sloc = report.aggregate.sloc;

			analysisData.aggregate.halstead = report.aggregate.halstead;
		}
	},
	authorWiseReport : function(analysisData, qualityReport, blameData) {
		if(!blameData.success || !qualityReport.success) {
			return;
		}
		let blame = blameData.blame;
		// console.log(blame);
		let report = qualityReport.report;

		var functions = report.functions;
		var authorWise = analysisData.authorWise;

		functions.forEach(function(fn) {
			let length = fn.line + fn.sloc.physical;
			let cyclomatic = fn.cyclomatic;
			let physical = fn.sloc.physical;
			let logical = fn.sloc.logical;
			let halstead = fn.halstead;

			for(let i = fn.line; i < length; ++i) {
				let author = blame[i - 1].author;
				author = author.replace(/\s/g, "");
				initAuthor(authorWise, author);
				// console.log(authorWise);
				let authorObj = authorWise[author];
				// console.log(authorObj, '-----', cyclomatic, ';;;;;;');
				authorObj.cyclomatic += (1/physical)*cyclomatic;
				authorObj.sloc.physical += 1;
				authorObj.sloc.logical += (1/physical)*logical;
				authorObj.halstead.volume += (1/physical)*halstead.volume;
				authorObj.halstead.effort += (1/physical)*halstead.effort;
				authorObj.halstead.time += (1/physical)*halstead.time;
			}

		});
	}
}

let consolidated = {
	authorWiseReport : function(consolidatedReport, fileReport) {
		let authorWiseReport = consolidatedReport.authorWise;
		let authorWiseData = fileReport.authorWise;


		Object.keys(authorWiseData).forEach(function (key) {
			key = key.replace(/\s/g, "");
			initAuthor(authorWiseReport, key);
			let authorObj = authorWiseReport[key];
			++authorObj.filesCount;
			authorObj.cyclomatic += authorWiseData[key].cyclomatic;
			authorObj.sloc.physical += authorWiseData[key].sloc.physical;
			authorObj.sloc.logical += authorWiseData[key].sloc.logical;
			authorObj.halstead.volume += authorWiseData[key].halstead.volume;
			authorObj.halstead.effort += authorWiseData[key].halstead.effort;
			authorObj.halstead.time += authorWiseData[key].halstead.time;
		});
	},
	mean : function(consolidatedReport) {
		let authorWiseReport = consolidatedReport.authorWise;

		Object.keys(authorWiseReport).forEach(function (key) {
			// key = key.replace(/\s/g, "");
			let authorObj = authorWiseReport[key];
			authorObj.cyclomatic /= authorObj.filesCount;
		});
	},
	aggregateReport : function(consolidatedReport, analysisData) {
		let aggregate = consolidatedReport.aggregate;
	}
}

function initAuthor(authorWise, authorName) {
	// console.log(authorWise, ';;;;;' ,authorName, '----')
	if(_.isEmpty(authorWise[authorName])) {
		authorWise[authorName] = {
			cyclomatic : 0,
			sloc : {
				physical : 0,
				logical : 0
			},
			halstead : {
				volume : 0,
				effort : 0,
				time : 0
			},
			filesCount : 0
		}
	}
}

function projectAnalysis(fileAnalysisArray) {
	var consolidatedReport = {
		authorWise : {},
		aggregate : {}
	}
	fileAnalysisArray.forEach(function (item) {
		consolidated.authorWiseReport(consolidatedReport, item);
		consolidated.aggregateReport(consolidatedReport, item);
	});
	consolidated.mean(consolidatedReport);

	return consolidatedReport;
}

module.exports = {
	fileAnalysis : fileAnalysis,
	projectAnalysis : projectAnalysis
}
