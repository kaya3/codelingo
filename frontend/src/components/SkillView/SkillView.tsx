import React, { PureComponent, ReactNode } from "react";
import { Button, UncontrolledPopover, PopoverHeader, PopoverBody  } from "reactstrap";
import { skillClient } from "../../network/skillClient";
import { Skill } from "../../model/Skill";
import { authClient } from "../../network/authClient";
import { FaListUl } from "react-icons/fa";


interface Props {}

interface State {
  skills: Skill[][],
}

class SkillView extends PureComponent<Props, State> {
  state: State = {
    skills: [],
  };

  componentDidMount() {
    authClient.getWhoAmI().then(whoAmI => {
      console.log(whoAmI);
    });

    skillClient.getSkills().then(skills => {
      console.log(skills);
      this.setState({
        skills,
      });
    });
  }

  render(): ReactNode {
    return (
      <div className="skill-view d-flex flex-column align-items-center p-2">
        <div>
          <h1>Your Skills</h1>
          <p>Click on a skill to learn more about this language!</p>
          { this.renderSkills() }
        </div>
      </div>
    );
  }

  private renderSkills() {
    return this.state.skills.flatMap((skillRow, outerIndex) => skillRow.map((skill, innerIndex) => (
      <div id={`skill-container-${outerIndex}-${innerIndex}`} className="skill-wrapper text-center" key={`${outerIndex}.${innerIndex}`}>
        <div className="skill-container">
          <FaListUl />
        </div>
        <p>{ skill.name }</p>
        <UncontrolledPopover placement="bottom" target={`skill-container-${outerIndex}-${innerIndex}`}>
          <PopoverBody>
            <Button className="button">LEARN SKILL</Button>
          </PopoverBody>
        </UncontrolledPopover>
      </div>
    )));
  }
}

export default SkillView;
