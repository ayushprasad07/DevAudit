from __future__ import annotations

from abc import ABC, abstractmethod

from app.intelligence.breaking_changes.parser.models import (
    ReleaseItem
)

from app.intelligence.breaking_changes.models import (
    BreakingChangeCategory,
    BreakingChangeSeverity
)

from .evidence import RuleResult


class BaseRule(ABC):

    category : BreakingChangeCategory
    severity : BreakingChangeSeverity

    @property
    @abstractmethod
    def name(self) -> str:
        ...
    
    @abstractmethod
    def evaluate(
        self,
        item: ReleaseItem,
    ) -> RuleResult :
        """
        Evaluate a release item.

        Returns:
            BreakingChange if this rule applies.
            None otherwise.
        """
        raise NotImplementedError