require('dotenv').config()

const fs = require("fs");

const consolere = require("console-remote-client");
consolere.connect({
  // server: 'https://console.re', // optional, default: https://console.re
  channel: process.env.CONSOLERE_CHANNEL, // required
  // redirectDefaultConsoleToRemote: true, // optional, default: false
  // disableDefaultConsoleOutput: true, // optional, default: false
});

console.log(`https://console.re/${process.env.CONSOLERE_CHANNEL}`);

const OpenAIClient = require("./openai-client");
const openai = new OpenAIClient();

const KoboldAIClient = require("./kobold-client");
const koboldai = new KoboldAIClient();

const { formatShortPrompt } = require("./prompt");

async function testGenerate(prompt) {
  // const response = await openai.generate(prompt);
  // console.log(response.data.choices[0].text);
  // const rawTxtStory = prompt + "\n" + response.data.choices[0].text;
  
  // ChatGPT API
  const messages = [];
  messages.push({role: "user", content: prompt});

  const generateCount = 5;
  for(var i=0; i<generateCount; ++i) {
    const response = await openai.generateChat(messages);
    console.log(`${response.status} ${response.statusText}: ${JSON.stringify(response.data)}`);

    if (!response.data || response.data.choices.length < 1) break;
    
    console.log(response.data.choices[0].message.content);
    messages.push(response.data.choices[0].message);
  }

  const rawTxtStory = messages.map((msg) => msg.content).join("\n");
  const modResponse = await openai.moderate(rawTxtStory);

  console.log(modResponse.status);
  console.log(modResponse.statusText);
  console.log(JSON.stringify(modResponse.data));

  if (modResponse.data && modResponse.data.results.length > 0) {
    const modCategories = modResponse.data.results[0].categories;

    if (modCategories['sexual/minors'] || 
      modCategories['self-harm'] ||
      modCategories.hate ||
      modCategories['hate/threatening']
    ) {
      const timestamp = new Date(Date.now()).toISOString().replaceAll(":", "-");
      const dirtyFilename = `episodes/raw/DITRY-${timestamp}.txt`
      console.warn(`Story failed moderation check, saving to ${dirtyFilename}...`);
      fs.writeFile(dirtyFilename, rawTxtStory, "utf-8", (err) => {
        if (err) console.error(err);
        else console.warn(`DIRTY STORY OF GOOPSEA READY FOR REVIEW!`);

        process.exit();
      });
      return;
    }

    fs.writeFile(`episodes/raw/story.txt`, rawTxtStory, "utf-8", (err) => {
      if (err) console.error(err);
      else console.log(`RAW TXT STORY OF GOOPSEA READY TO BE PROCESSED!`);

      process.exit();
    });
  }
}

async function testProcess(story) {
  const timestamp = new Date(Date.now()).toISOString().replaceAll(":", "-");
  const episodeNumber = 0;
  const rawStory = {
    name: `episode-${timestamp}-${episodeNumber.toString().padStart(3, '0')}`,
    date: timestamp,
    model: "gpt-3.5-turbo",
    story
  };
  // const episode = await openai.convertToEpisode(rawStory);
  // openai.saveEpisode(rawStory.name, episode, () => { process.exit(); });
  const episode = await koboldai.convertToEpisode(rawStory);
  koboldai.saveEpisode(rawStory.name, episode, () => { process.exit(); });
}

// generate raw AI chatlog text
// const testPrompt = 
// `Goopsea is a witty overweight male cat that loves Mondays and hates every other day of the week. Goopsea is always making jokes and witty remarks. Goopsea loves eating and his favorite food is pierogis. Jack is Goopsea's absent minded owner and roommate.  Jack always has trouble with women and has been single for most of his adult life.  Goopsea and Jack live together in a small house in Ferndale Michigan, a suburb of Detroit.

async function testImageGen(prompt) {
  const imgResponse = await openai.generateImage(prompt);
  console.log(`${imgResponse.status} ${imgResponse.statusText}`);
  
  const imgB64 = imgResponse.data.data[0].b64_json;
  await fs.writeFile("public/test-image.base64.txt", imgB64, "utf-8", (err) => {
    if (err)
      console.error(err);
  });
}

const prompt = "[jack asks goopsea about the moth incident but goopsea keeps avoiding the question]";
testImageGen(prompt);

// Please continue the following conversation with Goopsea.

/*
Goopsea: 
Jack: 
*/

// console.log(formatShortPrompt(process.argv[2]));
// process.exit();

// Goopsea: JACK! I NEED LASAGNA! I am so hungry, I could eat a whole house!
// Jack: Huh? I just ate the last of yesterday's lasagna. Sorry.
// Goopsea: `;
// testGenerate(testPrompt);

// process raw chatlog text to episode JSON
// const testStory = ``;
// testProcess(testStory);

// read raw story tmp file
// fs.readFile("episodes/raw/story.txt", "utf-8", (err, data) => {
//   if (err) console.error(err);
//   else {
//     testProcess(data);
//   }
// });

// run AI generator & processor loop
// openai.start();
