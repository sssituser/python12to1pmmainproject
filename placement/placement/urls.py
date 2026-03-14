from django.contrib import admin
from django.urls import path, include
<<<<<<< HEAD


urlpatterns = [

=======
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse   # add this

def home(request):
    return HttpResponse("Placement Backend Running")

urlpatterns = [

    path('', home),  # <-- add this

    # Django Admin
>>>>>>> f2e5c9995632b6a6eb18f2be0e802b3f47071f1f
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),
<<<<<<< HEAD

]
=======
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#     # Direct playground REST framework URL
#     #path('playground-rest/', playground_rest_framework, name='playground_rest_framework'),
#     # Serve React app for all other routes
#     #path('', serve_react_app, name='serve-react'),


#     # REST Playground page
#     #path('playground-rest/', playground_rest_framework, name='playground_rest_framework'),

#     # React Frontend
#     #path('', serve_react_app, name='serve-react'),

# ]

# # Media files
# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



>>>>>>> f2e5c9995632b6a6eb18f2be0e802b3f47071f1f
