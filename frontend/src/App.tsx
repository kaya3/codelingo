import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import "./style/index.scss";
import QuestionView from "./components/QuestionView/QuestionView";
import LoginView from "./components/LoginView/LoginView";
import SkillView from "./components/SkillView/SkillView";

function App() {
  return (
    <BrowserRouter>
      <Route exact path="/lesson" component={QuestionView} />
      <Route exact path="/skills" component={SkillView} />
      <Route exact path="/login" component={LoginView} />
    </BrowserRouter>
  );
}

export default App;
