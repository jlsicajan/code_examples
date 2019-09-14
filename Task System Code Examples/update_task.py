import ast
import simplejson

from datetime import datetime
from django.http import HttpResponse, JsonResponse
from sqlalchemy.orm.exc import NoResultFound

from vi_pycommon.models import tasks as task_models
from vital.alchemy_util import require_ajax


@require_ajax
def update_status(request):
    """Update status and return task updated"""
    task_id = request.POST.get('task_id', 0)
    new_status = request.POST.get('new_status', 0)

    search_task = task_models.Task.query.filter(task_models.Task.id == task_id).first()
    if not search_task:
        return HttpResponse(simplejson.dumps({'success': False}))

    search_task.update(user=request.user, status=new_status, lastModifiedBy=request.user.id,
                       lastModified=str(datetime.utcnow()))

    return JsonResponse({
        'status': new_status,
        'lastModifiedBy': request.user.id,
        'lastModified': str(datetime.utcnow())
    })


@require_ajax
def update_task(request):
    """Update task and return task updated"""
    task_id = request.POST.get('task_id', 0)
    modal_description = request.POST.get('description')
    modal_due_date = request.POST.get('dueDate')
    modal_name = request.POST.get('name')
    modal_priority = request.POST.get('priority')

    try:
        search_task = task_models.Task.query.filter(task_models.Task.id == task_id).first()
    except NoResultFound:
        return HttpResponse(simplejson.dumps({'success': False}))

    search_task.update(user=request.user, lastModifiedBy=request.user.id, lastModified=str(datetime.utcnow()),
                       description=modal_description, dueDate=modal_due_date, name=modal_name, priority=modal_priority)

    return JsonResponse({
        'lastModifiedBy': request.user.id,
        'lastModified': str(datetime.utcnow())
    })


@require_ajax
def delete_task(request):
    """Delete task and return result"""
    task_id = request.POST.get('task_id', 0)
    try:
        search_task = task_models.Task.query.filter(task_models.Task.id == task_id)
        task_comments = task_models.TaskComment.query.filter(task_models.TaskComment.taskId == task_id)
        task_users = task_models.UserTask.query.filter(task_models.UserTask.task_id == task_id)
    except NoResultFound:
        return HttpResponse(simplejson.dumps({'success': False}))

    if task_users.delete() and task_comments.delete() and search_task.delete():
        return HttpResponse(simplejson.dumps({'success': True, 'message': 'Task has been successfully deleted.'}))
    else:
        return HttpResponse(simplejson.dumps({'success': False, 'message': 'Operation failed.'}))
