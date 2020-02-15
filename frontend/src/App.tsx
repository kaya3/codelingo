import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import "./style/index.scss";
import QuestionView from "./components/QuestionView/QuestionView";
import LoginView from "./components/LoginView/LoginView";

function App() {
  return (
    <BrowserRouter>
      <Route exact path="/" component={QuestionView} />
      <Route exact path="/login" component={LoginView} />
    </BrowserRouter>
  );
}

export default App;
