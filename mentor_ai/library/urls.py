from rest_framework.routers import DefaultRouter
from mentor_ai.library.views import BookViewSet

router = DefaultRouter()
router.register(r"books", BookViewSet, basename="book")

urlpatterns = router.urls
