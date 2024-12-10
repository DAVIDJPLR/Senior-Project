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
            <Modal sx={{height: '80%', width: '80%', py: '10%', px: '10%'}}
                open={open}
                onClose={handleClose}
                aria-labelledby='modal-modal-title'
                aria-describedby='modal-modal-description'
            >
                <Box
                    className='solidBackground'
                    sx={{height: '80%', width: '80%', py: '10%', px: '10%'}}
                >
                    {article ?(
                        <>
                            <Typography variant="h3">{article.name}</Typography>
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