"use server"

import { v4 as uuidv4 } from "uuid"
import { RenderRequest, RenderedScene, Settings } from "@/types"
import { generateSeed } from "@/lib/generateSeed"
import { sleep } from "@/lib/sleep"

// Pre-generated Minecraft-style comic panels for testing
const preGeneratedComics = [
  {
    prompt: "A Minecraft character with diamond sword standing in front of a castle, comic book style",
    assetUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjODdDRUVGIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjQxMiIgaGVpZ2h0PSI0MTIiIGZpbGw9IiM0QTc5QzkiLz4KPHJlY3QgeD0iMTUwIiB5PSIzNTAiIHdpZHRoPSIyMTIiIGhlaWdodD0iMTAwIiBmaWxsPSIjNkI0QjNCIi8+CjxyZWN0IHg9IjE4MCIgeT0iMTUwIiB3aWR0aD0iMTUyIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJCNEYyQiIvPgo8cmVjdCB4PSIyMDAiIHk9IjE4MCIgd2lkdGg9IjExMiIgaGVpZ2h0PSI4MCIgZmlsbD0iI0ZFRkVGRSIvPgo8cmVjdCB4PSIxODAiIHk9IjEwMCIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjI4MCIgeT0iMTAwIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTE5MCAxMDBMMjEwIDEyMEwxOTAgMTQwTDE3MCAxMjBaIiBmaWxsPSIjRkZGRkZGIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iNDAwIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkRJQU1PTkQgQ0FTVExFPC90ZXh0Pgo8L3N2Zz4=",
    alt: "Minecraft character with diamond sword"
  },
  {
    prompt: "Minecraft creeper peeking around a corner, comic panel with speech bubble",
    assetUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjODdDRUVGIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjQxMiIgaGVpZ2h0PSI0MTIiIGZpbGw9IiM0QTc5QzkiLz4KPHJlY3QgeD0iMzAwIiB5PSIyMDAiIHdpZHRoPSIxNTAiIGhlaWdodD0iMjUwIiBmaWxsPSIjMEU5QjQ4Ii8+CjxyZWN0IHg9IjMyMCIgeT0iMjIwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiMwMDAwMDAiLz4KPHJlY3QgeD0iMzYwIiB5PSIyMjAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzAwMDAwMCIvPgo8cmVjdCB4PSIzMjAiIHk9IjI4MCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDAwMDAwIi8+CjxyZWN0IHg9IjM2MCIgeT0iMjgwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiMwMDAwMDAiLz4KPHBhdGggZD0iTTM1MCAxOTBMMzcwIDIxMEwzNTAgMjMwTDMzMCAyMTBaIiBmaWxsPSIjMDAwMDAwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMzUwIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPk1ha2Ugc3VyZSB5b3UgZG9uJ3QgZm9sbG93IG1lITwvdGV4dD4KPHJlY3QgeD0iOTAiIHk9IjMzMCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjMDAwMDAwIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTAwLDMzMCAxMjAsMzEwIDE0MCwzMzAiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+",
    alt: "Minecraft creeper with speech bubble"
  },
  {
    prompt: "Minecraft village with houses and villagers, sunny day comic style",
    assetUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjODdDRUVGIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjQxMiIgaGVpZ2h0PSI0MTIiIGZpbGw9IiM0QTc5QzkiLz4KPHJlY3QgeD0iNzAiIHk9IjMwMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI0E3NTQyQiIvPgo8cmVjdCB4PSIyMDAiIHk9IjI4MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI0E3NTQyQiIvPgo8cmVjdCB4PSIzMzAiIHk9IjI5MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEzMCIgZmlsbD0iI0E3NTQyQiIvPgo8cmVjdCB4PSI4NSIgeT0iMjUwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiM4QjQ1MTMiLz4KPHJlY3QgeD0iMjE1IiB5PSIyMzAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzhCNDUxMyIvPgo8cmVjdCB4PSIzNDUiIHk9IjI0MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjOEI0NTEzIi8+CjxjaXJjbGUgY3g9IjkwIiBjeT0iMjIwIiByPSI4IiBmaWxsPSIjRkZGRkZGIi8+CjxjaXJjbGUgY3g9IjIyMCIgY3k9IjIwMCIgcj0iOCIgZmlsbD0iI0ZGRkZGRiIvPgo8Y2lyY2xlIGN4PSIzNTAiIGN5PSIxOTAiIHI9IjgiIGZpbGw9IiNGRkZGRkYiLz4KPHJlY3QgeD0iNzAiIHk9IjEwMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzg3Q0VFRiIvPgo8dGV4dCB4PSIyNTYiIHk9IjEzMCIgZmlsbD0iIzMzMzMzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2Ij5NaW5lY3JhZnQgVmlsbGFnZTwvdGV4dD4KPC9zdmc+",
    alt: "Minecraft village scene"
  },
  {
    prompt: "Minecraft player fighting zombie with iron sword, action comic panel",
    assetUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjODdDRUVGIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjQxMiIgaGVpZ2h0PSI0MTIiIGZpbGw9IiM0QTc5QzkiLz4KPHJlY3QgeD0iMTUwIiB5PSIyNTAiIHdpZHRoPSIyMTIiIGhlaWdodD0iMTUwIiBmaWxsPSIjNkI0QjNCIi8+CjxyZWN0IHg9IjIwMCIgeT0iMzAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJCNEYyQiIvPgo8cmVjdCB4PSIzMDAiIHk9IjI4MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzBCNEYyQiIvPgo8cmVjdCB4PSIyMTAiIHk9IjMyMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjMyMCIgeT0iMzAwIiB3aWR0aD0iNjAiIGhlaWdodD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8cmVjdCB4PSIzMjAiIHk9IjI4MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMDAwMDAwIi8+CjxwYXRoIGQ9Ik0yNTAgMzAwTDI3MCAyODBMMjUwIDI2MEwyMzAgMjgwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8dGV4dCB4PSIxMDAiIHk9IjQwMCIgZmlsbD0iI0ZGRkZGRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5TV09JCE8L3RleHQ+Cjx0ZXh0IHg9IjMwMCIgeT0iMjUwIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkJSQUlJTiE8L3RleHQ+Cjwvc3ZnPg==",
    alt: "Minecraft player fighting zombie"
  },
  {
    prompt: "Minecraft ender dragon flying over the end dimension, epic comic scene",
    assetUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjMDAwMDAwIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjQxMiIgaGVpZ2h0PSI0MTIiIGZpbGw9IiMxQjE4QjciLz4KPHBhdGggZD0iTTI1NiAxMDBMMzAwIDE1MEwyNTYgMjAwTDIxMiAxNTBaIiBmaWxsPSIjODc0MjQyIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzI1MCAxMDAgMzAwIDEwMCAzNTAgMTUwTDMwMCAyMDBMMjU2IDI1MEwyMTIgMjAwWiIgZmlsbD0iIzg3NDI0MiIvPgo8Y2lyY2xlIGN4PSIyNTAiIGN5PSIxODAiIHI9IjEwIiBmaWxsPSIjRkYwMDAwIi8+CjxjaXJjbGUgY3g9IjIzMCIgY3k9IjE4MCIgcj0iOCIgZmlsbD0iI0ZGMDAwMCIvPgo8Y2lyY2xlIGN4PSIyNzAiIGN5PSIxODAiIHI9IjgiIGZpbGw9IiNGRjAwMDAiLz4KPHJlY3QgeD0iMTAwIiB5PSIzNTAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzg3NDI0MiIvPgo8cmVjdCB4PSIzNzAiIHk9IjM1MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjODc0MjQyIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iNDAwIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPkRyYWdvbiBCYXR0bGU8L3RleHQ+Cjwvc3ZnPg==",
    alt: "Minecraft ender dragon battle"
  }
]

