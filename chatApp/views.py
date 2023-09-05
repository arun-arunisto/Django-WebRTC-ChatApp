from django.shortcuts import render, redirect



# Create your views here.
def home(request):
    return render(request, 'index.html')

def chat_room(request):
    if request.method == 'POST':
        name = request.POST["username"]
        if name == '':
            return redirect('home_page')
    return render(request, 'chat_room.html', {"name":name})
