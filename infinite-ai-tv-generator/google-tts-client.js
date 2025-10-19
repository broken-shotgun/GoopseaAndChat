const fetch = require("node-fetch");
const { json, hash } = require("./utils");

module.exports = class GCTTS {
  googleLangCodeRegex = /^([a-z]{2,3}-[a-z]{2,3})-/i

  getLanguageCode(voice) {
    var languageCode = "en-US";
    const languageFound = voice.match(this.googleLangCodeRegex);
    if (languageFound) {
      const [_, langCode] = languageFound;
      languageCode = langCode;
    }
    return languageCode;
  }
  
  /**
   * Uses Google Cloud Text-to-Speech to synthesize audio from text.
   * @param {string} message text to synthesize
   * @param {string} voice https://cloud.google.com/text-to-speech/docs/voices
   * @param {string} languageCode required language code
   * @param audioConfig https://cloud.google.com/text-to-speech/docs/reference/rest/v1beta1/text/synthesize#VoiceSelectionParams
   * @returns promoise that returns base64 encoded audiocontent or null
   */
  async textToSpeech(message, voice="en-US-Neural2-F", audioConfig = {}) {
    const requestUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?alt=json&key=${process.env.TTS_API_KEY}`;
    const postData = {
      input: {
        text: message,
      },
      audioConfig: {
        audioEncoding: "LINEAR16",
        ...audioConfig
      },
      voice: {
        languageCode: this.getLanguageCode(voice),
        name: voice,
      },
    };
  
    return fetch(requestUrl, {
      method: "post",
      body: JSON.stringify(postData),
      headers: {
        Accept: "application/json",
      },
    })
      .then(json)
      .then((res) => {
        return res.audioContent;
      })
      .catch((ex) => {
        console.error(
          `textToSpeech> error ${ex.name}: ${ex.message}`
        );
        if (ex.response) {
          console.error(ex.response.data);
        } else {
          console.error(ex.stack);
        }
        return "";
      });
  }

  voices = [
    // Neural & WaveNet Premium Voices
    // Australia
    // "en-AU-Neural2-A", "en-AU-Neural2-B", "en-AU-Neural2-C", "en-AU-Neural2-D",
    // "en-AU-News-E", "en-AU-News-F", "en-AU-News-G",
    // "en-AU-Wavenet-A", "en-AU-Wavenet-B", "en-AU-Wavenet-C", "en-AU-Wavenet-D",
    // UK
    // "en-GB-Neural2-A", "en-GB-Neural2-B", "en-GB-Neural2-C", "en-GB-Neural2-D", "en-GB-Neural2-F",
    // "en-GB-News-G", "en-GB-News-H", "en-GB-News-I", "en-GB-News-J", "en-GB-News-K", "en-GB-News-L", "en-GB-News-M",
    // US
    // "en-US-Neural2-A", "en-US-Neural2-B", "en-US-Neural2-C", "en-US-Neural2-D", "en-US-Neural2-E", "en-US-Neural2-F", "en-US-Neural2-G", "en-US-Neural2-H", "en-US-Neural2-I", "en-US-Neural2-J",
    // "en-US-News-K", "en-US-News-L", "en-US-News-M", "en-US-News-N",
    // "en-US-Wavenet-A", "en-US-Wavenet-B", "en-US-Wavenet-C", "en-US-Wavenet-D", "en-US-Wavenet-E", "en-US-Wavenet-F", "en-US-Wavenet-G", "en-US-Wavenet-H", "en-US-Wavenet-I", "en-US-Wavenet-J"
    // STANDARD VOICES (Free til 4 million characters)
    // US
    "en-US-Standard-A", "en-US-Standard-B", "en-US-Standard-C", "en-US-Standard-D", "en-US-Standard-E", "en-US-Standard-F", "en-US-Standard-G", "en-US-Standard-H", "en-US-Standard-I", "en-US-Standard-J",
    // Australia
    "en-AU-Polyglot-1", "en-AU-Standard-A", "en-AU-Standard-B", "en-AU-Standard-C", "en-AU-Standard-D",
    // UK
    "en-GB-Standard-A", "en-GB-Standard-B", "en-GB-Standard-C", "en-GB-Standard-D", "en-GB-Standard-F", 
    // German
    "de-DE-Standard-A", "de-DE-Standard-B", "de-DE-Standard-C", "de-DE-Standard-D", "de-DE-Standard-E", "de-DE-Standard-F"
  ];

  /**
   * From provided list of voices, return a random voice.
   * @returns a random Google text-to-speech voice
   */
  getRandomVoice() {
    return this.voices[Math.floor(Math.random() * this.voices.length)];
  }

  getVoice(name) {
    return this.voices[Math.abs(hash(name)) % this.voices.length];
  }

  /**
   * Get a random pitch value for Google cloud text-to-speech voice.
   * @returns a random double between -20.0 (inclusive) and 20.0 (exclusive)
   */
  getRandomPitch() {
    return (Math.random() * 40.0) - 20.0;
  }
}
