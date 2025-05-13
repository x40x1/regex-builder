"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RegexTesterProps {
  regexPattern: string
  testString: string
  setTestString: (value: string) => void
  flags: {
    global: boolean
    caseInsensitive: boolean
    multiline: boolean
    dotAll: boolean
    unicode: boolean
    sticky: boolean
  }
}

interface Match {
  start: number
  end: number
  text: string
  groups: string[]
}

export default function RegexTester({ regexPattern, testString, setTestString, flags }: RegexTesterProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!regexPattern) {
      setMatches([])
      setError(null)
      return
    }

    try {
      const flagString = Object.entries(flags)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          switch (key) {
            case "global":
              return "g"
            case "caseInsensitive":
              return "i"
            case "multiline":
              return "m"
            case "dotAll":
              return "s"
            case "unicode":
              return "u"
            case "sticky":
              return "y"
            default:
              return ""
          }
        })
        .join("")

      const regex = new RegExp(regexPattern, flagString)
      const foundMatches: Match[] = []

      if (flags.global) {
        let match
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            groups: match.slice(1),
          })

          // Prevent infinite loops for zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++
          }
        }
      } else {
        const match = regex.exec(testString)
        if (match) {
          foundMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            groups: match.slice(1),
          })
        }
      }

      setMatches(foundMatches)
      setError(null)
    } catch (err) {
      setMatches([])
      setError((err as Error).message)
    }
  }, [regexPattern, testString, flags])

  const renderHighlightedText = () => {
    if (matches.length === 0) {
      return <span>{testString}</span>
    }

    const result = []
    let lastIndex = 0

    // Sort matches by start index
    const sortedMatches = [...matches].sort((a, b) => a.start - b.start)

    for (const match of sortedMatches) {
      // Add text before the match
      if (match.start > lastIndex) {
        result.push(<span key={`text-${lastIndex}`}>{testString.substring(lastIndex, match.start)}</span>)
      }

      // Add the matched text
      result.push(
        <span
          key={`match-${match.start}`}
          className="bg-green-500/20 dark:bg-green-500/30 rounded px-0.5 border border-green-500/30"
        >
          {testString.substring(match.start, match.end)}
        </span>,
      )

      lastIndex = match.end
    }

    // Add any remaining text
    if (lastIndex < testString.length) {
      result.push(<span key={`text-${lastIndex}`}>{testString.substring(lastIndex)}</span>)
    }

    return result
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Test String</label>
        <Textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against your regex pattern"
          className="font-mono"
          rows={5}
        />
      </div>

      {error ? (
        <div className="p-4 border border-red-400 bg-red-100 dark:bg-red-900/20 rounded-md text-red-800 dark:text-red-300">
          <p className="font-medium">Error in regex pattern</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Matches ({matches.length})</label>
            <Card
              className={cn(
                "p-4 min-h-[100px] font-mono text-sm whitespace-pre-wrap",
                matches.length === 0 && "text-muted-foreground",
              )}
            >
              {matches.length === 0 ? "No matches found" : <div className="space-y-2">{renderHighlightedText()}</div>}
            </Card>
          </div>

          {matches.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Match Details</label>
              <div className="space-y-2">
                {matches.map((match, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Match {index + 1}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Position: {match.start}-{match.end}
                      </span>
                    </div>
                    <div className="font-mono text-sm bg-muted p-2 rounded mb-2">{match.text}</div>
                    {match.groups.length > 0 && (
                      <div>
                        <div className="text-xs font-medium mb-1">Capture Groups:</div>
                        <div className="space-y-1">
                          {match.groups.map((group, groupIndex) => (
                            <div key={groupIndex} className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                Group {groupIndex + 1}
                              </Badge>
                              <span className="font-mono text-sm">{group || "(empty)"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
