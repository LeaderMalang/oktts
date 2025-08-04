from rest_framework import serializers
from .models import (
    Employee,
    EmployeeContract,
    LeaveRequest,
    Attendance,
    SalesTarget,
    Task,
    DeliveryAssignment,
    LeaveBalance,
    PayrollSlip,
)


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            "id",
            "user",
            "role",
            "name",
            "phone",
            "email",
            "cnic",
            "address",
            "active",
        ]


class EmployeeContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeContract
        fields = [
            "id",
            "employee",
            "start_date",
            "end_date",
            "salary",
            "notes",
        ]


class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "employee",
            "leave_type",
            "start_date",
            "end_date",
            "reason",
            "status",
            "applied_on",
            "reviewed_by",
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "date",
            "check_in",
            "check_out",
            "is_absent",
            "remarks",
        ]


class SalesTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesTarget
        fields = ["id", "employee", "month", "target_amount"]


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "assignment",
            "assigned_to",
            "assigned_by",
            "due_date",
            "status",
            "party",
            "invoice_content_type",
            "invoice_object_id",
            "created_at",
            "updated_at",
        ]


class DeliveryAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryAssignment
        fields = [
            "id",
            "employee",
            "sale",
            "assigned_date",
            "status",
            "remarks",
        ]


class LeaveBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveBalance
        fields = ["id", "employee", "annual", "sick", "casual"]


class PayrollSlipSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollSlip
        fields = [
            "id",
            "employee",
            "month",
            "base_salary",
            "present_days",
            "absent_days",
            "leaves_paid",
            "deductions",
            "net_salary",
            "created_on",
        ]
