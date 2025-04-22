import React, { useEffect, useMemo, useState, useRef } from 'react'
import { createEditor, Editor, Transforms, Element, Descendant, node } from 'slate'
import { Slate, Editable, withReact, useSlate } from 'slate-react'
import { withHistory } from 'slate-history'
import {Button, CircularProgress, IconButton, Toolbar as MuiToolbar, Paper, Snackbar, SnackbarCloseReason, TextField} from '@mui/material'
import { FormatBold, FormatItalic, FormatUnderlined, InsertPhotoOutlined } from '@mui/icons-material'
// import { PartialArticle } from '../custom_objects/models'
import { PartialAdminPrivilege } from "../custom_objects/models";
import TagDropdown from './TagDropdown'
import CategoryDropdown from './CategoryDropdown'
import { renderLeaf, renderElement } from './slate components/Renderers'
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'
import { APIBASE } from '../ApiBase'


type CustomText = { 
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

type CustomElement = {
  type: 'paragraph' | 'image' | 'code';
  url?: string;
  children: CustomText[];
}

type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

interface TextEditorProps {
  articleID: number;
  setUpdateArticles?: (x: boolean) => void;
}

export const TextEditor = ({articleID, setUpdateArticles}: TextEditorProps) => {
  const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), [])

  const [value, setValue] = useState<CustomElement[]>([
    {
      type: 'paragraph',
      children: [{text: 'A line of text in a paragraph.'}]
    },
  ])

  const [title, setTitle] = useState("Untitled Article")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState<boolean>(!!articleID)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  const [emptyField, setEmptyField] = useState<boolean>(false)
  const [notPrivileged, setNotPrivileged] = useState<boolean>(false)

  const [currentTag, setCurrentTag] = useState("")
  const [currentCategory, setCurrentCategory] = useState("")

  // If we were given an articleID then we load that article from the DB
  useEffect(() => {
    if (articleID >= 0) {
      const url = APIBASE + `/api/v1/article?articleID=${articleID}`
      console.log("Fetching article from URL: ", url)
      fetch(url, {
        method: 'GET',
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch article')
        }
        return response.json()
      })
      .then(data => {
        if (data.article) {
          try {
            setValue(JSON.parse(data.article.Content))
          } catch (e) {
            throw new Error('Error parsing article content')
          }
          setTitle(data.article.Title || "Untitled Article")
          setDescription(data.article.Article_Description || "")
          setCurrentTag(data.articleTagName || "")
          setCurrentCategory(data.articleCategoryName || "")
        }
      })
      .catch(error => {
        console.error("Error fetching article: ", error)
      })
      .finally(() => {
        setLoading(false)
      })
    } else if (articleID == -1){
      setLoading(false)
    }
  }, [articleID])

  // Save an article
  const handleSave = () => {
    const content = value
    const articlePayload: any = {
      Title: title,
      Content: content,
      Article_Description: description,
      Tag: currentTag,
      MetaTag: currentCategory
    }
    for (const field in articlePayload) {
      if (articlePayload[field].length == 0) {
        setEmptyField(true)
        return;
      }
    }

    let url = APIBASE + '/api/v1/article'
    // default to POST for creating a new article
    let method = 'POST'

    // If the article already exists we use PUT
    if (articleID >= 0) {
      method = 'PUT'
      articlePayload.ID = articleID
      url = APIBASE + `/api/v1/article?articleID=${articleID}`
    }

    if (articleID >= 0) {
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
          setNotPrivileged(true);
          throw new Error ('Failed to save article')
        }
        if (setUpdateArticles) {
          setUpdateArticles(true);
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
    } else {
      // need at minimum create article privilege to access the text editor, no need to check for it
      const payload: any = {
        title: title,
        content: content,
        desc: description,
        tag: currentTag,
        metatag: currentCategory
      }

      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
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
  } 

  const handleCloseSnackbar = (event: Event | React.SyntheticEvent<any, Event>, reason: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return
    }
    setSaveSuccess(false)
    setEmptyField(false)
    setNotPrivileged(false);
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
      onChange={(newValue: Descendant[]) => {
        const isAstChange = editor.operations.some(
          op => 'set_selection' !== op.type
        )
        if (isAstChange) {
          // Ensure we're setting the state with the correct type
          setValue(newValue as unknown as CustomElement[])
        }
      }}
    
    >
      <Toolbar editor={editor} articleID={articleID} setCurrentTag={setCurrentTag} setCurrentCategory={setCurrentCategory}/>
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
            if (event.key === 'Enter') {
              const { selection } = editor;
              if (selection) {
                const [nodeEntry] = Editor.nodes(editor, {
                  match: n => isCustomElement(n) && n.type === 'image',
                });
                if (nodeEntry) {
                  event.preventDefault()
                  const paragraphNode = {
                    type: 'paragraph',
                    children: [{text: ''}],
                  }
                  Transforms.insertNodes(editor, paragraphNode)
                  return
                }
              }
            }
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
    <Snackbar
      open={notPrivileged}
      autoHideDuration={3000}
      onClose={handleCloseSnackbar}
      message="You do not have permission to edit articles."
      />
    <Snackbar
      open={emptyField}
      autoHideDuration={3000}
      onClose={handleCloseSnackbar}
      message="One or more fields are empty!"
      />
    </Paper>
  )
}

