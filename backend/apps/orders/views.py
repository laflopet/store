from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Order, OrderStatusHistory
from .serializers import OrderSerializer, OrderCreateSerializer
from apps.products.models import Product, ProductVariant
from apps.accounts.models import GuestUser


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]



