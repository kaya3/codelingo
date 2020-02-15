import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import "./style/index.scss";
import QuestionView from "./components/QuestionView/QuestionView";

function App() {
  return (
    <BrowserRouter>
      <Route exact path="/" component={QuestionView} />
    </BrowserRouter>
  );
}

export default App;
