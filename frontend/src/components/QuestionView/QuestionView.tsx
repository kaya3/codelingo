import React, { PureComponent, ReactNode } from "react";
import { Button, Progress } from "reactstrap";
import { FaTimes } from "react-icons/fa";

import { skillClient } from "../../network/skillClient";
import { Lesson } from "../../model/Lesson";
import { Question } from "../../model/Question";
import ReactHtmlParser from "react-html-parser";
import { data } from "../../test/test_data.js";
import InteractiveContent from "../InteractiveContent/InteractiveContent";
import { arraysEqual } from "../../util/arraysEqual";
import { ToastContainer, toast } from "react-toastify";

interface Props {}
interface State {
  lesson?: Lesson;
  question?: Question;
  currentQuestionIndex: number;
  userAnswer: string[];
  buttonColor: string;
}

class QuestionView extends PureComponent<Props, State> {
  state: State = {
    currentQuestionIndex: 0,
    userAnswer: [],
    buttonColor: "info"
  };

  componentDidMount() {
    toast.configure();
    this.setState({
      lesson: data as any
    });

    // skillClient.getNextLesson("1").then(response => {
    //   this.setState({
    //     lesson: response
    //   });
    // });
  }

  incrementQuestion() {
    this.setState({
      currentQuestionIndex: this.state.currentQuestionIndex + 1
    });
  }

  updateAnswer(userAnswer: string[]) {
    this.setState({ userAnswer });
  }

  isCorrect() {
    const { userAnswer, lesson, currentQuestionIndex } = this.state;

    const questions = lesson!.questions;
    const question = questions[currentQuestionIndex];

    console.log(userAnswer, question.correct);

    return arraysEqual(userAnswer, question.correct);
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
    let code;

    if (question?.kind === "blanks") {
      code = question.template;
    }

    return (
      <div className="question-view d-flex flex-column align-items-center p-2">
        {this.renderHeader()}
        {ReactHtmlParser(question.text)}
        <InteractiveContent
          kind={question.kind}
          code={code}
          language={lesson.language}
          question={question}
          updateAnswer={this.updateAnswer.bind(this)}
        />
        {this.renderButton()}
      </div>
    );
  }

  // Progress Bar and Back Button
  private renderHeader() {
    const { currentQuestionIndex, lesson } = this.state;
    return (
      <div className="d-flex w-100 m-2 align-items-center">
        <FaTimes className="close" />
        <Progress
          color="info"
          className="ml-2 w-100"
          value={((currentQuestionIndex + 1) / lesson!.questions.length) * 100}
        >
          {currentQuestionIndex + 1} / {lesson!.questions.length}
        </Progress>
      </div>
    );
  }

  // Next/Finish Lesson Button
  private renderButton() {
    const { lesson, currentQuestionIndex, buttonColor } = this.state;

    return (
      <Button
        className={`button button-${buttonColor}`}
        color={buttonColor}
        onClick={() => {
          if (buttonColor === "info") {
            if (this.isCorrect()) {
              toast.success("✔️ Correct", { className: "toast-success" });
              this.setState({ buttonColor: "success" });
            } else {
              toast.error(`✖️ Correct Solution: this`, {
                className: "toast-error"
              });
              this.setState({ buttonColor: "danger" });
              // Put question to back of queue
            }
          } else {
            this.setState({ buttonColor: "info" });
            this.incrementQuestion();
          }
        }}
      >
        {buttonColor === "info"
          ? "CHECK"
          : buttonColor === "success" || buttonColor === "danger"
          ? "CONTINUE"
          : lesson!.questions.length !== currentQuestionIndex + 1
          ? "FINISH"
          : ""}
      </Button>
    );
  }

  private onNextClick() {

    this.setState({
      currentQuestionIndex: this.state.currentQuestionIndex + 1
    })

    skillClient.completeLesson('1').then(response => {
      console.log(response)
    })
  }

  // Results screen the user lands on after finishing or failing the lesson
  private renderFinishScreen() {
    return (
      <div className="complete-screen d-flex justify-content-center align-items-center">
        <div className="d-flex flex-column justify-content-center">
          <span className="text-muted m-2 text-center">
            Congratz! Skill finished
          </span>
          <Button
            className="button"
            onClick={() => this.setState({ currentQuestionIndex: 0 })}
            color="info"
          >
            COMPLETE MORE SKILLS
          </Button>
        </div>
      </div>
    );
  }

  // Loading screen when no lesson if found
  private renderLoadingScreen() {
    return (
      <div className="loading-area d-flex justify-content-center align-items-center">
        <span className="text-muted">Loading</span>
      </div>
    );
  }
}

export default QuestionView;
