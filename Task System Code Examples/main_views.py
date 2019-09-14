import json

from django.views.generic.list import ListView

from follow_up.forms import request_forms
from vi_pycommon.models.tasks import Task


# GENERIC VIEWS
class TaskListView(ListView):
    template_name = 'tasks/index.html'
    context_object_name = 'tasks'
    form_class = request_forms.AppointmentReportsFilterForm
    model = Task
    object_list = []

    def get_queryset(self, **kwargs):
        context = super(TaskListView, self).get_context_data(**kwargs)
        current_user_info = {'id': self.request.user.id, 'firstName': self.request.user.first_name,
                             'lastName': self.request.user.last_name, 'tz': self.request.user.facility.timeZone.php}
        context['current_user'] = json.dumps(current_user_info)
        return context
