from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from mentor_ai.users.serializers import CustomTokenObtainPairSerializer

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "api/v1/auth/token/",
        TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer),
        name="token_obtain_pair",
    ),
    path(
        "api/v1/auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
        "api/v1/users/",
        include("mentor_ai.users.urls"),
    ),
    path("api/v1/classrooms/", include("mentor_ai.classrooms.urls")),
    path("api/v1/assignments/", include("mentor_ai.assignments.urls")),
    path("api/v1/grading/", include("mentor_ai.grading.urls")),
    path("api/v1/dashboard/", include("mentor_ai.dashboard.urls")),
    path("api/v1/library/", include("mentor_ai.library.urls")),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
