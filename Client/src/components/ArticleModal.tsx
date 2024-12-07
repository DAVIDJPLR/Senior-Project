import { Modal, Typography, Box }  from '@mui/material';

interface Article{
    id: number,
    name: string
    description: string
}

interface Props {
    handleClose: () => void;
    open: boolean;
    article: Article | null;
}

function ArticleModal({ handleClose, open, article}: Props) {
    return(
        <>
            <Modal sx={{height: '80vh', width: '80vw', py: '10vw', px: '10vh'}}
                open={open}
                onClose={handleClose}
                aria-labelledby='modal-modal-title'
                aria-describedby='modal-modal-description'
            >
                <Box
                    className='solidBackground'
                >
                    {article ?(
                        <>
                            <Typography variant="h1">{article.name}</Typography>
                            <p>{article.description}</p>
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