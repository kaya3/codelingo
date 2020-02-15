import React, { PureComponent, ReactNode } from "react";
import { Button, Progress } from "reactstrap";
import CodeBlockWithBlank from "./CodeBlockWithBlank";

interface Props {}
interface State {}

class QuestionView extends PureComponent<Props, State> {
  state: State = {};

  render(): ReactNode {
    const question = {
      text: "Fill in the blanks",
      code: `class HelloMessage extends React.Component {
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
      <>
        <Progress />
        <h4 className="text-muted">{question.text}</h4>
        <CodeBlockWithBlank
          code={question.code}
          language={question.language}
          blank={question.blank}
        />
        {this.renderAnswers()}
        {this.renderButton()}
      </>
    );
  }

  private renderAnswers() {
    return (
      <>
        <div className="answer">
          <span>Answer 1</span>
        </div>
        <div className="answer">
          <span>Answer 2</span>
        </div>
        <div className="answer">
          <span>Answer 3</span>
        </div>
        <div className="answer">
          <span>Answer 4</span>
        </div>
      </>
    );
  }

  private renderButton() {
    return <Button>Next Question</Button>;
  }
}

export default QuestionView;
