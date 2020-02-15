export enum Kind {
  BLOCKS = "blocks",
  MULTIPLE_CHOICE = "multiple_choice",
  BLANKS = "blanks"
}

export type Question = {
  text: string;
  correct: string[];
  incorrect: string[];
} & (
  | {
      kind: Kind.BLOCKS;
    }
  | {
      kind: Kind.MULTIPLE_CHOICE;
      options: string[];
    }
  | {
      kind: Kind.BLANKS;
      template: string[];
    }
);
