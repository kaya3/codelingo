import React, { PureComponent, ReactNode } from "react";
//@ts-ignore
import { CodeBlock, dracula } from "react-code-blocks";

interface Props {
  code: string;
  language: string;
  blank: string;
}
interface State {}

class CodeBlockWithBlank extends PureComponent<Props, State> {
  state: State = {};

  render(): ReactNode {
    const { code, language } = this.props;

    return (
      <CodeBlock
        text={code}
        language={language}
        showLineNumbers
        theme={dracula}
        wrapLines
      />
    );
  }
}

export default CodeBlockWithBlank;
