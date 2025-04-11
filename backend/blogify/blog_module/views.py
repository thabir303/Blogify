# backend/blogify/blog_module/views.py
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response 
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Blog,Comment
from .serializers import BlogSerializer,CommentSerializer,ReplySerializer
from .tasks import send_comment_notification_email
from rest_framework.pagination import PageNumberPagination

class BlogPagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 100

class BlogListView(APIView):
    permission_classes = [AllowAny]
    pagination_class = BlogPagination

    def get(self, request):
        paginator = self.pagination_class()
        
        if request.user.is_authenticated:
            published_blogs = Blog.objects.filter(status=Blog.PUBLISHED).select_related('author')
            draft_blogs = Blog.objects.filter(author=request.user, status=Blog.DRAFT).select_related('author')
            
            filter_status = request.query_params.get('status')
            if filter_status:
                if filter_status == 'published':
                    blogs = published_blogs.order_by('-updated_at')
                elif filter_status == 'draft':
                    blogs = draft_blogs.order_by('-updated_at')
                elif filter_status == 'myblogs':
                    blogs = Blog.objects.filter(author=request.user).select_related('author').order_by('-updated_at')
                elif filter_status == 'all':
                    combined_queryset = published_blogs.union(draft_blogs)
                    blogs = combined_queryset.order_by('-updated_at')
            else:
                combined_queryset = published_blogs.union(draft_blogs)
                blogs = combined_queryset.order_by('-updated_at')
        else:
            blogs = Blog.objects.filter(status=Blog.PUBLISHED).select_related('author').order_by('-updated_at')
        
        page = paginator.paginate_queryset(blogs, request)
        
        if page is not None:
            serializer = BlogSerializer(page, many=True)
            result = paginator.get_paginated_response(serializer.data)
            return Response({
                'success': True,
                'data': serializer.data,
                'count': result.data['count'],
                'next': result.data['next'],
                'previous': result.data['previous'],
                'total_pages': (result.data['count'] + paginator.page_size - 1) // paginator.page_size
            }, status=status.HTTP_200_OK)
        
        serializer = BlogSerializer(blogs, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)

class BlogCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request):
        serializer = BlogSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            response = Response({
                'blog':serializer.data,
                'success':True,
                'message': 'Blog created successfully.',
            },status = status.HTTP_201_CREATED)
            return response
        return Response({
            'success':False,
            'errors': serializer.errors
            }, 
            status=status.HTTP_400_BAD_REQUEST)

class BlogDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, blog_id):
        try:
            blog =Blog.objects.get(id=blog_id)

            if blog.status == Blog.DRAFT and blog.author != request.user:
                response = Response({'success': False,
                                     'message': 'Draft blog only view by Author'
                                    }, status = status.HTTP_403_FORBIDDEN)
                return response
            
            serializer = BlogSerializer(blog)
            comments = Comment.objects.filter(blog=blog, parent = None).select_related('user')
            comment_data = CommentSerializer(comments, many = True).data
            response = Response({
                'success': True,
                'blog': serializer.data,
                'comments': comment_data
            },status = status.HTTP_200_OK)
            return response
        except Blog.DoesNotExist:
            return Response({'success': False,'message': 'Blog not found'}, status = status.HTTP_404_NOT_FOUND)

class BlogEditView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id, author = request.user)

            if blog.status == Blog.PUBLISHED and request.data.get('status') == Blog.DRAFT:
                response = Response({
                    'success': False,
                    'message': 'Published posts cannot be changed to draft mood.'
                }, status=status.HTTP_400_BAD_REQUEST)
                return response


            serializer = BlogSerializer(blog, data = request.data)
            if serializer.is_valid():
                serializer.save()
                response = Response({
                    'success' : True,
                    'message' : 'Blog updated successfully.',
                    'blog' : serializer.data
                },status= status.HTTP_200_OK)
                return response
            return Response({
                'success': False,
                'errors':serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST)
        except Blog.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Blog not found'
            },
            status= status.HTTP_404_NOT_FOUND)
        
class BlogDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, blog_id):
        try:
            blog = Blog.objects.get(id=blog_id, author = request.user)
            blog.delete()
            response = Response({
                'success': True,
                'message': 'Blog deleted successfully.'
            }, status= status.HTTP_200_OK)
            return response
        
        except Blog.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Blog not found'
            },
            status= status.HTTP_404_NOT_FOUND)
        
class CommentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, blog_id):

        try:
            blog = Blog.objects.get(id=blog_id)

            if not request.user.is_authenticated:
                response = Response({
                    'success': False,
                    'message': 'You must be logged in to comment.',
                }, status = status.HTTP_401_UNAUTHORIZED)
                return response

            serializer = CommentSerializer(data = request.data)
            if serializer.is_valid():
                comment = serializer.save(blog=blog, user = request.user)

                send_comment_notification_email.delay(
                    blog_id=blog.id,
                    commenter_username=request.user.username,
                    comment_content = comment.content)
                
                response = Response({
                    'success': True,
                    'message': 'Comment added successfully.',
                    'comment': CommentSerializer(comment).data,
                    # 'username':CommentSerializer(comment).data.user.username,
                }, status = status.HTTP_201_CREATED)
                return response
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST) 
        
        except Blog.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Blog not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
class CommentReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, comment_id):
        try:
            parent_comment = Comment.objects.get(id=comment_id)

            serializer = ReplySerializer(data=request.data)
            if serializer.is_valid():
                reply = serializer.save( user =request.user,
                                        blog=parent_comment.blog,
                                        parent = parent_comment
                                        )
                response = Response({
                    'success':True,
                    'message':'Reply added successfully.',
                    'reply':ReplySerializer(reply).data
                }, status=status.HTTP_201_CREATED)
                return response
        except Comment.DoesNotExist:
            return Response({
                'success':False,
                'message':'Comment not found',
            }, status = status.HTTP_404_NOT_FOUND)
            