import importlib.util
from pathlib import Path
import unittest

from app.db.session import Base
from app import models  # noqa: F401 — registers every model with Base.metadata


class RlsMigrationCoverageTests(unittest.TestCase):
    def test_every_application_table_is_in_fastapi_only_boundary(self) -> None:
        migration_path = (
            Path(__file__).parents[1]
            / "alembic"
            / "versions"
            / "d142a104f001_lock_public_tables_behind_fastapi.py"
        )
        spec = importlib.util.spec_from_file_location("rls_migration", migration_path)
        assert spec and spec.loader
        migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration)

        expected = set(Base.metadata.tables) | {"alembic_version"}
        self.assertEqual(expected, set(migration._TABLES))


if __name__ == "__main__":
    unittest.main()
