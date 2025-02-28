import React, { useEffect, useMemo, useState, useRef } from 'react'
import { createEditor, Editor, Transforms, Element, Descendant, Node } from 'slate'
import { Slate, Editable, withReact, useSlate } from 'slate-react'
import { withHistory } from 'slate-history'
import {Button, CircularProgress, IconButton, Toolbar as MuiToolbar, Paper, Snackbar, SnackbarCloseReason, TextField} from '@mui/material'
import { FormatBold, FormatItalic, FormatUnderlined, FormatQuote,
       FormatListBulleted, FormatListNumbered,
        Code, Title, InsertPhotoOutlined } from '@mui/icons-material'
import { PartialArticle } from '../custom_objects/models'
import TagDropdown from './TagDropdown'
import { renderLeaf, renderElement } from './slate components/Renderers'



interface TextEditorProps {
  articleID: number
}

export const TextEditor = ({articleID}: TextEditorProps) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  const [value, setValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{text: 'A line of text in a paragraph.'}]
    },
  ])

  const [title, setTitle] = useState("Untitled Article")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState<boolean>(!!articleID)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  
  // If we were given an articleID then we load that article from the DB
  useEffect(() => {
    if (articleID) {
      console.log("Text editor received articleID: ", articleID)
      const url = `http://localhost:5000/api/v1/article?articleID=${articleID}`
      console.log("Fetching article from URL: ", url)
      fetch(url, {
        method: 'GET',
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch article')
        }
        console.log("returning json")
        return response.json()
      })
      .then(data => {
        console.log("about to parse")
        console.log("Fetched data: ", data)
        console.log("Fetched content: ", data.article.Content)
        if (data.article) {
          console.log("beginning parse")
          try {
            // const parsedContent = data.article.Content
            // setValue(parsedContent)
            setValue(JSON.parse(data.article.Content))
            console.log("json parsed")
          } catch (e) {
            throw new Error('Error parsing article content')
          }
          setTitle(data.article.Title || "Untitled Article")
          setDescription(data.article.Article_Description || "")
        }
      })
      .catch(error => {
        console.error("Error fetching article: ", error)
      })
      .finally(() => {
        setLoading(false)
      })
    }
  }, [articleID])

  // Save an article
  const handleSave = () => {
    const content = value
    const articlePayload: any = {
      Title: title,
      Content: content,
      Article_Description: description
    }

    let url = 'http://localhost:5000/api/v1/article'
    // default to POST for creating a new article
    let method = 'POST'

    // If the article already exists we use PUT
    if (articleID >= 0) {
      method = 'PUT'
      articlePayload.ID = articleID
      url = `http://localhost:5000/api/v1/article?articleID=${articleID}`
    }

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(articlePayload)
      //body: articlePayload
    })
    .then(response => {
      if(!response.ok) {
        throw new Error ('Failed to save article')
      }
      return response.json()
    })
    .then(data => {
      console.log("Article saved successfully ", data)
      setSaveSuccess(true)
    })
    .catch(error => {
      console.error("Error saving article: ", error)
    })
  }

  const handleCloseSnackbar = (event: Event | React.SyntheticEvent<any, Event>, reason: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return
    }
    setSaveSuccess(false)
  }

  const initialValue = value

  if (loading) {
    return (
      <Paper 
        elevation={3}
        style={{ padding: '16px',
                 maxWidth: '800px',
                 margin: 'auto',
                 textAlign: 'center'
        }}
      >
        <CircularProgress />
      </Paper>
    )
  }
  console.log(articleID)
  return (
    <Paper elevation={3} style={{ padding: '16px', maxWidth: '800px', margin: 'auto' }}>
    <TextField
      fullWidth
      label="Title"
      variant="outlined"
      margin="normal"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
    <TextField
      fullWidth
      label="Description"
      variant="outlined"
      margin="normal"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
    />
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={newValue => {
        const isAstChange = editor.operations.some(
          op => 'set_selection' !== op.type
        )
        if (isAstChange) {
          //setValue(serialize(newValue))
          setValue(newValue)
        }
      }}
    
    >
      <Toolbar editor={editor}
                articleID={articleID}/>
      <Editable
        label="Content"
        style={{
          padding: '24px',
          minHeight: '200px',
          border: '2px solid #ddd',
          borderRadius: '8px'
        }}
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
    <Button variant="contained" color = "primary" onClick={handleSave} style={{ marginTop: "8px"}}>
      Save Article
    </Button>
    <Snackbar
      open={saveSuccess}
      autoHideDuration={3000}
      onClose={handleCloseSnackbar}
      message="Article saved!"
      />
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

interface ToolbarProps {
  editor: Editor
  articleID: number
}
const Toolbar = ({editor, articleID}: ToolbarProps) => {
//const Toolbar = ({ editor }: {editor: Editor}) => {
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
          aria-label="Bold"
        >
          <FormatBold/>
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleItalicMark(editor)
          }}
        aria-label="Italic"
        >
          <FormatItalic/>
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleUnderlineMark(editor)
          }}
        aria-label="Underline"
        >
          <FormatUnderlined/>
        </IconButton>
        {/* <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBlock(editor, 'heading-one')
          }}
        aria-label="Heading"
        >
          <Title />
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBlock(editor, 'block-quote')
          }}
        aria-label="Block Quote"
        >
          <FormatQuote/>
        </IconButton>
        <IconButton
          size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBlock(editor, 'code')
          }}
          aria-label="Code"
        >
          <Code />
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBlock(editor, 'bulleted-list')
          }}
        aria-label="Bulleted List"
        >
          <FormatListBulleted/>
        </IconButton>
        <IconButton
        size="small"
          onMouseDown={(event) => {
            event.preventDefault()
            CustomEditor.toggleBlock(editor, 'numbered-list')
          }}
        aria-label="Numbered List"
        >
          <FormatListNumbered/>
        </IconButton> */}
        <InsertImageButton articleID={articleID}/>
        <div style={{flexGrow: 1}} />
        <TagDropdown articleID={articleID}/>
      </MuiToolbar>
  )
}

interface InsertImageButtonProps {
  articleID: number
}

const InsertImageButton = ( {articleID}: InsertImageButtonProps) => {
  const editor = useSlate()
  const ref: any = null
  const fileInputRef = useRef(ref)
  console.log(articleID)

  const handleChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)
    formData.append('articleID', articleID.toString())
    console.log(articleID.toString())
    try {
      fetch(`http://localhost:5000/api/v1/image?articleID=${articleID}`, {
        method: "POST",
        body: formData,
        credentials: "include"
      })
      .then(response => {
        if(!response.ok) {
          throw new Error('Failed to save image')
        }
        return response.json()
      })
      .then(data => {
        if (data.url) {
          const text = {text: ""}
          const nodes = [{type: "image", url: data.url, children: [text]}, {type: "paragraph", children: [text]}]
          nodes.forEach((node) => 
            Transforms.insertNodes(editor, node)
          )
        } else {
          throw new Error('Upload error')
        }
      })
    } catch (error) {
      console.error("Upload error: ", error)
    }
  }

  return (
    <>
      <IconButton
        size='small'
        onMouseDown={(event) => {
          event.preventDefault()
          if (fileInputRef.current) {
            fileInputRef.current.click()
          }
        }}
        aria-label='Insert Image'
      >
        <InsertPhotoOutlined />
      </IconButton>
      <input
        type='file'
        ref={fileInputRef}
        style={{display: 'none'}}
        accept="image/*"
        onChange={handleChange}
      />
    </>
  )
}