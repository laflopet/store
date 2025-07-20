from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='orders'),
    # path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    # path('create/', views.create_order, name='create-order'),
    # path('<int:order_id>/status/', views.update_order_status, name='update-order-status'),
    # path('<int:order_id>/assign/', views.assign_order, name='assign-order'),
]