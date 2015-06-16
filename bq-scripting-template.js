/**
* Fetching data from BigQuery and present it in our sheet
* Author: Ido Green
* Date: 14/12/2013
* 
* See: http://wp.me/pB1lQ-19i
* Misc: https://developers.google.com/bigquery/
*/

//
// Build and run the query: Get the top 30 longest works of Shakespeare
//
function runQuery() {
  // Replace this value with your Google Developer project number (It is really a number. 
  // Don't confuse it with an alphanumeric project id)
  var projectNumber = 'Put your project number here';
  if (projectNumber.length < 1) {
      var errMsg = "You forgot to set a project number - So no BQ for you!";
      Logger.log(errMsg);
      Browser.msgBox(errMsg);
      return;
  }
  
  var sheet = SpreadsheetApp.getActiveSheet();
  var sql = 'select TOP(word, 30), COUNT(*) as word_count from publicdata:samples.shakespeare WHERE LENGTH(word) > 10;';
  var queryResults;

  // Inserts a Query Job
  try {
    var queryRequest = BigQuery.newQueryRequest();
    queryRequest.setQuery(sql).setTimeoutMs(100000);
    queryResults = BigQuery.Jobs.query(queryRequest, projectNumber);
  }
  catch (err) {
    Logger.log(err);
    Browser.msgBox(err);
    return;
  }
  
  // Check on status of the Query Job
  while (queryResults.getJobComplete() == false) {
    try {
      queryResults = BigQuery.Jobs.getQueryResults(projectNumber, queryJob.getJobReference().getJobId());
    }
    catch (err) {
      Logger.log(err);
      Browser.msgBox(err);
      return;
    }
  }
  
  // Update the amount of results
  var resultCount = queryResults.getTotalRows();
  var resultSchema = queryResults.getSchema();
  
  var resultValues = new Array(resultCount);
  var tableRows = queryResults.getRows();
  
  // Iterate through query results
  for (var i = 0; i < tableRows.length; i++) {
    var cols = tableRows[i].getF();
    resultValues[i] = new Array(cols.length);
    // For each column, add values to the result array
    for (var j = 0; j < cols.length; j++) {
      resultValues[i][j] = cols[j].getV();
    }
  } 

  // Update the Spreadsheet with data from the resultValues array, starting from cell A1
  sheet.getRange(1, 1, resultCount, tableRows[0].getF().length).setValues(resultValues);  
  Browser.msgBox("Yo yo! We are done with updating the results");
}

//
// Insert our customize menu item
//
function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [ {name: 'Run Query', functionName: 'runQuery'} ];
  sheet.addMenu('BigQuery Example', menuEntries);
};

