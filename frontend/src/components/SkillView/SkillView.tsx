import React, { PureComponent, ReactNode } from "react";
import { Button, Popover, PopoverBody } from "reactstrap";
import { skillClient } from "../../network/skillClient";
import { Skill } from "../../model/Skill";
import { authClient } from "../../network/authClient";
import { FaListUl, FaThumbsUp, FaEquals, FaFont,  } from "react-icons/fa";
import { Link } from "react-router-dom";
import randomcolor from 'randomcolor';

interface Props {}

interface State {
  skills: RenderedSkill[][];
  popoverOpen?: string;
  popoverColour?: string,
}

interface RenderedSkill extends Skill {
  colour: string,
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
        skills: skills.map(s1 => {
          return s1.map(s => ({ ...s, colour: randomcolor() }))
        }),
      });
    });
  }

  render(): ReactNode {
    return (
      <div className="skill-view d-flex justify-content-center flex-column align-items-center p-2"
      //@ts-ignore
      style={ { ['--colour']: this.state.popoverColour } }>
        <div className="d-flex w-100 justify-content-center align-items-center p-2">
          <h2 className="logo font-weight-bold">codelingo</h2>
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
            //@ts-ignore
            style={ { ['--colour']: skill.colour } }
            onClick={() => {
                this.setState({
                  popoverOpen:
                    this.state.popoverOpen ===
                    `skill-container-${outerIndex}-${innerIndex}`
                      ? undefined
                      : `skill-container-${outerIndex}-${innerIndex}`
                })

                this.setState({ popoverColour: skill.colour });
              }
            }
          >
            <div className="skill-container">
              <div className="skill-icon-wrapper">
              {  skill.name === 'Basics'
                  ? <FaThumbsUp /> :
                  skill.name === 'Expressions' || skill.name === 'Assignment' ? <FaEquals /> :
                  skill.name === 'Types' || skill.name === 'Variables' || skill.name === 'Strings' ? <FaFont /> :
                  <FaListUl /> }
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
                <p>
                  <span className="font-weight-bold">Lesson</span> {skill.level}{" "}
                  / {skill.total_lessons}
                </p>
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
