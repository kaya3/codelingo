import React, { PureComponent, ReactNode } from "react";
import { Button, Progress } from "reactstrap";
import CodeBlockWithBlank from "../CodeBlockWithBlank";
import { FaTimes } from "react-icons/fa";

import { skillClient } from "../../network/skillClient";

interface Props {}
interface State {}

class QuestionView extends PureComponent<Props, State> {
  state: State = {};

  componentDidMount() {
    skillClient.getNextLesson("1").then(response => {
      console.log(response);
    });
  }

  render(): ReactNode {
    const question = {
      text: "Fill in the blanks",
      code: `
class HelloMessage extends React.Component {
  handlePress = () => {
    alert('Hello')
  }
  render() {
    return (
      <div>
        <p>Hello {this.props.name}</p>
        <button onClick={this.handlePress}>Say Hello</button>
      </div>
    );
  }
}`,
      language: "jsx",
      blank: "test"
    };

    return (
      <div className="question-view d-flex flex-column align-items-center p-2">
        <div className="d-flex w-100 m-2 align-items-center">
          <FaTimes className="close" />
          <Progress color="info" className="ml-2 w-100" value={50}>
            1/2
          </Progress>
        </div>

        <h4>{question.text}</h4>
        <CodeBlockWithBlank
          code={question.code}
          language={question.language}
          blank={question.blank}
        />
        {this.renderAnswers()}
        {this.renderButton()}
      </div>
    );
  }

  private renderAnswers() {
    return (
      <div className="answer-container">
        <div className="answer-group">
          <div className="answer">
            <span>Answer 1</span>
          </div>
          <div className="answer">
            <span>Answer 1</span>
          </div>
        </div>
        <div className="answer-group">
          <div className="answer">
            <span>Answer 4</span>
          </div>
          <div className="answer">
            <span>Answer 1</span>
          </div>
        </div>
      </div>
    );
  }

  private renderButton() {
    return <Button className="action-button">NEXT</Button>;
  }
}

export default QuestionView;
