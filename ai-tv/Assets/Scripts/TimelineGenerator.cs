using Cinemachine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Playables;
using UnityEngine.Timeline;
using TMPro;
using UnityEngine.Networking;
using IngameDebugConsole;
using System.Text;
using System.Threading.Tasks;

public class TimelineGenerator : MonoBehaviour
{
    public PlayableDirector director;
    public CinemachineBrain brain;
    public const int fps = 24;

    [Header("Cameras")]
    public CinemachineVirtualCamera introCam;
    public CinemachineVirtualCamera endCam;

    public CinemachineVirtualCamera wideCam;
    public CinemachineVirtualCamera superWideCam;
    public CinemachineVirtualCamera goopseaCam;
    public CinemachineVirtualCamera goopseaCloseCam;
    public CinemachineVirtualCamera jackCam;
    public CinemachineVirtualCamera jackCloseCam;
    public CinemachineVirtualCamera woadieCam;
    public CinemachineVirtualCamera woadieCloseCam;

    [Header("Characters")]
    public Character goopsea;
    public Character jack;
    public Character woadie;

    [Header("Locations")]
    public Location kitchen;
    public Location livingRoom;
    public Location italianRestaurant;
    public Location litterBox;
    public Location transmissionFactory;
    public Location aiGeneratedLocation;
    public Location goopseaAndGoblins;
    public bool useAiImageGen;

    [Header("Timelines")]
    public GameObject establishingShotHouse;

    [Header("Music & SFX")]
    public AudioClip introAudioClip;
    public AudioClip endAudioClip;

    [Header("UI")]
    public TextMeshProUGUI subtitleText;
    public TextMeshProUGUI episodeName;
    public TextMeshProUGUI pauseText;
    public TextMeshProUGUI creditsText;

    [Header("Goops & Goblins")]
    public bool isAdventure;

    private bool isQueuePlaying = false;
    private EpisodeQueue episodeQueue = new EpisodeQueue();
    private bool isEpisodeFinished = true;
    private string currentUser = "";

    private const string baseUrl = "http://localhost:3000";

    void Start()
    {
        pauseText.enabled = false;
        SetupDirector();
        StartCoroutine(PlayEpisodesInDirectoryRefresh());
        if (isAdventure) SetupAdventure();
        SetupCommands();
    }

    private void SetupDirector()
    {
        director.played += (aDirector) =>
        {
            isEpisodeFinished = false;
            StartCoroutine(StartTwitchPoll(currentUser));
        };
        director.stopped += (aDirector) =>
        {
            isEpisodeFinished = true;
            StartCoroutine(MarkPlayed(currentUser));
        };
    }

    private void SetupAdventure()
    {
        Debug.Log("Setting up ADVENTURE MODE...");
        //UpdateCameraBounds(
        //    goopseaAndGoblins.cameraBounds,
        //    wideCam,
        //    goopseaCam, goopseaCloseCam,
        //    jackCam, jackCloseCam,
        //    woadieCam, woadieCloseCam,
        //    superWideCam
        //);
    }

    private void SetupCommands()
    {
        DebugLogConsole.AddCommandInstance("loopIdle", "Loops old episodes when queue is idle", "SetLoopIdle", this);
        DebugLogConsole.AddCommandInstance("spawnImage", "Spawns image object from URL", "SpawnImageFromUrl", this);
        DebugLogConsole.AddCommandInstance("setEpisodesDir", "Change the episodes directory", "SetEpisodesDirectory", this);
        DebugLogConsole.AddCommandInstance("exit", "Quit the game", "ExitApp", this);
    }

    /// <summary>
    /// Debug Console Commands
    /// </summary>
#pragma warning disable IDE0051 // Remove unused private members
    private void SetLoopIdle(bool shouldLoopIdle)
    {
        Debug.Log(string.Format("Loop Idle state set to {0}", shouldLoopIdle));
        episodeQueue.SetLoopIdle(shouldLoopIdle);
    }

