export type Question = {
    questionID: string,
    text: string,
} & ({
    kind: 'blocks',
    correct: string[],
    distractions: string[],
} | {
    kind: 'multiple_choice',
    options: string[],
} | {
    kind: 'blanks',
    correct: string[],
    distractions: string[],
})
