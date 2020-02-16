import React, { PureComponent, ReactNode } from "react";
import { Button, Progress } from "reactstrap";
import { FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { RouteProps } from "react-router";

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

class QuestionView extends PureComponent<Props & RouteProps, State> {
  state: State = {
    currentQuestionIndex: 0,
    userAnswer: [],
    buttonColor: "info"
  };

  componentDidMount() {
    toast.configure();
    // this.setState({
    //   lesson: data as any
    // });

    //@ts-ignore
    const id = this.props.match.params.id;

    if (!id) {
      return;
    }

    skillClient.getNextLesson(id).then(response => {
      this.setState({
        lesson: response
      });
    });
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
      code = question.template.join("###BLANK###");
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
      <div className="d-flex w-100 m-2 mb-5 align-items-center">
        <Link to="/skills">
          <FaTimes className="close" />
        </Link>
        <Progress
          color="info"
          className="ml-2 w-100"
          value={(currentQuestionIndex / lesson!.questions.length) * 100}
        >
          {currentQuestionIndex} / {lesson!.questions.length}
        </Progress>
      </div>
    );
  }

  // Next/Finish Lesson Button
  private renderButton() {
    const { lesson, currentQuestionIndex, buttonColor } = this.state;

    const questions = lesson!.questions;
    const question = questions[currentQuestionIndex];

    return (
      <Button
        className={`continue-button button button-${buttonColor}`}
        color={buttonColor}
        onClick={() => {
          if (buttonColor === "info") {
            if (this.isCorrect()) {
              toast.success("✔️ Correct", {
                className: "toast-success",
                autoClose: 1500,
                hideProgressBar: true
              });
              this.setState({ buttonColor: "success" });
              if (questions.length === this.state.currentQuestionIndex + 1) {
                skillClient.completeLesson(lesson!.lesson_id);
              }
            } else {
              toast.error(
                `✖️ Correct Solution: ${question.correct.join(" ")}`,
                {
                  className: "toast-error",
                  autoClose: 3000,
                  hideProgressBar: true
                }
              );
              this.setState({
                buttonColor: "danger"
              });
            }
          } else {
            const newQuestions = Array.from(questions);

            newQuestions.splice(currentQuestionIndex, 1);
            if (buttonColor === "danger") {
              this.setState({
                lesson: {
                  ...this.state.lesson!,
                  questions: [...newQuestions, question]
                }
              });
            } else {
              this.incrementQuestion();
            }

            this.setState({ buttonColor: "info" });
          }
        }}
      >
        {buttonColor === "info"
          ? "CHECK"
          : buttonColor === "success" || buttonColor === "danger"
          ? "CONTINUE"
          : ""}
      </Button>
    );
  }

  // Results screen the user lands on after finishing or failing the lesson
  private renderFinishScreen() {
    const { lesson } = this.state;

    return (
      <div className="complete-screen d-flex justify-content-center align-items-center">
        <div className="d-flex flex-column justify-content-center">
          <span className="text-muted m-2 text-center">
            Congratz! Skill finished
          </span>
          <Link to="/skills">
            <Button className="button button-info">COMPLETE MORE SKILLS</Button>
          </Link>
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