    private void SpawnImageFromUrl(string imageUrl, int sortOrder, float pixelsPerUnit)
    {
        Uri uri = new Uri(imageUrl);
        string fileExtension = Path.GetExtension(uri.LocalPath).ToLower();
        if (
            !(
                fileExtension == "" ||
                fileExtension.StartsWith(".png") ||
                fileExtension.StartsWith(".jpg") ||
                fileExtension.StartsWith(".jpeg")
            )
        )
        {
            Debug.LogWarningFormat("{0} not supported, image must be PNG or JPG/JPEG", fileExtension);
            return;
        }
        Debug.Log(string.Format("Spawning image {0}", imageUrl));
        StartCoroutine(_SpawnImageFromUrl(uri, sortOrder, pixelsPerUnit));
    }

    private IEnumerator _SpawnImageFromUrl(Uri imageUri, int sortOrder, float pixelsPerUnit)
    {
        using (UnityWebRequest uwr = UnityWebRequestTexture.GetTexture(imageUri))
        {
            yield return uwr.SendWebRequest();

            if (uwr.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError(uwr.error);
            }
            else
            {
                try
                {
                    Texture2D texture = DownloadHandlerTexture.GetContent(uwr);
                    //texture.filterMode = FilterMode.Point;
                    Vector3 spawnPoint = Camera.main.transform.position;
                    spawnPoint.z = 0;
                    GameObject go = new GameObject();
                    go.name = Path.GetFileName(imageUri.LocalPath);
                    go.transform.position = spawnPoint;
                    go.AddComponent<DestroyableObject>();
                    go.AddComponent<TeleportableObject>();
                    MoveableObject moveable = go.AddComponent<MoveableObject>();
                    SpriteRenderer sr = go.AddComponent<SpriteRenderer>();
                    sr.sprite = Sprite.Create(texture, new Rect(0, 0, texture.width, texture.height), new Vector2(0.5f, 0.5f), pixelsPerUnit);
                    sr.sortingOrder = sortOrder;
                    moveable.myRenderer = sr;
                    go.AddComponent<BoxCollider2D>();
                }
                catch(Exception ex)
                {
                    Debug.LogError("SpawnImageFromUrl Error!!!");
                    Debug.LogException(ex);
                }
            }
        }
    }

    bool episodesDirectoryUpdated = false;
    private void SetEpisodesDirectory(string updatedDir)
    {
        Debug.Log(string.Format("Updating episodes directory to {0}", updatedDir));
        PlayerPrefs.SetString("EpisodesDirectory", updatedDir);
        episodesDirectoryUpdated = true;
    }

    private void ExitApp()
    {
#if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
#endif
        Application.Quit();
    }

#pragma warning restore IDE0051 // Remove unused private members

    private void Update()
    {
        if (isQueuePlaying)
        {
            if (!isAdventure && Input.GetKeyUp(KeyCode.KeypadPlus))
            {
                Debug.Log("Loading next episode...");
                director.Stop();
            }
            else if (Input.GetKeyUp(KeyCode.KeypadEnter))
            {
                if (director.state == PlayState.Paused)
                {
                    Debug.Log("Unpausing...");
                    director.Play();
                    pauseText.enabled = false;
                }
                else
                {
                    Debug.Log("Pausing...");
                    director.Pause();
                    pauseText.enabled = true;
                }
            }
            else if (!isAdventure && Input.GetKeyUp(KeyCode.KeypadPeriod))
            {
                Debug.Log("Stopping the queue...");
                isQueuePlaying = false;
                director.Stop();
            }
        }
        else // Queue is stopped
        {
            if (Input.GetKeyUp(KeyCode.Keypad0))
            {
                Debug.Log("Restarting the queue...");
                StartCoroutine(PlayEpisodesInDirectoryRefresh());
            }
        }

        // Universal Input
        //if (Input.GetKeyUp(KeyCode.Escape))
        //{
        //    Application.Quit();
        //}
    }

