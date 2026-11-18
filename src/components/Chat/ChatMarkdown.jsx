import React from 'react';

/**
 * Lightweight, robust Markdown and Math renderer for AI Chat responses
 * Supports:
 * - LaTeX inline math ($...$) and block math ($$...$$)
 * - Headers (###, ####)
 * - Bold (**text**), Italic (*text*)
 * - Inline code (`code`) and code blocks (```...```)
 * - Unordered lists (- item) and Ordered lists (1. item)
 * - Tables (| a | b |)
 * - Blockquotes / Callouts (> quote)
 */
export default function ChatMarkdown({ content }) {
  if (!content) return null;

  // Split into lines/blocks
  const lines = content.split('\n');
  const elements = [];
  let currentTable = null;
  let inCodeBlock = false;
  let codeBlockLines = [];

  const parseInline = (text) => {
    if (!text) return '';

    // Handle block math if any escaped
    const parts = [];
    let remaining = text;

    // Regex to split by math $...$, code `...`, bold **...**, italic *...*
    // Simple sequential replacement
    const inlineRegex = /(\$\$.*?\$\$|\$.*?\$|`.*?`|\*\*.*?\*\*|\*.*?\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = inlineRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const token = match[0];
      if (token.startsWith('$$') && token.endsWith('$$')) {
        const math = token.slice(2, -2);
        parts.push(
          <div
            key={match.index}
            className="formula-block"
            style={{
              padding: '0.5rem 0.75rem',
              margin: '0.4rem 0',
              fontSize: '0.9rem',
              color: '#0c4a6e',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono, monospace)',
              overflowX: 'auto'
            }}
          >
            {math}
          </div>
        );
      } else if (token.startsWith('$') && token.endsWith('$')) {
        const math = token.slice(1, -1);
        parts.push(
          <span
            key={match.index}
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              color: '#0284c7',
              background: '#f0f9ff',
              padding: '1px 5px',
              borderRadius: '4px',
              fontWeight: '600',
              fontSize: '0.88em'
            }}
          >
            {math}
          </span>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            style={{
              background: '#f1f5f9',
              color: '#0f172a',
              padding: '2px 5px',
              borderRadius: '4px',
              fontSize: '0.85em',
              fontFamily: 'var(--font-mono, monospace)'
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
      }

      lastIndex = inlineRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const flushTable = () => {
    if (currentTable && currentTable.rows.length > 0) {
      const { headers, rows } = currentTable;
      elements.push(
        <div key={`table-${elements.length}`} style={{ overflowX: 'auto', margin: '0.6rem 0' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.82rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              overflow: 'hidden'
            }}
          >
            {headers && (
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} style={{ padding: '6px 10px', textAlign: 'left', color: '#334155', fontWeight: '700' }}>
                      {parseInline(h.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', background: ri % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                  {r.map((cell, ci) => (
                    <td key={ci} style={{ padding: '6px 10px', color: '#475569' }}>
                      {parseInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code block
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            style={{
              background: '#0f172a',
              color: '#38bdf8',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              overflowX: 'auto',
              margin: '0.5rem 0',
              fontFamily: 'var(--font-mono, monospace)'
            }}
          >
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Table parsing
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').slice(1, -1);
      // check if delimiter row
      if (cells.every(c => /^[\s\-:]+$/.test(c))) {
        continue;
      }
      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} style={{ color: '#0369a1', margin: '0.75rem 0 0.35rem 0', fontSize: '1rem', fontWeight: '700' }}>
          {parseInline(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('#### ')) {
      elements.push(
        <h5 key={i} style={{ color: '#0c4a6e', margin: '0.5rem 0 0.25rem 0', fontSize: '0.9rem', fontWeight: '700' }}>
          {parseInline(line.slice(5))}
        </h5>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={i}
          style={{
            borderLeft: '3px solid #0284c7',
            paddingLeft: '0.75rem',
            margin: '0.5rem 0',
            color: '#334155',
            background: '#f0f9ff',
            padding: '0.4rem 0.75rem',
            borderRadius: '0 6px 6px 0',
            fontSize: '0.85rem'
          }}
        >
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: '0.4rem', margin: '0.2rem 0', paddingLeft: '0.5rem', fontSize: '0.88rem' }}>
          <span style={{ color: '#0284c7', fontWeight: 'bold' }}>•</span>
          <span style={{ flex: 1, color: '#334155' }}>{parseInline(line.trim().slice(2))}</span>
        </div>
      );
      continue;
    }

    // Ordered List
    const orderedMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: '0.4rem', margin: '0.25rem 0', paddingLeft: '0.5rem', fontSize: '0.88rem' }}>
          <span style={{ color: '#0369a1', fontWeight: '700', minWidth: '18px' }}>{orderedMatch[1]}.</span>
          <span style={{ flex: 1, color: '#334155' }}>{parseInline(orderedMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={i} style={{ height: '0.4rem' }} />);
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} style={{ margin: '0.35rem 0', lineHeight: '1.5', fontSize: '0.88rem', color: '#334155' }}>
        {parseInline(line)}
      </p>
    );
  }

  flushTable();

  return <div style={{ lineHeight: '1.5' }}>{elements}</div>;
}
