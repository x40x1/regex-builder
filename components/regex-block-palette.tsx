"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { RegexBlockType } from "@/components/regex-builder"

interface RegexBlockPaletteProps {
  onAddBlock: (blockType: RegexBlockType) => void
}

export default function RegexBlockPalette({ onAddBlock }: RegexBlockPaletteProps) {
  const blockCategories = [
    {
      name: "Basic",
      blocks: [
        { type: "literal", label: "Text", description: "Match exact text" },
        { type: "anyChar", label: "Any Character", description: "Match any single character except newline" },
      ],
    },
    {
      name: "Character Classes",
      blocks: [
        { type: "digit", label: "Digit", description: "Match any digit (0-9)" },
        { type: "nonDigit", label: "Non-Digit", description: "Match any non-digit character" },
        { type: "word", label: "Word Character", description: "Match any word character (a-z, A-Z, 0-9, _)" },
        { type: "nonWord", label: "Non-Word Character", description: "Match any non-word character" },
        {
          type: "whitespace",
          label: "Whitespace",
          description: "Match any whitespace character (space, tab, newline)",
        },
        { type: "nonWhitespace", label: "Non-Whitespace", description: "Match any non-whitespace character" },
        { type: "characterClass", label: "Character Class", description: "Match any one character in the set" },
        {
          type: "negatedCharacterClass",
          label: "Negated Character Class",
          description: "Match any one character not in the set",
        },
      ],
    },
    {
      name: "Anchors",
      blocks: [
        { type: "startOfLine", label: "Start of Line", description: "Match the start of a line" },
        { type: "endOfLine", label: "End of Line", description: "Match the end of a line" },
        { type: "wordBoundary", label: "Word Boundary", description: "Match a word boundary position" },
        { type: "nonWordBoundary", label: "Non-Word Boundary", description: "Match a non-word boundary position" },
      ],
    },
    {
      name: "Quantifiers",
      blocks: [
        { type: "zeroOrMore", label: "Zero or More", description: "Match the previous item zero or more times" },
        { type: "oneOrMore", label: "One or More", description: "Match the previous item one or more times" },
        { type: "zeroOrOne", label: "Zero or One", description: "Match the previous item zero or one time" },
        { type: "exactly", label: "Exactly", description: "Match the previous item exactly n times" },
        { type: "atLeast", label: "At Least", description: "Match the previous item at least n times" },
        { type: "between", label: "Between", description: "Match the previous item between n and m times" },
      ],
    },
    {
      name: "Groups",
      blocks: [
        { type: "group", label: "Group", description: "Group multiple items together" },
        { type: "or", label: "Or", description: "Match either the expression before or after the |" },
      ],
    },
    {
      name: "Lookarounds",
      blocks: [
        { type: "lookahead", label: "Lookahead", description: "Match if followed by the given pattern" },
        {
          type: "negativeLookahead",
          label: "Negative Lookahead",
          description: "Match if NOT followed by the given pattern",
        },
        { type: "lookbehind", label: "Lookbehind", description: "Match if preceded by the given pattern" },
        {
          type: "negativeLookbehind",
          label: "Negative Lookbehind",
          description: "Match if NOT preceded by the given pattern",
        },
      ],
    },
  ]

  const handleDragStart = (e: React.DragEvent, blockType: RegexBlockType) => {
    e.dataTransfer.setData("blockType", blockType)
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={["Basic", "Character Classes", "Anchors", "Quantifiers", "Groups", "Lookarounds"]}
    >
      {blockCategories.map((category) => (
        <AccordionItem key={category.name} value={category.name}>
          <AccordionTrigger>{category.name}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2 pt-2">
              {category.blocks.map((block) => (
                <Button
                  key={block.type}
                  variant="outline"
                  className="justify-start h-auto py-2 px-3"
                  onClick={() => onAddBlock(block.type as RegexBlockType)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy"
                    e.dataTransfer.setData("application/regex-block", block.type)
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium">{block.label}</div>
                    <div className="text-xs text-muted-foreground">{block.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