    IEnumerator PlayEpisodesInDirectoryRefresh()
    {
        isQueuePlaying = true;

        DirectoryInfo info = GetEpisodesDirectoryInfo();

        while(isQueuePlaying)
        {
            if (episodesDirectoryUpdated)
            {
                info = GetEpisodesDirectoryInfo();
                episodesDirectoryUpdated = false;
            }

            // Debug.Log("Scanning for new episodes...");
            try
            {
                if (isAdventure)
                {
                    var files = info.GetFiles("adventure-*.json");
                    episodeQueue.Add(files);
                }
                else
                {
                    var files = info.GetFiles("episode-*.json");
                    episodeQueue.Add(files);
                }
            } catch (DirectoryNotFoundException ex)
            {
                Debug.LogError(ex);
            }

            if (episodeQueue.HasEpisodes())
            {
                var currentEpisodeFile = episodeQueue.Dequeue();
                // https://discussions.unity.com/t/async-await-inside-a-coroutine/804631
                Task<bool> task = PlayEpisode(currentEpisodeFile);
                yield return new WaitUntil(() => task.IsCompleted);
                if (task.Result) // if played
                {
                    yield return new WaitUntil(() => isEpisodeFinished);
                }
                else
                {
                    yield return new WaitForSeconds(1f);
                }
            }
            else
            {
                // Debug.LogWarning("Episode directory contains no episodes.");
                if (isAdventure) episodeName.text = "";
                else episodeName.text = "waiting for episodes...";
                subtitleText.text = "";
                creditsText.text = "";
                yield return new WaitForSeconds(1f);
            }
        }
    }

    private DirectoryInfo GetEpisodesDirectoryInfo()
    {
        string episodeFolder = PlayerPrefs.GetString("EpisodesDirectory", Application.dataPath + "/episodes");
        Debug.Log(string.Format("Episode folder = {0}", episodeFolder));
        return new DirectoryInfo(episodeFolder);
    }

    private IEnumerator MarkPlayed(string user)
    {
        string markPlayedUrl = string.Format("{0}/markPlayed?user={1}", baseUrl, user);
        UnityWebRequest www = UnityWebRequest.PostWwwForm(
            markPlayedUrl, 
            ""
        );
        yield return www.SendWebRequest();
        if (www.result != UnityWebRequest.Result.Success)
        {
            Debug.LogWarning(www.error + " " + markPlayedUrl);
        }
        else
        {
            Debug.Log("Marked played for " + user);
        }
    }

    private IEnumerator StartTwitchPoll(string user)
    {
        // https://forum.unity.com/threads/posting-raw-json-into-unitywebrequest.397871/
        string doActionUrl = "http://localhost:7474/DoAction"; // streamer.bot http server
        string doActionBody = $"{{ \"action\": {{ \"id\":\"d7313d45-8edb-4dbd-8389-0f2dd8c09518\", \"name\":\"Start Episode Poll\" }}, \"args\": {{ \"user\":\"{user}\"}} }}";
        byte[] bytes = Encoding.UTF8.GetBytes(doActionBody);
        UnityWebRequest www = new UnityWebRequest(doActionUrl, UnityWebRequest.kHttpVerbPOST);
        UploadHandlerRaw uhr = new UploadHandlerRaw(bytes);
        www.uploadHandler = uhr;
        www.SetRequestHeader("Content-Type", "application/json");
        yield return www.SendWebRequest();
        if (www.result != UnityWebRequest.Result.Success)
        {
            Debug.LogWarning(www.error + " " + doActionUrl);
            Debug.LogWarning(doActionBody);
        }
        else
        {
            Debug.Log("Twitch poll started for " + user);
        }
    }

