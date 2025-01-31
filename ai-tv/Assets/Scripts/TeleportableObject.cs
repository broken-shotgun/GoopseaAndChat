using UnityEngine;

public class TeleportableObject : MonoBehaviour
{
    public Vector3 mousePosition;

    void Update()
    {
        if (Input.GetKeyUp(KeyCode.Home))
        {
            Debug.Log(string.Format("Teleporting {0} to current mouse position...", name));
            mousePosition = Camera.main.ScreenToWorldPoint(Input.mousePosition);
            mousePosition.z = transform.position.z;
            transform.position = mousePosition;
        }
    }
}
