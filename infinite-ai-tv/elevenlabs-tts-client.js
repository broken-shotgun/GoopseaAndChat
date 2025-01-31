const fetch = require("node-fetch");
const { hash, streamToBase64String } = require("./utils");

module.exports = class ElevenLabsTTS {
  /**
   * Uses ElevenLabs Text-to-Speech to synthesize audio from text.
   * 
   * This endpoint returns MP3 bytes.
   * 
   * https://api.elevenlabs.io/docs
   * 
   * @param {string} message text to synthesize
   * @param {string} voice https://uberduck.readme.io/reference/get_voices_voices_get
   * @param {string} languageCode required language code
   * @param audioConfig https://uberduck.readme.io/reference/generate_speech_synchronously_speak_synchronous_post
   * Note: Pace, duration, and pitch are only supported for voices that support these controls (a very small subset of voices).
   * @returns promoise that returns base64 encoded audiocontent or null
   */
  async textToSpeech(message, voice = "chills", audioConfig = {}) {
    // https://uberduck.readme.io/reference/generate_speech_synchronously_speak_synchronous_post
    const requestUrl = "https://api.uberduck.ai/speak-synchronous";
    const postData = {
      voice: voice,
      speech: message,
      ...audioConfig,
    };
    return fetch(requestUrl, {
      method: "post",
      body: JSON.stringify(postData),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.UBERDUCK_API_KEY + ":" + process.env.UBERDUCK_API_SECRET
        ).toString("base64")}`,
        "uberduck-id": "anonymous",
      },
    }).then((response) => {
      return streamToBase64String(response.body);
    });
  }

  voices = [
    //  // disable voice for jack
    //  // disable voice for goopsea
    // Beavis & Butthead
    "beavis", "butthead", "coach-buzzcut", "cotton-hill",
    // King of the Hill
    // "hank-hill", 
    "dale-gribble",  
    // The Simpsons
    "lisa-simpson", "bart-simpson", "homer-simpson-shar", "ralph-wiggum", 
    "seymour-skinner", "chalmers",
    // Futurama
    "zoidberg", 
    // YouTubers
    "chills", 
    //"cr1tikal", 
    "guga-foods", "larry-bundy-jr", "wendover",
    // Actors
    "david-cross", "nick-offerman", "slj", " tyler-perry", "gordon-ramsay", 
    "dr-phil", "judge-judy", "maury", "guy-fieri", "georgecarlincomedy",
    "h-jon-benjamin", "norm-macdonald", "michael-caine", "matt-berry", "robertstack",
    // Rappers
    "e40", "eminem-arpa2", "mc-ride", "ludacris",
    // Random
    "hal-9000",
    "rick-sanchez", "morty",
    "ren-hoek", 
    // "stimpy", too quiet
    "duke-nukem", "mad-mad-mario",
    "carl-wheezer",
    "shaggy",
    "barney-the-dinosaur",
    "spongebob-squarepants", "squidward", "patrick", "mr-krabs", "plankton",
    "zorak", "space-ghost",
    "quagmire", "peter-griffin"
  ];

  /**
   * From provided list of voices, return a random voice.
   * @returns a random Uberduck text-to-speech voice
   */
  getRandomVoice() {
    return this.voices[Math.floor(Math.random() * this.voices.length)];
  }

  getVoice(name) {
    return this.voices[Math.abs(hash(name)) % this.voices.length];
  }

  /**
   * Get a random pitch value for Uberduck text-to-speech voice.
   * @returns a random double between -20.0 (inclusive) and 20.0 (exclusive)
   */
  getRandomPitch() {
    return Math.random() * 40.0 - 20.0;
  }
};
