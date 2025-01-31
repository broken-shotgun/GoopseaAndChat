# Infinite AI TV

🔴 Interactive AI Cartoon | Goopsea & Chat 🐱🐸👴

Airoboros 65B 1.4

## Pygway-6b Setup

* [Open Colab](https://koboldai.org/colab)
* TehVenom/PPO_Pygway-6b as the model name.
* Copy URL to `.env`
* Update settings:
  * 1.15 repetition penalty
  * 40 top_k

## Manually Approve Story

Stories flagged for moderation are save in `episodes/raw/dirty` in an unprocessed state.  You can manually approve them add add to processing queue by hiting the `POST /addStory` endpoint.

Example of manually approving a story that failed a moderation check:

```bash
curl -X POST -H "Content-Type: application/json" -d @DIRTY-2023-04-01T00-39-08.425Z-039-codegeassanimefan.json http://localhost:3000/addStory
```

Or if moderation endpoint fails due to an API error, the story is saved in an manual review inbox.  Here is an example:

```bash
curl -X POST -H "Content-Type: application/json" -d @episodes/raw/inbox/2023-04-01T00-39-08.425Z-039-codegeassanimefan.json http://localhost:3000/addStory
```

## Manually Mark Played

If a user's prompt generates a story that fails a modcheck and doesn't pass a manual review, their episode will never play, so
you'll need to manually mark it as complete.

Example:

```bash
curl -X POST http://localhost:3000/markPlayed?user=feddric0
```

## Test Add Prompt

For testing submitting prompts or submitting a prompt on a user's behalf.

```bash
curl -H "x-twitch-user: REPLACE_USER" -H "x-prompt: REPLACE_PROMPT" http://localhost:3000/addPrompt
```

## Manually Add Prompt

Submit a prompt directly without using channel points or shortcode formatting.

Example:

```bash
curl -X POST -H "Content-Type: application/json" -d @episodes/raw/manual-prompt.json http://localhost:3000/addPromptManual
```

## Continue Story

Mark the current episode to be continued and manully add continuation prompt.

Example:

```bash
curl -X POST -H "Content-Type: application/json" -d @episodes/raw/manual-prompt.json http://localhost:3000/continue
```

## Manually Start Twitch Poll for User (via Steamer.Bot)

```bash
curl -X POST -H "Content-Type: application/json" -d '{ "action": { "id": "d7313d45-8edb-4dbd-8389-0f2dd8c09518", "name": "Start Episode Poll" }, "args": { "user": "aipd" } }' http://localhost:7474/DoAction
```
