let questionNumber = 0;
let currentQuestionCount= 0;
let allQuestions = [];
let dbQuestions;
let endpointRoot = "https://stormy-sea-98579.herokuapp.com/api/v1/";
let endpointQuestions = "questions/";


window.onload = function () {
    fetchQuestionsFromDatabase();
    document.getElementById("add-btn").addEventListener("click", addNewQuestionTemplate);
};


class Question {
    constructor(questionId) {
        this.id = questionId;
        this.text = '';
        this.numOptions = 2;
        this.answer = ''; 
    }

    addMcOption(e) {
        if (this.numOptions < 4) {
            // Create option input
            let optionsContainer = document.getElementById(this.id).getElementsByClassName('answers-container')[0];
            let optionInput = document.getElementById('option-input');
            let clonedOptionInput = optionInput.cloneNode(true);
            let radioButton = clonedOptionInput.getElementsByClassName('radio-values')[0];
            radioButton.name = "optradio" + this.id;
            radioButton.setAttribute('value', this.numOptions);
            optionsContainer.appendChild(clonedOptionInput);
            this.numOptions++;
        }
    }
    deleteMcOption = function() {
        if (this.numOptions > 2) {
            let optionsContainer = document.getElementById(this.id).getElementsByClassName('answers-container')[0];
            optionsContainer.removeChild(optionsContainer.lastElementChild);
            this.numOptions--;
        }
    };

    deleteQuestion = function() {
        let questionContainer = document.querySelector('#questions-container');
        questionContainer.removeChild(document.getElementById(this.id));
    };

    addQuestionToDB = function() {
        let data = getQuestionData(questionNumber);

        if (data) {
            console.log("making call");
            const xhttp = new XMLHttpRequest();
            xhttp.open("POST", endpointRoot + endpointQuestions, true);
            // xhttp.open("POST", "http://localhost:8888", true);
            // xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify(data));
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    console.log(this.response);
                    displayAddedNotification();
                }
            }
            return true;
        } else {
            return false;
        }
    };

    updateQuestionInDB = function() {
        let data = getQuestionData(this.id.substring(1));
        console.log("Inside Update");
        console.log(data);

        if (data) {
            const xhttp = new XMLHttpRequest();
            xhttp.open("PUT", endpointRoot + endpointQuestions, true);
            // xhttp.open("PUT", "http://localhost:8888", true);
            // xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify(data));
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    console.log(this.response);
                    displayUpdatedNotification();
                }   
            }
            return true;
        } else {
            return false;
        }
    }
}


function addNewQuestionTemplate() {
    console.log("question number before: " + questionNumber.toString());
    console.log("dbQuestions.length before: " + currentQuestionCount.toString());

    // Deal with previous question
    if (questionNumber > currentQuestionCount) {
        if (!handlePreviousQuestion()) {
            return;
        }
    }
 
    // increment question number
    questionNumber++;

    console.log("question number after incrementing: " + questionNumber.toString());


    let questionObj = new Question("q" + questionNumber);    

    // add new empty template to bottom with appropriate attributes
    let questionContainer = document.querySelector('#questions-container');
    let question = document.querySelector("#question-template");
    
    let clonedQuestion = question.cloneNode(true);
    clonedQuestion.id = "q" + questionNumber;
    
    let title = clonedQuestion.querySelector(".card-title");
    // title.innerHTML = "Question " + questionNumber;
    title.innerHTML = "Question";


    let questionInput = clonedQuestion.querySelector(".question-input");
    questionInput.id = "qi" + questionNumber;

    let radioInputs = clonedQuestion.getElementsByClassName("radio-values");
    for (i = 0; i < radioInputs.length; i++) {
        radioInputs[i].name = "optradioq" + questionNumber;
    }

    //create add MC option button
    let questionBody = clonedQuestion.querySelector('.card-body');
    let addMCButton = document.createElement("BUTTON");
    addMCButton.innerHTML = '+';
    addMCButton.className = "add-mc-button"
    addMCButton.onclick = function() {
        questionObj.addMcOption();
    };
    questionBody.appendChild(addMCButton);

    // Create delete MC option button
    let deleteMCButton = document.createElement("BUTTON");
    deleteMCButton.innerHTML = '-';
    deleteMCButton.className = "delete-mc-button"
    deleteMCButton.onclick = function() {
        questionObj.deleteMcOption();
    };
    questionBody.appendChild(deleteMCButton);

    // Create delete question button
    let deleteButton = document.createElement("BUTTON");
    deleteButton.className = 'delete-button btn btn-danger';
    deleteButton.innerHTML = 'Delete';
    deleteButton.disabled = true;
    deleteButton.onclick = function() {
        questionObj.deleteQuestion();
    };
    questionBody.appendChild(deleteButton);

    // Create update question button
    let updateButton = document.createElement("BUTTON");
    updateButton.className = "update-button btn btn-primary";
    updateButton.innerHTML = "Update";
    updateButton.disabled = true;
    updateButton.onclick = function() {
        questionObj.updateQuestionInDB();
    };
    questionBody.appendChild(updateButton);

    // Add Question to the DOM
    clonedQuestion.style["display"] = "inline";
    questionContainer.appendChild(clonedQuestion);

    // Add Question object to master list
    allQuestions.push(questionObj);


}