function isCustomElement(element: any): element is CustomElement {
  return typeof element.type === 'string'
}

const withImages = (editor: CustomEditor) => {
  const { isVoid } = editor

  editor.isVoid = (element) => {
    if (isCustomElement(element) && element.type === 'image') {
      return true
    } else 
    return isVoid(element)
  }

  return editor
}

const CustomEditor = {
  isBoldMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor) as { bold?: boolean } | null
    return marks ? marks.bold === true : false
  },

  isItalicMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor) as { italic?: boolean } | null
    return marks ? marks.italic === true : false
  },

  isUnderlineMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor) as { underline?: boolean } | null
    return marks ? marks.underline === true : false
  },

  isBlockActive(editor: CustomEditor, block: 'paragraph' | 'image' | 'code') {
    const [match] = Editor.nodes(editor, {
      match: n => 
        !Editor.isEditor(n) && 
        Element.isElement(n) && 
        'type' in n && 
        typeof n.type === 'string' &&
        n.type === block,
      mode: 'highest'
    }) || [null]
    return !!match
  },

  toggleBoldMark(editor: CustomEditor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'bold')
    } else {
      Editor.addMark(editor, 'bold', true)
    }
  },

  toggleItalicMark(editor: CustomEditor) {
    const isActive = CustomEditor.isItalicMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'italic')
    } else {
      Editor.addMark(editor, 'italic', true)
    }
  },

  toggleUnderlineMark(editor: CustomEditor) {
    const isActive = CustomEditor.isUnderlineMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'underline')
    } else {
      Editor.addMark(editor, 'underline', true)
    }
  },

  toggleBlock(editor: CustomEditor, format: 'paragraph' | 'image' | 'code') {
    const isActive = CustomEditor.isBlockActive(editor, format)
    Transforms.setNodes<CustomElement>(
      editor,
      { 
        type: isActive ? 'paragraph' : format,
        children: [{ text: '' }]
      },
      { 
        match: n => !Editor.isEditor(n) && Element.isElement(n),
        mode: 'highest'
      }
    )
  },
}

interface ToolbarProps {
  editor: CustomEditor  // Changed from Editor to CustomEditor
  articleID: number
  setCurrentTag: (x: string) => void
  setCurrentCategory: (x: string) => void
}
const Toolbar = ({editor, articleID, setCurrentTag, setCurrentCategory}: ToolbarProps) => {
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
        <InsertImageButton articleID={articleID}/>
        <div style={{flexGrow: 1}} />
        <TagDropdown articleID={articleID} setCurrentTag={setCurrentTag}/>
        <CategoryDropdown articleID={articleID} setCurrentCategory={setCurrentCategory}/>
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

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
  if (!file || !file.type.startsWith('image/')) {
    console.error('Please select a valid image file')
    return
  }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('articleID', articleID.toString())
    try {
      fetch(APIBASE + `/api/v1/image?articleID=${articleID}`, {
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
          const imageNode = {
            type: 'image',
            url: data.url,
            children: [text]
          }
          const { selection } = editor
          if (selection) {
            Transforms.insertNodes(editor, imageNode)
            const point = Editor.end(editor, Editor.path(editor, selection))
            Transforms.select(editor, Editor.start(editor, point))
          }
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