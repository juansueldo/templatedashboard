/**
 * Markdown to HTML v1.0.0
 * Author: Juan Sueldo
 */

(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.markdownToHtml = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Inject styles
  function injectStyles() {
    if (document.getElementById('md-styles')) return;
    const style = document.createElement('style');
    style.id = 'md-styles';
    style.textContent = `
      .md-js-anchor {
        color: #7367f0;
        text-decoration: none;
      }
      .md-js-code {
        background: #eae8fd;
        color: #7367f0;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
        font-weight: 500;
      }
      pre.md-code {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 1rem;
        border-radius: 6px;
        overflow-x: auto;
        margin: 1em 0;
      }
      pre.md-code code {
        background: none;
        color: inherit;
        padding: 0;
        font-size: 0.9em;
      }
      .json-key { color: #9cdcfe; }
      .json-string { color: #ce9178; }
      .json-number { color: #b5cea8; }
      .json-literal { color: #569cd6; }
      .bash-cmd { color: #4ec9b0; font-weight: 600; }
      .bash-flag { color: #c586c0; }
      .bash-string { color: #ce9178; }
      .hl-string { color: #ce9178; }
      .hl-comment { color: #6a9955; font-style: italic; }
      .hl-keyword { color: #569cd6; font-weight: bold; }
      .hl-number { color: #b5cea8; }
      .hl-function { color: #dcdcaa; }
      .hl-property { color: #9cdcfe; }
      .md-js-blockquote {
        border-left: 4px solid #7367f0;
        margin: 1em 0;
        padding: .6em 1em;
        background: var(--bs-body-bg);
      }
      table.md-table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.2em 0;
        font-size: 0.95em;
        border: 1px solid;
        border-radius: 5px;
      }
      table.md-table th,
      table.md-table td {
        padding: .6em .8em;
        text-align: left;
      }
      table.md-table th {
        background: var(--bs-body-bg);
        font-weight: 600;
        text-transform: uppercase;
      }
      table.md-table tr:nth-child(even) {
        background: var(--bs-body-bg);
      }
    `;
    document.head.appendChild(style);
  }

  // Helpers
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/&#039;/g, "'");
  }

  function isTableLine(line) {
    return /\|/.test(line);
  }

  function parseTables(lines, i) {
    var header = lines[i];
    var sep = lines[i + 1];
    if (!sep || !/^\s*\|?\s*[:\-\s|]+$/i.test(sep)) return null;

    var j = i + 2;
    var rows = [];
    while (j < lines.length && isTableLine(lines[j])) {
      rows.push(lines[j]);
      j++;
    }

    function splitRow(r) {
      var parts = r.replace(/^\s*\|\s*|\s*\|\s*$/g, '').split(/\s*\|\s*/);
      return parts.map(function (p) { return p.trim(); });
    }

    var headers = splitRow(header);
    var body = rows.map(splitRow);

    var html = '<table class="md-table" :style="{ color: colors.text, backgroundColor: colors.background , borderColor: colors.border }"><thead :style="{ backgroundColor: colors.cardBg }"><tr>' + headers.map(function (h) { return '<th>' + inlineFormat(h) + '</th>'; }).join('') + '</tr></thead>';
    if (body.length) {
      html += '<tbody>' + body.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inlineFormat(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
    }
    html += '</table>';

    return { html: html, next: j };
  }

  function extractCodeBlocks(md) {
    var codeBlocks = [];
    var placeholderIndex = 0;
    var txt = md.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)\n```/g, function (m, lang, content) {
      var id = '[[CODE_BLOCK_' + (placeholderIndex++) + ']]';
      codeBlocks.push({ id: id, lang: lang || '', content: content });
      return '\n' + id + '\n';
    });
    return { text: txt, blocks: codeBlocks };
  }

  function prettyPrintJson(str) {
    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
    }

    function colorize(obj, indent = 0) {
      const spacing = '  '.repeat(indent);

      if (obj === null) return '<span class="json-literal">null</span>';
      if (typeof obj === 'boolean') return `<span class="json-literal">${obj}</span>`;
      if (typeof obj === 'number') return `<span class="json-number">${obj}</span>`;
      if (typeof obj === 'string') return `<span class="json-string">"${escapeHtml(obj)}"</span>`;
      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        return '[\n' + obj.map(v => spacing + '  ' + colorize(v, indent + 1)).join(',\n') + '\n' + spacing + ']';
      }
      if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';
        return '{\n' + keys.map(k => {
          const keyHtml = `<span class="json-key">"${k}"</span>`;
          return spacing + '  ' + keyHtml + ': ' + colorize(obj[k], indent + 1);
        }).join(',\n') + '\n' + spacing + '}';
      }
      return escapeHtml(String(obj));
    }

    try {
      // Arreglamos comillas simples y trailing commas
      let fixedStr = str.replace(/'/g, '"')
                        .replace(/,\s*}/g, '}')
                        .replace(/,\s*]/g, ']');

      const obj = JSON.parse(fixedStr);
      return `<pre class="md-code md-lang-json"><code class="md-js-code">${colorize(obj)}</code></pre>`;
    } catch (e) {
      return '<pre class="md-code"><code class="md-js-code">Invalid JSON</code></pre>';
    }
  }
  
  function highlightBash(code) {
    var escaped = escapeHtml(code);
    // Strings (primero para evitar conflictos)
    escaped = escaped.replace(/"([^"]*)"/g, function(m) {
      return '<span class="bash-string">' + m + '</span>';
    });
    escaped = escaped.replace(/'([^']*)'/g, function(m) {
      return '<span class="bash-string">' + m + '</span>';
    });
    // Flags (evitar dentro de strings)
    escaped = escaped.replace(/(\s)(-[a-zA-Z](?![^<]*<\/span>)|\-\-[a-zA-Z-]+(?![^<]*<\/span>))/g, function(m, space, flag) {
      if (m.indexOf('</span>') !== -1) return m;
      return space + '<span class="bash-flag">' + flag + '</span>';
    });
    // Comandos al inicio
    escaped = escaped.replace(/^(\s*)(curl|echo|cd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk|wget|git)\b/gm, function(m, space, cmd) {
      return space + '<span class="bash-cmd">' + cmd + '</span>';
    });
    return escaped;
  }

  function highlightJavaScript(code) {
    // Escapar HTML primero
    code = code.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
    
    // Array para almacenar tokens protegidos
    const tokens = [];
    let tokenIndex = 0;
    
    function createToken(content) {
      const placeholder = `###TOKEN${tokenIndex}###`;
      tokens[tokenIndex] = content;
      tokenIndex++;
      return placeholder;
    }
    
    // IMPORTANTE: Proteger strings ANTES que comentarios
    // porque las URLs dentro de strings contienen //
    
    // 1. Proteger template literals (backticks) primero
    code = code.replace(/`(?:[^`\\]|\\.)*`/g, (match) => {
      return createToken(`<span class="hl-string">${match}</span>`);
    });
    
    // 2. Proteger strings con comillas dobles
    code = code.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
      return createToken(`<span class="hl-string">${match}</span>`);
    });
    
    // 3. Proteger strings con comillas simples
    code = code.replace(/'(?:[^'\\]|\\.)*'/g, (match) => {
      return createToken(`<span class="hl-string">${match}</span>`);
    });
    
    // 4. AHORA SÍ proteger comentarios (después de strings)
    // Comentarios multi-línea
    code = code.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      return createToken(`<span class="hl-comment">${match}</span>`);
    });
    
    // Comentarios de línea
    code = code.replace(/\/\/.*$/gm, (match) => {
      return createToken(`<span class="hl-comment">${match}</span>`);
    });
    
    // 5. Palabras clave
    const keywords = /\b(const|let|var|function|return|if|else|for|while|class|new|this|switch|case|break|default|try|catch|throw|async|await|import|export|from|as|of|in)\b/g;
    code = code.replace(keywords, '<span class="hl-keyword">$1</span>');
    
    // 6. Números
    code = code.replace(/\b\d+\.?\d*\b/g, '<span class="hl-number">$&</span>');
    
    // 7. Nombres de funciones (antes de paréntesis)
    code = code.replace(/\b([a-zA-Z_$][\w$]*)(?=\s*\()/g, '<span class="hl-function">$1</span>');
    
    // 8. Propiedades de objetos (después de punto)
    code = code.replace(/\.([a-zA-Z_$][\w$]*)\b/g, '.<span class="hl-property">$1</span>');
    
    // Restaurar todos los tokens
    for (let i = 0; i < tokenIndex; i++) {
      code = code.replace(`###TOKEN${i}###`, tokens[i]);
    }
    
    return code;
  }


  function highlightHTTP(code) {
    var escaped = escapeHtml(code);
    // Headers
    escaped = escaped.replace(/^([A-Za-z-]+):/gm, '<span class="http-header">$1</span>:');
    return escaped;
  }

  function renderCodeBlock(block) {
    var lang = block.lang.toLowerCase();
    if (lang === 'json') return prettyPrintJson(block.content);
    
    var highlighted = block.content;
    if (lang === 'bash' || lang === 'sh' || lang === 'shell') {
      highlighted = highlightBash(block.content);
    } else if (lang === 'javascript' || lang === 'js') {
      highlighted = highlightJavaScript(block.content);
    } else if (lang === 'http') {
      highlighted = highlightHTTP(block.content);
    } else {
      highlighted = escapeHtml(block.content);
    }
    
    return '<pre class="md-code md-lang-' + escapeHtml(lang) + '"><code class="md-js-code">' + highlighted + '</code></pre>';
  }

  function inlineFormat(text) {
    if (!text) return '';
    var out = escapeHtml(text);

    // inline code sin backticks visibles
    out = out.replace(/`([^`]+)`/g, function (m, c) { 
      return '<code class="md-js-code">' + c + '</code>'; 
    });

    // images
    out = out.replace(/!\[([^\]]*)\]\(([^\s\)]+)(?:\s+"([^"]+)")?\)/g, function (m, alt, url, title) {
      alt = escapeHtml(alt);
      var t = title ? ' title="' + escapeHtml(title) + '"' : '';
      return '<img src="' + escapeHtml(url) + '" alt="' + alt + '"' + t + ' />';
    });

    // links
    out = out.replace(/\[([^\]]+)\]\(([^\s\)]+)(?:\s+"([^"]+)")?\)/g, function (m, txt, url, title) {
      var t = title ? ' title="' + escapeHtml(title) + '"' : '';
      return '<a class="md-js-anchor" href="' + escapeHtml(url) + '"' + t + '>' + txt + '</a>';
    });

    // bold
    out = out.replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '<strong>$2</strong>');
    // italic
    out = out.replace(/(\*|_)(?=\S)([\s\S]*?\S)\1/g, '<em>$2</em>');
    // strikethrough
    out = out.replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');

    return out;
  }

  function markdownToHtml(md, opts) {
    opts = opts || {};
    injectStyles();

    md = md.replace(/\r\n?/g, '\n');

    var extracted = extractCodeBlocks(md);
    md = extracted.text;
    var blocks = extracted.blocks;

    var lines = md.split('\n');
    var out = [];
    var i = 0;
    var listStack = [];

    function closeListTo(level) {
      while (listStack.length > level) {
        out.push('</' + listStack.pop() + '>');
      }
    }

    while (i < lines.length) {
      var line = lines[i];

      if (/^\s*$/.test(line)) {
        closeListTo(0);
        i++;
        continue;
      }

      var m = line.match(/^(#{1,6})\s+(.*)$/);
      if (m) {
        closeListTo(0);
        var level = m[1].length;
        out.push('<h' + level + ' style="font-weight: bolder">' + inlineFormat(m[2].trim()) + '</h' + level + '>');
        i++;
        continue;
      }

      if (/^\s*(?:\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
        closeListTo(0);
        out.push('<hr />');
        i++;
        continue;
      }

      if (/^>\s?/.test(line)) {
        closeListTo(0);
        var quoteLines = [];
        while (i < lines.length && /^>/.test(lines[i])) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        out.push('<blockquote class="md-js-blockquote">' + markdownToHtml(quoteLines.join('\n')) + '</blockquote>');
        continue;
      }

      if (isTableLine(line) && i + 1 < lines.length && /^\s*\|?\s*[:\-\s|]+$/.test(lines[i + 1])) {
        var parsed = parseTables(lines, i);
        if (parsed) {
          closeListTo(0);
          out.push(parsed.html);
          i = parsed.next;
          continue;
        }
      }

      var ulMatch = line.match(/^\s*([-+*])\s+(.*)$/);
      var olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
      if (ulMatch || olMatch) {
        var isOl = !!olMatch;
        var marker = isOl ? 'ol' : 'ul';
        var indent = line.match(/^\s*/)[0].length;
        var level = Math.floor(indent / 2) + 1;

        while (listStack.length < level) {
          listStack.push(marker);
          out.push('<' + marker + '>');
        }
        if (listStack[listStack.length - 1] !== marker) {
          out.push('</' + listStack.pop() + '>');
          listStack.push(marker);
          out.push('<' + marker + '>');
        }

        var text = (isOl ? olMatch[2] : ulMatch[2]);
        out.push('<li>' + inlineFormat(text) + '</li>');
        i++;
        while (i < lines.length) {
          var next = lines[i];
          var nextUl = next.match(/^\s*([-+*])\s+(.*)$/);
          var nextOl = next.match(/^\s*(\d+)\.\s+(.*)$/);
          if (!nextUl && !nextOl) break;
          var nIndent = next.match(/^\s*/)[0].length;
          var nLevel = Math.floor(nIndent / 2) + 1;
          if (nLevel > level) {
            break;
          }
          var nIsOl = !!nextOl;
          var nMarker = nIsOl ? 'ol' : 'ul';
          if (nMarker !== marker) {
            out.push('</' + listStack.pop() + '>');
            listStack.push(nMarker);
            out.push('<' + nMarker + '>');
            marker = nMarker;
          }
          var nText = nIsOl ? nextOl[2] : nextUl[2];
          out.push('<li>' + inlineFormat(nText) + '</li>');
          i++;
        }
        continue;
      }

      var codePlaceholderMatch = line.match(/^\s*\[\[CODE_BLOCK_(\d+)\]\]\s*$/);
      if (codePlaceholderMatch) {
        closeListTo(0);
        var idx = parseInt(codePlaceholderMatch[1], 10);
        var block = blocks[idx];
        if (block) out.push(renderCodeBlock(block));
        i++;
        continue;
      }

      var paraLines = [line];
      i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6})\s+/.test(lines[i]) && !/^\s*([-+*]|\d+\.)\s+/.test(lines[i]) && !/^>/.test(lines[i])) {
        if (/^\s*\[\[CODE_BLOCK_\d+\]\]\s*$/.test(lines[i])) break;
        paraLines.push(lines[i]);
        i++;
      }
      var para = paraLines.join(' ');
      out.push('<p>' + inlineFormat(para.trim()) + '</p>');
    }

    closeListTo(0);

    return out.join('\n');
  }

  return markdownToHtml;
});
