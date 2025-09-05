using System.Collections.Generic;
using System.IO;
using System.Runtime.CompilerServices;
using UnityEngine;

public class EpisodeQueue
{
    private Dictionary<string, FileInfo> fileMap = new Dictionary<string, FileInfo>();

    private Queue<string> active = new Queue<string>();
    private List<string> idle = new List<string>();
    private int currentIdleIndex = 0;
    private bool loopIdleWhileWaiting = false; // flag to disable idle queue from playing on loop while waiting

    [MethodImpl(MethodImplOptions.Synchronized)]
    public void Add(FileInfo[] files)
    {
        foreach (FileInfo file in files)
        {
            if (!fileMap.ContainsKey(file.Name))
            {
                Debug.Log(string.Format("New episode detected!  Adding {0} to queue...", file.Name));
                fileMap[file.Name] = file;
                active.Enqueue(file.Name);
            }
        }
    }

    [MethodImpl(MethodImplOptions.Synchronized)]
    public FileInfo Dequeue()
    {
        if (active.Count > 0)
        {
            string nextEpisode = active.Dequeue();

            if (!File.Exists(fileMap[nextEpisode].FullName))
            {
                Debug.LogWarning(string.Format("Episode does not exist anymore, removing {0} from active queue.", nextEpisode));
                fileMap.Remove(nextEpisode);
                return Dequeue();
            }
            Debug.Log(string.Format("Playing new episode {0}...", nextEpisode));
            idle.Add(nextEpisode);
            return fileMap[nextEpisode];
        } 
        else if (loopIdleWhileWaiting && idle.Count > 0)
        {
            if (currentIdleIndex >= idle.Count) currentIdleIndex = 0;
            string nextEpisode = idle[currentIdleIndex];
            if (!File.Exists(fileMap[nextEpisode].FullName))
            {
                Debug.LogWarning(string.Format("Episode does not exist anymore, removing {0} from idle queue.", nextEpisode));
                fileMap.Remove(nextEpisode);
                idle.RemoveAt(currentIdleIndex);
                return Dequeue();
            }
            Debug.Log(string.Format("No new episodes. Playing old episode {0}...", nextEpisode));
            currentIdleIndex++;
            return fileMap[nextEpisode];
        }
        return null;
    }

    [MethodImpl(MethodImplOptions.Synchronized)]
    public FileInfo Peek()
    {
        if (active.Count > 0)
        {
            string nextEpisode = active.Peek();
            return fileMap[nextEpisode];
        }
        return null;
    }

    public bool HasEpisodes()
    {
        return active.Count > 0 || (loopIdleWhileWaiting && idle.Count > 0);
    }

    public void SetLoopIdle(bool shouldLoopIdle)
    {
        loopIdleWhileWaiting = shouldLoopIdle;
    }
}
