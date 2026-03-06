import type { PostTemplate } from './types'
import job from './job'
import notification from './notification'
import result from './result'
import admit from './admit'
import answerKey from './answer-key'
import cutOff from './cut-off'
import syllabus from './syllabus'
import examPattern from './exam-pattern'
import previousPaper from './previous-paper'
import exam from './exam'
import scheme from './scheme'
import admission from './admission'

export type { PostTemplate }
export { getTemplateDefaults, hasStructuredContent } from './helpers'

export const POST_TEMPLATES: Record<string, PostTemplate> = {
  job,
  notification,
  result,
  admit,
  answer_key: answerKey,
  cut_off: cutOff,
  syllabus,
  exam_pattern: examPattern,
  previous_paper: previousPaper,
  exam,
  scheme,
  admission,
}
