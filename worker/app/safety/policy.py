from .models import SafetyFinding, FindingSeverity, SafetyStatus

class SafetyPolicy:

    def evaluate(
        self,
        findings : list[SafetyFinding]
    )-> SafetyStatus:

        if not findings :
            return SafetyStatus.ALLOW

        if any(
            finding.severity == FindingSeverity.CRITICAL
            for finding in findings
        ):
            return SafetyStatus.BLOCK

        return SafetyStatus.REVIEW