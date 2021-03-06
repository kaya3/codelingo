export const data = {
  title: "Basic Python",
  language: "python",
  questions: [
    {
      kind: "blocks",
      correct: ["sum", "(", "nums", ")"],
      incorrect: ["total", "[", "]"],
      text: "<p>Find the sum of the numbers in <code>nums</code>.</p>"
    },
    {
      kind: "multiple_choice",
      correct: ["7"],
      incorrect: ["2", "5"],
      text: "<p>What is the result of <code>sum([2, 5])</code>?</p>"
    },
    {
      kind: "blanks",
      template: ["for ", " in nums:\n\t", "(nums)"],
      correct: ["x", "print"],
      incorrect: ["y", "sum", "output", "nums"],
      text:
        "<p>Complete the code to print each element of <code>nums</code>.</p>"
    }
  ]
};
