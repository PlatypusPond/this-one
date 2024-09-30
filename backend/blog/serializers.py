from django.contrib.auth.models import Group, User
from rest_framework import serializers
from blog.models import Post, Comment

BLOCKED = ('cunt', 'fuckwit')
BLOCKED_MSG = 'Watch your language!'

class UserSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups']


class GroupSerializers(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Group
        fields = ['url', 'name']


class CommentSerializer(serializers.ModelSerializer):
    post_id = serializers.IntegerField(write_only=True)
    approved_comment = serializers.BooleanField(default=True)
    url = serializers.HyperlinkedIdentityField(view_name='blog:comment-detail', lookup_field='pk')
    author = serializers.StringRelatedField(read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['created_date', 'post']

    def validate(self, attrs):
        print(attrs)
        request = self.context['request']
        text = attrs['text'].lower()
        if any([word in text for word in BLOCKED]):
            err = {'text': BLOCKED_MSG}
            raise serializers.ValidationError(err)
        attrs['author'] = request.user
        return attrs
    def get_author_name(self, obj):
        return obj.author.get_full_name()

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    url = serializers.HyperlinkedIdentityField(view_name='blog:post-detail', lookup_field='pk')
    author = serializers.StringRelatedField(read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['created_date', 'published_date']

    def validate(self, attrs):
        request = self.context['request']
        text = attrs['text'].lower()
        title = attrs['title'].lower()
        field_errs = {}
        if any([word in text for word in BLOCKED]):
            field_errs['text'] = BLOCKED_MSG
        if any([word in title for word in BLOCKED]):
            field_errs['title'] = BLOCKED_MSG
        if field_errs:
            raise serializers.ValidationError(field_errs)
        attrs['author'] = request.user
        return attrs

    def get_author_name(self, obj):
        return obj.author.get_full_name()


