from cvss import CVSS3

from app.enums.severity import Severity

class SeverityParser : 

    PRIORITY = {
        Severity.UNKNOWN: 0,
        Severity.LOW: 1,
        Severity.MEDIUM: 2,
        Severity.HIGH: 3,
        Severity.CRITICAL: 4,
    }

    @classmethod
    def score(cls, vector : str) -> float | None:

        if not vector :
            return None
        
        try:

            return CVSS3(vector).scores()[0]
        
        except:

            return None
        
    @classmethod
    def parse(cls, vector : str) -> Severity:

        print(f"Vector: {vector}")

        score = cls.score(vector)

        if score is None:
            return Severity.UNKNOWN
        
        try:
            score = CVSS3(vector).scores()[0]
            print(f"Score: {score}")

        except Exception as e:
            print("Exception Type:", type(e))
            print("Exception:", repr(e))
            raise
        
        if score > 9.0:
            return Severity.CRITICAL
        
        if score >= 7.0:
            return Severity.HIGH
        
        if score >=4.0:
            return Severity.MEDIUM
        
        return Severity.LOW
    
    @classmethod
    def highest(cls, vulnerabilities) -> Severity:

        highest = Severity.UNKNOWN

        for vulnerability in vulnerabilities:

            severity = cls.parse(vulnerability.severity)

            if cls.PRIORITY[severity] > cls.PRIORITY[highest]:
                highest = severity

        return highest

