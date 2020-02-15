import React, { PureComponent, ReactNode } from "react";
import { Button, Progress } from "reactstrap";
import CodeBlockWithBlank from "../CodeBlockWithBlank";
import { FaTimes } from "react-icons/fa";

import { skillClient } from "../../network/skillClient";
import { Lesson } from "../../model/Lesson";
import { Question } from "../../model/Question";
import ReactHtmlParser from "react-html-parser";
import { QuestionHandler } from "../../util/QuestionHandler";
import { data } from "../../test/test_data.js";

interface Props {}
interface State {
  lesson?: Lesson;
  question?: Question;
  currentQuestionIndex: number;
  userAnswer: string[];
}

class QuestionView extends PureComponent<Props, State> {
  state: State = {
    currentQuestionIndex: 0,
    userAnswer: []
  };

  componentDidMount() {
    this.setState({
      lesson: data as any
    });

    // skillClient.getNextLesson("1").then(response => {
    //   this.setState({
    //     lesson: response
    //   });
    // });
  }

  render(): ReactNode {
    const { lesson, currentQuestionIndex } = this.state;

    if (!lesson) {
      {
        return this.renderLoadingScreen();
      }
    }

    const questions = lesson.questions;
    const question = questions[currentQuestionIndex];

    if (!question) {
      {
        return this.renderFinishScreen();
      }
    }
    let code = ["No code found"];

    if (question?.kind === "blanks") {
      code = question.template;
    }

    return (
      <div className="question-view d-flex flex-column align-items-center p-2">
        <div className="d-flex w-100 m-2 align-items-center">
          <FaTimes className="close" />
          <Progress
            color="info"
            className="ml-2 w-100"
            value={((currentQuestionIndex + 1) / questions.length) * 100}
          >
            {currentQuestionIndex + 1} / {questions.length}
          </Progress>
        </div>
        {ReactHtmlParser(question.text)}
        <CodeBlockWithBlank code={code} language={lesson.language} />
        {this.renderAnswers(question.correct, question.incorrect)}
        {this.renderButton()}
      </div>
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

  private renderButton() {
    const { lesson, currentQuestionIndex } = this.state;

    if (!lesson) {
      return;
    }

    return (
      <Button
        color="info"
        onClick={() =>
          this.setState({
            currentQuestionIndex: this.state.currentQuestionIndex + 1
          })
        }
      >
        {lesson.questions.length !== currentQuestionIndex + 1
          ? "NEXT"
          : "FINISH"}
      </Button>
    );
  }

  private renderFinishScreen() {
    return (
      <div className="complete-screen d-flex justify-content-center align-items-center">
        <div className="d-flex flex-column justify-content-center">
          <span className="text-muted m-2 text-center">
            Congratz! Skill finished
          </span>
          <Button
            onClick={() => this.setState({ currentQuestionIndex: 0 })}
            color="info"
          >
            COMPLETE MORE SKILLS
          </Button>
        </div>
      </div>
    );
  }

  private renderLoadingScreen() {
    return (
      <div className="loading-area d-flex justify-content-center align-items-center">
        <span className="text-muted">Loading</span>
      </div>
    );
  }
}

export default QuestionView;
