import React, { PureComponent, ReactNode } from "react";

import { QuestionHandler } from "../../util/QuestionHandler";
import { Question, Kind } from "../../model/Question";

import CodeBlockWithBlank from "../CodeBlockWithBlank";
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
}

interface State {
  answerListOrientation: Orientation;
}

enum Orientation {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical"
}

class InteractiveContent extends PureComponent<Props, State> {
  onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
  }

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
    const { kind } = this.props;
    const answers = correctAnswers.concat(incorrectAnswers);

    const shuffledAnswers = QuestionHandler.shuffleQuestions(answers);

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable
          direction={Orientation.HORIZONTAL}
          isDropDisabled={kind === Kind.MULTIPLE_CHOICE}
          droppableId="droppable"
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="answer-container"
            >
              {shuffledAnswers.map((answer, index) => (
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
      </DragDropContext>
    );
  }
}

export default InteractiveContent;
