from django.urls import path, include
from rest_framework import routers

# IMPORT ALL VIEW MODULES
from . import views
from .views import auth_views, profile_views, leave_views, exam_views, playground_views, job_views
from .views import html_views, css_views, javascript_views, bootstrap_views, oracle_views, java_views, react_views, django_views, python_views, course_views
from .views import Hibernate_views, JDBC_views, Pandas_views, Reports_views, Spring_views, ai_concepts_views, android_views, api_testing_views, asp_net_mvc_views, augmented_reality_views
from .views import big_data_tools_views, c_data_structures_views, c_sharp_views, ci_cd_views, cloud_basics_views, computer_fundamentals_views, dashboards_views, data_handling_views, data_modeling_views, data_visualization_views
from .views import database_basics_views, deep_learning_views, deployment_views, docker_views, ec2_s3_views, ethereum_views, ethical_hacking_views, etl_pipelines_views, excel_views, express_js_views
from .views import flutter_react_native_views, generative_ai_views, git_github_views, google_cloud_views, iam_views, ios_swift_views, kubernetes_basics_views, machine_learning_views, microsoft_azure_views, mongodb_views
from .views import ms_office_views, ms_word_views, network_security_views, node_js_views, numpy_views, oops_cpp_views, penetration_testing_views, powerpoint_views, programming_basics_views, python_data_science_views, dotnet_views, dotnet_mvc_views
from .views import qa_processes_views, selenium_views, smart_contracts_views, virtual_reality_views, web3_views, web_apis_views

