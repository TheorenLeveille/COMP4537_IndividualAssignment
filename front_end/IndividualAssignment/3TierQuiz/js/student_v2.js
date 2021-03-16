let questions;
let endpointRoot = "https://stormy-sea-98579.herokuapp.com/api/v1/";
let endpointQuestions = "questions/";

window.onload = function () {
    fetchQuiz();
    document.getElementById("start-quiz-btn").disabled = true;
    document.getElementById("start-quiz-btn").addEventListener("click", startQuiz);
    document.getElementById("submit-quiz-btn").addEventListener("click", markQuiz);
};


function fetchQuiz() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", endpointRoot + endpointQuestions, true);
    // xhttp.open("GET", "http://localhost:8888", true);
    // xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            questions = JSON.parse(this.response);
            document.getElementById("start-quiz-btn").disabled = false;
        }
    }
};

function startQuiz() {
    if (Object.keys(questions[0]).length === 0) {
        window.alert("No quiz found in the database.");
    } else {
        console.log(questions)
        questions.forEach(question => {
            console.log(question);
            generateQuestion(question);
        });
    
        document.getElementById("start-quiz-btn").disabled = true;
        document.getElementById("submit-quiz-btn").style.display = "inline";
    }
}

function generateQuestion(question) {

    let cardDeck = document.querySelector('.card-deck');
    let questionTemplate = document.querySelector("#question-template");
    
    let clonedQuestionTemplate = questionTemplate.cloneNode(true);
    clonedQuestionTemplate.id = question.qID;
    
    // populate question card with question text/answers
    let title = clonedQuestionTemplate.querySelector(".card-title");
    title.innerHTML = "Question " + question.qID.substring(1);

    let questionText = clonedQuestionTemplate.querySelector(".question-text");
    questionText.innerHTML = highlightReservedWords(question.qContent);

    let questionOptions = clonedQuestionTemplate.getElementsByClassName('form-check');
    let radioInputs = clonedQuestionTemplate.getElementsByClassName("form-check-input");
    let radioLabels = clonedQuestionTemplate.getElementsByClassName("form-check-label");
    for (i = 0; i < question.options.length; i++) {
        radioInputs[i].name =  "q" + question.qID.substring(1);
        radioLabels[i].innerHTML = question.options[i];;
        questionOptions[i].style["display"] = "block";
      
    }
   
    // display the question
    clonedQuestionTemplate.style["display"] = "inline";
    cardDeck.appendChild(clonedQuestionTemplate);
}

function highlightReservedWords(text){
    text = text.replaceAll("=", "<span class='red'>=</span>");
    text = text.replaceAll("let", "<span class='blue'>let</span>");
    text = text.replaceAll("var", "<span class='blue'>var</span>");
    text = text.replaceAll("const", "<span class='blue'>const</span>");
    text = text.replaceAll("for", "<span class='blue'>for</span>");
    text = text.replaceAll("(", "<span class='red'>(</span>");
    text = text.replaceAll(")", "<span class='red'>)</span>");
    text = text.replaceAll("{", "<span class='red'>{</span>");
    text = text.replaceAll("}", "<span class='red'>}</span>");
    text = text.replaceAll("+", "<span class='red'>+</span>");
    text = text.replaceAll("-", "<span class='red'>-</span>");
    text = text.replaceAll("*", "<span class='red'>*</span>");
    
    return text;
}


function markQuiz() {
    let answers = questions.map(question => {
        return question.options.indexOf(question.correctAnswer);
    });

    let userAnswers = questions.map(question => {
        let q = document.getElementById(question.qID);
        let givenAnswer = q.querySelector('input[name="' + question.qID + '"]:checked')
        return (givenAnswer ? givenAnswer.value : null);
    })
    console.log(userAnswers);

    // calculate user mark
    correctAnswerCount = 0;
    for (let i = 0; i < answers.length; i++) {
        if (answers[i] == userAnswers[i]) {
            correctAnswerCount++;
        }
    }

    // display the user's mark
    userMarkContainer = document.querySelector('#user-mark-container');
    userMarkContainer.innerHTML = "You got " + correctAnswerCount + "/" + answers.length;
    userMarkContainer.style.display = "inline";

    displayCorrectAnswers(answers, userAnswers);
    disableRadioButtons();
}

function displayCorrectAnswers(answers, userAnswers) {
    for (let i = 0; i < answers.length; i++) {
        let question = document.querySelector('#q' + (i + 1));
        let options = question.getElementsByClassName("form-check");
        let userAnswer = options[userAnswers[i]];
        if (userAnswer) {
            userAnswer.getElementsByTagName('span')[0].innerHTML = "&#10060;";
        }
        options[answers[i]].getElementsByTagName('span')[0].innerHTML = "&#10004;";
    }
}

function disableRadioButtons() {
    let radioButtons = document.getElementsByClassName("form-check-input");
    for (let i = 0; i < radioButtons.length; i++) {
        radioButtons[i].disabled = true;
    }
}


