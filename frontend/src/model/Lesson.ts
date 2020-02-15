import { Question } from './Question';

export type Lesson = {
    lessonID: string,
    title: string,
    questions: Question[],
}
