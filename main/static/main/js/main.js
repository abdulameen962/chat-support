const chat_element = document.getElementById("chat");
const chat_open_element = document.getElementById("chat_open");
const chat_join_element = document.getElementById("chat_join");
const chat_icon_element = document.getElementById("chat_icon");
const welcome_element = document.getElementById("chat_welcome");
const chat_name = document.getElementById("chat_name");
const chat_room = document.getElementById("chat_room");
const chat_log = document.getElementById("chat_log");
const chat_input = document.getElementById("chat_message_input");
const chat_submit = document.getElementById("chat_message_submit");
const ChatForm = document.getElementById("chat_join_form");
const messageForm = document.getElementById("message_form");

let chatName = ""
let chatSocket = null
let chatWindowUrl = window.location.href;
let chatRoomUUid = Math.random().toString(36).slice(2, 32)

function scrollToBottom() {
    chat_log.scrollTop = chat_log.scrollHeight;
}

function sendMessage() {
    chatSocket.send(JSON.stringify({
        "type": "message",
        "message": chat_input.value,
        "name": chatName
    }))

    chat_input.value = '';

}

function onChatMessage(data) {

    if (data.type == "chat_message") {
        if (data.agent) {
            let tmpinfo = document.querySelector(".tmp-info");

            if (tmpinfo) {
                tmpinfo.remove()
            }
            chat_log.innerHTML += `
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
            chat_log.innerHTML += `
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
    } else if (data.type == "users_update") {
        chat_log.innerHTML += `
                <p class="mt-2"> The admin/agent has joined the chat!  </p>
            `
    } else if (data.type == "writing_active") {
        if (data.agent) {
            let tmpinfo = document.querySelector(".tmp-info");

            if (tmpinfo) {
                tmpinfo.remove()
            }

            chat_log.innerHTML += `
            <div class="tmp-info flex w-full mt-2 space-x-3 max-w-md">
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2"> 
                    ${data.initials} 
                </div>
                <div>
                    <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
                        <p class="text-sm"> The agent/admin is writing a message... </p>  
                    </div> 
                </div>
            </div>
            `
        }
    }
    scrollToBottom();
}

async function JoinChatRoom() {
    chatName = chat_name.value;

    const data = new FormData()
    data.append('name', chatName);
    data.append('url', chatWindowUrl);
    var csrf = document.querySelector("[name='csrfmiddlewaretoken'").value;
    await fetch(`/api/create-room/${chatRoomUUid}/`, {
            method: "POST",
            headers: {
                'X-CSRFToken': csrf,
            },
            body: data,
        })
        .then(response => response.json().then(res => {
            if (response.status == 201) {

            }
        }))
        .catch(error => {
            console.log(error)
        })

    chatSocket = new WebSocket(`ws://${window.location.host}/ws/${chatRoomUUid}/`)

    chatSocket.onmessage = (e) => {
        onChatMessage(JSON.parse(e.data))
    }

    chatSocket.onopen = () => {
        scrollToBottom();
    }

    chatSocket.onclose = () => {
        console.log("Onclose:chat socket was closed");
    }
}


chat_open_element.onclick = (e) => {
    e.preventDefault();

    chat_icon_element.classList.add("hidden");
    welcome_element.classList.remove("hidden");

    return false
}

ChatForm.onsubmit = (e) => {
    e.preventDefault()

    welcome_element.classList.add("hidden");
    chat_room.classList.remove("hidden");


    JoinChatRoom();

    return false
}

messageForm.onsubmit = (e) => {
    e.preventDefault();

    sendMessage();
    return false
}

chat_input.onfocus = (e) => {
    chatSocket.send(JSON.stringify({
        "type": "update",
        "message": 'User is writing a message',
        "name": chatName
            // "agent": '',
    }))
}