import React, { useState, useRef } from 'react';

interface EquationBuilderProps {
  onEquationChange?: (latex: string) => void;
  initialLatex?: string;
}

export const EquationBuilder: React.FC<EquationBuilderProps> = ({ 
  onEquationChange, 
  initialLatex = '' 
}) => {
  const [latex, setLatex] = useState<string>(initialLatex);
  const [preview, setPreview] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const symbols = [
    { symbol: '\\sum', display: '∑', name: 'Sum' },
    { symbol: '\\int', display: '∫', name: 'Integral' },
    { symbol: '\\sqrt{}', display: '√', name: 'Square Root' },
    { symbol: '\\frac{}{}', display: '⁄', name: 'Fraction' },
    { symbol: '\\alpha', display: 'α', name: 'Alpha' },
    { symbol: '\\beta', display: 'β', name: 'Beta' },
    { symbol: '\\gamma', display: 'γ', name: 'Gamma' },
    { symbol: '\\delta', display: 'δ', name: 'Delta' },
    { symbol: '\\pi', display: 'π', name: 'Pi' },
    { symbol: '\\theta', display: 'θ', name: 'Theta' },
    { symbol: '\\lambda', display: 'λ', name: 'Lambda' },
    { symbol: '\\mu', display: 'μ', name: 'Mu' },
    { symbol: '\\infty', display: '∞', name: 'Infinity' },
    { symbol: '\\pm', display: '±', name: 'Plus/Minus' },
    { symbol: '\\leq', display: '≤', name: 'Less Equal' },
    { symbol: '\\geq', display: '≥', name: 'Greater Equal' },
    { symbol: '\\neq', display: '≠', name: 'Not Equal' },
    { symbol: '\\approx', display: '≈', name: 'Approximately' },
    { symbol: '^{}', display: 'x²', name: 'Superscript' },
    { symbol: '_{}', display: 'x₁', name: 'Subscript' },
  ];

  const templates = [
    { name: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { name: 'Pythagorean Theorem', latex: 'a^2 + b^2 = c^2' },
    { name: 'Euler\'s Identity', latex: 'e^{i\\pi} + 1 = 0' },
    { name: 'Derivative', latex: '\\frac{d}{dx}f(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}' },
    { name: 'Integral', latex: '\\int_a^b f(x) dx' },
    { name: 'Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { name: 'Summation', latex: '\\sum_{i=1}^{n} x_i' },
    { name: 'Binomial Coefficient', latex: '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}' },
  ];

  const handleLatexChange = (value: string) => {
    setLatex(value);
    onEquationChange?.(value);
    // Simple preview generation (in real app, you'd use MathJax or KaTeX)
    setPreview(value);
  };

  const insertSymbol = (symbol: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = latex.substring(0, start) + symbol + latex.substring(end);
      
      handleLatexChange(newValue);
      
      // Set cursor position after the inserted symbol
      setTimeout(() => {
        const cursorPos = symbol.includes('{}') ? start + symbol.indexOf('{}') : start + symbol.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const loadTemplate = (templateLatex: string) => {
    handleLatexChange(templateLatex);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const clearEquation = () => {
    handleLatexChange('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(latex);
      alert('LaTeX code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="equation-builder-panel">
      <div className="equation-toolbar">
        <div className="symbol-grid">
          {symbols.map((item, index) => (
            <button
              key={index}
              className="symbol-btn"
              onClick={() => insertSymbol(item.symbol)}
              title={item.name}
            >
              {item.display}
            </button>
          ))}
        </div>
      </div>

      <div className="equation-templates">
        <label>Templates:</label>
        <div className="template-buttons">
          {templates.map((template, index) => (
            <button
              key={index}
              className="template-btn"
              onClick={() => loadTemplate(template.latex)}
              title={template.latex}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="equation-editor">
        <label>LaTeX Code:</label>
        <textarea
          ref={textareaRef}
          value={latex}
          onChange={(e) => handleLatexChange(e.target.value)}
          placeholder="Enter LaTeX equation here... e.g., E = mc^2"
          rows={4}
        />
      </div>

      <div className="equation-preview">
        <label>Preview:</label>
        <div className="preview-container">
          {latex ? (
            <div className="latex-preview">
              <code>{latex}</code>
              <p className="preview-note">
                💡 In a real implementation, this would render as mathematical notation using MathJax or KaTeX
              </p>
            </div>
          ) : (
            <div className="preview-placeholder">
              Enter LaTeX code to see preview
            </div>
          )}
        </div>
      </div>

      <div className="equation-actions">
        <button onClick={clearEquation} className="clear-btn">
          🗑️ Clear
        </button>
        <button onClick={copyToClipboard} className="copy-btn">
          📋 Copy LaTeX
        </button>
      </div>
    </div>
  );
}; 