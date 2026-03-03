"use client"

import { Suspense, useEffect, useRef, useState, useTransition } from "react"
import { useLocalStorage } from "usehooks-ts"

import { cn } from "@/lib/utils"
import { fonts } from "@/lib/fonts"
import { GeneratedPanel } from "@/types"
import { joinWords } from "@/lib/joinWords"
import { useDynamicConfig } from "@/lib/useDynamicConfig"
import { Button } from "@/components/ui/button"

import { TopMenu } from "./interface/top-menu"
import { useStore } from "./store"
import { Zoom } from "./interface/zoom"
import { BottomBar } from "./interface/bottom-bar"
import { Page } from "./interface/page"
import { getStoryContinuation } from "./queries/getStoryContinuation"
import { localStorageKeys } from "./interface/settings-dialog/localStorageKeys"
import { defaultSettings } from "./interface/settings-dialog/defaultSettings"
import { SignUpCTA } from "./interface/sign-up-cta"
import { useLLMVendorConfig } from "@/lib/useLLMVendorConfig"

export default function Main() {
  const [_isPending, startTransition] = useTransition()

  const llmVendorConfig = useLLMVendorConfig()
  const { config, isConfigReady } = useDynamicConfig()
  const isGeneratingStory = useStore(s => s.isGeneratingStory)
  const setGeneratingStory = useStore(s => s.setGeneratingStory)

  const font = useStore(s => s.font)
  const preset = useStore(s => s.preset)
  const prompt = useStore(s => s.prompt)

  const currentNbPages = useStore(s => s.currentNbPages)
  const maxNbPages = useStore(s => s.maxNbPages)
  const previousNbPanels = useStore(s => s.previousNbPanels)
  const currentNbPanels = useStore(s => s.currentNbPanels)
  const maxNbPanels = useStore(s => s.maxNbPanels)

  const setCurrentNbPanelsPerPage = useStore(s => s.setCurrentNbPanelsPerPage)
  const setMaxNbPanelsPerPage = useStore(s => s.setMaxNbPanelsPerPage)
  const setCurrentNbPages = useStore(s => s.setCurrentNbPages)
  const setMaxNbPages = useStore(s => s.setMaxNbPages)

  const panels = useStore(s => s.panels)
  const setPanels = useStore(s => s.setPanels)

  // do we need those?
  const userDefinedMaxNumberOfPages = useStore(s => s.userDefinedMaxNumberOfPages)
  const setUserDefinedMaxNumberOfPages = useStore(s => s.setUserDefinedMaxNumberOfPages)

  const renderedScenes = useStore(s => s.renderedScenes)

  const pageRef = useRef<HTMLDivElement>(null)

  const [draft, setDraft] = useLocalStorage<string>(
    localStorageKeys.draftPrompt,
    ""
  )

  const [history, setHistory] = useLocalStorage<string[]>(
    localStorageKeys.promptHistory,
    []
  )

  const [historyIdx, setHistoryIdx] = useLocalStorage<number>(
    localStorageKeys.promptHistoryIdx,
    -1
  )

  const [showLoginWall, setShowLoginWall] = useState(false)

  // this is used to detect if the user has already generated at least once
  // if yes, we will show a small prompt to register
  const [hasGeneratedAtLeastOnce, setHasGeneratedAtLeastOnce] = useState(false)

  const handleUserWantsToGenerateMore = async () => {
    startTransition(async () => {
      const userDefinedMaxNumberOfPages = useStore.getState().userDefinedMaxNumberOfPages

      const currentNbPages = useStore.getState().currentNbPages

      if (currentNbPages >= userDefinedMaxNumberOfPages) {
        setShowLoginWall(true)
        return
      }

      const prompt = useStore.getState().prompt

      const newPanels = await getStoryContinuation({
        prompt,
        preset,
        nbPanels: 4,
        width: 512,
        height: 512,
      })

      const newPanelNames = newPanels.map(
        ({ fileName }) => fileName
      )

      setPanels([...panels, ...newPanelNames])
      setCurrentNbPages(currentNbPages + 1)
    })
  }

  useEffect(() => {
    if (isConfigReady) {

      // note: this has very low impact at the moment as we are always using the value 4
      // however I would like to progressively evolve the code to make it dynamic
      setCurrentNbPanelsPerPage(config.nbPanelsPerPage)
      setMaxNbPanelsPerPage(config.nbPanelsPerPage)
    }
  }, [JSON.stringify(config), isConfigReady])

  // react to prompt changes
  useEffect(() => {
    // console.log(`main.tsx: asked to re-generate!!`)
    if (!prompt) { return }


    // a quick and dirty hack to skip prompt regeneration,
    // unless the prompt has really changed
    if (
      prompt === useStore.getState().currentClap?.meta.description
    ) {
      console.log(`loading a pre-generated comic, so skipping prompt regeneration..`)
      return
    }

    // if the prompt or preset changed, we clear the cache
    // useStore.setState({ renderedScenes: {} })

    startTransition(async () => {
      setGeneratingStory(true)

      const newPanels = await getStoryContinuation({
        prompt,
        preset,
        nbPanels: 4,
        width: 512,
        height: 512,
      })

      const newPanelNames = newPanels.map(
        ({ fileName }) => fileName
      )

      setPanels(newPanelNames)
      setCurrentNbPages(1)
      setMaxNbPages(1)
      setHasGeneratedAtLeastOnce(true)

      setGeneratingStory(false)
    })
  }, [prompt, preset])

  useEffect(() => {
    const userDefinedMaxNumberOfPages = useStore.getState().userDefinedMaxNumberOfPages

    // note: this might be a bit confusing, but "maxNbPages" is the max for the CURRENT session
    // while "userDefinedMaxNumberOfPages" is the user-defined limit (eg. 1 for free tier, 100 for premium etc)
    if (maxNbPages > userDefinedMaxNumberOfPages) {
      setMaxNbPages(userDefinedMaxNumberOfPages)
    }
  }, [userDefinedMaxNumberOfPages, maxNbPages])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      handleUserWantsToGenerateMore()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleAddPage = () => {
    handleUserWantsToGenerateMore()
  }

  const handleClearPanels = () => {
    setPanels([])
    setCurrentNbPages(0)
    setMaxNbPages(0)
  }

  const handleExport = () => {
    // TODO: implement export functionality
    console.log("Export functionality to be implemented")
  }

  return (
    <div
      ref={pageRef}
      className={cn(
        `flex flex-col items-center w-full h-full`,
        `bg-zinc-50 text-stone-900`,
        `print:bg-white print:text-black`
      )}
    >
      <div className={cn(
        `flex flex-col w-full`,
        `space-y-2 lg:space-y-4`,
        `pt-2 lg:pt-4`,
        `px-2 lg:px-4`,
        `pb-2 lg:pb-8`
      )}>
        <TopMenu
          draft={draft}
          setDraft={setDraft}
          history={history}
          setHistory={setHistory}
          historyIdx={historyIdx}
          setHistoryIdx={setHistoryIdx}
        />

        <div className={cn(
          `flex flex-col lg:flex-row w-full`,
          `space-y-4 lg:space-y-0 lg:space-x-4`,
          `items-start`
        )}>
          <div className={cn(
            `flex flex-col`,
            `w-full`,
            `space-y-2 lg:space-y-4`,
            `items-center`
          )}>
            <Zoom />
            <Page />
            {currentNbPages < maxNbPages && (
              <Button
                onClick={handleAddPage}
                disabled={isGeneratingStory}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGeneratingStory ? "Generating..." : "Add Page"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <BottomBar
        onClearPanels={handleClearPanels}
        onExport={handleExport}
      />

      {showLoginWall && (
        <SignUpCTA
          userAskedToSeeMore={true}
          onUserCameBackFromLogin={() => {
            setShowLoginWall(false)
          }}
        />
      )}

      {hasGeneratedAtLeastOnce && !showLoginWall && (
        <SignUpCTA
          userAskedToSeeMore={false}
          onUserCameBackFromLogin={() => {
            setShowLoginWall(false)
          }}
        />
      )}
    </div>
  )
}
