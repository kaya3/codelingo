export const QuestionHandler = {

    shuffleQuestions(questions: string[]): string[] {
        let currentIndex = questions.length
        let temporaryValue;

        while (0 !== currentIndex) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = questions[currentIndex];
            questions[currentIndex] = questions[randomIndex];
            questions[randomIndex] = temporaryValue;
        }

        return questions;
    },

    isQuestionCorrect(usersAnswer: string[], correctAnswer: string[]): boolean {
        for (let i = 0; i < usersAnswer.length; ++i) {
            if (usersAnswer[i] !== correctAnswer[i]) {
                return false;
            }
        }

        return true;
    },
}
