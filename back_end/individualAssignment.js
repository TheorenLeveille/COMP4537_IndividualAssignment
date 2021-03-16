const http = require('http');
const urlParser = require('url');
const mysql = require('mysql');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const { Console } = require('console');
const POST = 'POST';
const PUT = 'PUT';
const OPTIONS = 'OPTIONS';
const GET = 'GET';
const DELETE = 'DELETE';
const endpointRoot = "/api/v1/";
const enpointQuestions = "questions/";

console.log("Just before creating the server");
let questionJSON; 

http.createServer(function(req, res) {
    res.writeHead(200, 
        {"Content-Type": "text/html",
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Methods": 'POST, GET, OPTIONS, PUT, DELETE'});    
    // res.end("Server up");
    console.log("URL");
    let url = urlParser.parse(req.url, true);
    console.log(url);

    // Get request body data
    if (req.method == POST || req.method == PUT) {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            questionJSON = JSON.parse(data); 
            res.end();
            console.log(questionJSON);
        });   
    }

    let con;
    
    con = mysql.createConnection({
        host: "us-cdbr-east-03.cleardb.com",
        user: "b92c1e42eec901",
        password: "709c33418a28b3f",
        database: "heroku_b8cf87bb3d5672e",
        timeout: 1000000
    });

    con.connect(
        function (err) {
            if (err) throw err;
            console.log("CONNECTED!");
            console.log(req.method);
           
            function getResult(callback) {
                let getQuestionSql = 'SELECT Questions.qID, Questions.qContent, Answers.aContent, CorrectAnswers.aContent AS correctAnswer FROM Questions LEFT JOIN Answers ON Questions.qID = Answers.questionID LEFT JOIN CorrectAnswers ON Answers.questionID = CorrectAnswers.questionID';
                con.query(getQuestionSql, (err, result, fields) => {
                    if (err) throw err;
                    return callback(result);
                });
            }

            if (req.method == OPTIONS) {
                console.log("Inside options");
                res.end();
            }

            if (req.method == POST && url.path === (endpointRoot + enpointQuestions)) {
                // Add question query 
                let insertQuestionSql = "INSERT INTO Questions(qID, qContent) values ('" + questionJSON.id + "', '" + questionJSON.questionContent + "')";
                con.query(insertQuestionSql, function (err, result) {
                    if (err) throw err;
                    console.log("1 Record inserted");
                });

                // Add question answers query
                questionJSON.options.forEach(element => {
                    let sql = "INSERT INTO Answers(questionID, aContent) values ('" + questionJSON.id + "', '" + element + "')";
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("1 Record inserted");
                    });
                });

                // Add correct anser to correct answers table query
                let insertCorrectAnswerSql = "INSERT INTO CorrectAnswers(questionID, aContent) values ('" + questionJSON.id + "', '" + questionJSON.correctAnswer + "')";
                // console.log(insertCorrectAnswerSql);
                con.query(insertCorrectAnswerSql, function (err, result) {
                    if (err) throw err;
                    console.log("1 Record inserted");
                });
                response = "Question Added";
                
            } else if (req.method == PUT && url.path === (endpointRoot + enpointQuestions)) {
                console.log("Inside PUT");
        
                // Update question content query 
                let UpdateQuestionContentSql = "UPDATE Questions SET qContent = '" + questionJSON.questionContent + "' WHERE qID = '" + questionJSON.id + "'";
                // console.log(UpdateQuestionContentSql);
                con.query(UpdateQuestionContentSql, function (err, result) {
                    if (err) throw err;
                    console.log("1 Record updated");
                });

                // Update question answers/options query 
                let deleteQuestionOptionsSql = "DELETE from Answers where questionID = '" + questionJSON.id + "'";
                // console.log(deleteQuestionOptionsSql);
                con.query(deleteQuestionOptionsSql, function (err, result) {
                    if (err) throw err;
                    console.log("records deleted");
                });

                questionJSON.options.forEach(element => {
                    let updateQuestionOptionsSql = "INSERT INTO Answers(questionID, aContent) values ('" + questionJSON.id + "', '" + element + "')";
                    // console.log(updateQuestionOptionsSql);
                    con.query(updateQuestionOptionsSql, function (err, result) {
                        if (err) throw err;
                        console.log("1 Record updated");
                    });
                });

                // Update correct answer query 
                let UpdateCorrectAnswerSql = "UPDATE CorrectAnswers SET aContent = '" + questionJSON.correctAnswer + "' WHERE questionID = '" + questionJSON.id + "'";
                // console.log(UpdateCorrectAnswerSql);
                con.query(UpdateCorrectAnswerSql, function (err, result) {
                    if (err) throw err;
                    console.log("1 Record updated");
                });


            } else if (req.method == GET && url.path === (endpointRoot + enpointQuestions)) {
                console.log("INSIDE GET");

                getResult(function(result) {
                    // db = JSON.stringify(result);
                    // console.log(db);

                    let questions = [];
                    let prevId = -1;
                    let question = {};

                    result.forEach(item => {

                        if (item.qID !== prevId) {

                            if(question.qID) {
                                questions.push(question);
                            }

                            question = {};

                            question.qID = item.qID;
                            question.qContent = item.qContent;

                            question.options = [item.aContent];

                            question.correctAnswer = item.correctAnswer;

                        } else {
                            question.options.push(item.aContent);
                        }

                        prevId = item.qID

                    });

                    questions.push(question);

                    jsonStr = JSON.stringify(questions);
                    console.log(jsonStr);
                
                    res.writeHead(200, 
                        {"Content-Type": "text/html",
                        "Access-Control-Allow-Origin": "*"});
                    res.end(jsonStr);
                });
                
                           
            } else if (req.method == DELETE) {}
    });

    con.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            con.end(function(err) {
                console.log(err);
              });

            con = mysql.createConnection({
                host: "us-cdbr-east-03.cleardb.com",
                user: "b92c1e42eec901",
                password: "709c33418a28b3f",
                database: "heroku_b8cf87bb3d5672e",
                timeout: 1000000
            });                   
        } else {                                      
            throw err;                                  
        }
      });

}).listen(process.env.PORT || 8888);

console.log("server created");




