# backend/blogify/blog_module/serializers.py
from rest_framework import serializers
from .models import Blog, Comment

class BlogSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only =True)

    class Meta:
        model = Blog
        fields = ['id','author','title','content','status','created_at','updated_at']
        # extra_kwargs = {
        #     'author' : { 'required': False }
        # }

    # def create(self, validated_data):
    #     validated_data['author'] = self.context['request'].user
    #     return super().create(validated_data)
    
        
class ReplySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id','user','username','content','created_at']
        extra_kwargs = {
            'user' : { 'required' : False},
            # 'blog' : { 'required' : False},
        }
class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    replies = ReplySerializer(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = ['id','user','username','blog','content','created_at','replies','parent']

        extra_kwargs = {
            'user' : { 'required' : False},
            'blog' : { 'required' : False},
        }

        # def create(self,validated_data):
        #     validated_data['user'] = self.context['request'].user
        #     return super().create(validated_data)
