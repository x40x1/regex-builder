"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface RegexExplanationProps {
  regexPattern: string
  flags: {
    global: boolean
    caseInsensitive: boolean
    multiline: boolean
    dotAll: boolean
    unicode: boolean
    sticky: boolean
  }
}

interface ExplanationPart {
  pattern: string
  explanation: string
  depth: number
}

export default function RegexExplanation({ regexPattern, flags }: RegexExplanationProps) {
  const [explanation, setExplanation] = useState<ExplanationPart[]>([])
  const [flagExplanations, setFlagExplanations] = useState<ExplanationPart[]>([])
  const [customPattern, setCustomPattern] = useState("")
  const [customFlags, setCustomFlags] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isCustomPattern, setIsCustomPattern] = useState(false)

  useEffect(() => {
    if (!isCustomPattern) {
      parseRegexPattern(regexPattern, getFlagString(flags))
    }
  }, [regexPattern, flags, isCustomPattern])

  const getFlagString = (flagsObj: typeof flags) => {
    return Object.entries(flagsObj)
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
  }

  const parseRegexPattern = (pattern: string, flagString: string) => {
    if (!pattern) {
      setExplanation([])
      setFlagExplanations([])
      setError(null)
      return
    }

    try {
      // Validate the regex by trying to create a RegExp object
      new RegExp(pattern, flagString)
      setError(null)

      const parts = parseRegex(pattern)
      setExplanation(parts)

      const flagParts = flagString.split("").map((flag) => {
        switch (flag) {
          case "g":
            return {
              pattern: "g",
              explanation: "Global: Find all matches rather than stopping after the first match",
              depth: 0,
            }
          case "i":
            return {
              pattern: "i",
              explanation: "Case Insensitive: Match will be case-insensitive",
              depth: 0,
            }
          case "m":
            return {
              pattern: "m",
              explanation: "Multiline: ^ and $ match start/end of line in addition to start/end of string",
              depth: 0,
            }
          case "s":
            return {
              pattern: "s",
              explanation: "Dot All: . matches newline characters as well",
              depth: 0,
            }
          case "u":
            return {
              pattern: "u",
              explanation: "Unicode: Pattern is treated as a sequence of Unicode code points",
              depth: 0,
            }
          case "y":
            return {
              pattern: "y",
              explanation: "Sticky: Matches only from the index indicated by lastIndex property",
              depth: 0,
            }
          default:
            return {
              pattern: flag,
              explanation: `Unknown flag: ${flag}`,
              depth: 0,
            }
        }
      })

      setFlagExplanations(flagParts)
    } catch (err) {
      setError((err as Error).message)
      setExplanation([])
      setFlagExplanations([])
    }
  }

  const handleCustomPatternSubmit = () => {
    setIsCustomPattern(true)

    // Extract pattern and flags if input is in the form /pattern/flags
    if (customPattern.startsWith("/")) {
      const lastSlashIndex = customPattern.lastIndexOf("/")
      if (lastSlashIndex > 0) {
        const pattern = customPattern.substring(1, lastSlashIndex)
        const flags = customPattern.substring(lastSlashIndex + 1)
        parseRegexPattern(pattern, flags)
        return
      }
    }

    // Otherwise, use the pattern as-is with any provided flags
    parseRegexPattern(customPattern, customFlags)
  }

  const handleResetToBuilder = () => {
    setIsCustomPattern(false)
    setCustomPattern("")
    setCustomFlags("")
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Enter regex pattern (e.g. /abc.*def/gi or just abc.*def)"
            value={customPattern}
            onChange={(e) => setCustomPattern(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Flags (e.g. gi)"
            value={customFlags}
            onChange={(e) => setCustomFlags(e.target.value)}
            className="sm:w-24"
          />
          <Button onClick={handleCustomPatternSubmit}>Explain</Button>
          {isCustomPattern && (
            <Button variant="outline" onClick={handleResetToBuilder}>
              Use Builder Pattern
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Enter a regex pattern to explain, or use the pattern from the builder
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-2">Plain English Explanation</h3>
        <Separator className="mb-4" />

        {(isCustomPattern ? customPattern : regexPattern) ? (
          <>
            <p className="mb-4">This regular expression:</p>
            <div className="font-mono p-2 bg-muted rounded mb-4 overflow-x-auto">
              /{isCustomPattern ? customPattern : regexPattern}/{isCustomPattern ? customFlags : getFlagString(flags)}
            </div>

            <p className="mb-2">Matches:</p>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {explanation.length > 0 ? (
                <div className="space-y-2">
                  {explanation.map((part, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-md p-3 transition-colors ${
                        part.depth > 0 ? `border-l-4 border-l-primary/50` : ''
                      }`} 
                      style={{ 
                        marginLeft: `${part.depth * 16}px`,
                        backgroundColor: part.depth % 2 === 0 ? 'var(--background)' : 'var(--muted)' 
                      }}
                    >
                      <div className="font-mono text-sm bg-background/80 dark:bg-muted/50 p-1.5 rounded mb-1.5 overflow-x-auto">
                        {part.pattern}
                      </div>
                      <p className="text-sm">{part.explanation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No pattern to explain</p>
              )}

              {flagExplanations.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Flags:</h4>
                  <div className="space-y-2">
                    {flagExplanations.map((flag, index) => (
                      <div key={index} className="border rounded-md p-3">
                        <div className="font-mono text-sm bg-muted p-1.5 rounded mb-1.5">{flag.pattern}</div>
                        <p className="text-sm">{flag.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Add regex blocks or enter a pattern to see an explanation</p>
        )}
      </Card>
    </div>
  )
}

function parseRegex(pattern: string): ExplanationPart[] {
  if (!pattern) return [];

  const parts: ExplanationPart[] = [];
  let i = 0;
  
  // Use a recursive descent parsing approach for better handling of nested structures
  function parseExpression(currentDepth = 0): ExplanationPart[] {
    const expressionParts: ExplanationPart[] = [];
    
    while (i < pattern.length) {
      // Handle groups and nested expressions
      if (pattern[i] === '(') {
        // Check for non-capturing and other special groups
        if (pattern.substring(i, i+2) === "(?") {
          // Handle look-ahead, look-behind, and non-capturing groups
          const startPos = i;
          i += 2; // Skip past (?
          
          // Check for extended patterns like (?=...), (?!...), (?<=...), (?<!...)
          let groupType = "";
          if (i < pattern.length) {
            if (pattern[i] === '=') { groupType = "positive lookahead"; i++; }
            else if (pattern[i] === '!') { groupType = "negative lookahead"; i++; }
            else if (pattern.substring(i, i+2) === "<=") { groupType = "positive lookbehind"; i += 2; }
            else if (pattern.substring(i, i+2) === "<!") { groupType = "negative lookbehind"; i += 2; }
            else if (pattern[i] === ':') { groupType = "non-capturing"; i++; }
          }
          
          // Parse the contents of the special group
          const nestedParts = parseExpression(currentDepth + 1);
          
          // Add the special group as a container
          let explanation = "";
          if (groupType === "positive lookahead") 
            explanation = "Assert that the following matches ahead without consuming characters";
          else if (groupType === "negative lookahead") 
            explanation = "Assert that the following does NOT match ahead without consuming characters";
          else if (groupType === "positive lookbehind") 
            explanation = "Assert that the following matches behind without consuming characters";
          else if (groupType === "negative lookbehind") 
            explanation = "Assert that the following does NOT match behind without consuming characters";
          else if (groupType === "non-capturing") 
            explanation = "Group that doesn't capture for backreference";
          else 
            explanation = "Special group with extended pattern";
          
          const groupEndPos = i;
          
          expressionParts.push({
            pattern: pattern.substring(startPos, groupEndPos),
            explanation,
            depth: currentDepth,
          });
          
          // Add the nested parts with increased depth
          expressionParts.push(...nestedParts);
          
          continue;
        } else {
          // Regular capturing group
          const startPos = i;
          i++; // Skip past (
          
          // Parse the contents of the group
          const nestedParts = parseExpression(currentDepth + 1);
          
          // Add the group as a container
          expressionParts.push({
            pattern: pattern.substring(startPos, i),
            explanation: "Capture group that remembers the matched substring",
            depth: currentDepth,
          });
          
          // Add the nested parts with increased depth
          expressionParts.push(...nestedParts);
          
          continue;
        }
      }
      
      // Exit condition for recursive calls - end of group
      if (pattern[i] === ')') {
        i++; // Skip past )
        break; 
      }
      
      // Handle character classes [...]
      if (pattern[i] === '[') {
        const startIndex = i;
        i++;
        const isNegated = pattern[i] === '^';
        if (isNegated) i++;
        
        // Find the closing bracket
        while (i < pattern.length && pattern[i] !== ']') {
          if (pattern[i] === '\\' && i + 1 < pattern.length) {
            i += 2; // Skip escaped character
          } else {
            i++;
          }
        }
        
        if (i < pattern.length) i++; // Include the closing bracket
        
        const charClass = pattern.substring(startIndex, i);
        expressionParts.push({
          pattern: charClass,
          explanation: explainCharacterClass(charClass),
          depth: currentDepth,
        });
        
        continue;
      }
      
      // Handle escaped characters
      if (pattern[i] === '\\' && i + 1 < pattern.length) {
        const escaped = pattern.substring(i, i + 2);
        expressionParts.push({
          pattern: escaped,
          explanation: explainEscapedCharacter(escaped),
          depth: currentDepth,
        });
        i += 2;
        continue;
      }
      
      // Handle quantifiers
      if ("*+?{".includes(pattern[i])) {
        let quantifier = pattern[i];
        const startPos = i;
        i++;
        
        // Handle {n}, {n,}, {n,m}
        if (quantifier === "{") {
          while (i < pattern.length && pattern[i] !== "}") {
            quantifier += pattern[i];
            i++;
          }
          if (i < pattern.length) {
            quantifier += pattern[i]; // Include the closing brace
            i++;
          }
        }
        
        // Check for lazy quantifier ?
        if (i < pattern.length && pattern[i] === '?') {
          quantifier += '?';
          i++;
        }
        
        // Get the previous part to explain what the quantifier applies to
        const prevPart = expressionParts.length > 0 
          ? expressionParts[expressionParts.length - 1].pattern 
          : "the preceding character";
        
        expressionParts.push({
          pattern: pattern.substring(startPos, i),
          explanation: explainQuantifier(quantifier, prevPart),
          depth: currentDepth,
        });
        
        continue;
      }
      
      // Handle anchors and other special characters
      if ("^$.|".includes(pattern[i])) {
        const special = pattern[i];
        expressionParts.push({
          pattern: special,
          explanation: explainSpecialCharacter(special),
          depth: currentDepth,
        });
        i++;
        continue;
      }
      
      // Handle dot (match any character)
      if (pattern[i] === '.') {
        expressionParts.push({
          pattern: ".",
          explanation: "Match any single character except newline",
          depth: currentDepth,
        });
        i++;
        continue;
      }
      
      // Handle literal characters
      let literal = "";
      const literalStartPos = i;
      while (i < pattern.length && !"\\[]().*+?{}^$|".includes(pattern[i])) {
        literal += pattern[i];
        i++;
      }
      
      if (literal) {
        expressionParts.push({
          pattern: literal,
          explanation: `Match the characters "${literal}" literally`,
          depth: currentDepth,
        });
      }
    }
    
    return expressionParts;
  }
  
  // Start parsing from the root level
  return parseExpression();
}

function explainCharacterClass(charClass: string): string {
  if (charClass.startsWith("[^")) {
    return `Match any character that is not in the set: ${charClass.substring(2, charClass.length - 1)}`
  } else {
    return `Match any character in the set: ${charClass.substring(1, charClass.length - 1)}`
  }
}

function explainEscapedCharacter(escaped: string): string {
  switch (escaped) {
    case "\\d":
      return "Match any digit (0-9)"
    case "\\D":
      return "Match any non-digit character"
    case "\\w":
      return "Match any word character (a-z, A-Z, 0-9, _)"
    case "\\W":
      return "Match any non-word character"
    case "\\s":
      return "Match any whitespace character (space, tab, newline)"
    case "\\S":
      return "Match any non-whitespace character"
    case "\\b":
      return "Match a word boundary position"
    case "\\B":
      return "Match a non-word boundary position"
    case "\\n":
      return "Match a newline character"
    case "\\t":
      return "Match a tab character"
    case "\\r":
      return "Match a carriage return character"
    default:
      if (escaped.length === 2) {
        return `Match the character "${escaped[1]}" literally`
      }
      return `Match ${escaped}`
  }
}

function explainQuantifier(quantifier: string, prevPart: string): string {
  const isLazy = quantifier.endsWith('?');
  const baseQuantifier = isLazy ? quantifier.slice(0, -1) : quantifier;
  const lazyDescription = isLazy ? " (lazy, matching as few as possible)" : " (greedy, matching as many as possible)";
  
  switch (baseQuantifier) {
    case "*":
      return `Match the preceding item (${prevPart}) zero or more times${lazyDescription}`;
    case "+":
      return `Match the preceding item (${prevPart}) one or more times${lazyDescription}`;
    case "?":
      return `Match the preceding item (${prevPart}) zero or one time${lazyDescription}`;
    default:
      if (baseQuantifier.startsWith("{") && baseQuantifier.endsWith("}")) {
        const inner = baseQuantifier.substring(1, baseQuantifier.length - 1);
        if (inner.includes(",")) {
          const [min, max] = inner.split(",");
          if (max === "") {
            return `Match the preceding item (${prevPart}) at least ${min} times${lazyDescription}`;
          } else {
            return `Match the preceding item (${prevPart}) between ${min} and ${max} times${lazyDescription}`;
          }
        } else {
          return `Match the preceding item (${prevPart}) exactly ${inner} times`;
        }
      }
      return `Match using quantifier ${quantifier}`;
  }
}

function explainSpecialCharacter(special: string): string {
  switch (special) {
    case "^":
      return "Match the start of the line"
    case "$":
      return "Match the end of the line"
    case ".":
      return "Match any single character except newline"
    case "|":
      return "Match either the expression before or after the |"
    default:
      return `Match the special character ${special}`
  }
}
