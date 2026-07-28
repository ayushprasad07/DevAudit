from pathlib import Path

FIXTURE_DIR = (
    Path(__file__).parent / "fixtures"
)

def load_fixture(relative_path: str) -> str:
    return (
        FIXTURE_DIR / relative_path
    ).read_text(
        encoding="utf-8"
    )