    async Task<bool> PlayEpisode(FileInfo file)
    {
        if (file == null || !File.Exists(file.FullName))
        {
            Debug.LogError(string.Format("Error file does not exist: {0}", file.FullName));
            return false;
        }

        var filename = Path.GetFileNameWithoutExtension(file.Name);
        episodeName.text = filename;

        int retries = 0;
        string episodeJson = null;
        while (episodeJson == null && retries < 10)
        {
            try
            {
                episodeJson = File.ReadAllText(file.FullName);
            }
            catch (IOException exception)
            {
                Debug.LogWarning(exception);
                retries++;
            }
        }

        if (episodeJson != null)
        {
            //Debug.Log(string.Format("Success!  Playing {0}", file.FullName));
            Episode nextEpisode = Deserialize(episodeJson);
            currentUser = nextEpisode.user;
            TimelineAsset episodeTimeline = await CreateTimeline(nextEpisode);
            director.playableAsset = episodeTimeline;
            director.Play();
            pauseText.enabled = false;
            return true;
        }
        else
        {
            Debug.LogError(string.Format("Error reading episode file: {0}", file.FullName));
            return false;
        }
    }

    public Episode Deserialize(string json)
    {
        return JsonUtility.FromJson<Episode>(json);
    }

    public async Task<TimelineAsset> CreateTimeline(Episode episode)
    {
        if (useAiImageGen) LoadAiImage(episode.ai_img_background);

        // https://darioseyb.com/post/unity-importer/
        var timelineAsset = ScriptableObject.CreateInstance<TimelineAsset>();
        timelineAsset.name = episode.date + "_timeline";
        timelineAsset.editorSettings.frameRate = fps;

        var cameraTrack = timelineAsset.CreateTrack<CinemachineTrack>("Camera Track");
        director.SetGenericBinding(cameraTrack, brain);

        var mainAudioTrack = timelineAsset.CreateTrack<AudioTrack>("Main Audio");

        var creditsTrack = timelineAsset.CreateTrack<SubtitleTrack>("Credits");
        director.SetGenericBinding(creditsTrack, creditsText);

        var subtitleTrack = timelineAsset.CreateTrack<SubtitleTrack>("Subtitles");
        director.SetGenericBinding(subtitleTrack, subtitleText);

        var goopseaAnimationTrack = timelineAsset.CreateTrack<AnimationTrack>();
        director.SetGenericBinding(goopseaAnimationTrack, goopsea.animator);
        AddIdleAnimationClip(goopseaAnimationTrack, goopsea, 0);

        var jackAnimationTrack = timelineAsset.CreateTrack<AnimationTrack>();
        director.SetGenericBinding(jackAnimationTrack, jack.animator);
        AddIdleAnimationClip(jackAnimationTrack, jack, 0);

        var woadieAnimationTrack = timelineAsset.CreateTrack<AnimationTrack>();
        director.SetGenericBinding(woadieAnimationTrack, woadie.animator);
        AddIdleAnimationClip(woadieAnimationTrack, woadie, 0);

        var controlTrack = timelineAsset.CreateTrack<ControlTrack>();

        var startTime = 0.0;
        TimelineClip currentCameraClip = null;
        foreach (StageDirection direction in episode.directions)
        {
            if (direction.type == "change-location")
            {
                ChangeLocation(direction.target);
            }
            else if (direction.type == "change-camera")
            {
                currentCameraClip = ChangeCamera(cameraTrack, direction.target);
                currentCameraClip.start = startTime;
                currentCameraClip.duration = 0;
            }
            else if (direction.type == "play-timeline")
            {
                var controlClip = controlTrack.CreateDefaultClip();
                var controlAsset = controlClip.asset as ControlPlayableAsset;
                if (direction.target == "establishing-shot-house")
                {
                    controlAsset.prefabGameObject = establishingShotHouse;
                    
                    controlClip.start = startTime;

                    var credits = string.Format("Written by:\n{0} & {1}", episode.user, episode.model);
                    AddSubtitleClip(creditsTrack, credits, startTime, controlClip.duration);

                    startTime += controlClip.duration;
                }
            }
            else if (direction.type == "dialog")
            {
                var duration = 1.0;
                if (!string.IsNullOrEmpty(direction.audio))
                {
                    //var dialogAudioClip = GetAudioClipFromBase64Wav(direction);
                    var dialogAudioClip = await GetAudioClipFromBase64Mp3(direction);
                    if (dialogAudioClip != null) 
                    {
                        var audioTimelineClip = mainAudioTrack.CreateClip(dialogAudioClip);
                        audioTimelineClip.start = startTime;
                        audioTimelineClip.duration = dialogAudioClip.length / 2;
                        duration = audioTimelineClip.duration;

                        if (direction.target == "goopsea")
                        {
                            AddTalkingAnimationClip(goopseaAnimationTrack, goopsea, startTime, audioTimelineClip.duration);
                        }
                        else if (direction.target == "jack")
                        {
                            AddTalkingAnimationClip(jackAnimationTrack, jack, startTime, audioTimelineClip.duration);
                        }
                        else if (direction.target == "woadie")
                        {
                            AddTalkingAnimationClip(woadieAnimationTrack, woadie, startTime, audioTimelineClip.duration);
                        }
                    }
                    else
                    {
                        Debug.LogWarning("CreateTimeline> dialog audio clip is null");
                        duration = 3f;
                    }

                    AddSubtitleClip(subtitleTrack, direction.target.ToUpper() + ": " + direction.text, startTime, duration, true);
                }

                if (currentCameraClip != null) currentCameraClip.duration += duration;

                startTime += duration;
            }
            else if (direction.type == "pause")
            {
                if (currentCameraClip != null) currentCameraClip.duration += direction.duration;

                startTime += direction.duration;
            }
            else if (direction.type == "intro")
            {
                currentCameraClip = ChangeCamera(cameraTrack, "intro");
                currentCameraClip.start = startTime;
                currentCameraClip.duration = 5;

                if (introAudioClip != null)
                {
                    var audioClipTrack = mainAudioTrack.CreateClip(introAudioClip);
                    audioClipTrack.start = startTime;
                    currentCameraClip.duration = audioClipTrack.duration;
                }

                startTime += currentCameraClip.duration;
            }
            else if (direction.type == "end")
            {
                currentCameraClip = ChangeCamera(cameraTrack, "end");
                currentCameraClip.start = startTime;
                currentCameraClip.duration = 3;

                if (endAudioClip != null)
                {
                    var audioClipTrack = mainAudioTrack.CreateClip(endAudioClip);
                    audioClipTrack.start = startTime;
                    currentCameraClip.duration = audioClipTrack.duration;
                }
                
                startTime += currentCameraClip.duration;
            }
        }

        //goopseaAnimationTrack.trackOffset = TrackOffset.ApplySceneOffsets;
        //jackAnimationTrack.trackOffset = TrackOffset.ApplySceneOffsets;

        //timelineAsset.durationMode = TimelineAsset.DurationMode.BasedOnClips;
        timelineAsset.durationMode = TimelineAsset.DurationMode.FixedLength;
        timelineAsset.fixedDuration = startTime;

        return timelineAsset;
    }

