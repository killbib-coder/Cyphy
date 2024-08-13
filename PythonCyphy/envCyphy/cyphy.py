import discord
import json
import asyncio
import aioconsole

# Load the configuration from the conf.json file
with open('config.json') as config_file:
    config = json.load(config_file)

TOKEN = config['token']
CHANNELS = config['channels']
channel_id = int(config['channelId'])

# Initialize the Discord client
intents = discord.Intents.default()
client = discord.Client(intents=intents)

async def send_message_in_channel(message):
    global channel_id  # Ensure we use the global channel_id
    # Retrieve the channel
    channel = client.get_channel(channel_id)
    if channel is not None:
        # Send a message to the channel
        await channel.send(message)
        print(f"Message sent in channel {channel_id}")
    else:
        print(f"Channel with ID {channel_id} not found.")

async def cli(cli_prefix):
    global channel_id
    while True:
        cli_input = await aioconsole.ainput(cli_prefix)
        if cli_input in ["sm", "sendmessage"]:
            print("Sending message")
            message_input = await aioconsole.ainput("Cyphy - WriteMessage >> ")
            await send_message_in_channel(message_input)
        elif cli_input in ["cl", "channellist"]:
            print("List of channels")
            for channel in CHANNELS:
                print(f"{channel} - {CHANNELS[channel]}")
        elif cli_input in ["cc", "changechannel"]:
            print("Changing channel")
            channel_input = await aioconsole.ainput("Cyphy - Channel >> ")
            if channel_input.isdigit():
                channel_id = int(channel_input)
                print("Channel ID was changed")
            else:
                id_changed = False
                for channel in CHANNELS:
                    if channel_input == channel:
                        channel_id = int(CHANNELS[channel])  # Convert to int here
                        id_changed = True
                if id_changed:
                    print("Channel ID was changed")
                else:
                    print("Channel ID was not changed...")
        elif cli_input in ["q", "quit"]:
            print("Exit...")
            await client.close()
            break
        else:
            print("Wrong command...")

@client.event
async def on_ready():
    print(f"Connected as {client.user}")
    await cli("Cyphy >> ")

# Start the bot
client.run(TOKEN)
