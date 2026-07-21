from app.entity.security_report import SecurityReport
from app.enums.security_status import SecurityStatus
from app.enums.severity import Severity
from app.services.vulnerability_service import VulnerabilityService

from packaging.version import Version

from app.utils.severity_parser import SeverityParser


class SecurityService:

    @classmethod
    def analyze(
        cls,
        project_type,
        dependency
    ) -> SecurityReport:
        
        vulnerabilities = VulnerabilityService.get_vulnerabilities(
            project_type,
            dependency
        )

        satus = cls.determine_safity(vulnerabilities)

        vulnerability_count = cls.get_vulnerability_count(vulnerabilities)

        min_safe_version = cls.get_safe_minimum_version(vulnerabilities)

        recommendation = cls.generate_recommendations(
            vulnerability_count,
            min_safe_version
        )

        highest_severity = SeverityParser.highest(vulnerabilities)

        return SecurityReport(
            status=satus,
            vulnerability_count=vulnerability_count,
            highest_severity=highest_severity,
            minimum_safe_version=min_safe_version,
            recommendation=recommendation,
            vulnerabilities=vulnerabilities
        )
    
    @staticmethod
    def get_vulnerability_count(vulnerabilities):

        return len(vulnerabilities)
    
    @staticmethod
    def get_safe_minimum_version(vulnerabilities):

        fixed_versions = [
            v.fixed_version
            for v in vulnerabilities
            if v.fixed_version
        ]

        if not fixed_versions:
            return None

        return max(fixed_versions, key=Version)
    
    @staticmethod
    def generate_recommendations(count, min_safe_version):

        if count == 0:
            return "No security action required."

        if min_safe_version:
            return f"Upgrade to {min_safe_version} to resolve {count} security issue(s)."

        return f"Upgrade to latest version to resolve {count} security issue(s)."
    
    @staticmethod
    def determine_safity(vulnerabilities):

        if not vulnerabilities:
            return SecurityStatus.SAFE
        
        return SecurityStatus.WARNING
