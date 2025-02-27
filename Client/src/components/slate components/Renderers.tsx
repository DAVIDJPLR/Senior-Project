

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
  
export const renderLeaf = props => {
  return <Leaf {...props} />
}
  
export const renderElement = props => {
    switch (props.element.type) {
      case 'image':
        return <ImageElement {...props} />
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

const ImageElement = ({attributes, children, element}) => {
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img src={element.url} alt="" style={{maxWidth: "100%", display: "block", margin: "0 auto"}}/>
      </div>
      {children}
    </div>
  )
}