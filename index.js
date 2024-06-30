// Discord packages initialization
const { Client, GatewayIntentBits } = require('discord.js');
// Package initialization for reading console input
const readline = require('readline');
// Client initialization with Bot permissions
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ] 
});
// Retrieving data from config file
const { token, channelId } = require('./config.json');

// Variable to accumulate console input text
let userInput = '';

let lineCount = 0; // Counter for line breaks

// Function called when the bot is ready
client.on('ready', () => {
    console.log(client.user.tag + ' is ready!');

    /*
    # Display a message in the channel when the Bot is launched
    if (channel) {
        channel.send('The bot is now online!');
    } else {
        console.log('The channel was not found.');
    }*/
});

// Function to handle user commands
client.on('messageCreate', message => {
    // Check if the message comes from the specified channel
    if (message.channel.id !== channelId) {
        return; // Ignore the message if it does not come from the correct channel
    }

    if (message.content === '!hello') {
        message.channel.send('Hello everyone!');
    } else if (message.content === '!who-are-you') {
        message.channel.send('Salut à tous, c’est Cyphy, la mascotte officielle de Cyphub ! 🌐🔒');
    } else if (message.content.startsWith('!say ')) {
        const sayMessage = message.content.slice(5).trim(); // Get the text after '!say' and trim any extra spaces
        if (sayMessage) {
            message.channel.send(sayMessage);
        } else {
            message.channel.send('Please provide a message to say.');
        }
    } else if (message.content == '!help') {
        message.channel.send('"!hello" to get a hello message');
        message.channel.send('"!who-are-you" for a presentation');
        message.channel.send('"!say <message>" to make Cyphy speak')
    }
});

// Bot login using the token
client.login(token);

// Read and send console input to the channel
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to send a message while checking length
async function sendMessage(channel, message) {
    try {
        if (message.length <= 2000) {
            await channel.send(message);
            console.log('Message sent successfully.');
        } else {
            console.error('Message length exceeds Discord limit. Message not sent.');
        }
    } catch (error) {
        console.error('Error sending message:', error.message);
        // Handle error here if needed
    }
}

// Read and send console input to the channel
rl.on('line', async line => {
    if (line.trim() === '') {
        lineCount++;
        if (lineCount >= 2) {
            if (userInput.trim() !== '') {
                const channel = client.channels.cache.get(channelId);
                if (channel) {
                    await sendMessage(channel, userInput);
                    userInput = ''; // Reset userInput after sending
                    lineCount = 0; // Reset line break counter
                } else {
                    console.log('Channel not found.');
                    userInput = ''; // Reset userInput if channel is not found
                    lineCount = 0; // Reset line break counter
                }
            }
        } else {
            userInput += '\n'; // Add a line break in userInput as a "shift+enter"
        }
    } else {
        userInput += (userInput.length > 0 ? '\n' : '') + line; // Add the line to userInput with a normal line break
        lineCount = 0; // Reset line break counter as a valid new line has been added
    }
});