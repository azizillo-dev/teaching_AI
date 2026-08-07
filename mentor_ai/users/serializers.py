from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from mentor_ai.users.models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['role'] = user.role
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_trial_active'] = user.is_trial_active
        
        # Include avatar in token claims if available
        if user.avatar:
            token['avatar'] = user.avatar.url
        else:
            token['avatar'] = None

        return token


class UserProfileSerializer(serializers.ModelSerializer):
    is_trial_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", 
            "role", "avatar", "bio", "subject", "phone_number", 
            "created_at", "plan_expires_at", "is_trial_active"
        ]
        read_only_fields = ["id", "email", "role", "created_at", "plan_expires_at"]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "avatar", "bio", "subject", "phone_number"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            is_active=False  # Must verify email first
        )
        return user


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=6)
