import { useMemo, useState } from 'react';
import { Modal, Typography }  from '@mui/material';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { PartialArticle } from '../custom_objects/models';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react'
import { renderLeaf, renderElement } from './slate components/Renderers';

interface Props {
    handleClose: () => void;
    open: boolean;
    article: PartialArticle | null;
}

function ArticleModal({ handleClose, open, article }: Props) {

    const articleURL: string = "URL_" + article?.Title;

    const editor = useMemo(() => withReact(createEditor()), []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(articleURL).then(() => {
            alert('Article URL copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };
    
    const handleFeedback = (feedback: 'up' | 'down') => {
        
        if (!article) return;
        
            const payload = {
                Positive: feedback === 'up',
                ArticleID: article.ID
            };
    
            fetch('http://localhost:5000/api/v1/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            })
                .then(response => {
                    if(!response.ok) {
                        throw new Error('Feedback submission failed')
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Feedback submitted successfully: ", data)
                    // could display confirmation message here
                })
                .catch(error => {
                     console.error("Error submitting feedback: ", error)
            })
        
    };
    
    return(
        <Modal 
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: "100%", width: "100%"}}
        >
            <div
                style={{height: '70%', width: '80%', backgroundColor: 'white', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: "auto"}}
            >
                {article ?(
                    <>
                        <div style={{ flex: '0 0 auto', marginBottom: '10px'}}>
                            <Typography sx={{textAlign: "center", fontSize: "20px", fontWeight: "600"}}>{article.Title}</Typography>
                        </div>
                        <div style={{ flex: '1 1 auto', overflowY: 'auto'}}>
                            {/* <Typography sx={{textAlign: "left", fontSize: "16px", fontWeight: "400"}}>{article.Content}</Typography> */}
                            <Slate editor={editor} initialValue={JSON.parse(article.Content)}>
                                <Editable readOnly
                                    renderElement = {renderElement}
                                    renderLeaf = {renderLeaf}
                                />
                            </Slate>
                        
                        <div style = {{marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <div></div>
                            <Typography sx={{ width: "100%", fontSize: "16px", fontWeight: "400", textAlign: 'center', alignItems: 'çenter', justifyContent: 'center', gap: "10px"}}>Was this article helpful?</Typography>
                            <div style= {{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: "20px"}}>
                                <ThumbUpAltOutlinedIcon sx={{cursor: 'pointer',
                                                             width: "64px",
                                                             height: "64px",
                                                             color: 'black'}}
                                                        onClick={() => handleFeedback('up')}/>
                                <ThumbDownAltOutlinedIcon sx={{cursor: 'pointer',
                                                               width: "64px",
                                                               height: "64px",
                                                               color: 'black'}}
                                                        onClick={() => handleFeedback('down')}/>
                            </div>
                        </div>
                        {/*help<div onClick={copyToClipboard} style={{cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <Typography sx={{textDecoration: "underline", fontSize: "16px", fontWeight: "400"}}>{articleURL}</Typography>
                            <ContentCopyOutlinedIcon sx={{fontSize: "25px", fontWeight: "400"}}/>
                        </div>*/}
                        </div>
                    </>
                ) : (
                    <h1>No Article Available</h1>
                )}
            </div>
        </Modal>
    );
}

export default ArticleModal;