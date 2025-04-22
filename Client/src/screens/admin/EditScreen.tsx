import React, {useState} from "react";
import {Dialog, AppBar, Toolbar, IconButton, Typography, Slide, Icon} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {TransitionProps} from "@mui/material/transitions";
// import AdminAppBar from "../../components/AdminAppBar";
import { TextEditor } from "../../components/TextEditor";
import { PartialArticle } from "../../custom_objects/models";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
})

interface Props{
    open: boolean;
    article: PartialArticle;
    onClose: () => void;
    setUpdateArticles?: (update: boolean) => void;
}

function EditArticleModal({ open, article, onClose, setUpdateArticles }: Props) {
    const articleID = article.ID
    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <AppBar sx={{position: "relative"}}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {article ? "Edit Article" : "New Article"}
                    </Typography>
                </Toolbar>
            </AppBar>
            <div style={{padding: "16px"}}>
                <TextEditor articleID={articleID} setUpdateArticles={setUpdateArticles}/>
            </div>
        </Dialog>
    )
}

export default EditArticleModal;