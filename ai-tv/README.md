# ai-tv

AI Generated TV

## Episode Generator

Python or node script?

1. Generate episode script
2. Process epsideo script to characters
3. Generate TTS for episode script
4. Create Episode JSON and send to mod queue

How to send to mod queue?

How to send from mod queue to ready queue?

How to put audio/json in folder for Unity to pickup? [FileSystemWatcher](https://learn.microsoft.com/en-us/dotnet/api/system.io.filesystemwatcher?redirectedfrom=MSDN&view=net-7.0)?

Preprocessed Episode JSON:

```json
{
    "id": "",
    "date": "",
    "directions": [
        {
            "type": "intro"
        },
        {
            "type": "change-location",
            "location": "kitchen"
        },
        {
            "type": "change-camera",
            "camera": "wide"
        },
        {
            "type": "dialog",
            "actor": "goopsea",
            "text": "hello world",
            "audio": "goopsea-tts-123456.wav"
        },
        {
            "type": "dialog",
            "actor": "jack",
            "text": "hello goopsea",
            "audio": "jack-tts-123456.wav"
        },
        {
            "type": "change-camera",
            "camera": "goopsea"
        },
        {
            "type": "dialog",
            "actor": "goopsea",
            "text": "lasagna",
            "audio": "goopsea-tts-1234567.wav"
        },
        {
            "type": "end"
        },
        {
            "type": "commerical",
            "image": "generated commercial image",
            "text": "have you ever spilled drink?  stop that with DRINK ANCHOR!",
            "audio": "commercial-tts.wav"
        }
    ]
}
```

## Episode Player

Unity, C#

1. Grab episode json from FIFO queue
2. Convert episode json to timeline
3. Play timeline

* How to detect changes in `Data` folder?
* What to do when queue is empty?
