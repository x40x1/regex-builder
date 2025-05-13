import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegexExplanation from '@/components/regex-explanation';

describe('RegexExplanation Component', () => {
  const defaultFlags = {
    global: false,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false
  };

  test('renders empty state correctly', () => {
    render(<RegexExplanation regexPattern="" flags={defaultFlags} />);
    
    expect(screen.getByText('Add regex blocks or enter a pattern to see an explanation')).toBeInTheDocument();
  });

  test('explains simple regex pattern correctly', () => {
    render(<RegexExplanation regexPattern="abc" flags={defaultFlags} />);
    
    expect(screen.getByText('This regular expression:')).toBeInTheDocument();
    expect(screen.getByText(/\/abc\//)).toBeInTheDocument();
    expect(screen.getByText('Match the characters "abc" literally')).toBeInTheDocument();
  });

  test('explains character classes correctly', () => {
    render(<RegexExplanation regexPattern="[a-z]" flags={defaultFlags} />);
    
    expect(screen.getByText(/Match any character in the set:/)).toBeInTheDocument();
  });

  test('explains negated character classes correctly', () => {
    render(<RegexExplanation regexPattern="[^0-9]" flags={defaultFlags} />);
    
    expect(screen.getByText(/Match any character that is not in the set:/)).toBeInTheDocument();
  });

  test('explains escaped characters correctly', () => {
    render(<RegexExplanation regexPattern="\d\w\s" flags={defaultFlags} />);
    
    expect(screen.getByText('Match any digit (0-9)')).toBeInTheDocument();
    expect(screen.getByText('Match any word character (a-z, A-Z, 0-9, _)')).toBeInTheDocument();
    expect(screen.getByText('Match any whitespace character (space, tab, newline)')).toBeInTheDocument();
  });

  test('explains quantifiers correctly', () => {
    render(<RegexExplanation regexPattern="a+" flags={defaultFlags} />);
    
    expect(screen.getByText(/Match the preceding item .* one or more times/)).toBeInTheDocument();
  });

  test('explains capture groups correctly', () => {
    render(<RegexExplanation regexPattern="(abc)" flags={defaultFlags} />);
    
    expect(screen.getByText(/Capture group that remembers the matched substring/)).toBeInTheDocument();
    expect(screen.getByText('Match the characters "abc" literally')).toBeInTheDocument();
  });

  test('explains non-capturing groups correctly', () => {
    render(<RegexExplanation regexPattern="(?:abc)" flags={defaultFlags} />);
    
    expect(screen.getByText(/Group that doesn't capture for backreference/)).toBeInTheDocument();
  });

  test('explains lookahead assertions correctly', () => {
    render(<RegexExplanation regexPattern="a(?=b)" flags={defaultFlags} />);
    
    expect(screen.getByText(/Assert that the following matches ahead without consuming characters/)).toBeInTheDocument();
  });

  test('explains flags correctly', () => {
    const flags = {
      global: true,
      caseInsensitive: true,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false
    };
    
    render(<RegexExplanation regexPattern="abc" flags={flags} />);
    
    expect(screen.getByText(/\/abc\/gi/)).toBeInTheDocument();
    expect(screen.getByText('Global: Find all matches rather than stopping after the first match')).toBeInTheDocument();
    expect(screen.getByText('Case Insensitive: Match will be case-insensitive')).toBeInTheDocument();
  });

  test('allows custom pattern input', () => {
    render(<RegexExplanation regexPattern="abc" flags={defaultFlags} />);
    
    const patternInput = screen.getByPlaceholderText(/Enter regex pattern/);
    fireEvent.change(patternInput, { target: { value: 'xyz+' } });
    
    const explainButton = screen.getByRole('button', { name: /Explain/ });
    fireEvent.click(explainButton);
    
    expect(screen.getByText(/\/xyz\+\//)).toBeInTheDocument();
    expect(screen.getByText(/Match the characters "xyz" literally/)).toBeInTheDocument();
    expect(screen.getByText(/Match the preceding item .* one or more times/)).toBeInTheDocument();
  });

  test('handles custom pattern with flags input', () => {
    render(<RegexExplanation regexPattern="abc" flags={defaultFlags} />);
    
    const patternInput = screen.getByPlaceholderText(/Enter regex pattern/);
    fireEvent.change(patternInput, { target: { value: 'xyz' } });
    
    const flagsInput = screen.getByPlaceholderText(/Flags/);
    fireEvent.change(flagsInput, { target: { value: 'gi' } });
    
    const explainButton = screen.getByRole('button', { name: /Explain/ });
    fireEvent.click(explainButton);
    
    expect(screen.getByText(/\/xyz\/gi/)).toBeInTheDocument();
    expect(screen.getByText('Global: Find all matches rather than stopping after the first match')).toBeInTheDocument();
  });

  test('handles pattern in /pattern/flags format', () => {
    render(<RegexExplanation regexPattern="abc" flags={defaultFlags} />);
    
    const patternInput = screen.getByPlaceholderText(/Enter regex pattern/);
    fireEvent.change(patternInput, { target: { value: '/xyz/gi' } });
    
    const explainButton = screen.getByRole('button', { name: /Explain/ });
    fireEvent.click(explainButton);
    
    expect(screen.getByText(/\/xyz\/gi/)).toBeInTheDocument();
    expect(screen.getByText('Global: Find all matches rather than stopping after the first match')).toBeInTheDocument();
  });

  test('handles invalid regex pattern', () => {
    render(<RegexExplanation regexPattern="abc[" flags={defaultFlags} />);
    
    expect(screen.getByText(/Invalid regular expression/)).toBeInTheDocument();
  });

  test('resets to builder pattern', () => {
    render(<RegexExplanation regexPattern="abc" flags={defaultFlags} />);
    
    // First switch to custom pattern
    const patternInput = screen.getByPlaceholderText(/Enter regex pattern/);
    fireEvent.change(patternInput, { target: { value: 'xyz' } });
    
    const explainButton = screen.getByRole('button', { name: /Explain/ });
    fireEvent.click(explainButton);
    
    // Now reset to builder
    const resetButton = screen.getByRole('button', { name: /Use Builder Pattern/ });
    fireEvent.click(resetButton);
    
    expect(screen.getByText(/\/abc\//)).toBeInTheDocument();
  });
});
