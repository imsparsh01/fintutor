import importlib.util
from pathlib import Path
import unittest

from app.db.session import Base
from app import models  # noqa: F401 — registers every model with Base.metadata


class RlsMigrationCoverageTests(unittest.TestCase):
    def test_every_application_table_is_in_fastapi_only_boundary(self) -> None:
        versions = Path(__file__).parents[1] / "alembic" / "versions"
        secured = set()
        for index, migration_path in enumerate(versions.glob("*.py")):
            spec = importlib.util.spec_from_file_location(f"rls_migration_{index}", migration_path)
            assert spec and spec.loader
            migration = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(migration)
            secured.update(getattr(migration, "_TABLES", ()))

        expected = set(Base.metadata.tables) | {"alembic_version"}
        self.assertEqual(expected, secured)


if __name__ == "__main__":
    unittest.main()
