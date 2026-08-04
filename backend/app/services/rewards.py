import random

# Variable-ratio reward probability — deliberately unpredictable per D-060 ("same playbook as
# Duolingo," not a fixed schedule). A plain tunable constant, not a finalized game-design
# number; safe to adjust without a new decision (P7's permitted, app-behavior-only half).
_REWARD_PROBABILITY = 0.3
_REWARD_TYPE = "celebration"  # matches Mascot.tsx's 'celebrating' mood (BQ-032)


def evaluate_reward(is_new_day: bool) -> dict:
    """D-060/BQ-030: server-authoritative variable-ratio reward trigger, scoped to app-open
    only for now (the richer trigger set D-060 anticipated — rewarding a completed teaching
    moment — needs the chat surface first, BQ-023/024, and is a follow-on, not this item).

    Only rolled on a genuinely new day's first open (`is_new_day`) — a same-day repeat open
    never re-rolls, so a client can't force extra attempts by refreshing. Reacts only to the
    app-open/streak event, never to financial data (P7).
    """
    if not is_new_day:
        return {"reward_fired": False, "reward_type": None}
    fired = random.random() < _REWARD_PROBABILITY
    return {"reward_fired": fired, "reward_type": _REWARD_TYPE if fired else None}