export async function renderFluxMinecraftComic({
  prompt,
  width,
  height,
  nbFrames,
  withCache,
  settings,
}: {
  prompt: string
  width: number
  height: number
  nbFrames: number
  withCache: boolean
  settings: Settings
}): Promise<RenderedScene> {
  
  console.log(`🎮 FLUX Minecraft Movie Model rendering: "${prompt}"`)
  
  // Simulate processing time for local generation
  await sleep(500 + Math.random() * 1000)
  
  // For testing, return a pre-generated comic based on prompt keywords
  let selectedComic = preGeneratedComics[0]
  
  if (prompt.toLowerCase().includes('creeper')) {
    selectedComic = preGeneratedComics[1]
  } else if (prompt.toLowerCase().includes('village') || prompt.toLowerCase().includes('house')) {
    selectedComic = preGeneratedComics[2]
  } else if (prompt.toLowerCase().includes('zombie') || prompt.toLowerCase().includes('fight')) {
    selectedComic = preGeneratedComics[3]
  } else if (prompt.toLowerCase().includes('dragon') || prompt.toLowerCase().includes('ender')) {
    selectedComic = preGeneratedComics[4]
  }
  
  const renderId = uuidv4()
  
  const result: RenderedScene = {
    renderId,
    status: "completed",
    assetUrl: selectedComic.assetUrl,
    alt: selectedComic.alt,
    maskUrl: "",
    error: "",
    segments: []
  }
  
  console.log(`✅ FLUX Minecraft render completed: ${renderId}`)
  
  return result
}

// Function to get random pre-generated comic for initial load
export async function getRandomPreGeneratedComic(): Promise<RenderedScene> {
  const randomComic = preGeneratedComics[Math.floor(Math.random() * preGeneratedComics.length)]
  
  return {
    renderId: uuidv4(),
    status: "completed",
    assetUrl: randomComic.assetUrl,
    alt: randomComic.alt,
    maskUrl: "",
    error: "",
    segments: []
  }
}

// Generate multiple pre-generated comics for initial display
export async function generateInitialComics(count: number = 4): Promise<RenderedScene[]> {
  const comics: RenderedScene[] = []
  
  for (let i = 0; i < count; i++) {
    comics.push(await getRandomPreGeneratedComic())
  }
  
  return comics
}
