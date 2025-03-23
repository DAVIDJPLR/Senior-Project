// several helper functions for the Slate.js text editor
// these are used anywhere a Slate editor shows up to properly
// render the content, including marks (bold/italics/underline) and images

import { RenderLeafProps, RenderElementProps } from 'slate-react';
import { BaseText, BaseElement } from 'slate';

interface CustomText extends BaseText {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface CustomLeafProps extends Omit<RenderLeafProps, 'leaf'> {
  leaf: CustomText;
}

const Leaf: React.FC<CustomLeafProps> = ({ attributes, children, leaf }) => {
  return (
    <span
      {...attributes}
      style={{
        fontWeight: leaf.bold ? 'bold' : 'normal',
        fontStyle: leaf.italic ? 'italic' : 'normal',
        textDecoration: leaf.underline ? 'underline' : 'none',  
      }}
    >
      {children}
    </span>
  )
}
  
export const renderLeaf = (props: RenderLeafProps) => {
  return <Leaf {...props} />
}

interface CustomElement extends BaseElement {
  type: 'image' | 'code' | 'block-quote' | 'heading-one' | 'bulleted-list' | 'numbered-list' | 'paragraph';
}
  
export const renderElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props as RenderElementProps & { element: CustomElement };

  switch (element.type) {
    case 'image':
      return <ImageElement {...props} />
    case 'code':
      return <CodeElement {...props} />
    case 'block-quote':
      return <BlockQuote {...props} />
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'bulleted-list':
      return (<ul {...attributes} style={{ paddingLeft: '24px', listStyleType: 'circle #ddd'}}>
        {children}
      </ul>)
    case 'numbered-list':
      return <ol {...attributes} style={{ paddingLeft: '24px', listStyleType: 'decimal #ddd'}}>
        {children}</ol>
    default:
      return <DefaultElement {...props} />
  }
}

const CodeElement: React.FC<RenderElementProps> = ({ attributes, children }) => {
  return (
    <pre {...attributes} style={{ background: '#f4f4f4', padding: '8px', borderRadius: '4px'}}>
      <code>{children}</code>
    </pre>
  )
}

const BlockQuote: React.FC<RenderElementProps> = ({ attributes, children }) => {
  return (
    <blockquote {...attributes} style={{ borderLeft: '4px solid #ddd', paddingLeft: '8px', color: '#666' }}>
          {children}
    </blockquote>
  )
}
  
const DefaultElement: React.FC<RenderElementProps> = ({ attributes, children }) => {
  return <p {...attributes}>{children}</p>
}

interface ImageElementType extends BaseElement {
  type: 'image';
  url: string;
}

const ImageElement: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
  if (!('url' in element)) {
    console.error('Invalid element passed to ImageElement:', element);
    return <div {...attributes}>{children}</div>;
  }

  const imageElement = element as ImageElementType;

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={imageElement.url}
          alt=""
          style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', margin: '0 auto' }}
        />
      </div>
      {children}
    </div>
  );
};