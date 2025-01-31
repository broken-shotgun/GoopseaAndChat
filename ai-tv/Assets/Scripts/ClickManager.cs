using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// https://gamedevbeginner.com/how-to-move-an-object-with-the-mouse-in-unity-in-2d/
/// </summary>
public class ClickManager : MonoBehaviour
{
    public Vector3 mousePosition;
    public Collider2D[] overlapResults = new Collider2D[5];
    public GameObject selectedObject;
    public GameObject party;
    Vector3 offset;
    void Update()
    {
        mousePosition = Camera.main.ScreenToWorldPoint(Input.mousePosition);

        if (party != null && Input.GetMouseButtonDown(0) && Input.GetKey(KeyCode.LeftControl))
        {
            selectedObject = party;
            offset = selectedObject.transform.position - mousePosition;
        }
        else if (Input.GetMouseButtonDown(0) && selectedObject == null)
        {
            int hitCount = Physics2D.OverlapPointNonAlloc(mousePosition, overlapResults);
            Collider2D highestCollider = GetHighestObject(overlapResults, hitCount);
            if (highestCollider != null)
            {
                selectedObject = highestCollider.transform.gameObject;

                offset = selectedObject.transform.position - mousePosition;
            }
        }

        HandleSelectedObject();
    }

    private void HandleSelectedObject()
    {
        if (!selectedObject) return;

        selectedObject.transform.position = mousePosition + offset;
        float scroll = Input.GetAxis("Mouse ScrollWheel");
        if (!Mathf.Approximately(scroll, 0f))
        {
            selectedObject.transform.Rotate(Mathf.Sign(scroll) * 15f * Vector3.forward, Space.Self);
        }

        if (Input.GetMouseButtonUp(0))
        {
            selectedObject = null;
        }

        if (Input.GetMouseButtonUp(1))
        {
            DestroyableObject destroyable = selectedObject.GetComponent<DestroyableObject>();
            if (destroyable)
            {
                selectedObject = null;
                destroyable.OnClickToDestroy();
            }
        }
    }

    private Collider2D GetHighestObject(Collider2D[] results, int count)
    {
        int highestValue = 0; // note: ignores sorting order less than zero (i.e. tilemaps)
        Collider2D highestObject = null;
        for (int i=0; i<count; ++i)
        {
            MoveableObject moveable;
            if ((moveable = results[i].GetComponent<MoveableObject>()) == null) continue;
            Renderer ren = moveable.myRenderer;
            if (ren && ren.sortingOrder > highestValue)
            {
                highestValue = ren.sortingOrder;
                highestObject = results[i];
            }
        }
        return highestObject;
    }
}
