import React, { PureComponent, ReactNode } from "react";
import { Button, Progress } from "reactstrap";
import { FaTimes } from "react-icons/fa";

import { skillClient } from "../../network/skillClient";
import { Lesson } from "../../model/Lesson";
import { Question } from "../../model/Question";
import ReactHtmlParser from "react-html-parser";
import { data } from "../../test/test_data.js";
import InteractiveContent from "../InteractiveContent/InteractiveContent";

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
    const { lesson, currentQuestionIndex } = this.state;

    return (
      <Button
        className="button"
        color="info"
        onClick={() =>
          this.setState({
            currentQuestionIndex: this.state.currentQuestionIndex + 1
          })
        }
      >
        {lesson!.questions.length !== currentQuestionIndex + 1
          ? "NEXT"
          : "FINISH"}
      </Button>
    );
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
