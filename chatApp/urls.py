from django.urls import path
from .views import home, chat_room
urlpatterns = [
    path('', home, name="home_page"),
    path('chat_room/', chat_room, name='chat_room')
]