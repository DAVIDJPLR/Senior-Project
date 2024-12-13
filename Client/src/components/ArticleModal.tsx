import { Modal, Typography, Box }  from '@mui/material';

interface Article{
    id: number,
    title: string,
    description: string,
    content: string
}

interface Props {
    handleClose: () => void;
    open: boolean;
    article: Article | null;
}

function ArticleModal({ handleClose, open, article}: Props) {
    return(
        <>
            <Modal sx={{height: '80%', width: '80%', py: '10%', px: '10%'}}
                open={open}
                onClose={handleClose}
                aria-labelledby='modal-modal-title'
                aria-describedby='modal-modal-description'
            >
                <Box
                    className='solidBackground'
                    sx={{height: '50%', width: '80%', py: '10%', px: '10%'}}
                >
                    {article ?(
                        <>
                            <Typography variant="h3">{article.title}</Typography>
                            <p>{article.content}</p>
                        </>
                    ) : (
                        <h1>No Article Available</h1>
                    )}
                </Box>
            </Modal>
        </>
    );
}

export default ArticleModal;