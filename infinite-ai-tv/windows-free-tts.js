module.exports = class WindowsTTS {
  /**
   * Uses Windows SAPI 5
   * @param {string} message text to synthesize
   * @param {string} voice 
   * @param {object} options speaking pitch and rate options
   * @returns promoise that returns base64 encoded audiocontent or null
   */
  async textToSpeech(message, voice = "Microsoft David Desktop", options = {}) {
    // TODO: figure out how to use SAPI to generate a file, then base64 file to string and return
  }

  voices = [
    "Microsoft David Desktop",
    "Microsoft Zira Desktop",
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