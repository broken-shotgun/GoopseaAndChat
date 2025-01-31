using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[RequireComponent(typeof(PolygonCollider2D), typeof(SpriteRenderer))]
public class Location : MonoBehaviour
{
    public Transform goopseaSpawn;
    public Transform jackSpawn;
    public Transform woadieSpawn;

    public Sprite currentBackground;

    [HideInInspector]
    public PolygonCollider2D cameraBounds;

    [HideInInspector]
    public SpriteRenderer spriteRenderer;

    private void Start()
    {
        cameraBounds = GetComponent<PolygonCollider2D>();
        spriteRenderer = GetComponent<SpriteRenderer>();
    }

    public void RefreshCameraBounds()
    {
        Destroy(cameraBounds);
        cameraBounds = gameObject.AddComponent<PolygonCollider2D>(); 
    }
}
