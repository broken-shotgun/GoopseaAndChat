const fetch = require("node-fetch");
const { json } = require("./utils");

module.exports = class GooseAIClient {
  constructor() {
    // https://goose.ai/docs/api/engines
    this.model = "convo-6b"; // Convo 6B seems to be best for sticking to format
    // "gpt-neo-125m";
    // "fairseq-125m";
    // "gpt-j-6b"; 
    // "gpt-neo-2-7b";
    // "fairseq-13b";
    // "gpt-neo-20b";
  }

  /**
   * https://goose.ai/docs/api/completions
   * @param {string[]} prompt 
   * @param {object} options 
   * @returns 
   */
  generate(prompt, options = {}) {
    const requestUrl = `https://api.goose.ai/v1/engines/${this.model}/completions`;
    // const stopTokenRegex = new RegExp(`("<|endoftext|>")$`, "im");
    const postData = {
      prompt: prompt,
      temperature: 0.9, // [0, 1.0]
      // top_p: 0.3, // [0, 1.0], recommended to change this or temperature, but not both
      // presence_penalty: 0, // [-2.0, 2.0]
      // frequency_penalty: 0, // [-2.0, 2.0]
      // repetition_penalty: 1.0, // [0, 8.0]
      // min_tokens: 1,
      // max_tokens: 150,
      // stop: ["<|endoftext|>"],
      ...options
    };
    return fetch(requestUrl, {
      method: "post",
      body: JSON.stringify(postData),
      headers: {
        'Authorization': `Bearer ${process.env.GOOSE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
      .then(json)
      .then((data) => {
        console.log(`gooseai:generate> ${JSON.stringify(data)}`);
        return data.choices[0].text;
        // const response = data.choices[0].text;
        // return response.replace(stopTokenRegex, ""); // remove trailing stop tokens
      })
      .catch((ex) => {
        console.error(`gooseai:generate> error ${ex.name}: ${ex.message}`);
        if (ex.response) {
          console.error(ex.response.data);
        } else {
          console.error(ex.stack);
        }
      });
  }

/**
 * Get the currently loaded AI model.
 * @returns promise
 */
  getCurrentModel() {
    return this.model;
  }
};
