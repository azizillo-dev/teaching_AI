from django.urls import path
from mentor_ai.users.views import (
    ProfileAPIView, 
    TeacherProfileView,
    RegisterAPIView,
    VerifyEmailAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView
)

urlpatterns = [
    path("profile/", ProfileAPIView.as_view(), name="user-profile"),
    path("teacher-profile/<uuid:group_id>/", TeacherProfileView.as_view(), name="teacher-profile"),
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("verify-email/", VerifyEmailAPIView.as_view(), name="verify-email"),
    path("forgot-password/", ForgotPasswordAPIView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordAPIView.as_view(), name="reset-password"),
]
