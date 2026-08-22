export interface FailedChatRequest {
  question: string;
  deepenAlias?: string;
  onboardingTrackHint?: string;
}

export interface RetryInvocation extends FailedChatRequest {
  appendUserMessage: false;
}

export const CHAT_FAILURE_MESSAGE =
  'Arya is temporarily unavailable. Your question was not resent. Retry when you are ready.';

export function captureFailedChatRequest(
  question: string,
  deepenAlias?: string,
  onboardingTrackHint?: string,
): FailedChatRequest {
  return { question, deepenAlias, onboardingTrackHint };
}

export function retryInvocationFor(request: FailedChatRequest | null): RetryInvocation | null {
  if (!request) return null;
  return { ...request, appendUserMessage: false };
}
