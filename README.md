# Django-WebRTC-ChatApp


Django based WebRTC chatApp, this app have the option like share screen and text chat option also
we are using django channels for async connection, by using channels we are making changes in <code>asgi.py</code> file, and we are adding <code>consumers.py</code> and <code>routing.py</code> file.<br>
In <code>asgi.py</code> we are enabling the protocols and websocket, and in <code>routing.py</code> we are routing the urlpatterns of the websocket, and in <code>consumers.py</code> we are adding the AsyncWebsocket configurations.
<br>
The use of django in this project for getting the request from client to server make an async connection, it will help multiple client can connect at a same time.<br>
For audio, video, data transfer we are using Javascript, for enable audio, video in our browser.
