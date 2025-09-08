# Goopsea & Chat

## infinite-ai-tv-generator-player (Unity)

This is the Unity project for the episode player.  This looks at a directory and plays generated episodes.  (Defaults to `ai-tv_Data\episodes\`, can be overriden by using debug console `~` and calling `setEpisodesDir` command)

###

Note: originally built with Built with Unity Editor Version 2021.3.18f1.  But Unity sucks now and forces you to use latest version unless you have paid license to use old LTS versions.

Install UnityHub and install Unity 6.2.

Known issues:
"No valid Unity Editor license found. Please activate your license." - Use UnityHub to open the project, not the editor exe itself.

## infinite-ai-tv-generator (Node.js)

This is a Node.js project for generating the episodes.  It will generate the episode text from a generative AI text service, then progmatically generated the episode and text-to-speech all the dialog.  When the episode is "ready", it will be placed in a folder that the Unity scene is configured to look at for new episodes. For testing, I usually call `setEpisodesDir` in the player debug console (`~` to open debug console) and update it to `{REPLACE_WITH_FULL_PROJECT_DIRECTORY_PATH}/infinite-ai-tv-generator/episodes`.

### Setup

Copy `.env.example` to `.env` and put keys.  

Notable ones to add:
- `CONSOLERE_CHANNEL` for remote logging
- `PORT`

```
# on first time running project
npm install

# start the prompt server
npm start
```
