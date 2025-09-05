using IngameDebugConsole;
using Newtonsoft.Json;
using UnityEngine;
using WebSocketSharp;

public class SpeakerBotWsClient : MonoBehaviour
{
    WebSocket ws;
    private void Start()
    {
        ws = new WebSocket("ws://127.0.0.1:7580/");
        ws.Connect();
        ws.OnMessage += (sender, e) =>
        {
            Debug.Log("Message Received from " + ((WebSocket)sender).Url + ", Data : " + e.Data);
        };

        SetupCommands();
    }

    private void SetupCommands()
    {
        DebugLogConsole.AddCommandInstance("speak", "Speaks the provided text with default voice", "Speak", this);
    }

    class SpeakRequest
    {
        public string id { get; set; }
        public string request { get; set; }
        public string voice { get; set; }
        public string message { get; set; }
        public bool badWordFilter { get; set; }
    }

    void Speak(string message)
    {
        var wsRequest = new SpeakRequest
        {
            id = "1",
            request = "Speak",
            voice = "Microsoft",
            message = message,
            badWordFilter = true
        };
        string json = JsonConvert.SerializeObject(wsRequest);
        Debug.Log(json);
        ws.Send(json);
    }
}