function handlePreviousQuestion() {
    let questionId = 'q' + questionNumber;
    let previousQuestion = document.getElementById(questionId);
    let updateButton = previousQuestion.getElementsByClassName('update-button')[0];
    let deleteButton = previousQuestion.getElementsByClassName('delete-button')[0];
    updateButton.disabled = false;
    // deleteButton.disabled = false;

    let previousQuestionObj = allQuestions[allQuestions.length - 1];
    let status = previousQuestionObj.addQuestionToDB();
    console.log(status);
    return status;
        
}

function getQuestionData(questionNumber) {
    let data = {
        id: '',
        questionContent: '',
        options: [],
        correctAnswer: null
    }

    let questionId = 'q' + questionNumber;

    let question = document.getElementById(questionId)
    console.log(question);
    data.id = questionId;

    let questionContent = document.getElementById('qi' + questionNumber).value;
    data.questionContent = questionContent;

    let optionRadios = question.getElementsByClassName('radio-values');
    let optionInputs = question.getElementsByClassName('options')

    for (let i = 0; i < optionRadios.length; i++) {
        data.options.push(optionInputs[i].value);

        if (optionRadios[i].checked) {
            data.correctAnswer = optionInputs[i].value;
        }
    }
    if (handleMissingQuestionElements(data)) {
        return null;
    } else {
        return data;
    }
}

function handleMissingQuestionElements(data) {
    let questionContainer = document.getElementById(data.id).querySelector('.card-body');

    let isMissingElements = false;
    
    if(data.questionContent.trim() == '') {
        let errorBanner = document.createElement("DIV");
        errorBanner.className = 'alert alert-danger';
        errorBanner.innerHTML = "The question content cannot be empty."
        errorBanner.style.marginTop = '1em';
        questionContainer.appendChild(errorBanner);
        setTimeout(function() {
            questionContainer.removeChild(questionContainer.lastElementChild)
        }, 7000);

        isMissingElements = true;
    } 

    for (let i = 0; i < data.options.length; i++) {
        console.log(data.options[i]);
        if (!data.options[i]) {
            let errorBanner = document.createElement("DIV");
            errorBanner.className = 'alert alert-danger';
            errorBanner.innerHTML = "Question answer input boxes cannot be empty."
            errorBanner.style.marginTop = '1em';
            questionContainer.appendChild(errorBanner);
            setTimeout(function() {
                questionContainer.removeChild(questionContainer.lastElementChild)
            }, 7000);

            isMissingElements = true;
            break;
        }
    }

    if (!data.correctAnswer) {
        let errorBanner = document.createElement("DIV");
        errorBanner.className = 'alert alert-danger';
        errorBanner.innerHTML = "You must select the correct answer."
        errorBanner.style.marginTop = '1em';
        questionContainer.appendChild(errorBanner);
        setTimeout(function() {
            questionContainer.removeChild(questionContainer.lastElementChild)
        }, 7000);

        isMissingElements = true;
    }

    return isMissingElements;
}

function fetchQuestionsFromDatabase() {

    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", endpointRoot + endpointQuestions, true);
    // xhttp.open("GET", "http://localhost:8888", true);
    // xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            dbQuestions = JSON.parse(this.response);
            
            if (Object.keys(dbQuestions[0]).length === 0) {
                console.log("Empty database");
                addNewQuestionTemplate();
            } else {
                displayQuestions(dbQuestions);
            }            
        }
    }
}

function displayQuestions(questions) {
    console.log(questions);

    questions.forEach(q => {
        addNewQuestionTemplate();

        let question = document.getElementById(q.qID);
        question.querySelector(".question-input").innerHTML = q.qContent;

        // create correct number of option inputs
        for (let i = 2; i < q.options.length; i++) {
            let questionObj = allQuestions[allQuestions.length - 1];
            questionObj.addMcOption();
        }

        let radioButtons = question.getElementsByClassName('radio-values');
        let radioInputs = question.getElementsByClassName('options');
        for (let i = 0; i < q.options.length; i++) {
            if (q.options[i] == q.correctAnswer) {
                radioButtons[i].checked = true;
            }
            radioInputs[i].value = q.options[i];
        }


        // Enable update and delete buttons
        let updateButton = question.getElementsByClassName('update-button')[0];
        let deleteButton = question.getElementsByClassName('delete-button')[0];
        updateButton.disabled = false;
        // deleteButton.disabled = false;

        currentQuestionCount++;
        
    })

    // add new empty template 
    addNewQuestionTemplate()

    console.log(questionNumber);
}

function displayAddedNotification() {
    document.getElementById("saved-message").classList.add("show");
    document.getElementById("saved-message").innerHTML = "&#10004; Question Added"
    setTimeout(function() {
        document.getElementById("saved-message").classList.remove("show");
    }, 1800);
}

function displayUpdatedNotification() {
    document.getElementById("saved-message").classList.add("show");
    document.getElementById("saved-message").innerHTML = "&#10004; Question Updated"
    setTimeout(function() { 
        document.getElementById("saved-message").classList.remove("show");
    }, 1800);
}