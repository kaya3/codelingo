export type Question = {
  text: string;
  correct: string[];
  incorrect: string[];
} & (
  | {
      kind: "blocks";
    }
  | {
      kind: "multiple_choice";
      options: string[];
    }
  | {
      kind: "blanks";
      template: string[];
    }
);
