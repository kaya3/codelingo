import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import "./style/index.scss";
import ElderScrolls6 from "./components/QuestionView";

function App() {
  return (
    <BrowserRouter>
      <Route exact path="/" component={ElderScrolls6} />
    </BrowserRouter>
  );
}

export default App;
