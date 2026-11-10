// Kleine Helfer, um Lexical-Rich-Text für die Erstbefüllung zu erzeugen.

const text = (t: string, format = 0) => ({
  type: 'text',
  text: t,
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  version: 1,
})

const base = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }

export const p = (t: string) => ({ type: 'paragraph', children: [text(t)], textFormat: 0, ...base })

export const h2 = (t: string) => ({ type: 'heading', tag: 'h2', children: [text(t)], ...base })

export const h3 = (t: string) => ({ type: 'heading', tag: 'h3', children: [text(t)], ...base })

/** Liste; ein Eintrag "Titel: Text" bekommt einen fett gesetzten Titel. */
export const ul = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  children: items.map((item, i) => {
    const m = item.match(/^\*\*(.+?)\*\*\s*(.*)$/)
    return {
      type: 'listitem',
      value: i + 1,
      children: m ? [text(m[1], 1), text(' ' + m[2])] : [text(item)],
      ...base,
    }
  }),
  ...base,
})

export const rt = (...nodes: unknown[]) => ({ root: { type: 'root', children: nodes, ...base } }) as any
