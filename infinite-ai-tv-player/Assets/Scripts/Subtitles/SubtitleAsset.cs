using UnityEngine;
using UnityEngine.Playables;

public class SubtitleAsset : PlayableAsset
{
    public string subtitleText;

    public SubtitleAsset(string subtitleText)
    {
        this.subtitleText = subtitleText;
    }

    public override Playable CreatePlayable(PlayableGraph graph, GameObject owner)
    {
        var playable = ScriptPlayable<SubtitleBehavior>.Create(graph);

        SubtitleBehavior subtitleBehavior = playable.GetBehaviour();
        subtitleBehavior.subtitleText = subtitleText;

        return playable;
    }
}
