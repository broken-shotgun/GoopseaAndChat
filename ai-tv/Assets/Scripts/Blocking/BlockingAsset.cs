using UnityEngine;
using UnityEngine.Playables;

public class BlockingAsset : PlayableAsset
{
    public Transform markToHit;

    public override Playable CreatePlayable(PlayableGraph graph, GameObject owner)
    {
        var playable = ScriptPlayable<BlockingBehavior>.Create(graph);

        BlockingBehavior blockingBehavior = playable.GetBehaviour();
        blockingBehavior.markToHit = markToHit;

        return playable;
    }
}