    private void LoadAiImage(string aiImg)
    {
        if (aiImg == "")
        {
            // if there is a problem generating image, just show older sprite again
            //aiGeneratedLocation.spriteRenderer.sprite = null; // ... or clear old sprite
            return;
        }

        byte[] imageBytes = Convert.FromBase64String(aiImg);
        Texture2D tex = new Texture2D(256, 256); // 8.0 ppu
        //Texture2D tex = new Texture2D(512, 512); // 16.0 ppu
        //Texture2D tex = new Texture2D(1024, 1024); // 32.0 ppu
        tex.LoadImage(imageBytes);
        aiGeneratedLocation.spriteRenderer.sprite = Sprite.Create(tex, new Rect(0.0f, 0.0f, tex.width, tex.height), new Vector2(0.5f, 0.5f), 8.0f);
    }

    private void AddTalkingAnimationClip(AnimationTrack characterTrack, Character character, double start, double talkDuration)
    {
        var talkTimelineClip = characterTrack.CreateClip(character.talk);
        talkTimelineClip.start = start;
        talkTimelineClip.duration = talkDuration;

        AddIdleAnimationClip(characterTrack, character, talkTimelineClip.start + talkTimelineClip.duration);
    }

    private void AddIdleAnimationClip(AnimationTrack characterTrack, Character character, double start)
    {
        var idleTimelineClip = characterTrack.CreateClip(character.idle);
        idleTimelineClip.SetPostExtrapolationMode(TimelineClip.ClipExtrapolation.Continue);
        idleTimelineClip.start = start;
        idleTimelineClip.duration = 0.1;
    }

