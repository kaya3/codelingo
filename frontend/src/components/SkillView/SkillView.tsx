import React, { PureComponent, ReactNode } from "react";
import { Button, Progress } from "reactstrap";
import { skillClient } from "../../network/skillClient";
import { Skill } from "../../model/Skill";

interface Props {}

interface State {
  skills: Skill[],
}

class SkillView extends PureComponent<Props, State> {
  state: State = {
    skills: [],
  };

  componentDidMount() {
    skillClient.getSkills().then(skills => {
      this.setState({
        skills,
      });
    });
  }

  render(): ReactNode {
    return (
      <div className="skill-view d-flex flex-column align-items-center p-2">
        <div className="d-flex w-100 m-2 align-items-center">
          <h1>Your Skills</h1>
          { this.renderSkills() }
        </div>
      </div>
    );
  }

  private renderSkills() {
    return this.state.skills.map(skill => (
      <div className="answer-container">
        <Button>Go To Skill { skill.title }</Button>
      </div>
    ));
  }
}

export default SkillView;
