from dataclasses import dataclass

@dataclass(frozen=True)
class SafetyLimits:
    max_files: int  = 50_000
    max_file_size_bytes : int = 50*1024*1024