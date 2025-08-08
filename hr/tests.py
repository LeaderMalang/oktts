from datetime import date
from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase

from .models import Employee, LeaveRequest
from .views import LeaveRequestViewSet


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

