from rest_framework import permissions, viewsets

from .models import (
    Attendance,
    DeliveryAssignment,
    Employee,
    EmployeeContract,
    LeaveBalance,
    LeaveRequest,
    PayrollSlip,
    SalesTarget,
    Task,
)
from .serializers import (
    AttendanceSerializer,
    DeliveryAssignmentSerializer,
    EmployeeContractSerializer,
    EmployeeSerializer,
    LeaveBalanceSerializer,
    LeaveRequestSerializer,
    PayrollSlipSerializer,
    SalesTargetSerializer,
    TaskSerializer,
)


class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    

class EmployeeViewSet(BaseViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class EmployeeContractViewSet(BaseViewSet):
    queryset = EmployeeContract.objects.all()
    serializer_class = EmployeeContractSerializer


class LeaveRequestViewSet(BaseViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        employee_id = self.request.query_params.get("employee")
        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        return qs

    def _deduct_balance_if_approved(self, instance, previous_status=None):
        if instance.status == "APPROVED" and previous_status != "APPROVED":
            days = (instance.end_date - instance.start_date).days + 1
            leave_balance, _ = LeaveBalance.objects.get_or_create(
                employee=instance.employee
            )
            leave_balance.deduct_leave(instance.leave_type, days)

    def perform_create(self, serializer):
        instance = serializer.save()
        self._deduct_balance_if_approved(instance)

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        instance = serializer.save()
        self._deduct_balance_if_approved(instance, previous_status)


class AttendanceViewSet(BaseViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


class SalesTargetViewSet(BaseViewSet):
    queryset = SalesTarget.objects.all()
    serializer_class = SalesTargetSerializer


class TaskViewSet(BaseViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class DeliveryAssignmentViewSet(BaseViewSet):
    queryset = DeliveryAssignment.objects.all()
    serializer_class = DeliveryAssignmentSerializer


class LeaveBalanceViewSet(BaseViewSet):
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer


class PayrollSlipViewSet(BaseViewSet):
    queryset = PayrollSlip.objects.all()
    serializer_class = PayrollSlipSerializer
