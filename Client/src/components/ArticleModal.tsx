import { Modal, Typography }  from '@mui/material';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { Article } from '../custom_objects/Article';

interface Props {
    handleClose: () => void;
    open: boolean;
    article: Article | null;
}

function ArticleModal({ handleClose, open, article}: Props) {

    const articleURL: string = "URL_" + article?.Title;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(articleURL).then(() => {
            alert('Article URL copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
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
                className='solidBackground'
                style={{height: '70%', width: '80%', backgroundColor: 'white', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}
            >
                {article ?(
                    <>
                        <div style={{width: "100%", height: "10%"}}>
                            <Typography sx={{textAlign: "center", fontSize: "20px", fontWeight: "600"}}>{article.Title}</Typography>
                        </div>
                        <div style={{width: "90%", minHeight: "65%"}}>
                            <Typography sx={{textAlign: "left", fontSize: "16px", fontWeight: "400"}}>{article.Content}</Typography>
                        </div>
                        <div style={{width: "90%", height: "20%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: "10px"}}>
                            <Typography sx={{ width: "100%", textAlign: "left", fontSize: "16px", fontWeight: "400"}}>Was this article helpful?</Typography>
                            <div style= {{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: "20px"}}>
                                <ThumbUpAltOutlinedIcon sx={{cursor: 'pointer', width: "64px", height: "64px"}}/>
                                <ThumbDownAltOutlinedIcon sx={{cursor: 'pointer', width: "64px", height: "64px"}}/>
                            </div>
                        </div>
                        <div onClick={copyToClipboard} style={{cursor: 'pointer', height: "5%", display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <Typography sx={{textDecoration: "underline", fontSize: "16px", fontWeight: "400"}}>{articleURL}</Typography>
                            <ContentCopyOutlinedIcon sx={{fontSize: "25px", fontWeight: "400"}}/>
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