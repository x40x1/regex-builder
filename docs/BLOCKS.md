# Regex Block Types

This document describes all available regex block types in the builder.

## Basic Blocks
- **Literal**: Match exact text
- **Any Character**: .
- **Digit**: \d
- **Non-Digit**: \D
- **Word Character**: \w
- **Non-Word Character**: \W
- **Whitespace**: \s
- **Non-Whitespace**: \S
- **Start of Line**: ^
- **End of Line**: $
- **Word Boundary**: \b
- **Non-Word Boundary**: \B

## Quantifiers
- **Zero or More**: *
- **One or More**: +
- **Zero or One**: ?
- **Exactly**: {n}
- **At Least**: {n,}
- **Between**: {n,m}

## Grouping & Alternation
- **Group**: (...)
- **Or**: (...|...)

## Character Classes
- **Character Class**: [abc]
- **Negated Character Class**: [^abc]

## Lookarounds
- **Lookahead**: (?=...)
- **Negative Lookahead**: (?!...)
- **Lookbehind**: (?<=...)
- **Negative Lookbehind**: (?<!...)
