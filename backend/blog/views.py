from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets, mixins
from .serializers import GroupSerializers, UserSerializer, PostSerializer, CommentSerializer
from .models import Post, Comment
from core.permissions import  IsAdminOrReadOnly, IsAuthor

#
# def post_list(request):
#     posts = Post.objects.filter(published_date__lte=timezone.now()).order_by('published_date')
#     return render(request, 'blog/templates/blog/post_list.html', {'posts': posts})
#
# def post_detail(request,pk):
#     post = get_object_or_404(Post, pk=pk)
#     return render(request, 'blog/templates/blog/post_detail.html', {'post': post})
#
# def add_comment_to_post(request, pk):
#     post = get_object_or_404(Post, pk=pk)
#     if request.method == "POST":
#         form = CommentForm(request.POST)
#         if form.is_valid():
#             comment = form.save(commit=False)
#             comment.post = post
#             comment.save()
#             return redirect('post_detail', pk=post.pk)
#     else:
#         form = CommentForm()
#     return render(request, 'blog/templates/blog/add_comment_to_post.html', {'form': form})
#
# @login_required
# def comment_approve(request, pk):
#     comment = get_object_or_404(Comment, pk=pk)
#     comment.approve()
#     return redirect('post_detail', pk=comment.post.pk)
#
# @login_required
# def comment_remove(request, pk):
#     comment = get_object_or_404(Comment, pk=pk)
#     comment.delete()
#     return redirect('post_detail', pk=comment.post.pk)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-published_date', '-created_date')
    serializer_class = PostSerializer
    permissions_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if not user or not user.is_staff:
            qs = qs.filter(published_date__isnull=False)
        return qs


class CommentViewSet(mixins.CreateModelMixin,
                     mixins.UpdateModelMixin,
                     mixins.DestroyModelMixin,
                     viewsets.GenericViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthor] #needs object permissions


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows user to be viewed or edited
    """
    queryset = User.objects.all().order_by('date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows group to be viewed or edited
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializers
    permission_classes = [permissions.IsAuthenticated]

