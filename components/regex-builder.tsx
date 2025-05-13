"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { GripVertical, Trash2, Copy, Info, MoonStar, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import RegexBlockPalette from "@/components/regex-block-palette" // Assuming this component exists
import RegexTester from "@/components/regex-tester"           // Assuming this component exists
import RegexExplanation from "@/components/regex-explanation" // Assuming this component exists
import { cn } from "@/lib/utils"                             // Assuming this utility exists
import { generateRegexPattern, NESTING_BEHAVIOR } from "@/lib/regex-block-utils"

// Define the types for our regex blocks
export type RegexBlockType =
  | "literal" | "anyChar" | "digit" | "nonDigit" | "word" | "nonWord"
  | "whitespace" | "nonWhitespace" | "startOfLine" | "endOfLine"
  | "zeroOrMore" | "oneOrMore" | "zeroOrOne" | "exactly" | "atLeast" | "between"
  | "group" | "or" | "characterClass" | "negatedCharacterClass"
  | "wordBoundary" | "nonWordBoundary" | "lookahead" | "negativeLookahead"
  | "lookbehind" | "negativeLookbehind";

export interface RegexBlock {
  id: string;
  type: RegexBlockType;
  label: string;
  value: string;
  description: string;
  params?: { [key: string]: string | number | boolean };
  children?: RegexBlock[];
}

