import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Editor, Transforms, Element } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import {IconButton, Toolbar as MuiToolbar, Paper} from '@mui/material'
import { FormatBold, FormatItalic, FormatUnderlined, FormatQuote,
       FormatListBulleted, FormatListNumbered,
        Code, Title } from '@mui/icons-material'

export const TextEditor = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  
  const initialValue = useMemo(
    () =>
      JSON.parse(localStorage.getItem('content')) || [
        {
          type: 'paragraph',
          children: [{text: 'A line of text in a paragraph.' }],
        },
      ],
    []
  )
  return (
    <Paper elevation={3} style={{ padding: '16px', maxWidth: '800px', margin: 'auto' }}>
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={value => {
        const isAstChange = editor.operations.some(
          op => 'set_selection' !== op.type
        )
        if (isAstChange) {
          const content = JSON.stringify(value)
          localStorage.setItem('content', content)
        }
      }}
    
    >
      <Toolbar editor={editor}/>
      <Editable
        style={{ padding: '24px', minHeight: '200px', border: '2px solid #ddd', borderRadius: '8px'}}
        renderElement = {renderElement}
        renderLeaf = {renderLeaf}
        onKeyDown={(event: KeyboardEvent) => {
          if (!event.ctrlKey) {
            return
          }

          switch (event.key) {
            case "`": {
              event.preventDefault()
              CustomEditor.toggleBlock(editor, 'code')
              break
            }

            case 'b': {
              event.preventDefault()
              CustomEditor.toggleBoldMark(editor)
              break
            }

            case 'i': {
              event.preventDefault()
              CustomEditor.toggleItalicMark(editor)
              break
            }

            case 'u': {
              event.preventDefault()
              CustomEditor.toggleUnderlineMark(editor)
              break
            }

            case 'z': {
              event.preventDefault()
              editor.undo()
              break
            }

            case 'y': {
              event.preventDefault()
              editor.redo()
              break
            }
          }
        }}
      />
    </Slate>
    </Paper>
  )
}

const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
      const marks = Editor.marks(editor)
      return marks ? marks.bold === true : false
  },

  isItalicMarkActive(editor: Editor) {
    const marks = Editor.marks(editor)
    return marks ? marks.italic === true : false
  },

  isUnderlineMarkActive(editor: Editor) {
    const marks = Editor.marks(editor)
    return marks ? marks.underline === true : false
  },

  isBlockActive(editor: Editor, block: string) {
      const [match] = Editor.nodes(editor, {
        match: n => Element.isElement(n) && n.type === block,
      })

      return !!match
  },

  toggleBoldMark(editor: Editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'bold')
    } else {
      Editor.addMark(editor, 'bold', true)
    }
  },

  toggleItalicMark(editor: Editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'italic')
    } else {
      Editor.addMark(editor, 'italic', true)
    }
  },

  toggleUnderlineMark(editor: Editor) {
    const isActive = CustomEditor.isUnderlineMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'underline')
    } else {
      Editor.addMark(editor, 'underline', true)
    }
  },

  toggleBlock(editor: Editor, format: string) {
    const isActive = CustomEditor.isBlockActive(editor, format)
    Transforms.setNodes(
      editor,
      { type: isActive ? null : format },
      { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
    )
  },
}



const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf.bold ? 'bold' : 'normal',
        fontStyle: props.leaf.italic ? 'italic' : 'normal',
        textDecoration: props.leaf.underline ? 'underline' : 'none',  
      }}
    >
      {props.children}
    </span>
  )
}

const renderLeaf = props => {
  return <Leaf {...props} />
}

const renderElement = props => {
  switch (props.element.type) {
    case 'code':
      return <CodeElement {...props} />
    case 'block-quote':
      return <BlockQuote {...props} />
    case 'heading-one':
      return <h1 {...props.attributes}>{props.children}</h1>
    case 'bulleted-list':
      return (<ul {...props.attributes} style={{ paddingLeft: '24px', listStyleType: 'circle #ddd'}}>
        {props.children}
      </ul>)
    case 'numbered-list':
      return <ol {...props.attributes} style={{ paddingLeft: '24px', listStyleType: 'decimal #ddd'}}>
        {props.children}</ol>
    default:
      return <DefaultElement {...props} />
  }
}

const CodeElement = props => {
  return (
    <pre {...props.attributes} style={{ background: '#f4f4f4', padding: '8px', borderRadius: '4px'}}>
      <code>{props.children}</code>
    </pre>
  )
}

const BlockQuote = props => {
  return (
    <blockquote {...props.attributes} style={{ borderLeft: '4px solid #ddd', paddingLeft: '8px', color: '#666' }}>
          {props.children}
    </blockquote>
  )
}

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}

const Toolbar = ({ editor }: {editor: Editor}) => {
  return (
    <MuiToolbar variant="dense" style={{ marginBottom: '8px', borderBottom: '1px solid #ddd'}}>
        <IconButton
          size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBoldMark(editor)
          }}
          style={{
            backgroundColor: CustomEditor.isBoldMarkActive(editor) ? '#ddd' : 'transparent',
          }}
        >
          <FormatBold/>
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleItalicMark(editor)
          }}
        >
          <FormatItalic/>
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleUnderlineMark(editor)
          }}
        >
          <FormatUnderlined/>
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBlock(editor, 'heading-one')
          }}
        >
          <Title />
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBlock(editor, 'block-quote')
          }}
        >
          <FormatQuote/>
        </IconButton>
        <IconButton
          size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBlock(editor, 'code')
          }}
        >
          <Code />
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBlock(editor, 'bulleted-list')
          }}
        >
          <FormatListBulleted/>
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBlock(editor, 'numbered-list')
          }}
        >
          <FormatListNumbered/>
        </IconButton>
      </MuiToolbar>
  )
}