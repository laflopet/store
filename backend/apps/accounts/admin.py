from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth import get_user_model
from .models import GuestUser

User = get_user_model()

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'role')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'phone', 
                 'date_of_birth', 'gender', 'role', 'is_active', 'is_staff', 'is_superuser')

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name', 'phone', 'date_of_birth', 'gender')}),
        ('Permisos', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas Importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('last_login', 'date_joined')

@admin.register(GuestUser)
class GuestUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'session_key', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('email', 'first_name', 'last_name', 'session_key')
    readonly_fields = ('session_key', 'created_at')
    
    fieldsets = (
        ('Información Personal', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Información del Sistema', {'fields': ('session_key', 'created_at')}),
    )