function createNewBlock(type: RegexBlockType): RegexBlock {
  const id = `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  switch (type) {
    case "literal": return { id, type, label: "Text", value: "", description: "Match exact text", params: { value: "" } };
    case "anyChar": return { id, type, label: "Any Character", value: ".", description: "Match any single character except newline" };
    case "digit": return { id, type, label: "Digit", value: "\\d", description: "Match any digit (0-9)" };
    case "nonDigit": return { id, type, label: "Non-Digit", value: "\\D", description: "Match any non-digit character" };
    case "word": return { id, type, label: "Word Character", value: "\\w", description: "Match any word character (a-z, A-Z, 0-9, _)" };
    case "nonWord": return { id, type, label: "Non-Word Character", value: "\\W", description: "Match any non-word character" };
    case "whitespace": return { id, type, label: "Whitespace", value: "\\s", description: "Match any whitespace character (space, tab, newline)" };
    case "nonWhitespace": return { id, type, label: "Non-Whitespace", value: "\\S", description: "Match any non-whitespace character" };
    case "startOfLine": return { id, type, label: "Start of Line", value: "^", description: "Match the start of a line" };
    case "endOfLine": return { id, type, label: "End of Line", value: "$", description: "Match the end of a line" };
    case "wordBoundary": return { id, type, label: "Word Boundary", value: "\\b", description: "Match a word boundary position" };
    case "nonWordBoundary": return { id, type, label: "Non-Word Boundary", value: "\\B", description: "Match a non-word boundary position" };
    case "zeroOrMore": return { id, type, label: "Zero or More", value: "*", description: "Match the previous item zero or more times", children: [] };
    case "oneOrMore": return { id, type, label: "One or More", value: "+", description: "Match the previous item one or more times", children: [] };
    case "zeroOrOne": return { id, type, label: "Zero or One", value: "?", description: "Match the previous item zero or one time", children: [] };
    case "exactly": return { id, type, label: "Exactly", value: "{n}", description: "Match the previous item exactly n times", params: { count: 1 }, children: [] };
    case "atLeast": return { id, type, label: "At Least", value: "{n,}", description: "Match the previous item at least n times", params: { min: 1 }, children: [] };
    case "between": return { id, type, label: "Between", value: "{n,m}", description: "Match the previous item between n and m times", params: { min: 1, max: 3 }, children: [] };
    case "group": return { id, type, label: "Group", value: "()", description: "Group multiple items together", children: [] };
    case "or": return { id, type, label: "Or", value: "|", description: "Match either the expression before or after the |", children: [] };
    case "characterClass": return { id, type, label: "Character Class", value: "[]", description: "Match any one character in the set", params: { characters: "a-z" } };
    case "negatedCharacterClass": return { id, type, label: "Negated Char Class", value: "[^]", description: "Match any one character not in the set", params: { characters: "a-z" } };
    case "lookahead": return { id, type, label: "Lookahead", value: "(?=)", description: "Assert that the following characters match", children: [] };
    case "negativeLookahead": return { id, type, label: "Neg. Lookahead", value: "(?!)", description: "Assert that the following characters do NOT match", children: [] };
    case "lookbehind": return { id, type, label: "Lookbehind", value: "(?<=)", description: "Assert that the preceding characters match", children: [] };
    case "negativeLookbehind": return { id, type, label: "Neg. Lookbehind", value: "(?<! )", description: "Assert that the preceding characters do NOT match", children: [] };
    default: return { id, type: "literal", label: "Text", value: "", description: "Match exact text", params: { value: "" } };
  }
}

// Helper function for recursive updates in the block tree
const updateBlockInTree = (
  blocks: RegexBlock[],
  targetParentId: string,
  updateFn: (parentBlock: RegexBlock) => RegexBlock,
): RegexBlock[] => {
  return blocks.map(block => {
    // If this is the target block, apply the update function
    if (block.id === targetParentId) {
      return updateFn(block);
    }
    
    // If this block has children, recursively check them
    if (block.children && block.children.length > 0) {
      const updatedChildren = updateBlockInTree(block.children, targetParentId, updateFn);
      
      // Only create a new block if children actually changed
      if (updatedChildren !== block.children) {
        return { ...block, children: updatedChildren };
      }
    }
    
    // Return unchanged block
    return block;
  });
};

const t = (s: string) => s; // Placeholder for i18n

function getFlagString(flags: { [key: string]: boolean }): string {
  const flagMap: { [key: string]: string } = {
    global: 'g',
    caseInsensitive: 'i',
    multiline: 'm',
    dotAll: 's',
    unicode: 'u',
    sticky: 'y'
  };
  return Object.entries(flags)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => flagMap[key])
    .join('');
}

export default function RegexBuilder() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("builder");
  const [regexBlocks, setRegexBlocks] = useState<RegexBlock[]>([]);
  const [regexPattern, setRegexPattern] = useState("");
  const [testString, setTestString] = useState("Hello 123 world!");
  const [flags, setFlags] = useState({
    global: true, caseInsensitive: false, multiline: false,
    dotAll: false, unicode: false, sticky: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setRegexPattern(generateRegexPattern(regexBlocks));
  }, [regexBlocks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRegexBlocks((blocks) => {
        const oldIndex = blocks.findIndex((block) => block.id === active.id);
        const newIndex = blocks.findIndex((block) => block.id === over.id);
        return arrayMove(blocks, oldIndex, newIndex);
      });
    }
  };

  const addBlock = (blockType: RegexBlockType) => {
    const newBlock = createNewBlock(blockType);
    setRegexBlocks([...regexBlocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setRegexBlocks(regexBlocks.filter((block) => block.id !== id));
  };

  const updateBlockParams = (id: string, params: { [key: string]: string | number | boolean }) => {
    setRegexBlocks((blocks) =>
      blocks.map((block) => (block.id === id ? { ...block, params: { ...block.params, ...params } } : block)),
    );
  };

  const copyRegexToClipboard = () => {
    const flagString = getFlagString(flags);
    navigator.clipboard.writeText(`/${regexPattern}/${flagString}`);
  };

  const onAddNestedBlock = (parentId: string, newBlock: RegexBlock) => {
    setRegexBlocks(prevBlocks => updateBlockInTree(
      prevBlocks, 
      parentId, 
      (parentBlock) => {
        let updatedChildren: RegexBlock[];
        if (NESTING_BEHAVIOR.MULTI_CHILD_SEQUENCE.includes(parentBlock.type) || 
            NESTING_BEHAVIOR.MULTI_CHILD_ALTERNATION.includes(parentBlock.type)) {
          updatedChildren = [...(parentBlock.children || []), newBlock];
        } else if (NESTING_BEHAVIOR.SINGLE_CHILD_MODIFIER.includes(parentBlock.type)) {
          updatedChildren = [newBlock];
        } else {
          updatedChildren = parentBlock.children || [];
        }
        return { ...parentBlock, children: updatedChildren };
      }
    ));
  };

  const onRemoveNestedBlock = (parentId: string, blockIdToRemove: string) => {
    setRegexBlocks(prevBlocks => updateBlockInTree(
      prevBlocks,
      parentId,
      (parentBlock) => ({
        ...parentBlock,
        children: (parentBlock.children || []).filter(child => child.id !== blockIdToRemove),
      })
    ));
  };

  const onUpdateNestedBlockParams = (
    parentId: string,
    blockIdToUpdate: string,
    newParams: { [key: string]: string | number | boolean },
  ) => {
    setRegexBlocks(prevBlocks => updateBlockInTree(
      prevBlocks,
      parentId,
      (parentBlock) => ({
        ...parentBlock,
        children: (parentBlock.children || []).map(child =>
          child.id === blockIdToUpdate 
            ? { ...child, params: { ...child.params, ...newParams } } 
            : child
        ),
      })
    ));
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <TabsList>
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="tester">Tester</TabsTrigger>
              <TabsTrigger value="explanation">Explanation</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              {mounted && (
                <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="h-4 w-4 mr-1" /> : <MoonStar className="h-4 w-4 mr-1" />}
                  {theme === "dark" ? "Light" : "Dark"}
                </Button>
              )}
            </div>
          </div>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle>
                <div className="flex justify-between items-center">
                  <span>{activeTab === "builder" ? "Regex Builder" : activeTab === "tester" ? "Regex Tester" : "Regex Explanation"}</span>
                  <Button variant="outline" size="sm" onClick={copyRegexToClipboard} aria-label={t("Copy regex")}>
                    <Copy className="h-4 w-4 mr-1" /> {t("Copy")}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {activeTab === "builder" ? "Drag and drop blocks to build your regex pattern"
                  : activeTab === "tester" ? "Test your regex against sample text"
                  : "Understand what your regex pattern means"}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="builder" className="mt-0">
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="font-mono p-2 bg-muted rounded flex-1 overflow-x-auto whitespace-nowrap">
                        /{regexPattern || t("your-regex-pattern")}/{getFlagString(flags)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mb-6">
                      {(Object.keys(flags) as Array<keyof typeof flags>).map(flagKey => (
                        <div key={flagKey} className="flex items-center space-x-2">
                          <Switch id={flagKey} checked={flags[flagKey]} onCheckedChange={(c) => setFlags(f => ({ ...f, [flagKey]: c }))} />
                          <Label htmlFor={flagKey} className="capitalize text-sm">
                            {flagKey.replace(/([A-Z])/g, ' $1')} ({flagKey === "caseInsensitive" ? "i" : flagKey[0]})
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="border rounded-lg p-4 min-h-[200px] mb-6 bg-background"
                         onDragOver={(e) => { e.preventDefault(); if (e.target instanceof Element && !e.target.closest('[data-nested-dropzone]')) e.dataTransfer.dropEffect = "copy"; }}
                         onDrop={(e) => { e.preventDefault(); if (!(e.target instanceof Element) || !e.target.closest('[data-nested-dropzone]')) { const bt = e.dataTransfer.getData("application/regex-block"); if (bt) addBlock(bt as RegexBlockType); }}}>
                      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={regexBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                          {regexBlocks.length > 0 ? (
                            <div className="space-y-2">
                              {regexBlocks.map((block) => (
                                <SortableRegexBlock key={block.id} block={block}
                                  onRemove={removeBlock} onUpdateParams={updateBlockParams}
                                  onAddNestedBlock={onAddNestedBlock}
                                  onRemoveNestedBlock={onRemoveNestedBlock}
                                  onUpdateNestedBlockParams={onUpdateNestedBlockParams} />
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
                              <p>{t("Drag blocks from the palette here, or click a block in the palette to add.")}</p>
                            </div>
                          )}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="tester" className="mt-0"><RegexTester regexPattern={regexPattern} testString={testString} setTestString={setTestString} flags={flags} /></TabsContent>
                <TabsContent value="explanation" className="mt-0"><RegexExplanation regexPattern={regexPattern} flags={flags} /></TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader><CardTitle>{t("Block Palette")}</CardTitle><CardDescription>{t("Drag blocks to the builder or click to add")}</CardDescription></CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ScrollArea className="h-[calc(100vh-250px)] min-h-[400px] pr-3">
                <RegexBlockPalette onAddBlock={addBlock} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface SortableRegexBlockProps {
  block: RegexBlock;
  onRemove: (id: string) => void;
  onUpdateParams: (id: string, params: { [key: string]: string | number | boolean }) => void;
  onAddNestedBlock: (parentId: string, block: RegexBlock) => void;
  onRemoveNestedBlock: (parentId: string, blockId: string) => void;
  onUpdateNestedBlockParams: (parentId: string, blockId: string, params: { [key: string]: string | number | boolean }) => void;
}

function SortableRegexBlock({ block, onRemove, onUpdateParams, onAddNestedBlock, onRemoveNestedBlock, onUpdateNestedBlockParams }: SortableRegexBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const [isDropTargetActive, setIsDropTargetActive] = useState(false);
  const style = { transform: CSS.Transform.toString(transform), transition };
  const handleParamChange = (key: string, value: string | number | boolean) => onUpdateParams(block.id, { [key]: value });
  const supportsNesting = block.children !== undefined;

  let dropZoneMessage = t("Drop a block here");
  if (supportsNesting) {
    if (NESTING_BEHAVIOR.MULTI_CHILD_ALTERNATION.includes(block.type)) dropZoneMessage = t("Drop blocks here to add alternatives");
    else if (NESTING_BEHAVIOR.MULTI_CHILD_SEQUENCE.includes(block.type)) dropZoneMessage = t("Drop blocks here to add to this group/assertion");
    else if (NESTING_BEHAVIOR.SINGLE_CHILD_MODIFIER.includes(block.type)) dropZoneMessage = block.children?.length ? t("Drop block to replace content") : t("Drop block for this modifier");
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDropTargetActive(false);
    const blockType = e.dataTransfer.getData("application/regex-block") as RegexBlockType;
    if (blockType) onAddNestedBlock(block.id, createNewBlock(blockType));
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-md p-3 bg-card shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div {...attributes} {...listeners} className="cursor-grab p-1"><GripVertical className="h-5 w-5 text-muted-foreground" /></div>
        <div className="flex-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge variant="secondary" className="font-mono text-sm">{block.label}</Badge>
          {block.type === "literal" && <Input className="h-8 flex-grow min-w-[100px]" placeholder={t("Text value")} value={block.params?.value as string || ""} onChange={e => handleParamChange("value", e.target.value)} />}
          {(block.type === "characterClass" || block.type === "negatedCharacterClass") && <Input className="h-8 flex-grow min-w-[150px]" placeholder={t("Chars (e.g. a-z0-9)")} value={block.params?.characters as string || ""} onChange={e => handleParamChange("characters", e.target.value)} />}
          {block.type === "exactly" && <div className="flex items-center gap-1"><Input type="number" min={0} className="w-20 h-8" value={block.params?.count as number || 1} onChange={e => handleParamChange("count", parseInt(e.target.value))} /><span className="text-sm text-muted-foreground">{t("times")}</span></div>}
          {block.type === "atLeast" && <div className="flex items-center gap-1"><Input type="number" min={0} className="w-20 h-8" value={block.params?.min as number || 1} onChange={e => handleParamChange("min", parseInt(e.target.value))} /><span className="text-sm text-muted-foreground">{t("or more")}</span></div>}
          {block.type === "between" && <div className="flex items-center gap-1"><Input type="number" min={0} className="w-16 h-8" value={block.params?.min as number || 1} onChange={e => handleParamChange("min", parseInt(e.target.value))} /><span className="text-xs text-muted-foreground p-1">{t("to")}</span><Input type="number" min={0} className="w-16 h-8" value={block.params?.max as number || 3} onChange={e => handleParamChange("max", parseInt(e.target.value))} /><span className="text-sm text-muted-foreground">{t("times")}</span></div>}
          <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 ml-auto"><Info className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>{block.description}</p></TooltipContent></Tooltip></TooltipProvider>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(block.id)} className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
      {supportsNesting && (
        <div className={cn("mt-2 ml-6 border-l-2 pl-4 border-dashed", isDropTargetActive ? "border-primary" : "border-muted-foreground/50")}>
          <div data-nested-dropzone className={cn("p-3 rounded-md min-h-[60px] border-2 border-dashed", isDropTargetActive ? "border-primary bg-primary/10" : "border-muted hover:border-muted-foreground/50")}
               onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "copy"; setIsDropTargetActive(true); }}
               onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDropTargetActive(false); }}
               onDrop={handleDrop}>
            {block.children?.length ? (
              <div className="space-y-2">
                {block.children.map(child => (
                  <NestedRegexBlock key={child.id} block={child}
                    onRemoveSelf={() => onRemoveNestedBlock(block.id, child.id)}
                    onUpdateSelfParams={params => onUpdateNestedBlockParams(block.id, child.id, params)}
                    addNestedBlock={onAddNestedBlock} removeNestedBlock={onRemoveNestedBlock} updateNestedBlockParams={onUpdateNestedBlockParams} />
                ))}
              </div>
            ) : <div className="text-center text-muted-foreground text-sm py-2">{dropZoneMessage}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

interface NestedRegexBlockProps {
  block: RegexBlock;
  onRemoveSelf: () => void;
  onUpdateSelfParams: (params: { [key: string]: string | number | boolean }) => void;
  addNestedBlock: (parentId: string, newBlock: RegexBlock) => void;
  removeNestedBlock: (parentId: string, blockId: string) => void;
  updateNestedBlockParams: (parentId: string, blockId: string, params: { [key: string]: string | number | boolean }) => void;
}

function NestedRegexBlock({ block, onRemoveSelf, onUpdateSelfParams, addNestedBlock, removeNestedBlock, updateNestedBlockParams }: NestedRegexBlockProps) {
  const [isDropTargetActive, setIsDropTargetActive] = useState(false);
  const handleParamChange = (key: string, value: string | number | boolean) => onUpdateSelfParams({ [key]: value });
  const supportsNesting = block.children !== undefined;

  let dropZoneMessage = t("Drop a block here");
  if (supportsNesting) {
    if (NESTING_BEHAVIOR.MULTI_CHILD_ALTERNATION.includes(block.type)) dropZoneMessage = t("Drop blocks to add alternatives");
    else if (NESTING_BEHAVIOR.MULTI_CHILD_SEQUENCE.includes(block.type)) dropZoneMessage = t("Drop blocks for this group/assertion");
    else if (NESTING_BEHAVIOR.SINGLE_CHILD_MODIFIER.includes(block.type)) dropZoneMessage = block.children?.length ? t("Drop block to replace content") : t("Drop block for this modifier");
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDropTargetActive(false);
    const blockType = e.dataTransfer.getData("application/regex-block") as RegexBlockType;
    if (blockType) addNestedBlock(block.id, createNewBlock(blockType));
  };

  return (
    <div className="border rounded-md p-2 bg-card shadow-sm">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">{block.label}</Badge>
        {block.type === "literal" && <Input className="h-7 text-sm flex-grow min-w-[80px]" placeholder={t("Text")} value={block.params?.value as string || ""} onChange={e => handleParamChange("value", e.target.value)} />}
        {(block.type === "characterClass" || block.type === "negatedCharacterClass") && <Input className="h-7 text-sm flex-grow min-w-[100px]" placeholder={t("e.g. a-z0-9")} value={block.params?.characters as string || ""} onChange={e => handleParamChange("characters", e.target.value)} />}
        {block.type === "exactly" && <div className="flex items-center gap-1"><span className="text-xs text-muted-foreground">{t("Repeat")}:</span><Input type="number" min={0} className="w-16 h-7 text-sm" value={block.params?.count as number ?? 1} onChange={e => handleParamChange("count", parseInt(e.target.value))} /><span className="text-xs text-muted-foreground">{t("times")}</span></div>}
        {block.type === "atLeast" && <div className="flex items-center gap-1"><span className="text-xs text-muted-foreground">{t("Min")}:</span><Input type="number" min={0} className="w-16 h-7 text-sm" value={block.params?.min as number ?? 1} onChange={e => handleParamChange("min", parseInt(e.target.value))} /><span className="text-xs text-muted-foreground">{t("times")}</span></div>}
        {block.type === "between" && <div className="flex items-center gap-1"><span className="text-xs text-muted-foreground">{t("Min")}:</span><Input type="number" min={0} className="w-14 h-7 text-sm" value={block.params?.min as number ?? 1} onChange={e => handleParamChange("min", parseInt(e.target.value))} /><span className="text-xs text-muted-foreground">{t("Max")}:</span><Input type="number" min={0} className="w-14 h-7 text-sm" value={block.params?.max as number ?? 3} onChange={e => handleParamChange("max", parseInt(e.target.value))} /><span className="text-xs text-muted-foreground">{t("times")}</span></div>}
        <div className="flex-1 min-w-[10px]"></div>
        
        {/* Add tooltip for information, similar to the parent blocks */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Info className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{block.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button variant="ghost" size="icon" onClick={onRemoveSelf} className="h-7 w-7">
          <Trash2 className="h-3.5 w-3.5 text-destructive/80 hover:text-destructive" />
        </Button>
      </div>
      {supportsNesting && (
        <div className={cn("mt-2 ml-4 border-l-2 pl-3 border-dashed", isDropTargetActive ? "border-primary" : "border-muted-foreground/30")}>
          <div data-nested-dropzone className={cn("p-2 rounded-md min-h-[50px] border-2 border-dashed", isDropTargetActive ? "border-primary bg-primary/10" : "border-muted hover:border-muted-foreground/40")}
               onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "copy"; setIsDropTargetActive(true); }}
               onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDropTargetActive(false); }}
               onDrop={handleDrop}>
            {block.children?.length ? (
              <div className="space-y-1.5">
                {block.children.map(child => (
                  <NestedRegexBlock key={child.id} block={child}
                    onRemoveSelf={() => removeNestedBlock(block.id, child.id)}
                    onUpdateSelfParams={params => updateNestedBlockParams(block.id, child.id, params)}
                    addNestedBlock={addNestedBlock} removeNestedBlock={removeNestedBlock} updateNestedBlockParams={updateNestedBlockParams} />
                ))}
              </div>
            ) : <div className="text-center text-muted-foreground text-xs py-1.5">{dropZoneMessage}</div>}
          </div>
        </div>
      )}
    </div>
  );
}