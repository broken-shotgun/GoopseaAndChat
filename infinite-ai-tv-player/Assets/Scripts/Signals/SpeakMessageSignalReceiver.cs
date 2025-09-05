using System;
using System.Linq;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.Playables;
using UnityEngine.Timeline;
using static SpeakerBotWsClient;

public class SpeakMessageSignalReceiver : MonoBehaviour, INotificationReceiver
{
    public SignalAssetEventPair[] signalAssetEventPairs;

    [Serializable]
    public class SignalAssetEventPair
    {
        public SignalAsset signalAsset;
        public ParameterizedEvent events;

        [Serializable]
        public class ParameterizedEvent : UnityEvent<SpeakEventParams> { }
    }

    public void OnNotify(Playable origin, INotification notification, object context)
    {
        if (notification is SpeakMessageSignalEmitter speakEmitter)
        {
            var matches = signalAssetEventPairs.Where(x => ReferenceEquals(x.signalAsset, speakEmitter.asset));
            foreach (var m in matches)
            {
                SpeakEventParams speakEvent = new SpeakEventParams
                {
                    message = speakEmitter.message,
                    voice = speakEmitter.voice
                };
                m.events.Invoke(speakEvent);
            }
        }
    }
}
