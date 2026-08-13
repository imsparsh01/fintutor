import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from './backend';
import { ASSESSMENT_QUESTION_ORDER, type AssessmentQuestion } from './assessmentVocabulary';

const HANDLED_CACHE_PREFIX = 'fintutor:onboarding_v2_handled:';
const LEGACY_INVITE_DISMISSED_PREFIX = 'fintutor:onboarding_v2_invite_dismissed:';

export const assessmentQuestions = ASSESSMENT_QUESTION_ORDER;
export type { AssessmentQuestion } from './assessmentVocabulary';

export type AssessmentValue = string | string[];

export type AssessmentState = {
  flow_version: number;
  status: 'in_progress' | 'handled';
  current_question: AssessmentQuestion | null;
  answers: Record<AssessmentQuestion, AssessmentValue | null>;
  handled_via: 'completed' | 'global_exit' | null;
  handled_at: string | null;
  cleared_at: string | null;
};

export class AssessmentApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
  }
}

async function request(path: string, userId: string, init?: RequestInit): Promise<AssessmentState> {
  let response: Response;
  try {
    response = await fetch(
      `${BACKEND_URL}${path}?user_id=${encodeURIComponent(userId)}`,
      {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
      },
    );
  } catch {
    throw new AssessmentApiError('FinTutor could not reach the server.', null);
  }

  if (!response.ok) {
    let detail = 'The assessment could not be updated.';
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // Stable fallback copy avoids exposing server internals.
    }
    throw new AssessmentApiError(detail, response.status);
  }
  return (await response.json()) as AssessmentState;
}

export function getAssessment(userId: string): Promise<AssessmentState> {
  return request('/onboarding-assessment', userId);
}

export async function getLegacyCompatibility(userId: string): Promise<boolean> {
  let response: Response;
  try {
    response = await fetch(
      `${BACKEND_URL}/onboarding-assessment/compatibility?user_id=${encodeURIComponent(userId)}`,
    );
  } catch {
    throw new AssessmentApiError('FinTutor could not reach the server.', null);
  }
  if (!response.ok) throw new AssessmentApiError('Compatibility state could not be read.', response.status);
  const body = (await response.json()) as { legacy_user?: boolean };
  return body.legacy_user === true;
}

export function startAssessment(userId: string): Promise<AssessmentState> {
  return request('/onboarding-assessment/start', userId, {
    method: 'POST',
    body: JSON.stringify({ eligibility_confirmed: true }),
  });
}

export function answerAssessment(
  userId: string,
  question: AssessmentQuestion,
  value: AssessmentValue,
): Promise<AssessmentState> {
  return request('/onboarding-assessment/answer', userId, {
    method: 'POST',
    body: JSON.stringify({ question, value }),
  });
}

export function skipAssessmentQuestion(
  userId: string,
  question: AssessmentQuestion,
): Promise<AssessmentState> {
  return request('/onboarding-assessment/skip', userId, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

export function handleAssessment(userId: string): Promise<AssessmentState> {
  return request('/onboarding-assessment/handle', userId, { method: 'POST' });
}

export function updateAssessmentContext(
  userId: string,
  question: AssessmentQuestion,
  value: AssessmentValue,
): Promise<AssessmentState> {
  return request(`/onboarding-assessment/context/${question}`, userId, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

export function clearAssessmentContext(userId: string): Promise<AssessmentState> {
  return request('/onboarding-assessment/clear', userId, { method: 'POST' });
}

export async function hasHandledAssessmentCache(userId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(`${HANDLED_CACHE_PREFIX}${userId}`)) === 'true';
}

export function cacheHandledAssessment(userId: string): Promise<void> {
  return AsyncStorage.setItem(`${HANDLED_CACHE_PREFIX}${userId}`, 'true');
}

export async function hasDismissedLegacyInvite(userId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(`${LEGACY_INVITE_DISMISSED_PREFIX}${userId}`)) === 'true';
}

export function dismissLegacyInvite(userId: string): Promise<void> {
  return AsyncStorage.setItem(`${LEGACY_INVITE_DISMISSED_PREFIX}${userId}`, 'true');
}
