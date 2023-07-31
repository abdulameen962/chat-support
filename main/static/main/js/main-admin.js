/**
 * Variables
 */

const chatRoom = document.getElementById("room_uuid").textContent.replaceAll('"', '')
let chatSocket = null

/**
 * Elements
 */

const chatLog = document.getElementById("chat_log");
const chatInput = document.getElementById("chat_message_input");
const chatSubmit = document.getElementById("chat_message_submit");
const messageForm = document.getElementById("message_form");


/**
 * Functions
 */
function scrollToBottom() {
    chatLog.scrollTop = chatLog.scrollHeight;
}

function sendMessage() {
    chatSocket.send(JSON.stringify({
        "type": "message",
        "message": chatInput.value,
        "name": document.getElementById("user_name").textContent.replaceAll('"', ''),
        "agent": document.getElementById("user_id").textContent.replaceAll('"', ''),
    }))

    chatInput.value = '';

}

function onChatMessage(data) {

    if (data.type == "chat_message") {
        if (!data.agent) {
            let tmpinfo = document.querySelector(".tmp-info");

            if (tmpinfo) {
                tmpinfo.remove()
            }
            chatLog.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2"> 
                        ${data.initials} 
                    </div>
                    <div>
                        <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm"> ${data.message} </p>  
                        </div> 
                        <span class="text-xs text-gray-500 leading-none"> ${data.created_at} ago  </span>
                    </div>
                </div>
            `
        } else {
            chatLog.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 ml-auto justify-end max-w-md">
                    <div>
                        <div class="bg-blue-300 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm"> ${data.message} </p>  
                        </div> 
                        <span class="text-xs text-gray-500 leading-none"> ${data.created_at} ago  </span>
                    </div>
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2"> 
                        ${data.initials} 
                    </div>
                </div>
            `
        }
    } else if (data.type == "writing_active") {
        if (!data.agent) {
            let tmpinfo = document.querySelector(".tmp-info");

            if (tmpinfo) {
                tmpinfo.remove()
            }

            chatLog.innerHTML += `
                <div class="tmp-info flex w-full mt-2 space-x-3 max-w-md">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2"> 
                        ${data.initials} 
                    </div>
                    <div>
                        <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm"> User is writing a message... </p>  
                        </div> 
                    </div>
                </div>
            `
        }
    } else if (data.type == "closed_message") {
        if (!data.agent) {
            chatLog.innerHTML += `
                <div class="tmp-info flex w-full mt-2 space-x-3 max-w-md">
                    <div>
                        <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm"> User left the chat room and it has been closed </p>  
                        </div> 
                    </div>
                </div>
            `
        }
    }
    scrollToBottom();
}

/**
 * Web Socket
 */

chatSocket = new WebSocket(`ws://${window.location.host}/ws/${chatRoom}/`)

chatSocket.onmessage = (e) => {
    onChatMessage(JSON.parse(e.data))
}

chatSocket.onopen = () => {
    scrollToBottom();
}

chatSocket.onclose = () => {
    console.log("Chatsocket closed unexpectedly")
}

messageForm.onsubmit = (e) => {
    e.preventDefault();

    sendMessage();
    return false
}

chatInput.onfocus = (e) => {
    chatSocket.send(JSON.stringify({
        "type": "update",
        "message": 'Agent is writing a message',
        "name": document.getElementById("user_name").textContent.replaceAll('"', ''),
        "agent": document.getElementById("user_id").textContent.replaceAll('"', ''),
    }))
}