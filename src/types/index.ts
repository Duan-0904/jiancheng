// ========== 简历相关 ==========
export interface Resume {
  name: string
  skills: string[]
  experiences: ResumeExperience[]
  education: ResumeEducation[]
}

export interface ResumeExperience {
  company: string
  role: string
  duration: string
  highlights: string[]
}

export interface ResumeEducation {
  school: string
  degree: string
  major: string
  year: string
}

// ========== 岗位相关 ==========
export interface Job {
  id: string
  title: string
  company: string
  city: string
  salary: string
  jdFull: string
  jdHighlights: string[]
  sourceUrl: string
}

// ========== 匹配结果 ==========
export interface MatchResult {
  job: Job
  score: number // 综合评分 0-100
  skillScore: number // 技能匹配
  experienceScore: number // 经验匹配
  directionScore: number // 方向匹配
  reason: string // 推荐理由，必须具体
}

// ========== 改写建议 ==========
export type SuggestionSection = 'highlight' | 'quickFix' | 'reposition'

export interface RewriteItem {
  location: string // 在哪里改
  change: string // 改成什么
  reason: string // 为什么
}

export interface RewriteSuggestion {
  section: SuggestionSection
  title: string
  items: RewriteItem[]
}

export interface RewriteResult {
  matchScore: number // 当前匹配度百分比
  suggestions: RewriteSuggestion[]
}

// ========== API 响应 ==========
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// ========== localStorage 数据结构 ==========
export interface StoredHistoryEntry {
  recordId: string
  createdAt: string
  topJob: string
  topScore: number
  count: number
  preferences: string
}

export interface StoredMatchData {
  results: MatchResult[]
  resume: Resume | null
  recordId: string | null
  history: StoredHistoryEntry[]
}