    private void AddSubtitleClip(SubtitleTrack subtitleTrack, string text, double start, double duration, bool addBackground = false)
    {
        var subtitleTimelineClip = subtitleTrack.CreateDefaultClip();
        var subtitleAsset = subtitleTimelineClip.asset as SubtitleAsset;
        if (addBackground)
        {
            subtitleAsset.subtitleText =
                "<font=\"LiberationSans SDF\"><mark color=\"#000000AA\" padding=\"20, 20, 1, 2\">" +
                text +
                "</mark></font>";
        }
        else
        {
            subtitleAsset.subtitleText = text;
        }
        subtitleTimelineClip.start = start;
        subtitleTimelineClip.duration = duration;
    }

    //private float[] NormalizeMp3(float[] data)
    //{
    //    float max = float.MinValue;
    //    for (int i = 0; i < data.Length; i++)
    //    {
    //        if (Math.Abs(data[i]) > max) max = Math.Abs(data[i]);
    //    }
    //    for (int i = 0; i < data.Length; i++) data[i] = data[i] / max;
    //    return data;
    //}

    //private float[] NormalizeMp3(float[] data)
    //{
    //    float max = float.MinValue;
    //    for (int i = 0; i < data.Length; i++)
    //    {
    //        if (System.Math.Abs(data[i]) > max) max = System.Math.Abs(data[i]);
    //    }
    //    for (int i = 0; i < data.Length; i++) data[i] = data[i] / max;
    //    return data;
    //}

    ///*
    // * https://discussions.unity.com/t/how-to-convert-base64-mpeg-to-audioclip/908900/2
    // */
    //private float[] ConvertByteToFloatMp3(byte[] array)
    //{
    //    float[] floatArr = new float[array.Length / 4];
    //    for (int i = 0; i < floatArr.Length; i++)
    //    {
    //        if (BitConverter.IsLittleEndian) Array.Reverse(array, i * 4, 4);
    //        floatArr[i] = BitConverter.ToSingle(array, i * 4);
    //    }
    //    return NormalizeMp3(floatArr);
    //}

    //private AudioClip GetAudioClipFromBase64Mp3(StageDirection direction)
    //{
    //    // https://stackoverflow.com/questions/35228767/noisy-audio-clip-after-decoding-from-base64
    //    byte[] audioBytes = Convert.FromBase64String(direction.audio);
    //    float[] f = ConvertByteToFloatMp3(audioBytes);
    //    AudioClip audioClip = AudioClip.Create(direction.target + "dialog", f.Length, 2, 48000, false);
    //    audioClip.SetData(f, 0);
    //    return audioClip;
    //}

    /**
     * https://gist.github.com/readpan/a7b43c40342f315a32146cbad0d36cfe
     */
    static async Task<AudioClip> GetAudioClipFromBase64Mp3(StageDirection direction)
    {
        var fileBytes = Convert.FromBase64String(direction.audio);
        var fullPath = Application.persistentDataPath + "/temp.mp3";
        await File.WriteAllBytesAsync(fullPath, fileBytes);
        fullPath = "file://" + fullPath;
        using (var uwr = UnityWebRequestMultimedia.GetAudioClip(fullPath, AudioType.MPEG))
        {
            uwr.downloadHandler = new DownloadHandlerAudioClip(fullPath, AudioType.MPEG);
            ((DownloadHandlerAudioClip)uwr.downloadHandler).streamAudio = true;

            await uwr.SendWebRequest();
            while (!uwr.isDone)
                await Task.Delay(1); //can replace with UniTask.WaitUntil(() => uwr.isDone);
            //File.Delete(fullPath);
            return (uwr.downloadHandler as DownloadHandlerAudioClip)?.audioClip;
        }
    }

