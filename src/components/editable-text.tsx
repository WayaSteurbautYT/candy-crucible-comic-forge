"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface EditableTextProps {
  text: string
  onChange: (text: string) => void
  className?: string
  placeholder?: string
  multiline?: boolean
  maxLength?: number
  disabled?: boolean
  style?: React.CSSProperties
}

export function EditableText({
  text,
  onChange,
  className,
  placeholder = "Double-click to edit",
  multiline = false,
  maxLength,
  disabled = false,
  style
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(text)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditText(text)
  }, [text])

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      } else if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }, [isEditing, multiline])

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true)
      setEditText(text)
    }
  }

  const handleBlur = () => {
    if (editText !== text) {
      onChange(editText)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditText(text)
      setIsEditing(false)
    } else if (e.key === 'Enter' && !multiline) {
      handleBlur()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (maxLength && newValue.length > maxLength) {
      return
    }
    setEditText(newValue)
  }

  if (isEditing) {
    const Component = multiline ? 'textarea' : 'input'
    const ref = multiline ? textareaRef : inputRef
    const props = multiline 
      ? { rows: 3, ...({ ref } as any) }
      : { type: 'text', ...({ ref } as any) }

    return (
      <Component
        {...props}
        value={editText}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full p-2 border border-primary rounded-md bg-background text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          className
        )}
        style={style}
        maxLength={maxLength}
      />
    )
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        "min-h-[2rem] p-2 rounded-md transition-colors cursor-text",
        "hover:bg-muted/50 focus:bg-muted/50",
        "border border-transparent hover:border-muted-foreground/20",
        disabled && "cursor-not-allowed opacity-50",
        !text && "text-muted-foreground italic",
        className
      )}
      style={style}
      title={disabled ? undefined : "Double-click to edit"}
    >
      {text || placeholder}
    </div>
  )
}

interface ComicPanelTextProps {
  text: string
  onChange: (text: string) => void
  type: 'speech' | 'caption' | 'title'
  className?: string
}

export function ComicPanelText({ text, onChange, type, className }: ComicPanelTextProps) {
  const getTextStyles = () => {
    switch (type) {
      case 'speech':
        return "bg-white/90 border-2 border-black rounded-lg p-2 text-sm font-comic shadow-lg"
      case 'caption':
        return "bg-yellow-100/90 border border-black rounded p-1 text-xs font-serif italic"
      case 'title':
        return "bg-red-600 text-white font-bold text-lg px-3 py-1 rounded shadow-lg border-2 border-red-800"
      default:
        return "bg-white/90 border border-black rounded p-2 text-sm"
    }
  }

  return (
    <EditableText
      text={text}
      onChange={onChange}
      className={cn(getTextStyles(), className)}
      placeholder={`Double-click to add ${type}`}
    />
  )
}
