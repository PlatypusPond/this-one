from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated


class IsAuthor(IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        user = request.user
        return obj.author == user


class IsAdminOrReadOnly(BasePermission):
    """
    The request is authenticated as a user, or is a read-only request.
    """

    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or
           (request.user and
            request.user.is_authenticated and
           (request.user.is_staff or request.user.is_superuser))
        )
