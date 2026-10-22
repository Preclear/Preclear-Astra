"""Compound conditions; no model or first-match rule decides permit status."""

from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import operator

OPS = {
    "gt": operator.gt,
    "gte": operator.ge,
    "lt": operator.lt,
    "lte": operator.le,
    "eq": operator.eq,
}


def matches(condition, attributes):
    key = condition["attribute"]
    if key not in attributes:
        return None
    actual = attributes[key]
    expected = condition["value"]
    op = condition["operator"]
    if op == "bool":
        if not isinstance(actual, bool) or not isinstance(expected, bool):
            return None
        return actual is expected
    if op == "eq" and isinstance(expected, str):
        return isinstance(actual, str) and actual.casefold() == expected.casefold()
    if isinstance(actual, bool) or isinstance(expected, bool):
        return None
    try:
        left, right = Decimal(str(actual)), Decimal(str(expected))
        if not left.is_finite() or not right.is_finite():
            return None
        return OPS[op](left, right)
    except (InvalidOperation, KeyError):
        return None


def evaluate(rules, attributes):
    matched = []
    missing = set()
    now = datetime.now(timezone.utc)
    for rule in rules:
        if not rule["verified_at"] or not rule["source_url"] or not rule["conditions"]:
            continue
        expiry = rule.get("valid_until")
        if (
            not expiry
            or datetime.fromisoformat(str(expiry).replace("Z", "+00:00")) <= now
        ):
            continue
        outcomes = [matches(c, attributes) for c in rule["conditions"]]
        if False in outcomes:
            continue
        if None in outcomes:
            missing.update(
                c["attribute"]
                for c, v in zip(rule["conditions"], outcomes)
                if v is None
            )
        else:
            matched.append(rule)
    decisions = {r["permit_required"] for r in matched}
    if missing or len(decisions) != 1:
        status = "VERIFY_WITH_JURISDICTION"
    else:
        status = "PERMIT_REQUIRED" if True in decisions else "PERMIT_NOT_REQUIRED"
    return {
        "status": status,
        "missing_attributes": sorted(missing),
        "rules": [
            {
                "id": str(r["id"]),
                "requirement": r["requirement"],
                "source_url": r["source_url"],
                "code_citation": r["code_citation"],
                "verified_at": str(r["verified_at"]),
            }
            for r in matched
        ],
        "notice": "Research support. Confirm current requirements with the responsible jurisdiction.",
    }
