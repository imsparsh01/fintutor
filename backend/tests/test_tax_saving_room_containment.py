import unittest
import uuid

from fastapi.testclient import TestClient

from app.main import app
from tests.auth_helpers import authenticated_client


class TaxSavingRoomContainmentTests(unittest.TestCase):
    def test_non_fixture_route_is_not_registered(self) -> None:
        paths = {route.path for route in app.routes}
        self.assertNotIn("/tax-saving-room", paths)

    def test_authenticated_request_cannot_return_a_tax_number(self) -> None:
        response = authenticated_client(app, uuid.uuid4()).get(
            "/tax-saving-room?tax_regime=old"
        )
        self.assertEqual(response.status_code, 404)
        self.assertNotIn("unused_room", response.text)
        self.assertNotIn("150000", response.text)

    def test_unauthenticated_request_is_also_unavailable(self) -> None:
        response = TestClient(app).get("/tax-saving-room?tax_regime=old")
        self.assertIn(response.status_code, (401, 404))
        self.assertNotIn("unused_room", response.text)


if __name__ == "__main__":
    unittest.main()
