import { RegexBlock, RegexBlockType } from '@/components/regex-builder';

/**
 * Generate a regex pattern string from a regex block structure
 */
export function generateRegexPattern(blocks: RegexBlock[]): string {
  return blocks.map(block => processBlock(block)).join("");
}

/**
 * Process a single regex block into its string representation
 */
function processBlock(block: RegexBlock): string {
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapeCharClass = (str: string) => str.replace(/([-\]\\[\\])/g, "\\$1");

  const childrenContent = block.children?.map(child => processBlock(child)).join("") || "";
  const wrapNonCapturing = (content: string) => 
    content.length > 1 || /\|/.test(content) 
      ? `(?:${content})` 
      : content;
  
  switch (block.type) {
    // Simple character matches
    case "literal": return block.params?.value ? escapeRegex(block.params.value as string) : "";
    case "anyChar": return ".";
    case "digit": return "\\d";
    case "nonDigit": return "\\D";
    case "word": return "\\w";
    case "nonWord": return "\\W";
    case "whitespace": return "\\s";
    case "nonWhitespace": return "\\S";
    
    // Positional assertions
    case "startOfLine": return "^";
    case "endOfLine": return "$";
    case "wordBoundary": return "\\b";
    case "nonWordBoundary": return "\\B";
    
    // Quantifiers
    case "zeroOrMore": return childrenContent 
      ? `${wrapNonCapturing(childrenContent)}*` 
      : ".*";
    case "oneOrMore": return childrenContent 
      ? `${wrapNonCapturing(childrenContent)}+` 
      : ".+";
    case "zeroOrOne": return childrenContent 
      ? `${wrapNonCapturing(childrenContent)}?` 
      : ".?";
    case "exactly": return childrenContent 
      ? `${wrapNonCapturing(childrenContent)}{${block.params?.count || 1}}` 
      : `.{${block.params?.count || 1}}`;
    case "atLeast": return childrenContent 
      ? `${wrapNonCapturing(childrenContent)}{${block.params?.min || 1},}` 
      : `.{${block.params?.min || 1},}`;
    case "between": return childrenContent 
      ? `${wrapNonCapturing(childrenContent)}{${block.params?.min || 1},${block.params?.max || 3}}` 
      : `.{${block.params?.min || 1},${block.params?.max || 3}}`;

    // Groups
    case "group": return `(${childrenContent})`;
    case "or": return block.children && block.children.length > 0
      ? block.children.map(child => processBlock(child)).join("|")
      : "a|b"; // Default placeholder
    
    // Character classes
    case "characterClass": return `[${escapeCharClass(block.params?.characters as string || "a-z")}]`;
    case "negatedCharacterClass": return `[^${escapeCharClass(block.params?.characters as string || "a-z")}]`;
    
    // Lookarounds
    case "lookahead": return `(?=${childrenContent || "pattern"})`;
    case "negativeLookahead": return `(?!${childrenContent || "pattern"})`;
    case "lookbehind": return `(?<=${childrenContent || "pattern"})`;
    case "negativeLookbehind": return `(?<!${childrenContent || "pattern"})`;
    
    default: return "";
  }
}

/**
 * Define nesting behavior for each block type
 */
export const NESTING_BEHAVIOR = {
  // Blocks that can contain multiple children in sequence
  MULTI_CHILD_SEQUENCE: [
    'group', 'lookahead', 'negativeLookahead', 
    'lookbehind', 'negativeLookbehind'
  ] as RegexBlockType[],
  
  // Blocks that can contain multiple children as alternatives
  MULTI_CHILD_ALTERNATION: ['or'] as RegexBlockType[],
  
  // Blocks that modify a single child
  SINGLE_CHILD_MODIFIER: [
    'zeroOrMore', 'oneOrMore', 'zeroOrOne',
    'exactly', 'atLeast', 'between'
  ] as RegexBlockType[],
  
  // Helper to check if a block type supports nesting
  supportsNesting(type: RegexBlockType): boolean {
    return [
      ...this.MULTI_CHILD_SEQUENCE, 
      ...this.MULTI_CHILD_ALTERNATION, 
      ...this.SINGLE_CHILD_MODIFIER
    ].includes(type);
  }
};
