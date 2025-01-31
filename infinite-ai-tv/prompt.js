/**
 * Formats a shortcode promt to one ready to submit to AI
 * @param {string} rawPrompt 
 * @returns formatted string of prompt for AI
 */
function formatShortPrompt(rawPrompt) {
  const chatLogDivider=">>";
  const chatLogRegex = new RegExp(`(?=\\w+${chatLogDivider})`, "i");
  const formattedLines = rawPrompt
    .split(chatLogRegex)
    .map((x) => x.trim());
  const lineRegex = new RegExp(`^(\\w+)${chatLogDivider} (.+)$`, "i");
  var formattedPrompt = "";

  var lastActor = "";
  for (const [i, line] of formattedLines.entries()) {
    const match = line.match(lineRegex);
    if (!match) {
      if (i == 0) formattedPrompt += `[${line}]\n`;
      continue;
    }

    const actorCode = match[1].toLowerCase();
    const dialog = match[2];
    const actor =
      actorCode == "g" ? "Goopsea" : 
      actorCode == "j" ? "Jack" : 
      actorCode == "w" ? "Woadie" : 
      match[1];
    formattedPrompt += `${actor}: ${dialog}\n`;

    lastActor = actor;
  }

  // if (lastActor == "Goopsea") {
  //   formattedPrompt += `Jack${chatLogDivider} `;
  // } if (lastActor == "Jack") {
  //   formattedPrompt += `Woadie${chatLogDivider} `;
  // } else {
  //   formattedPrompt += `Goopsea${chatLogDivider} `;
  // }
  
  return formattedPrompt;
}

module.exports = { formatShortPrompt };
