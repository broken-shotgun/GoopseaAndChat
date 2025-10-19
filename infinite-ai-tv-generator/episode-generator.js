const fs = require("fs");
const { chunkify, getRandomInt, shuffle } = require("./utils");
// const { censor } = require("./censor");
// const GCTTS = require("./google-tts-client");
// const WinTTS = require("./windows-free-tts");
const ElevenLabsTTS = require("./elevenlabs-tts-client");
//const KoboldAIClient = require("./kobold-client");
const { OpenAIClient } = require("./openai-client");
const { raw } = require("express");
// const GooseAIClient = require("./goose-client");

module.exports = class EpisodeGenerator {
  constructor() {
    // this.tts = new GCTTS();
    // this.tts = new WinTTS();
    this.tts = new ElevenLabsTTS();
    // this.koboldai = new KoboldAIClient();
    this.openai = new OpenAIClient();
    // this.gooseai = new GooseAIClient();
    this.running = false;
    this.continue = false;
    this.continueCount = 0;
    this.currentMessages = [];
    this.userPromptQueue = [];
    this.rawEpisodeQueue = [];
    this.episodeNumber = 1;
    this.chatLogDivider = ">>";
    this.lineRegex = new RegExp(`^([^\n\r${this.chatLogDivider}]*)${this.chatLogDivider} (.+)$`, "i");
    this.prevModifierIndex = -1
    this.setupPrompt = `
You are writing a script for an episode between the following characters: Goopsea, Jack, and Woadie.

- Every line of text you write should be formatted like this:
CHARACTER ${this.chatLogDivider} LINE OF DIALOG

- Every line of dialog should end with a newline.
- Every line of the script should be dialog between the characters: Goopsea, Jack, and Woadie.
- Don't repeat the initial user prompt or state your reasoning.
`;
// You are a seasoned cartoon show writer.
// - Goopsea is a depressed wisecracking overweight cat.  Goopsea LOVES food.
// - Woadie is a super intelligent frog dog.  He acts like Urkel from Family Matters.  Woadie was a secret government experiment that escaped and so he is always hiding from government agents.
// - Jack is an anxious overworked accountant. Jack dreams of becoming a battle rapper like Eminem and always looks for an opportunity to rhyme.
// - Keep the episode interesting, engaging, and make sure to progress the story.
// - The current time is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
    // https://en.wikipedia.org/wiki/The_Thirty-Six_Dramatic_Situations
    this.modifiers = shuffle([
      // "Continue the script and focus on the initial topic.",
      "Continue and make the characters experience or achieve something amazing.",
      // "Continue the script and make the characters experience a downfall and have an unhappy ending.",
      // "Continue the script and have one of the characters fail.",
      // "Continue the script make it a comedy.",
      "Continue and make it a tragedy.",
      "Continue and make it sad.",
      "Continue and make it happy.",
      "Continue and introduce a celebrirty or famous character.",
      // "Continue and make all the characters breakout into a WWE style wrestling match.",
      "Continue and give one of the characters a supernatural power.",
      "Continue and introduce an apocalyptic event.",
      "Continue and make it into a heroes story.",
      "Continue and make one of the characters gain something new.",
      "Continue and introduce a conflict.",
      "Continue and make one of the characters master a new thing.",
      "Continue and make one of the characters fall victim to madness.",
      "Continue and make one of the characters get revenge",
      "Continue and introduce a sudden disaster.",
      "Continue and make one of the characters start a new enterprise.",
      "Continue and make one of the characters self-sacrifice for an ideal.",
      "Continue and make one of the characters self-sacrifice for kin.",
      "Continue and make one of the characters self-sacrifice for passion.",
      "Continue and make one of the characters face off against a rival.",
      "Continue and make one of the characters have a conflict with a god.",
      "Continue and make one of the characters deal with remorse.",
      // "Continue and make one of the characters overcome a monster.",
      "Continue and make one of the characters go on a quest.",
      "Continue and make one of the characters change their ways and become a better individual.",
      "Continue and make one of the characters go on a voyage.",
      "Continue and have the characters experience a natural disaster.",
      "Continue and have the characters experience an unnatural disaster."
    ]);
  }

  /**
   * @typedef {Object} UserPromptOptions
   * @property {boolean} skiptts Skips generating TTS audio for this prompt. (For testing)
   * @property {number} generateCount how many times should AI attempt to generate response before next prompt
   * @property {number} generateTokenAmount the max tokens per generate
   */

  /**
   * @typedef {Object} UserPrompt
   * @property {string} user Twitch username who submitted this prompt
   * @property {string} date timestamp for when reward was redeemed
   * @property {string} prompt formatted episode prompt
   * @property {string} location episode location
   * @property {string} model ai model to use for this prompt
   * @property {UserPromptOptions} options 
   */

  /**
   * Add user submitted prompt to queue.
   * @param {UserPrompt} userPrompt object with user, date, and prompt
   * @returns true if prompt added, false if user already has a pending prompt
   */
  addPrompt(userPrompt) {
    if (this.userPromptQueue.find(p => p.user === userPrompt.user)) {
      return false;
    }
    this.userPromptQueue.push(userPrompt);
    return true;
  }

  /**
   * Manually adds story to processing queue (bypasses moderation).
   * @param {RawEpisode} rawEpisode 
   */
  addRawEpisode(rawEpisode) {
    const updatedEpisodeName = `episode-${rawEpisode.date}-${this.episodeNumber.toString().padStart(3, '0')}-${rawEpisode.model}-${rawEpisode.user}`;
    this.episodeNumber += 1;
    rawEpisode.name = updatedEpisodeName;
    this.rawEpisodeQueue.push(rawEpisode);
  }

  /**
   * Save the raw text version of the story to local folder.
   * @param {string} storyName filename
   * @param {string} rawTxtStory raw formatted story
   * @param {Function} callback called when writeFile is completed
   */
  saveStoryTextLocal(storyName, rawTxtStory, callback = () => {}) {
    console.log("saving current story...");
    fs.writeFile(`episodes/raw/${storyName}.txt`, rawTxtStory, "utf-8", (err) => {
      if (err) console.error(err);
      else console.log(`Success!  Story saved to: episodes/raw/${storyName}.txt`);
      if (callback) callback();
    });
  }

  start() {
    this.running = true;
    
    this.runGeneratorV3();
    this.runProcessor();
  }

  stop() {
    this.running = false;
  }

  /**
   * Run more interactive AI generation loop using GooseAI to generate responses.
   */
  async runGeneratorV3() {
    if (!this.running) return;
    if (this.userPromptQueue.length < 1) {
      setTimeout(this.runGeneratorV3.bind(this), 100);
      return;
    }

    const currentUserPrompt = this.userPromptQueue.shift();
    const currentLocation = this.getRandomLocation();
    this.openai.setCurrentModel(currentUserPrompt.model);
    try {
      const messages = [];
      if (this.continue) { // continue previous episode
        this.continueCount++;
        messages.push(...this.currentMessages); // add all messages from previous episode(s)

        // openai
        messages.push({role: "user", content: currentUserPrompt.prompt});

        // gooseai
        // messages.push(currentUserPrompt.prompt);

        console.log(`continuing previous episode, current episode arc = ${this.continueCount + 1} episodes`);
      }
      else { // new episode
        console.log(`starting new episode`);
        this.continueCount = 0;
        this.currentMessages = [];

        // openai
        messages.push({role: "system", content: this.setupPrompt});
        messages.push({role: "user", content: currentUserPrompt.prompt});

        // gooseai
        // messages.push(this.setupPrompt);
        // messages.push(currentUserPrompt.prompt);
      }

      const generateCount = currentUserPrompt.options.generateCount ? Number(currentUserPrompt.options.generateCount) : 1;
      const modifierIndex = getRandomInt(this.modifiers.length);
      while (modifierIndex == this.prevModifierIndex) modifierIndex = getRandomInt(this.modifiers.length); // guarentee new modifier
      this.prevModifierIndex = modifierIndex;
      //var prevRemainingTokens = 0;
      for(let i=0; i<generateCount; ++i) {
        const isEndOfEpisode = i > 0 && i == generateCount-1;
        if (isEndOfEpisode) {
          messages.push({role: "user", content: "Wrap up the episode in a satisfying way or with a cliffhanger ending that makes the viewer want to watch the next episode." });
        }
        else if (i > 0) {
          const midPrompt = this.modifiers[modifierIndex];
          console.log(`generator:modify> ${midPrompt.toUpperCase()}`);
          // openai
          messages.push({role: "system", content: midPrompt });
          // // gooseai
          // // messages.push(`[${midPrompt}]`);
          // messages.push({role: "user", content: `Continue the episode, this is act ${i+1} of ${generateCount}.` });
        }

        // openai
        const maxTokens = currentUserPrompt.options.generateTokenAmount ? Number(currentUserPrompt.options.generateTokenAmount) : 500; //isEndOfEpisode ? 1000 : 500; //this.getMaxTokens(i, generateCount); // + prevRemainingTokens;

        // gooseai
        // const maxTokens = 500; // gooseai

        let response;
        try {
          console.log(`generator:tokens> [${i}] generating with max tokens = ${maxTokens}`);

          // openai
          response = await this.openai.generateChat(messages, { max_tokens: maxTokens });

          // gooseai
          // response = await this.gooseai.generate(messages, { min_tokens: maxTokens / 2, max_tokens: maxTokens });
        } catch(generateErr) {
          console.error(generateErr);
          continue;
        }
        if (!response) {
          console.warn(`generator:generate> null generate response, skipping...`);
          continue;
        }

        console.log(`generator:generate> ${JSON.stringify(response)}`);
  
        // openai
        if (response.choices.length > 0){
        // gooseai
        // if (response) {
          console.log(`generator:generate> ${response.choices[0].message.content}`);
          messages.push(response.choices[0].message);
          //prevRemainingTokens = maxTokens - response.usage.completion_tokens;
          //if (prevRemainingTokens < 0) prevRemainingTokens = 0;

          // gooseai
          // messages.push(response);
          // prevRemainingTokens = 0;

         // console.log(`generator:generate> LEFTOVER TOKENS = ${prevRemainingTokens}`);
        } else {
          console.warn(`generator:generate> no responses data and/or choices`);
        }
      }
  
      var rawTxtStory;
      var episodeName;
      const service = "openai"; // openai, gooseai
      let storyMessages = [];
      if (this.continue) { 
        episodeName = `episode-${currentUserPrompt.date.replaceAll(":", "-")}-${this.episodeNumber.toString().padStart(3, '0')}-part-${this.continueCount + 1}-${service}-${currentUserPrompt.user}`;
        storyMessages = messages.splice(this.currentMessages.length); // only process latest episode in the continue saga
      } else {
        episodeName = `episode-${currentUserPrompt.date.replaceAll(":", "-")}-${this.episodeNumber.toString().padStart(3, '0')}-${service}-${currentUserPrompt.user}`;
        storyMessages = messages;
        console.log(`generator:messages>`, JSON.stringify(messages));
      }

      // openai
      rawTxtStory = currentUserPrompt.prompt + "\n" + storyMessages
        .filter((msg) => msg.role === "assistant")
        .map((msg) => msg.content)
        .join("\n");

      // gooseai
      // rawTxtStory = currentUserPrompt.prompt + "\n" + storyMessages.join("\n");

      const aiModel = this.openai.getCurrentModel();

      const rawEpisode = {
        name: episodeName,
        date: currentUserPrompt.date,
        user: currentUserPrompt.user,
        model: aiModel,
        location: currentUserPrompt.location ?? currentLocation,
        story: rawTxtStory.replace(/[’']/gim, ""),
        skiptts: currentUserPrompt.options.skiptts,
        //ai_img_background: img_b64
      };

      // openai
      // await this.moderateEpisode(rawEpisode); skip auto-moderation
      this.rawEpisodeQueue.push(rawEpisode); // comment this out if moderation enabled

      this.episodeNumber += 1;
      this.continue = false;
      this.currentMessages = messages; // messages.splice(this.currentMessages.length); // if the cost is outrageous, only store last episode into memory
    } catch (err) {
      console.warn(`runGeneratorV3> Error generating prompt for ${currentUserPrompt.user}`);
      console.error(err);
    }

    setTimeout(this.runGeneratorV3.bind(this), 100);
  }

  /**
   * Get the number of tokens to have the ai generate.
   * @param {number} generateIndex The current generation round
   * @param {number} generateCount The total number of generations
   * @returns max number of tokens to generate
   */
  getMaxTokens(generateIndex, generateCount) {
    return (generateIndex==0) ? 300 :
      (generateIndex==1) ? 300 :
      // (generateIndex==(generateCount-1)) ? 32 :
      300;
  }

  /**
   * Mark the current episode for continuation.
   * 
   * The next episode will have the context of the previous episode or episodes.
   * 
   * It will remember multiple episodes if continue has been called for each.
   */
  markContinue() {
    this.continue = true;
  }

  previousLocationIndex = -1
  /**
   * Get a random location.  Always returns a different location from the previous.
   * @returns an episode location id
   */
  getRandomLocation() {
    var random5 = getRandomInt(5);
    while (random5 == this.previousLocationIndex) random5 = getRandomInt(5);
    this.previousLocationIndex = random5;
    return random5 == 0 ? "kitchen" : 
      random5 == 1 ? "living-room" :
      random5 == 2 ? "italian-restaurant" :
      random5 == 3 ? "litter-box" : 
      "transmission-factory";
  }

  getLocationPrompt(location) {
    var prompt;
    switch(location) {
      case "kitchen":
        prompt = "Jack's outdated kitchen";
        break;
      case "living-room":
        prompt = "Jack's living room with a big blue couch and Goopsea's large cat tree";
        break;
      case "italian-restaurant":
        prompt = "a chain Italian restaurant";
        break;
      case "litter-box":
        prompt = "a spare bedroom in Jack's house covered in sand";
        break;
      case "transmission-factory":
        prompt = "the transmission plant where Jack works";
        break;
      default: prompt = "";
    }
    return prompt;
  }

  /**
   * Run episode process loop.
   * 
   * 1. check if story in queue to process, poll from queue if not empty
   * 2. process story into episode json
   * 3. save episode json to data/ folder
   */
  async runProcessor() {
    if (!this.running) return;

    if (this.rawEpisodeQueue.length >= 1) {
      const rawEpisode = this.rawEpisodeQueue.shift();
      const episode = await this.processEpisode(rawEpisode);
      this.saveEpisode(rawEpisode.name, episode);
    }

    setTimeout(this.runProcessor.bind(this), 100);
  }

  /**
   * @typedef {Object} RawEpisode
   * @property {string} name story name
   * @property {string} date timestamp for when story was generated
   * @property {string} user user who submitted prompt
   * @property {string} model ai model used to generate story
   * @property {string} location the episode location id
   * @property {string} story formatted ai generated story
   * @property {string} ai_img_background base 64 generated image for background
   * @property {boolean} skiptts
   */

  /**
   * @typedef {Object} Direction
   * @property {string} type
   * @property {string} target
   */

  /**
   * @typedef {Object} Episode
   * @property {string} id 
   * @property {string} date timestamp for when story was generated
   * @property {string} user 
   * @property {string} model ai model used to generate story
   * @property {Array<Direction>} directions
   * @property {string} ai_img_background base 64 generated image for background
   */

  /**
   * Process raw episode to a playable episode object.
   * @param {RawEpisode} rawEpisode raw episode json without stage directions or processed TTS
   * @returns a processed episode object with stage directions & base64 encoded TTS audio
   */
  async processEpisode(rawEpisode) {
    const episode = {
      id: rawEpisode.name,
      date: rawEpisode.date,
      user: rawEpisode.user,
      model: rawEpisode.model,
      directions: [],
      ai_img_background: rawEpisode.ai_img_background
    };

    episode.directions.push({ type: "intro" });
    episode.directions.push({
      type: "play-timeline",
      target: "establishing-shot-house"
    });
    episode.directions.push({
      type: "change-location",
      target: rawEpisode.location
    });
    episode.directions.push({
      type: "change-camera",
      target: "wide",
    });
    episode.directions.push({
      type: "pause",
      duration: 1
    });
    
    const formattedLines = rawEpisode
      .story
      .split("\n")
      .map(x => x.trim());

    for (const line of formattedLines) {
      // console.log(`$$$ ${line}`);
      if (line === "") continue;

      const match = line.match(this.lineRegex);

      var actor;
      var dialog;
      if (match) {
        actor = match[1];
        if (!actor || actor === "") actor = "narrator";
        else actor = actor.trim().toLowerCase()
        dialog = match[2];
      } else {
        actor = "narrator";
        dialog = line;
      }

      if (dialog === "") continue;

      await this.addLine(actor, dialog, episode, rawEpisode.skiptts);

      episode.directions.push({
        type: "pause",
        duration: 0.25 + (getRandomInt(100) / 100.0)
      });
    }
    
    episode.directions.push({ type: "end" });
    
    return episode;
  }

  async addLine(actor, dialog, episode, skiptts) {
    const chunks = chunkify(dialog);
    for (const chunk of chunks) {
      // vary camera angle for every chunk of dialoge
      const random100 = getRandomInt(100);
      const cameraTarget = random100 < 50 ? actor :
        random100 < 75 ? `${actor}-close` :
        "wide";
      episode.directions.push({
        type: "change-camera",
        target: cameraTarget,
      });

      var base64Audio;
      /*
      if (!skiptts) {
        try {
          // Google TTS
          // const voiceType = "Standard"; //"Neural2";
          // base64Audio =
          //   actor === "jack" ? await this.tts.textToSpeech(chunk, `en-US-${voiceType}-D`, { pitch: 4.8, })
          //     : actor === "goopsea" ? await this.tts.textToSpeech(chunk, `en-US-${voiceType}-J`, { pitch: -1.8, })
          //     : actor === "woadie" ? await this.tts.textToSpeech(chunk, `de-DE-${voiceType}-D`, { pitch: -4.8, speakingRate: 1.4 })
          //     : actor === "narrator" ? await this.tts.textToSpeech(chunk, `en-US-${voiceType}-I`, { pitch: -3.6, speakingRate: 1.11 })
          //     : await this.tts.textToSpeech(chunk, this.tts.getVoice(actor), this.tts.getRandomPitch());

          // TODO update for WinTTS
          
          // ElevenLabsTTS
          base64Audio =
              actor === "goopsea" ? await this.tts.textToSpeech(chunk) // default narrator voice for Goops (Brian)
              : actor === "jack" ? await this.tts.textToSpeech(chunk, "bIHbv24MWmeRgasZH58o") // Will
              : actor === "woadie" ? await this.tts.textToSpeech(chunk, "onwK4e9ZLuTAKqWW03F9") // Daniel
              : actor === "narrator" ? await this.tts.textToSpeech(chunk, "cjVigY5qzO86Huf0OWal") // Eric
              : await this.tts.textToSpeech(chunk, this.tts.getVoice(actor).voice_id); // random voice for everyone else
        } catch (error) {
          console.warn(`TTS error - problem generating audio ${error.name}`);
        }
      }
      //*/

      // text-to-speech chunk
      episode.directions.push({
        type: "dialog",
        target: actor,
        text: chunk,
        audio: base64Audio
      });
    }
  }

  /**
   * Save the episode to a JSON file.
   * @param {string} name save file name
   * @param {Episode} episode
   */
  saveEpisode(name, episode, callback=()=>{}) {
    if (episode.directions.length <= 6) { // the base number of directions added (currently: intro, establishing, location, cam, pause, end)
      console.warn(`episode ${name} has no dialog and will be skipped.  Please check connection to KoboldAI API.`);
      // TODO should this also stop the queue?
      return;
    }

    fs.writeFile(`episodes/${name}.json`, JSON.stringify(episode), "utf-8", (err) => {
      if (err) console.error(err);
      else console.log(`(^.^) NEW EPISODE OF GOOPSEA IS AVAILABLE: ${name}!`);
      if (callback) callback();
    });
  }
};