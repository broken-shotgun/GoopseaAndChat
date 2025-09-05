using UnityEngine;
using UnityEngine.Playables;
using TMPro;

public class SubtitleTrackMixer : PlayableBehaviour
{
    public override void ProcessFrame(Playable playable, FrameData info, object playerData)
    {
        TextMeshProUGUI text = playerData as TextMeshProUGUI;
        string currentText = "";
        float currentAlpha = 0f;

        if (!text) return;

        int inputCount = playable.GetInputCount();
        for (int i=0; i<inputCount; ++i)
        {
            float inputWeight = playable.GetInputWeight(i);

            if (inputWeight > 0f)
            {
                ScriptPlayable<SubtitleBehavior> inputPlayable = (ScriptPlayable<SubtitleBehavior>)playable.GetInput(i);
                
                SubtitleBehavior input = inputPlayable.GetBehaviour();
                currentText = input.subtitleText;
                currentAlpha = inputWeight;
                text.enabled = true;
            }
        }

        text.text = currentText;
        text.color = new Color(1, 1, 1, currentAlpha);
    }
}
