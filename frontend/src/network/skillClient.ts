import { request } from './request';

import { Lesson } from '../model/Lesson';
import { Skill } from '../model/Skill';

export const skillClient = {
  getSkills(): Promise<Skill[][]> {
    return request.getData<Skill[][]>('/get_skills', {});
  },

  getNextLesson(skillID: string): Promise<Lesson> {
    return request.getData<Lesson>(`/get_next_lesson/${skillID}`, {});
  },

  completeLesson(lessonID: string): Promise<void> {
    return request.postData(`/complete_lesson/${lessonID}`, new FormData());
  }
}
