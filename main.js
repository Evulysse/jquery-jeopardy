const jeopardyElement = document.getElementById("jeopardy");

const scoreDisplayElement = jeopardyElement.querySelector("#score");

const boardElement = jeopardyElement.querySelector("#board");

const boardRowElement = boardElement
                            .querySelector("template")
                            .content
                            .querySelector("tr");

const questionDisplayElement = jeopardyElement.querySelector("#question");

const answerFormElement = jeopardyElement.querySelector("#answer"); 

const answerInputElement = answerFormElement.querySelector("input[type=\"text\"]");

const answerBtnElement = answerFormElement.querySelector("button");

// const JSON_FILE_URL = `${location.href}/data/jeopardy.json` ;
const JSON_FILE_URL ='data/jeopardy.json';

function createBoardRow(amount) {
    const rowElement = document.importNode(boardRowElement, true);

    const rowCellsElements = rowElement.querySelectorAll("td");
    for(const rowCellElement of rowCellsElements) {
        rowCellElement.querySelector("button").textContent = `\$${amount}`;
    }

    return rowElement;
}

function initBoard(board, rowCount = 5) {
    const amounts = [];

    for(let i = 0, even = 0; even < rowCount; i++) {
        if(i === 0) {
            amounts.push(100);
            even += 1;
        } else if(i % 2 === 0) {
            amounts.push(i * 100);
            even += 1;
        }
    }

    for(const amount of amounts) {
        board.append(createBoardRow(amount));
    }
}

function sendHttpRequest(url) {
    return fetch(url);
}

async function loadQuestionsByAmount(amount) { 
    let response = await sendHttpRequest(JSON_FILE_URL)
        .then(responseData => responseData.json())
        .then(questions => {
            questions = questions.filter(question => question.value === amount);
            return questions;
        });

    return response;
}

function attachListenerToElement(element, listener, handler, data) {
    element.addEventListener(
        listener, 
        data ? handler.bind(null, data): handler, 
        data ? {once: true}: {}
    );
}

function removeListenerFromElement(element, listener, handler) {
    element.removeEventListener(listener, handler);
}

function validateAnswer(...values) {
    let event, question;

    (values.length === 1) ? [event] = values: [question, event] = values;

    event.preventDefault();

    if(question) {
        let answer = answerInputElement.value.trim();

        if(!answer) {
            alert("Please provide an answer to the question!");
        } else if (question.answer.toLowerCase() === answer.toLowerCase()) {
            let scoreElement = scoreDisplayElement.querySelector("p span");

            const score = parseInt(question.value.replace("$", ""));
            
            scoreElement.textContent = parseInt(scoreElement.textContent) + score;

            if(localStorage.getItem("score")) {
                localStorage.setItem("score", scoreElement.textContent);
            } else {
                localStorage.setItem("score", scoreElement.textContent);
            }
        } else {
            alert(`Wrong answer! The correct answer was "${question.answer}"`);
        }

        let questionElement = questionDisplayElement.querySelector("p span");
        questionElement.textContent = "";
        answerInputElement.value = "";
    }
}

function pickRandomQuestion(questions) {
    let question = parseInt(Math.random() * questions.length);
    let randomQuestion = questions[question];
    return randomQuestion;
}

// For testing purposes only! Please remove in production!!!
function alwaysWin(answer) {
    answerInputElement.value = answer;
}

function attachQuestionToBtnHandler(event) {
    if(event.target.tagName === "BUTTON") {
        event.preventDefault();

        let amount = event.target.textContent;

        loadQuestionsByAmount(amount).then(questions => {
            let question = pickRandomQuestion(questions);
            return question;
        }).then(question => {

            alwaysWin(question.answer); // To be removed!!!

            let questionElement = questionDisplayElement.querySelector("p span");
            questionElement.innerHTML = question.question;
            attachListenerToElement(answerBtnElement, "click", validateAnswer, question);
        });
    }
}

function main() {
    initBoard(boardElement);
    attachListenerToElement(boardElement, "click", attachQuestionToBtnHandler);
}

main();


function manageScoreHandler(event) {
    if(localStorage.getItem("score")) {
        scoreDisplayElement.querySelector("p span").textContent = +localStorage.getItem("score");
    }
}

attachListenerToElement(document, "DOMContentLoaded", manageScoreHandler);