    private AudioClip GetAudioClipFromBase64Wav(StageDirection direction)
    {
        // https://stackoverflow.com/questions/35228767/noisy-audio-clip-after-decoding-from-base64
        byte[] audioBytes = Convert.FromBase64String(direction.audio);
        if (audioBytes.Length < 44) return null;
        byte[] wavHeaderBytes = audioBytes[..44];
        int numChannels = BitConverter.ToInt16(wavHeaderBytes[22..24], 0);
        int sampleRate = BitConverter.ToInt32(wavHeaderBytes[24..28], 0);
        // PrintWavHeader(wavHeaderBytes);
        float[] f = ConvertByteToFloat(audioBytes[44..]);
        if (f.Length < 1) return null;
        AudioClip audioClip = AudioClip.Create(direction.target + "dialog", f.Length * 2, numChannels, sampleRate, false);
        audioClip.SetData(f, 0);
        return audioClip;
    }

    private static float[] ConvertByteToFloat(byte[] array)
    {
        float[] result = new float[array.Length / 2];
        for (int i = 0; i < result.Length; i++)
        {
            result[i] = BitConverter.ToInt16(array, i * 2) / 32768.0f;
        }
        return result;
    }

#pragma warning disable IDE0051 // Remove unused private members
    private void PrintWavHeader(byte[] header)
    {
        /*
        Name	        offset	Size	Value
        ChunkID	        0	    4	    �RIFF�
        ChunkSize	    4	    4	    405040
        Format	        8	    4	    �WAVE�
        Subchunk1 ID	12	    4	    �fmt�
        Subchunk1 Size	16	    4	    16
        Audio Format	20	    2	    1
        Num Channels	22	    2	    2
        Sample Rate	    24	    4	    22050
        Byte Rate	    28	    4	    88200
        Block Align	    32	    2	    4
        Bits per Sample	34	    2	    16
        Subchunk2 ID	36	    4	    �data�
        Subchunk 2 Size	40	    4	    405004
        */

    string chunkId = System.Text.Encoding.UTF8.GetString(header[..4]);
        string format = System.Text.Encoding.UTF8.GetString(header[8..12]);
        int sampleRate = BitConverter.ToInt32(header[24..28], 0);
        int numChannels = BitConverter.ToInt16(header[22..24], 0);
        Debug.Log(string.Format("ChunkID = {0}, Format = {1}, Channels = {2}, Sample Rate = {3}", chunkId, format, numChannels, sampleRate));
    }
#pragma warning restore IDE0051 // Remove unused private members

    private TimelineClip ChangeCamera(CinemachineTrack cameraTrack, string target)
    {
        var cameraClip = cameraTrack.CreateDefaultClip();
        var cinemachineShot = cameraClip.asset as CinemachineShot;
        if (target == "intro")
        {
            cinemachineShot.VirtualCamera.defaultValue = introCam;
        }
        else if (target == "end")
        {
            cinemachineShot.VirtualCamera.defaultValue = endCam;
        }
        else if (target == "goopsea")
        {
            cinemachineShot.VirtualCamera.defaultValue = goopseaCam;
        }
        else if (target == "goopsea-close")
        {
            cinemachineShot.VirtualCamera.defaultValue = goopseaCloseCam;
        }
        else if (target == "jack")
        {
            cinemachineShot.VirtualCamera.defaultValue = jackCam;
        }
        else if (target == "jack-close")
        {
            cinemachineShot.VirtualCamera.defaultValue = jackCloseCam;
        }
        else if (target == "woadie")
        {
            cinemachineShot.VirtualCamera.defaultValue = woadieCam;
        }
        else if (target == "woadie-close")
        {
            cinemachineShot.VirtualCamera.defaultValue = woadieCloseCam;
        }
        else if (target == "super-wide")
        {
            cinemachineShot.VirtualCamera.defaultValue = superWideCam;
        }
        else
        {
            cinemachineShot.VirtualCamera.defaultValue = wideCam;
        }
        return cameraClip;
    }

