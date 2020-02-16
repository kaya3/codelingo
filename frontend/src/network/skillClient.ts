import { request } from "./request";

import { Lesson } from "../model/Lesson";
import { Skill } from "../model/Skill";
import { SkillsResponse } from "../model/SkillsResponse";

export const skillClient = {
  getSkills(): Promise<Skill[][]> {
    return request
      .getData<SkillsResponse>("/get_skills", {})
      .then(skillsResponse => {
        return skillsResponse.skills;
      });
  },

  getNextLesson(skillID: string): Promise<Lesson> {
    return request.getData<Lesson>(`/get_next_lesson/${skillID}`, {});
  },

  completeLesson(lessonID: number): Promise<void> {
    return request.postData(`/complete_lesson/${lessonID}`, new FormData());
  }
};
