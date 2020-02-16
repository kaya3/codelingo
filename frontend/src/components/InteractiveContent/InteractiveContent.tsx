import React, { PureComponent, ReactNode } from "react";

import { QuestionHandler } from "../../util/QuestionHandler";
import { Question, Kind } from "../../model/Question";
import { reorder } from "../../util/reorder";
import { move } from "../../util/move";
import classNames from "classnames";

import CodeBlockWithBlank from "../CodeBlockWithBlank/CodeBlockWithBlank";
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable
} from "react-beautiful-dnd";

interface Props {
  kind: Kind;
  question: Question;
  code?: string;
  language?: string;
  updateAnswer: (userAnswer: string[]) => void;
}

interface State {
  answerListOrientation: Orientation;
  userAnswer: string[];
  possibleAnswers?: string[];
  verticalMenu?: boolean;
}

enum Orientation {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical"
}

class InteractiveContent extends PureComponent<Props, State> {
  state: State = {
    userAnswer: [],
    answerListOrientation: Orientation.HORIZONTAL
  };

  constructor(props: Props) {
    super(props);

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  componentDidMount() {
    this.updatePossibleAnswers();
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.question !== this.props.question) {
      this.updatePossibleAnswers();
    }
  }

  resize() {
    let currentHideNav = window.innerWidth <= 600;
    if (currentHideNav !== this.state.verticalMenu) {
      this.setState({ verticalMenu: currentHideNav });
    }
  }

  updatePossibleAnswers() {
    const { kind } = this.props;

    if (kind === Kind.BLANKS) {
      const codeBlock = document.getElementById("code-block");

      if (codeBlock) {
        codeBlock.innerHTML = codeBlock.innerHTML.replace(
          /###BLANK###/g,
          `<span class="blank"></span>`
        );
      }
    }

    let possibleAnswers = this.props.question.correct.concat(
      this.props.question.incorrect
    );
    possibleAnswers = QuestionHandler.shuffleQuestions(possibleAnswers);
    this.setState({ possibleAnswers, userAnswer: [] });
  }

  onDragEnd(result: DropResult) {
    const { source, destination } = result;
    const { updateAnswer } = this.props;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        //@ts-ignore
        this.state[source.droppableId],
        source.index,
        destination.index
      );

      let state = { userAnswer: items };

      if (source.droppableId === "possibleAnswers") {
        //@ts-ignore
        state = { possibleAnswers: items };
      }

      //@ts-ignore
      this.setState(state, () => updateAnswer(this.state.userAnswer));
    } else {
      const result = move(
        //@ts-ignore
        this.state[source.droppableId],
        //@ts-ignore
        this.state[destination.droppableId],
        source,
        destination
      );

      this.setState(
        {
          //@ts-ignore
          userAnswer: result.userAnswer,
          //@ts-ignore
          possibleAnswers: result.possibleAnswers
        },
        () => updateAnswer(this.state.userAnswer)
      );
    }
  }

  render(): ReactNode {
    const { code, language, kind, updateAnswer } = this.props;
    const { userAnswer, verticalMenu } = this.state;
    return (
      <>
        <DragDropContext onDragEnd={this.onDragEnd}>
          {kind === Kind.BLOCKS ? (
            <>
              <small className="text-muted">
                Hint: Click or drag the answers onto the area below.
              </small>
              <Droppable
                direction={Orientation.HORIZONTAL}
                droppableId="userAnswer"
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="block-container"
                  >
                    {userAnswer.map((answer, index) => (
                      <Draggable
                        key={`${answer}-${index}`}
                        draggableId={answer}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="answer"
                            key={`drag-answer-${answer}-${index}`}
                            onClick={() => {
                              const userAnswer = Array.from(
                                this.state.userAnswer
                              );
                              const possibleAnswers = Array.from(
                                this.state.possibleAnswers!
                              );

                              const index = userAnswer.findIndex(
                                (possibleAnswer: string) =>
                                  possibleAnswer === answer
                              );

                              userAnswer.splice(index, 1);
                              possibleAnswers.push(answer);

                              this.setState(
                                {
                                  //@ts-ignore
                                  userAnswer,
                                  //@ts-ignore
                                  possibleAnswers
                                },
                                () => updateAnswer(this.state.userAnswer)
                              );
                            }}
                          >
                            <span>{answer}</span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </>
          ) : (
            code &&
            language && <CodeBlockWithBlank code={code} language={language} />
          )}

          {this.renderAnswers()}
        </DragDropContext>
      </>
    );
  }

  private renderAnswers() {
    const { kind, updateAnswer } = this.props;
    const { possibleAnswers, verticalMenu } = this.state;

    if (!possibleAnswers) {
      return;
    }

    return (
      <Droppable
        direction={verticalMenu ? Orientation.VERTICAL : Orientation.HORIZONTAL}
        isDropDisabled={kind === Kind.MULTIPLE_CHOICE}
        droppableId="possibleAnswers"
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`answer-container ${kind}`}
          >
            {possibleAnswers.map((answer, index) => {
              return (
                <Draggable
                  key={`${answer}-${index}`}
                  isDragDisabled={kind === Kind.MULTIPLE_CHOICE}
                  draggableId={answer}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={classNames("answer", {
                        active:
                          (this.state.userAnswer.includes(answer) &&
                            kind === Kind.MULTIPLE_CHOICE) ||
                          kind === Kind.BLANKS
                      })}
                      key={`drag-option-${answer}-${index}`}
                      onClick={() => {
                        const userAnswer = Array.from(this.state.userAnswer);
                        const possibleAnswers = Array.from(
                          this.state.possibleAnswers!
                        );

                        userAnswer.push(answer);

                        if (kind === Kind.BLOCKS) {
                          const index = possibleAnswers.findIndex(
                            (possibleAnswer: string) =>
                              possibleAnswer === answer
                          );
                          possibleAnswers.splice(index, 1);
                        } else if (kind === Kind.MULTIPLE_CHOICE) {
                          if (userAnswer.length > 1) {
                            userAnswer.splice(0, 1);
                          }
                        }

                        this.setState(
                          {
                            //@ts-ignore
                            userAnswer,
                            //@ts-ignore
                            possibleAnswers
                          },
                          () => updateAnswer(this.state.userAnswer)
                        );
                      }}
                    >
                      <span>{answer}</span>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }
}

export default InteractiveContent;
