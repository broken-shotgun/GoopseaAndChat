using UnityEngine;

public class DestroyableObject : MonoBehaviour
{
    public void OnClickToDestroy()
    {
        Debug.Log(string.Format("Deleting object {0}...", name));
        Destroy(gameObject);
    }
}
