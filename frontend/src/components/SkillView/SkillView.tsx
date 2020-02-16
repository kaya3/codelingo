import React, { PureComponent, ReactNode } from "react";
import { Button, Popover, PopoverBody } from "reactstrap";
import { skillClient } from "../../network/skillClient";
import { Skill } from "../../model/Skill";
import { authClient } from "../../network/authClient";
import { FaListUl } from "react-icons/fa";
import { Link } from "react-router-dom";

interface Props {}

interface State {
  skills: Skill[][];
  popoverOpen?: string;
}

class SkillView extends PureComponent<Props, State> {
  state: State = {
    skills: []
  };

  componentDidMount() {
    authClient.getWhoAmI().then(whoAmI => {
      console.log(whoAmI);
    });

    skillClient.getSkills().then(skills => {
      console.log(skills);
      this.setState({
        skills
      });
    });
  }

  render(): ReactNode {
    return (
      <div className="skill-view d-flex justify-content-center flex-column align-items-center p-2">
        <div className="d-flex w-100 justify-content-center align-items-center p-2">
          <h1 className="font-weight-bold">codelingo</h1>
        </div>
        <hr />
        <div className="m-2 d-flex flex-column w-100 justify-content-center align-items-center">
          <h4>Your Skills</h4>
          <small className="text-muted">
            Click on a skill to learn more about this language!
          </small>
          {this.renderSkills()}
        </div>
      </div>
    );
  }

  private renderSkills() {
    return this.state.skills.map((skillRow, outerIndex) => (
      <div className="d-flex flex-wrap justify-content-center" key={outerIndex}>
        {skillRow.map((skill, innerIndex) => (
          <div
            id={`skill-container-${outerIndex}-${innerIndex}`}
            className="skill-wrapper text-center m-2"
            key={innerIndex}
            onClick={() =>
              this.setState({
                popoverOpen:
                  this.state.popoverOpen ===
                  `skill-container-${outerIndex}-${innerIndex}`
                    ? undefined
                    : `skill-container-${outerIndex}-${innerIndex}`
              })
            }
          >
            <div className="skill-container">
              <div className="skill-icon-wrapper">
                <FaListUl />
              </div>
            </div>
            <p className="font-weight-bold">{skill.name}</p>
            <Popover
              placement="bottom"
              target={`skill-container-${outerIndex}-${innerIndex}`}
              isOpen={
                `skill-container-${outerIndex}-${innerIndex}` ===
                this.state.popoverOpen
              }
            >
              <PopoverBody>
                <Link to={`/lesson/${skill.id}`}>
                  <Button className="button button-info">LEARN SKILL</Button>
                </Link>
              </PopoverBody>
            </Popover>
          </div>
        ))}
      </div>
    ));
  }
}

export default SkillView;
