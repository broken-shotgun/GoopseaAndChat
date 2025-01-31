// TODO enchancement: connect to twitch chat/rewards queue and add "ideas" to mod queue to be used by koboldai story templates as prompt influencers
// TODO call koboldai to create script in chat log format (ex "actor: line")
// TODO add raw script to processing queue (enchancement: add mod queue here)
// TODO pull from raw queue and turn raw script into episode json
// TODO add episode json to queue (shortcut: instead of doing this, add them to a folder I can download and manually copy paste into unity resources folder)
// TODO add express endpoint to download all the episodes ready in the queue and clear the queue

require('dotenv').config()

const consolere = require("console-remote-client");
consolere.connect({
  // server: 'https://console.re', // optional, default: https://console.re
  channel: process.env.CONSOLERE_CHANNEL, // required
  // redirectDefaultConsoleToRemote: true, // optional, default: false
  // disableDefaultConsoleOutput: true, // optional, default: false
});

console.re.log(`https://console.re/${process.env.CONSOLERE_CHANNEL}`);

const KoboldAIClient = require("./kobold");
const koboldai = new KoboldAIClient();

koboldai.start();
