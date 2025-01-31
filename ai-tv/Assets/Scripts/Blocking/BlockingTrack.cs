using UnityEngine;
using UnityEngine.Timeline;
using TMPro;
using UnityEngine.Playables;

[TrackClipType(typeof(BlockingAsset))]
[TrackBindingType(typeof(Character))]
public class BlockingTrack : TrackAsset
{
    public override Playable CreateTrackMixer(PlayableGraph graph, GameObject go, int inputCount)
    {
        return ScriptPlayable<BlockingTrackMixer>.Create(graph, inputCount);
    }
}