    private void ChangeLocation(string location)
    {
        if (useAiImageGen)
        {
            goopsea.transform.position = aiGeneratedLocation.goopseaSpawn.position;
            jack.transform.position = aiGeneratedLocation.jackSpawn.position;
            woadie.transform.position = aiGeneratedLocation.woadieSpawn.position;

            UpdateCameraBounds(
                aiGeneratedLocation.cameraBounds,
                wideCam,
                goopseaCam, goopseaCloseCam,
                jackCam, jackCloseCam,
                woadieCam, woadieCloseCam
            );

            goopsea.transform.rotation = Quaternion.identity;
            jack.transform.rotation = Quaternion.identity;
            woadie.transform.rotation = Quaternion.identity;

            return;
        }

        if (location == "kitchen")
        {
            goopsea.transform.position = kitchen.goopseaSpawn.position;
            jack.transform.position = kitchen.jackSpawn.position;
            woadie.transform.position = kitchen.woadieSpawn.position;

            UpdateCameraBounds(
                kitchen.cameraBounds, 
                wideCam, 
                goopseaCam, goopseaCloseCam, 
                jackCam, jackCloseCam,
                woadieCam, woadieCloseCam
            );
        }
        else if (location == "living-room")
        {
            goopsea.transform.position = livingRoom.goopseaSpawn.position;
            jack.transform.position = livingRoom.jackSpawn.position;
            woadie.transform.position = livingRoom.woadieSpawn.position;

            UpdateCameraBounds(
                livingRoom.cameraBounds, 
                wideCam, 
                goopseaCam, goopseaCloseCam, 
                jackCam, jackCloseCam,
                woadieCam, woadieCloseCam
            );
        }
        else if (location == "italian-restaurant")
        {
            goopsea.transform.position = italianRestaurant.goopseaSpawn.position;
            jack.transform.position = italianRestaurant.jackSpawn.position;
            woadie.transform.position = italianRestaurant.woadieSpawn.position;

            UpdateCameraBounds(
                italianRestaurant.cameraBounds, 
                wideCam, 
                goopseaCam, goopseaCloseCam, 
                jackCam, jackCloseCam,
                woadieCam, woadieCloseCam
            );
        }
        else if (location == "litter-box")
        {
            goopsea.transform.position = litterBox.goopseaSpawn.position;
            jack.transform.position = litterBox.jackSpawn.position;
            woadie.transform.position = litterBox.woadieSpawn.position;

            UpdateCameraBounds(
                litterBox.cameraBounds,
                wideCam,
                goopseaCam, goopseaCloseCam,
                jackCam, jackCloseCam,
                woadieCam, woadieCloseCam
            );
        }
        else if (location == "transmission-factory")
        {
            goopsea.transform.position = transmissionFactory.goopseaSpawn.position;
            jack.transform.position = transmissionFactory.jackSpawn.position;
            woadie.transform.position = transmissionFactory.woadieSpawn.position;

            UpdateCameraBounds(
                transmissionFactory.cameraBounds,
                wideCam,
                goopseaCam, goopseaCloseCam,
                jackCam, jackCloseCam,
                woadieCam, woadieCloseCam
            );
        }

        goopsea.transform.rotation = Quaternion.identity;
        jack.transform.rotation = Quaternion.identity;
        woadie.transform.rotation = Quaternion.identity;
    }

    private void UpdateCameraBounds(PolygonCollider2D bounds, params CinemachineVirtualCamera[] cameras)
    {
        foreach (CinemachineVirtualCamera cam in cameras)
        {
            cam.GetComponent<CinemachineConfiner2D>().m_BoundingShape2D = bounds;
        }
    }

    [Serializable]
    public class Episode
    {
        public string id;
        public string date;
        public string user;
        public string model;
        public string ai_img_background;
        public List<StageDirection> directions;

        public override string ToString()
        {
            return JsonUtility.ToJson(this);
        }
    }

    [Serializable]
    public class StageDirection
    {
        public string type;
        public string target;
        public string text;
        public string audio;
        public double duration;

        public override string ToString()
        {
            return JsonUtility.ToJson(this);
        }
    }
}
