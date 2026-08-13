export const ASSESSMENT_QUESTION_ORDER = [
  'immediate_intent',
  'earning_context',
  'responsibility_context',
  'exposure_flags',
  'familiarity',
] as const;

export type AssessmentQuestion = (typeof ASSESSMENT_QUESTION_ORDER)[number];

export type AssessmentOption = { label: string; value: string };
export type AssessmentQuestionContent = {
  eyebrow: string;
  title: string;
  helper: string;
  options: AssessmentOption[];
  multi?: boolean;
};

// D-119: one presentation vocabulary for initial capture and later management.
// The values are the backend-approved normalized codes; only labels reach the UI.
export const ASSESSMENT_QUESTIONS: Record<AssessmentQuestion, AssessmentQuestionContent> = {
  immediate_intent: {
    eyebrow: 'A useful starting point',
    title: 'What would you like FinTutor to help you do first?',
    helper: 'This only shapes where we begin. It is not a recommendation.',
    options: [
      { label: 'Understand the basics', value: 'learn_basics' },
      { label: 'See how my financial picture fits together', value: 'connect_picture' },
      { label: 'Understand something I already have', value: 'understand_existing' },
      { label: 'Explore a goal or scenario', value: 'model_future' },
      { label: 'Build a learning routine', value: 'build_routine' },
      { label: 'Ask Arya a question', value: 'ask_arya' },
      { label: 'Just look around', value: 'explore' },
      { label: 'Prefer not to choose', value: 'undisclosed' },
    ],
  },
  earning_context: {
    eyebrow: 'Your current context',
    title: 'Which description is closest to where you are today?',
    helper: 'No income amount is needed.',
    options: [
      { label: 'Studying', value: 'student' },
      { label: 'Preparing to start earning', value: 'pre_earning' },
      { label: 'Started earning recently', value: 'early_earner' },
      { label: 'Working for a few years', value: 'established_earner' },
      { label: 'My situation or income varies', value: 'variable_or_transitioning' },
      { label: 'Prefer not to say', value: 'undisclosed' },
    ],
  },
  responsibility_context: {
    eyebrow: 'The people money supports',
    title: 'How are day-to-day financial responsibilities arranged?',
    helper: 'Choose the closest fit—you can change this later.',
    options: [
      { label: 'Mostly just me', value: 'self' },
      { label: 'Shared or family expenses', value: 'shared' },
      { label: 'Others depend on me', value: 'dependents' },
      { label: 'It changes month to month', value: 'variable' },
      { label: 'Prefer not to say', value: 'undisclosed' },
    ],
  },
  exposure_flags: {
    eyebrow: 'What you have encountered',
    title: 'Which money topics are already part of your life?',
    helper: 'Choose any that fit. We still do not need amounts or account details.',
    multi: true,
    options: [
      { label: 'Spending', value: 'spending' },
      { label: 'Saving', value: 'saving' },
      { label: 'Investing', value: 'investing' },
      { label: 'Borrowing or EMIs', value: 'borrowing' },
      { label: 'Insurance', value: 'insurance' },
      { label: 'Financial goals', value: 'goals' },
      { label: 'Workplace benefits or tax', value: 'workplace_and_tax' },
      { label: 'None of these yet', value: 'none' },
      { label: 'Not sure', value: 'unsure' },
      { label: 'Prefer not to say', value: 'undisclosed' },
    ],
  },
  familiarity: {
    eyebrow: 'How explanations should begin',
    title: 'How familiar do these topics generally feel?',
    helper: 'This changes explanation depth, not what you are allowed to explore.',
    options: [
      { label: 'Start from the foundations', value: 'foundations' },
      { label: 'I know the working basics', value: 'working_basics' },
      { label: 'I am connecting the pieces', value: 'connecting' },
      { label: 'I want deeper context', value: 'deeper_context' },
      { label: 'It varies by topic', value: 'variable' },
      { label: 'Prefer not to say', value: 'undisclosed' },
    ],
  },
};

export const EXCLUSIVE_EXPOSURE_VALUES = new Set(['none', 'unsure', 'undisclosed']);

export function assessmentValueLabels(question: AssessmentQuestion, value: string | string[] | null): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const labels = new Map(ASSESSMENT_QUESTIONS[question].options.map((option) => [option.value, option.label]));
  return values.map((item) => labels.get(item) ?? 'Not provided');
}
