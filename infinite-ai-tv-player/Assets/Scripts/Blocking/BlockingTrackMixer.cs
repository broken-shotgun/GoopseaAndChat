using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;

public class BlockingTrackMixer : PlayableBehaviour
{
    public override void ProcessFrame(Playable playable, FrameData info, object playerData)
    {
        Character character = playerData as Character;

        if (!character) return;

        Transform currentMarkToHit;

        int inputCount = playable.GetInputCount();
        for (int i = 0; i < inputCount; ++i)
        {
            float inputWeight = playable.GetInputWeight(i);
            if (inputWeight > 0f)
            {
                // https://docs.unity3d.com/ScriptReference/Playables.PlayableExtensions.html
                // https://docs.unity3d.com/Packages/com.unity.timeline@1.6/manual/smpl_custom_tween.html
                ScriptPlayable<BlockingBehavior> inputPlayable = (ScriptPlayable<BlockingBehavior>)playable.GetInput(i);
                BlockingBehavior input = inputPlayable.GetBehaviour();
                currentMarkToHit = input.markToHit;
            }
        }

        // TODO lerp character towards destination blocking point, progress based on input weight?  time?

        // TODO when clip finishes... how to "apply" new mark location to keep it there
    }
}
