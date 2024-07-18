// Discord packages initialization
const { Client, GatewayIntentBits } = require("discord.js");
// Package initialization for reading console input
const readline = require("readline");
// Client initialization with Bot permissions
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
// Retrieving data from config file
const config = require("./config.json");
const token = config.token;
let channelId = config.channelId;
const channels = config.channels;

// Read and send console input to the channel
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "Cyphy >> ",
});

// Bot login using the token
client.login(token);
// Variable to accumulate console input text
let userInput = "";
// Counter for line breaks
let lineCount = 0;

let mode = "main";

// Function called when the bot is ready
client.on("ready", () => {
  console.log(client.user.tag + " is ready!");
  console.log("\n[Cyphy's console]");
  console.log(
    "q - quit console\nsendmessage|sm - send message to the channel selected (default 'test-cyphy')\ncc|channelconsole - open change channel Id console",
    "\n",
  );
  mainPrompt();
});

// Function to handle user commands
client.on("messageCreate", (message) => {
  // Check if the message comes from the specified channel
  if (message.channel.id !== channelId) {
    return; // Ignore the message if it does not come from the correct channel
  }

  if (message.content === "!hello") {
    message.channel.send("Hello everyone!");
  } else if (message.content === "!who-are-you") {
    message.channel.send(
      "Salut à tous, c’est Cyphy, la mascotte officielle de Cyphub ! 🌐🔒",
    );
  } else if (message.content.startsWith("!say ")) {
    const sayMessage = message.content.slice(5).trim(); // Get the text after '!say' and trim any extra spaces
    if (sayMessage) {
      message.channel.send(sayMessage);
    } else {
      message.channel.send("Please provide a message to say.");
    }
  } else if (message.content == "!help") {
    message.channel.send('"!hello" to get a hello message');
    message.channel.send('"!who-are-you" for a presentation');
    message.channel.send('"!say <message>" to make Cyphy speak');
  }
});

// Function to send a message while checking length
async function sendMessage(channel, message) {
  try {
    if (message.length <= 2000) {
      await channel.send(message);
      console.log("Message sent successfully.");
    } else {
      console.error("Message length exceeds Discord limit. Message not sent.");
    }
  } catch (error) {
    // Handle error
    console.error("Error sending message:", error.message);
  }
}

// Read and send console input to the channel
function sendMessageInChannel(channelId) {
  console.log("Type your message here :");
  mode = "sendMessage";
  rl.prompt();
}

rl.on("line", async (line) => {
  if (mode === "sendMessage") {
    if (line.trim() === "") {
      lineCount++;
      if (lineCount >= 2) {
        if (userInput.trim() !== "") {
          const channel = client.channels.cache.get(channelId);
          if (channel) {
            await sendMessage(channel, userInput);
            userInput = ""; // Reset userInput after sending
            lineCount = 0; // Reset line break counter
            mode = "main";
            mainPrompt();
          } else {
            console.log("Channel not found.");
            userInput = ""; // Reset userInput if channel is not found
            lineCount = 0; // Reset line break counter
            mode = "main";
            mainPrompt();
          }
        }
      } else {
        userInput += "\n"; // Add a line break in userInput as a "shift+enter"
      }
    } else {
      userInput += (userInput.length > 0 ? "\n" : "") + line; // Add the line to userInput with a normal line break
      lineCount = 0; // Reset line break counter as a valid new line has been added
    }
  } else if (mode === "changeChannelIdConsole") {
    if (line === "q") {
      console.log("[Exit Change channel ID console...]\n");
      mode = "main";
      mainPrompt();
    } else if (line === "ls") {
      for (let channel in channels) {
        console.log(channel, ": ", channels[channel]);
      }
    } else {
      let set = false;
      for (let channel in channels) {
        if (line === channel) {
          channelId = channels[line];
          set = true;
          console.log("channel set to: ", line);
        }
      }
      if (/^\d+$/.test(line)) {
        channelId = line;
        console.log("channel Id set to: ", line);
      } else if (set === false) {
        console.log(`"${line}" not know`);
      }
    }
    rl.prompt();
  } else {
    if (line === "q") {
      rl.close();
    } else if (line === "sendmessage" || line === "sm") {
      rl.setPrompt("");
      sendMessageInChannel(channelId);
    } else if (line === "cc" || line === "channelconsole") {
      console.log("\n[Change channel Id console]");
      console.log(
        "Enter channel id or channel name and press enter or use :\n\tls - channels list\n\tq - quit",
      );
      channelConsole();
    } else {
      console.log(`Wrong command: "${line}"`);
      mainPrompt();
    }
  }
});

// Prompt function for the main mode
function mainPrompt() {
  if (mode === "main") {
    rl.setPrompt("Cyphy >> ");
    rl.prompt();
  }
}

// Change the console to channel Id console
function channelConsole() {
  rl.setPrompt("Cyphy - Change channel Id concsole >> ");
  mode = "changeChannelIdConsole";
  rl.prompt();
}

// Exit function
rl.on("close", () => {
  console.log("Good bye!");
  process.exit(0);
});
