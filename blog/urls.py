from django.urls import path
from .import views
from django.urls import include, path
from rest_framework import routers

urlpatterns = [
    path('',views.post_list,name='post_list'),
    path('post/<int:pk>',views.post_detail,name='post_detail'),
path('post/<int:pk>/comment/', views.add_comment_to_post, name='add_comment_to_post'),
path('comment/<int:pk>/approve/', views.comment_approve, name='comment_approve'),
path('comment/<int:pk>/remove/', views.comment_remove, name='comment_remove'),
]

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns += [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

urlpatterns += router.urls