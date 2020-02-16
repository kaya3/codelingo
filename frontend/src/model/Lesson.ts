import { Question } from "./Question";

export type Lesson = {
  language: string;
  title: string;
  questions: Question[];
  lesson_id: number;
};
