import UserArticleSearch from "./components/UserArticleSearch"

import { useState } from "react";
import './App.css'

enum PageState {
  UserArticleSearch,
  PageNotFound
}

function App() {

  const [pageState, setPageState] = useState(PageState.UserArticleSearch);

  if (pageState == PageState.UserArticleSearch){
    return(
      <>
        <UserArticleSearch></UserArticleSearch>
      </>
    );
  } else if (pageState === PageState.PageNotFound){
    return(
      <>
        <h1>Page Not Found</h1>
      </>
    );
  } else {
    setPageState(PageState.PageNotFound);
  }
}

export default App
