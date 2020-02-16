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
  code?: string[];
  language?: string;
  updateAnswer: (userAnswer: string[]) => void;
}

interface State {
  answerListOrientation: Orientation;
  userAnswer: string[];
  possibleAnswers?: string[];
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
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.question !== this.props.question) {
      this.updatePossibleAnswers();
    }
  }

  updatePossibleAnswers() {
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
    const { code, language, question, kind } = this.props;
    const { userAnswer } = this.state;
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
                        key={answer}
                        draggableId={answer}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            key={answer}
                            className="answer"
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
    const { possibleAnswers } = this.state;

    if (!possibleAnswers) {
      return;
    }

    return (
      <Droppable
        direction={Orientation.HORIZONTAL}
        isDropDisabled={kind === Kind.MULTIPLE_CHOICE}
        droppableId="possibleAnswers"
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="answer-container"
          >
            {possibleAnswers.map((answer, index) => (
              <Draggable
                key={answer}
                isDragDisabled={kind === Kind.MULTIPLE_CHOICE}
                draggableId={answer}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    key={answer}
                    className={classNames("answer", {
                      active: this.state.userAnswer.includes(answer)
                    })}
                    onClick={() => {
                      const userAnswer = Array.from(this.state.userAnswer);
                      const possibleAnswers = Array.from(
                        this.state.possibleAnswers!
                      );

                      userAnswer.push(answer);

                      if (kind === Kind.BLOCKS) {
                        const index = possibleAnswers.findIndex(
                          (possibleAnswer: string) => possibleAnswer === answer
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
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }
}

export default InteractiveContent;
