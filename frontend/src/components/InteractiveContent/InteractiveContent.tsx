import React, { PureComponent, ReactNode } from "react";

import { QuestionHandler } from "../../util/QuestionHandler";
import { Question, Kind } from "../../model/Question";

import CodeBlockWithBlank from "../CodeBlockWithBlank";

interface Props {
  kind: Kind;
  question: Question;
  code?: string[];
  language?: string;
}

interface State {}

class InteractiveContent extends PureComponent<Props, State> {
  render(): ReactNode {
    const { code, language, question } = this.props;
    return (
      <>
        {code && language && (
          <CodeBlockWithBlank code={code} language={language} />
        )}
        {this.renderAnswers(question.correct, question.incorrect)}
      </>
    );
  }

  private renderAnswers(correctAnswers: string[], incorrectAnswers: string[]) {
    const answers = correctAnswers.concat(incorrectAnswers);

    const shuffledAnswers = QuestionHandler.shuffleQuestions(answers);

    return (
      <div className="answer-container">
        {shuffledAnswers.map(answer => (
          <div key={answer} className="answer">
            <span>{answer}</span>
          </div>
        ))}
      </div>
    );
  }
}

export default InteractiveContent;
