from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserRegistrationSerializer, UserSerializer, AdminUserSerializer
from .models import GuestUser

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "tokens" : {
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if email and password:
        user = authenticate(request, username=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        else:
            return Response({'error': 'Credenciales inválidas'},
                            status=status.HTTP_401_UNAUTHORIZED)
        
    return Response({'error': 'Email y credenciales requeridos'},
                    status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    

class AdminUserListView(generics.ListCreateAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'super_admin':
            return User.objects.all()
        return User.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'super_admin':
            serializer.save(role='admin')

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'super_admin':
            return User.objects.all()
        return User.objects.none()
    
    def perform_update(self, serializer):
        if self.request.user.role == 'super_admin':
            serializer.save()
        else:
            raise permissions.PermissionDenied('Sin permisos para actualizar usuario')

class AdminCreateView(generics.CreateAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        if self.request.user.role == 'super_admin':
            serializer.save(role='admin')
        else:
            raise permissions.PermissionDenied('Sin permisos para crear administradores')


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({'error': 'Contraseña actual y nueva contraseña son requeridas'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Verify current password
        if not user.check_password(current_password):
            return Response({'error': 'Contraseña actual incorrecta'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password length
        if len(new_password) < 8:
            return Response({'error': 'La nueva contraseña debe tener al menos 8 caracteres'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Contraseña actualizada exitosamente'}, 
                       status=status.HTTP_200_OK)