router = routers.DefaultRouter()
router.register(r'jobs', job_views.JobViewSet, basename='job')
router.register(r'applied-jobs', job_views.AppliedJobViewSet, basename='applied-job')
router.register(r'admin-jobs', job_views.AdminJobViewSet, basename='admin-job')
router.register(r'faculty-applications', job_views.FacultyApplicationsViewSet, basename='faculty-application')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    path('create-sample-applications/', job_views.CreateSampleApplicationsView.as_view(), name='create-sample-applications'),
    
    # Auth and user URLs
    path('login/', auth_views.login),
    path('login-v1/', auth_views.login),
    path('verify-login-otp/', auth_views.verify_otp),
    path('register/', auth_views.register),
    path('profile/', profile_views.profile_view),
    path('profile/update/', profile_views.update_profile),
    
    # Original playground subjects
    path('playground-questions/html/', html_views.playground_questions_html_api),
    path('playground-questions/css/', css_views.playground_questions_css_api),
    path('playground-questions/javascript/', javascript_views.playground_questions_javascript_api),
    path('playground-questions/bootstrap/', bootstrap_views.playground_questions_bootstrap_api),
    path('playground-questions/oracle/', oracle_views.playground_questions_oracle_api),
    path('playground-questions/java/', java_views.playground_questions_java_api),
    path('playground-questions/react/', react_views.playground_questions_react_api),
    path('playground-questions/django/', django_views.playground_questions_django_api),
    path('playground-questions/python/', python_views.playground_questions_api),
    
    # NEW SUBJECTS - FULLY VERIFIED SOURCE MAPPINGS (FINAL REVISION)
    path('playground-questions/ai_concepts/', ai_concepts_views.playground_questions_aiconcepts_api),
    path('playground-questions/android/', android_views.playground_questions_android_api),
    path('playground-questions/api_testing/', api_testing_views.playground_questions_apitesting_api),
    path('playground-questions/asp_net_mvc/', asp_net_mvc_views.playground_questions_aspnetmvc_api),
    path('playground-questions/augmented_reality/', augmented_reality_views.playground_questions_augmentedreality_api),
    path('playground-questions/big_data_tools/', big_data_tools_views.playground_questions_bigdatatools_api),
    path('playground-questions/c_data_structures/', c_data_structures_views.playground_questions_cdata_api),
    path('playground-questions/c_sharp/', c_sharp_views.playground_questions_csharp_api),
    path('playground-questions/ci_cd/', ci_cd_views.playground_questions_cicd_api),
    path('playground-questions/cloud_basics/', cloud_basics_views.playground_questions_cloudbasics_api),
    path('playground-questions/computer_fundamentals/', computer_fundamentals_views.playground_questions_computerfundamentals_api),
    path('playground-questions/dashboards/', dashboards_views.playground_questions_dashboards_api),
    path('playground-questions/data_handling/', data_handling_views.playground_questions_datahandling_api),
    path('playground-questions/datamodeling/', data_modeling_views.playground_questions_datamodeling_api),
    path('playground-questions/data_visualization/', data_visualization_views.playground_questions_datavis_api),
    path('playground-questions/database_basics/', database_basics_views.playground_questions_dbbasics_api),
    path('playground-questions/deep_learning/', deep_learning_views.playground_questions_deeplearning_api),
    path('playground-questions/deployment/', deployment_views.playground_questions_deployment_api),
    path('playground-questions/docker/', docker_views.playground_questions_docker_api),
    path('playground-questions/ec2_s3/', ec2_s3_views.playground_questions_ec2s3_api),
    path('playground-questions/ethereum/', ethereum_views.playground_questions_ethereum_api),
    path('playground-questions/ethical_hacking/', ethical_hacking_views.playground_questions_ethicalhacking_api),
    path('playground-questions/etl_pipelines/', etl_pipelines_views.playground_questions_etlpipes_api),
    path('playground-questions/excel/', excel_views.playground_questions_excel_api),
    path('playground-questions/express_js/', express_js_views.playground_questions_expressjs_api),
    path('playground-questions/flutter_react_native/', flutter_react_native_views.playground_questions_flutterreactnative_api),
    path('playground-questions/generative_ai/', generative_ai_views.playground_questions_generativeai_api),
    path('playground-questions/git_github/', git_github_views.playground_questions_gitgithub_api),
    path('playground-questions/google_cloud/', google_cloud_views.playground_questions_gcp_api),
    path('playground-questions/hibernate/', Hibernate_views.playground_questions_hibernate_api),
    path('playground-questions/iam/', iam_views.playground_questions_iam_api),
    path('playground-questions/ios_swift/', ios_swift_views.playground_questions_iosswift_api),
    path('playground-questions/jdbc/', JDBC_views.playground_questions_jdbc_api),
    path('playground-questions/kubernetes_basics/', kubernetes_basics_views.playground_questions_k8sbasics_api),
    path('playground-questions/machine_learning/', machine_learning_views.playground_questions_ml_api),
    path('playground-questions/microsoft_azure/', microsoft_azure_views.playground_questions_azure_api),
    path('playground-questions/mongodb/', mongodb_views.playground_questions_mongodb_api),
    path('playground-questions/ms_office/', ms_office_views.playground_questions_msoffice_api), # FIXED
    path('playground-questions/ms_word/', ms_word_views.playground_questions_msword_api), # FIXED
    path('playground-questions/network_security/', network_security_views.playground_questions_networksecurity_api),
    path('playground-questions/node_js/', node_js_views.playground_questions_nodejs_api),
    path('playground-questions/numpy/', numpy_views.playground_questions_numpy_api),
    path('playground-questions/oops_cpp/', oops_cpp_views.playground_questions_oopscpp_api),
    path('playground-questions/pandas/', Pandas_views.playground_questions_pandas_api),
    path('playground-questions/penetration_testing/', penetration_testing_views.playground_questions_penetrationtesting_api), # FIXED
    path('playground-questions/powerpoint/', powerpoint_views.playground_questions_powerpoint_api),
    path('playground-questions/programming_basics/', programming_basics_views.playground_questions_probasics_api),
    path('playground-questions/python_data_science/', python_data_science_views.playground_questions_py_datascience_api),
    path('playground-questions/qa_processes/', qa_processes_views.playground_questions_qaprocesses_api),
    path('playground-questions/reports/', Reports_views.playground_questions_reports_api),
    path('playground-questions/selenium/', selenium_views.playground_questions_selenium_api),
    path('playground-questions/smart_contracts/', smart_contracts_views.playground_questions_smartcontracts_api),
    path('playground-questions/spring/', Spring_views.playground_questions_spring_api),
    path('playground-questions/virtual_reality/', virtual_reality_views.playground_questions_virtualreality_api),
    path('playground-questions/web3/', web3_views.playground_questions_web3_api),
    path('playground-questions/web_apis/', web_apis_views.playground_questions_webapis_api),
    path('playground-questions/dotnet/', dotnet_views.playground_questions_dotnet_api),
    path('playground-questions/dotnet_mvc/', dotnet_mvc_views.playground_questions_dotnet_mvc_api),

    # Results API
    path('all-exam-results/', python_views.exam_reports_api),
    path('user-combined-results/', python_views.user_combined_results_api),
    path('save-exam-report/', python_views.save_exam_report_api),
    path('exam-report-detail/<int:pk>/', python_views.exam_report_detail_api),
    path('delete-exam-report/<int:pk>/', python_views.delete_exam_report_api),
    path('leaderboard/', python_views.leaderboard_api),
    path('weekly-exam-results/', python_views.weekly_exam_reports_api),
    path('monthly-exam-results/', python_views.monthly_exam_reports_api),
]
