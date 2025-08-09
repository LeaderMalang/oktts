from rest_framework import permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import City, Area, Company, Group, Distributor, Branch, Warehouse
from .serializers import (
    CitySerializer,
    AreaSerializer,
    CompanySerializer,
    GroupSerializer,
    DistributorSerializer,
    BranchSerializer,
    WarehouseSerializer,
)
from inventory.models import Party, Product, Batch, PriceList, PriceListItem
from expense.models import ExpenseCategory
from voucher.models import ChartOfAccount


class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [permissions.IsAuthenticated]


class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [permissions.IsAuthenticated]


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class DistributorViewSet(viewsets.ModelViewSet):
    queryset = Distributor.objects.all()
    serializer_class = DistributorSerializer
    permission_classes = [permissions.IsAuthenticated]


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated]


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def management_all(request):
    data = {
        "companies": list(Company.objects.values()),
        "groups": list(Group.objects.values()),
        "distributors": list(Distributor.objects.values()),
        "cities": list(City.objects.values()),
        "areas": list(Area.objects.values()),
        "parties": list(Party.objects.values()),
        "products": list(Product.objects.values()),
        "batches": list(Batch.objects.values()),
        "expense_categories": list(ExpenseCategory.objects.values()),
        "price_lists": list(PriceList.objects.values()),
        "price_list_items": list(PriceListItem.objects.values()),
        "chart_of_accounts": list(ChartOfAccount.objects.values()),
    }
    return Response(data)
