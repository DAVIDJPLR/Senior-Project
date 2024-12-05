import { Container, Typography, Paper, Box }  from '@mui/material';

import './App.css'

interface Article{
  id: number,
  name: string
  description: string
}

const article1: Article = {
  id: 1,
  name: "How to Connect to the wifi", 
  description: "Learn more about how you can connect to the wifi by clicking on this article"
}
const article2: Article = {
  id: 2,
  name: "How to Log in to MyGCC", 
  description: "Learn more about how you to log in to the MyGCC by clicking on this article. Or avoid logging in at all costs"
}
const articleList = [article1, article2]

function App() {
  return (
    <Container sx={{height: '100vh', py: 0}}>
      <Typography variant='h1' sx={{ my: 4, textAlign: 'top'}}>Articles</Typography>
      <Box 
        sx={{ 
          display:'flex', 
          flexDirection: 'column',
          justifyContent: "space-between",
          gap: 2
        }}
      >
        {articleList.map((article) => (
          <Paper sx={{height: 125}} key={article.id} elevation={3}>
            <Typography variant="h3">{article.name}</Typography>
            <Typography sx={{textAlign: 'left', px: 2}}>{article.description}</Typography>
          </Paper>
        ))}
      </Box>
      <Box sx={{height: 20}}></Box>
    </Container>
  );
}

export default App
