using UnityEngine;
using UnityEngine.Timeline;
using TMPro;
using UnityEngine.Playables;

[TrackBindingType(typeof(TextMeshProUGUI))]
[TrackClipType(typeof(SubtitleAsset))]
public class SubtitleTrack : TrackAsset
{
    public override Playable CreateTrackMixer(PlayableGraph graph, GameObject go, int inputCount)
    {
        return ScriptPlayable<SubtitleTrackMixer>.Create(graph, inputCount);
    }
}
