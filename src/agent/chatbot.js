// Constants and Configurations
const API_URL = "https://sightera-backend.azurewebsites.net/api/v1/";
// const ASSETS_URL = "http://localhost:3000"; // Base URL for styles and images
const ASSETS_URL = "https://app.sightera.ai/agent/build"; // Base URL for styles and images
const CHATBOT_ID = "676cec5153e0c2eab4d44d8e";
function generateReceiverId(length = 24) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const RECEIVER_ID = generateReceiverId();

const config = {
  welcomeMessage: "Hi, welcome to Sightera! Go ahead and send me a message.",
  aiMessageBackgroundColor: "#f7f7f7",
  userMessageBackgroundColor: "#579ffb",
  chatWindowBackgroundColor: "#ffffff",
  widgetPosition: "bottom-right",
  chatbotName: "AI Agent",
  companyName: "Sightera",
  botFontColor: "#FFFFFF",
  userFontColor: "#FFFFFF",
};

let chatRoomId;
let aiContentDiv;
let messagesDiv;       // Define messagesDiv as a global variable
let chatbotInputBox;    // Define chatbotInputBox as a global variable
let loadingIndicator;   // Define loadingIndicator as a global variable
let sendButton;         // Define sendButton as a global variable

// Load styles.css from ASSETS_URL after window load
function loadStyles() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${ASSETS_URL}/css/styles.css`;
  document.head.appendChild(link);
}

// Add Google Fonts link
function addGoogleFontLink() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap";
  document.head.appendChild(link);
}

// Create and insert the chatbot button and interface into the DOM
function createChatbotElements() {
  // Chatbot button
  const chatbotButton = document.createElement("button");
  chatbotButton.id = "chatbot-button-sightera";
  chatbotButton.innerHTML = "&#128172;";
  document.body.appendChild(chatbotButton);

  // Chatbot interface
  const chatbotInterface = document.createElement("div");
  chatbotInterface.id = "chatbot-interface-sightera";
  chatbotInterface.innerHTML = `
    <div id="chatbot-header-sightera"><img src="${ASSETS_URL}/images/sightera-logo-white.svg" class="logo-img-sightera" /><div class="chatbot-name-sightera"> ${config.chatbotName}</div></div>
    <div id="chatbot-messages-sightera"></div>
    <div id="loading-indicator-sightera" style="display: none;">
    <div class="loader-sightera">
      <div class="dot-sightera"></div>
      <div class="dot-sightera"></div>
      <div class="dot-sightera"></div>
    </div>
    </div>
    <div id="chatbot-input-sightera">
      <input id="chatbot-input-box-sightera" type='text' placeholder="Ask me anything..." />
      <button><img class="send-icon-sightera" src="${ASSETS_URL}/images/send.svg" /></button>
    </div>
  `;
  document.body.appendChild(chatbotInterface);

  // Assign global variables for dynamic elements
  messagesDiv = chatbotInterface.querySelector("#chatbot-messages-sightera");
  chatbotInputBox = chatbotInterface.querySelector("#chatbot-input-box-sightera");
  loadingIndicator = chatbotInterface.querySelector("#loading-indicator-sightera");
  sendButton = chatbotInterface.querySelector("button"); // Assign sendButton

  return {
    chatbotButton,
    chatbotInterface
  };
}

// Toggle visibility of the chatbot interface
function toggleChatInterface() {
  const chatbotInterface = document.getElementById("chatbot-interface-sightera");
  if (chatbotInterface.classList.contains("open-sightera")) {
    chatbotInterface.classList.remove("open-sightera");
    setTimeout(() => {
      chatbotInterface.style.display = "none";
    }, 300); // Match the transition duration
  } else {
    chatbotInterface.style.display = "block";
    setTimeout(() => {
      chatbotInterface.classList.add("open-sightera");
    }, 10); // Small delay to trigger transition
  }
}

// Set loading state
function setLoading(isLoading) {
  loadingIndicator.style.display = isLoading ? "block" : "none";
  chatbotInputBox.disabled = isLoading;
  sendButton.disabled = isLoading;
}

// Initialize the Chat Room
function initializeChatRoom() {
  fetch(`${API_URL}conversations/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatbotId: CHATBOT_ID, receiverId: RECEIVER_ID }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Chat room created:", data);
      chatRoomId = data.data._id;
    })
    .catch((error) => console.error("Error:", error));
}

// Load theme settings
function loadThemeSettings() {
  fetch(`${API_URL}themes/get-user-theme?chatBotId=${CHATBOT_ID}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.result === 1) {
        Object.assign(config, data.data);
        applyStyles();
        addMessage(config.welcomeMessage, false); // Display welcome message
      }
    })
    .catch((error) => console.error("Error fetching theme:", error));
}

// Apply dynamic styles
function applyStyles() {
  document.documentElement.style.setProperty(
    "--aiMessageBackgroundColor-sightera",
    config.aiMessageBackgroundColor
  );
  document.documentElement.style.setProperty(
    "--userMessageBackgroundColor-sightera",
    config.userMessageBackgroundColor
  );
  document.documentElement.style.setProperty(
    "--chatWindowBackgroundColor-sightera",
    config.chatWindowBackgroundColor
  );
}

// Format time in AM/PM
function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
}

// Add message to chat window
function addMessage(content, isUser = true, messageRef = null) {
  if (messageRef) {
    messageRef.textContent += content;
    return messageRef;
  }

  const messageDiv = document.createElement("div");
  const wrapperDiv = document.createElement("div");
  wrapperDiv.className = isUser ? "user-message-wrapper-sightera" : "ai-message-wrapper-sightera";
  messageDiv.className = `message-sightera ${isUser ? "user-message-sightera" : "ai-message-sightera"}`;

  const headerDiv = document.createElement("div");
  headerDiv.className = "header-wrapper-sightera";
  headerDiv.innerHTML = `
    <div class="message-header-sightera">${isUser ? "You" : config.chatbotName}</div>
    <div class="message-time-sightera">${formatAMPM(new Date())}</div>
  `;
  
  const contentDiv = document.createElement("div");
  contentDiv.textContent = content;
  messageDiv.append(headerDiv, contentDiv);
  wrapperDiv.append(messageDiv);
  messagesDiv.append(wrapperDiv); // Use global messagesDiv
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  if (!isUser) aiContentDiv = contentDiv;
  return contentDiv;
}

// Handle Send Button Click
function handleSendButtonClick() {
  const message = chatbotInputBox.value.trim();
  if (!message) return;

  addMessage(message, true);
  const currRef = addMessage("", false);
  chatbotInputBox.value = "";
  setLoading(true);

  fetch(`${API_URL}ai/chat?chatbotId=${CHATBOT_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatRoomId, question: message }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      function readStream() {
        reader.read().then(({ done, value }) => {
          if (done) {
            setLoading(false);
            return;
          }
          const aiMessage = decoder.decode(value, { stream: true });
          addMessage(aiMessage, false, currRef);
          readStream();
        });
      }
      readStream();
    })
    .catch((error) => {
      setLoading(false);
      addMessage("Error sending message. Please try again.", false);
    });
}

// Main Initialization Function
window.addEventListener("load", () => {
  loadStyles();
  const { chatbotButton } = createChatbotElements();
  initializeChatRoom();
  loadThemeSettings();
  addGoogleFontLink(); // Add Google Fonts link on window load

  // Event Listeners
  chatbotButton.addEventListener("click", toggleChatInterface);
  sendButton.addEventListener("click", handleSendButtonClick);
  chatbotInputBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendButton.click();
    }
  });
});
