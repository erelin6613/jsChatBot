const CHATFRAME = 'messages';
const MESSAGE = 'message';
const CLIENT = 'client';
const SERVER = 'server';
const CONTENT = 'message-content';
const TEXT = 'message-text';
const TIME = 'message-time';
const MSGFORM ='msgForm';
const TEXTSEND = 'textSend';
const TEXTAREA = 'textArea';

function createMessage(serverOrClient,text){
    let newMessage = document.createElement('div');
    newMessage.classList.add(MESSAGE, serverOrClient);

    let newContent = document.createElement('div');
    newContent.classList.add(CONTENT);

    let newTime = document.createElement('div');
    newTime.classList.add(TIME);
    newTime.innerHTML = new Date().toLocaleTimeString();

    let newText = document.createElement('pre');
    newText.classList.add(TEXT);
    newText.innerHTML = text;

    newContent.append(newText,newTime);
    newMessage.append(newContent);
    
    return newMessage;
}
function postNewMessage(createdMessage){
    let chatFrame = document.querySelector("." + CHATFRAME);
    chatFrame.append(createdMessage);
    let lastMessage = document.querySelector("." + CHATFRAME + " ." + MESSAGE + ":last-child");
    lastMessage.scrollIntoView({behavior:"smooth"});
    lastMessage.dispatchEvent(new Event("message-created", {bubbles:true}));
}

let msgForm = document.querySelector('.' + MSGFORM);
msgForm.addEventListener("keyup", function(event){
    let text = document.querySelector('.' + TEXTAREA);
    if(event.keyCode === 13 && !event.shiftKey) {
        event.preventDefault();
        postNewMessage(createMessage(CLIENT,text.value));
        text.value = "";
    }
});
let button = document.querySelector('.' + TEXTSEND)
button.onclick = function(event){
    let text = document.querySelector('.' + TEXTAREA);
        event.preventDefault();
        postNewMessage(createMessage(CLIENT,text.value));
        text.value = "";
};

let chatFrame = document.querySelector('.' + CHATFRAME);
//event.target.children[0].children[0].innerHTML - access to message
//event.target.classList[1] - access to client/server name

chatFrame.addEventListener("message-created", function(event){
    let messageText = event.target.children[0].children[0].innerHTML;
    let isClient = (event.target.classList[1] == CLIENT);
    if (isClient) {
        getDataFromPoetryDB(event.target.children[0].children[0].innerHTML);
    }
    event.stopPropagation();
});

function getDataFromPoetryDB(pattern){
    const url = 'http://poetrydb.org/lines/' + pattern +'/lines';

    sendXMLHttpRequest(url)
        .then( ok => createServerMessageValid(ok))
        .catch( err => createServerMessageInvalid(err));
};

const sendXMLHttpRequest = (url) => {
    const promise = new Promise((resolve,reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET',url);
        xhr.responseType = 'json';
        xhr.onload = () => {
            if (xhr.response.status == 404) {
                reject(xhr.response.reason);
            }
            else {
                resolve(xhr.response);
                console.log(xhr.response);
            }
        };
        xhr.onerror = () => {
            reject('onerror');
        };
        xhr.send();
    });
    return promise;
}

function createServerMessageValid(detail){
    let repo = detail[0].lines;
    //&#013; &#010;
    let stringArr = [];
    repo.forEach( (val) => {
        stringArr.push(val = '&#013;&#010;' + val);
    })
    console.log(stringArr);
    postNewMessage(createMessage(SERVER,stringArr));
}
function createServerMessageInvalid(detail){
    postNewMessage(createMessage(SERVER,detail));
}
