from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='orders'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('create/', views.create_order, name='create-order'),
    path('<int:order_id>/status/', views.update_order_status, name='update-order-status'),
    path('<int:order_id>/assign/', views.assign_order, name='assign-order'),
    # New admin endpoints
    path('<int:order_id>/reject/', views.reject_order, name='reject-order'),
    path('<int:order_id>/admin-detail/', views.order_detail_admin, name='order-admin-detail'),
    path('<int:order_id>/preparation/', views.update_order_preparation, name='update-order-preparation'),
    # Public endpoints
    path('lookup/', views.lookup_order, name='lookup-order'),
]