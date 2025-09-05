const { time } = require("console");
const fs = require("fs");
const path = require('path');

/**
 * @typedef {Object} Direction
 * @property {string} type direction type
 * @property {string} target
 */

// enum DirectionType {
//     Intro = "intro",
//     PlayTimeline = "play-timeline",
//     ChangeLocation = "change-location",
//     ChangeCamera = "change-camera",
//     Pause = "pause",
//     Dialog = "dialog"
// }

/**
 * @typedef {Object} Episode
 * @property {string} id 
 * @property {string} date timestamp for when story was generated
 * @property {string} user 
 * @property {string} model ai model used to generate story
 * @property {Array<Direction>} directions
 * @property {string} ai_img_background base 64 generated image for background
 */

// const episodeRegex = new RegExp("^episode-(.*)-(\\d{3})-\\w*\\-*(\\d*)\\-*openai-(\\w*)\\.json$");
const episodeRegex = /^episode-(.*)-?(\d{3})-\w*\-*(\d*)\-*openai-(.*)\.json$/i;
const firstSentenceRegex = /^(.*?[.!?](?=\s[A-Z]|\s?$)(?!.*\)))/i;

const episodesDir = fs.readdirSync("episodes");
var exportXml = "<root>";

var prevNumber = "";
for (const item of episodesDir) {
    // console.log(`item = ${item}`);
    // const currentPath = path.join("episodes", item);
    // console.log(`current path = ${currentPath}`);
    const match = item.match(episodeRegex);
    if (match) {
        const timestamp = match[1];
        const number = match[2];
        const part = parseInt(match[3] ? match[3] : "1");
        const user = match[4];
        console.log(`match = ${timestamp} ${number} ${part} ${user}`);

        var partTitle = "";
        if (part > 1) {
            partTitle = `${prevNumber} Part ${part}`;
        } else {
            prevNumber = number;
            partTitle = `${prevNumber}`;
        }

        const data = fs.readFileSync(path.join("episodes", item), { encoding: 'utf-8', flag: 'r' });
        const storyJson = JSON.parse(data);
        // for (const direction of storyJson.directions) {
        //     if (direction.type == "dialog") {
        //         console.log(`${direction.target} >> ${direction.text}`);
        //     }
        // }
        exportXml += convertEpisodeToStoryXml(storyJson, number, partTitle);

    }
};

exportXml += "</root>";

fs.writeFileSync(`episodes/export-goopsea-${formatDate(Date.now())}.xml`, exportXml, { encoding: "utf-8" });
console.log("Episode export created!");

function convertEpisodeToStoryXml(storyJson, episodeNumber, episodePart) {
    var storyXml = "<Story>";
    const title = storyJson.id; // TODO update to something more readable
    //const fixedDate = storyJson.date.substring(0, 10) + storyJson.date.substring(10).replaceAll(/[-]/gi, ":");
    //const dateMs = Date.parse(fixedDate);
    // https://www.w3schools.com/php/func_date_strtotime.asp
    const dateMs = Date.parse(storyJson.date);
    storyXml += `<Title>${escapeXml(title)}</Title>`;
    const author = `${storyJson.user} & ${storyJson.model}`;
    storyXml += `<Author>${escapeXml(author)}</Author>`;
    storyXml += `<Episode>${formatDate(dateMs)}-${episodeNumber}</Episode>`;
    storyXml += `<BatchNumber>${episodeNumber}</BatchNumber>`;
    storyXml += `<PartTitle>${episodePart}</PartTitle>`;
    storyXml += `<Date>${storyJson.date}</Date>`;
    // const epNum = parseInt(episodeNumber);
    // var hours = epNum >= 60 ? (8 + (epNum / 60)).toString().padStart(2, '0') : "08";
    // const mins = (epNum % 60).toString().padStart(2, '0');
    // storyXml += `<Date>${formatDate(dateMs)}T00:${hours}:${mins}.${episodeNumber}Z</Date>`;
    var first = true;
    for (const direction of storyJson.directions) {
        if (direction.type == "dialog") {
            if (first) { // skip first line of dialog (prompt)
                first = false;
                const prompt = direction.text.replaceAll(/[\[\]\(\)]/gi, "");
                storyXml += `<Prompt>${escapeXml(prompt)}</Prompt>`;
                const firstSentenceMatch = prompt.match(firstSentenceRegex);
                if (firstSentenceMatch) {
                    const firstSentence = firstSentenceMatch[1];
                    storyXml += `<FirstSentence>${escapeXml(firstSentence)}</FirstSentence>`;
                } else {
                    storyXml += `<FirstSentence>${escapeXml(prompt)}</FirstSentence>`;
                }
                storyXml += "<Text>";
                storyXml += escapeXml(`<pre class="prompt">${prompt}</pre>\n`);
                continue;
            }
            const line = `${direction.target.toUpperCase()}: ${direction.text}`;
            storyXml += escapeXml(`<pre class="ai">${line}</pre>\n`);
        }
    }
    storyXml += "</Text>";
    storyXml += "</Story>";
    return storyXml;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            // case '\'': return '&apos;';
            // case '"': return '&quot;';
            case '\'': return '\'';
            case '"': return '"';
        }
    });
}
