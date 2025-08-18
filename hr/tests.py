from datetime import date
from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Employee, LeaveRequest
from .views import LeaveRequestViewSet

User = get_user_model()


class LeaveRequestApprovalTests(SimpleTestCase):
    def test_leave_balance_deducted_on_approval(self):
        employee = Employee(id=1, name="Test", phone="123")
        request = LeaveRequest(
            employee=employee,
            leave_type="ANNUAL",
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 3),
            status="APPROVED",
        )
        viewset = LeaveRequestViewSet()
        mock_balance = MagicMock()
        with patch(
            "hr.views.LeaveBalance.objects.get_or_create",
            return_value=(mock_balance, True),
        ):
            viewset._deduct_balance_if_approved(request, previous_status="PENDING")

        mock_balance.deduct_leave.assert_called_once_with("ANNUAL", 3)


class LeaveRequestStatusAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("user@example.com", "pass")
        self.employee = Employee.objects.create(name="Emp", phone="123")
        self.leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type="ANNUAL",
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 1),
            status="PENDING",
        )

    def test_update_status_endpoint(self):
        self.client.force_authenticate(self.user)
        resp = self.client.patch(
            f"/hr/leave-requests/{self.leave.id}/status/",
            {"status": "APPROVED"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.leave.refresh_from_db()
        self.assertEqual(self.leave.status, "APPROVED")

    def test_status_endpoint_requires_status(self):
        self.client.force_authenticate(self.user)
        resp = self.client.patch(
            f"/hr/leave-requests/{self.leave.id}/status/",
            {},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

