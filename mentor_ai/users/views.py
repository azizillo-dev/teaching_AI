from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import random

from mentor_ai.users.models import User, EmailVerification
from mentor_ai.users.serializers import (
    UserProfileSerializer, 
    UserUpdateSerializer, 
    RegisterSerializer,
    VerifyEmailSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    CustomTokenObtainPairSerializer
)
from mentor_ai.classrooms.models import Group

class ProfileAPIView(generics.RetrieveUpdateAPIView):
    """
    Get or update the current user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserProfileSerializer


class TeacherProfileView(APIView):
    """
    Get the profile of a teacher for a specific group.
    Students can use this to see their teacher's details.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, group_id):
        # Ensure the group exists and get its teacher
        group = get_object_or_404(Group, id=group_id)
        teacher = group.owner
        
        serializer = UserProfileSerializer(teacher, context={'request': request})
        return Response(serializer.data)


def send_otp_email(user, verification_type):
    code = str(random.randint(100000, 999999))
    EmailVerification.objects.filter(user=user, verification_type=verification_type).delete()
    
    EmailVerification.objects.create(
        user=user,
        code=code,
        verification_type=verification_type,
        expires_at=timezone.now() + timedelta(minutes=10)
    )

    subject = "Sizning tasdiqlash kodingiz (Teacher AI)"
    message = f"Assalomu alaykum, {user.first_name}!\n\nSizning tasdiqlash kodingiz: {code}\nKod 10 daqiqa davomida amal qiladi.\n\nHurmat bilan,\nTeacher AI jamoasi"
    send_mail(
        subject=subject,
        message=message,
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False,
    )


class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Activate user and start 14-day free trial immediately
            user.is_active = True
            user.plan_expires_at = timezone.now() + timedelta(days=14)
            user.save()
            
            refresh = CustomTokenObtainPairSerializer.get_token(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "detail": "User created successfully."
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            
            user = get_object_or_404(User, email=email)
            verification = EmailVerification.objects.filter(
                user=user, 
                code=code, 
                verification_type=EmailVerification.VerificationType.REGISTER
            ).first()

            if not verification or not verification.is_valid():
                return Response({"detail": "Invalid or expired code."}, status=status.HTTP_400_BAD_REQUEST)

            # Activate user and start 14-day free trial
            user.is_active = True
            user.plan_expires_at = timezone.now() + timedelta(days=14)
            user.save()
            
            verification.delete()

            # Return tokens so user is logged in
            refresh = CustomTokenObtainPairSerializer.get_token(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "detail": "Email verified successfully."
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                send_otp_email(user, EmailVerification.VerificationType.PASSWORD_RESET)
                return Response({"detail": "Password reset code sent."})
            except User.DoesNotExist:
                # Return success even if user doesn't exist for security
                return Response({"detail": "Password reset code sent."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            new_password = serializer.validated_data['new_password']
            
            user = get_object_or_404(User, email=email)
            verification = EmailVerification.objects.filter(
                user=user, 
                code=code, 
                verification_type=EmailVerification.VerificationType.PASSWORD_RESET
            ).first()

            if not verification or not verification.is_valid():
                return Response({"detail": "Invalid or expired code."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            verification.delete()
            return Response({"detail": "Password has been reset successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
