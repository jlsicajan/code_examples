import ast
import json

from datetime import datetime
from django.http import JsonResponse
from tasks import constants
from vi_pycommon.models import tasks as task_models
from vital.models.models_voztera import Customer as customer_model
from vital.alchemy_util import require_ajax
from tasks.views.task_notification import task_helpers


@require_ajax
def save_task(request):
    """Create and return new task"""
    task_saved = save_task_in_db(request.POST, request.user)
    users_assigned = associate_users_with_task(request.POST, task_saved[constants.TaskFilters.TASK])
    if users_assigned:
        create_task_notifications(users_assigned, task_saved[constants.TaskFilters.TASK], request.user.customer)

    return JsonResponse(dict(task_info=task_saved[constants.TaskFilters.TASK_INFO], users_assigned=users_assigned))


def save_task_in_db(request_post, user):
    """ Save task """
    task_info = {}

    for key in request_post:
        if key != constants.UNDEFINED and key != constants.Task.ASSIGNED_TO:
            task_info[key] = request_post[key]

    task_info[constants.Task.LAST_MODIFIED] = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

    if task_info[constants.Task.DUE_DATE]:
        parse_due_date = datetime.strptime(task_info[constants.Task.DUE_DATE], '%m/%d/%Y')
        task_info[constants.Task.DUE_DATE] = str(parse_due_date.date())

    if user:
        task_info[constants.Task.LAST_MODIFIED_BY] = task_info[constants.Task.CREATED_BY] = user.id
        task_info[constants.Task.CUSTOMER_ID] = user.customer.id

    new_task = task_models.Task(**task_info)
    task_models.Task.save(new_task)
    task_info[constants.Task.TASK_ID] = new_task.id

    return {constants.TaskFilters.TASK_INFO: task_info, constants.TaskFilters.TASK: new_task}


def associate_users_with_task(request_post, task):
    """ Save relation in database for every user assigned"""

    assert isinstance(task, task_models.Task), ("Expected Task object in task. Given '%s'") % type(task)

    assigned = ast.literal_eval(request_post[constants.Task.ASSIGNED_TO])  # convert simple string

    users_assigned = []
    try:
        for assigned_to in assigned:
            new_relation = save_user_for_task(
                {constants.TaskFilters.USER_ID: assigned_to, constants.TaskFilters.TASK_ID: task.id})
            users_assigned.append(new_relation.user_id)
        return users_assigned
    except Exception as e:
        return False


def save_user_for_task(assignment_info):
    """Save relation in database for user and task"""
    new_relation = task_models.UserTask(**assignment_info)
    task_models.UserTask.save(new_relation)
    return new_relation


@require_ajax
def save_comment(request):
    """Create and return new task"""
    comment = {}
    for key, value in request.POST.items():
        if key != constants.UNDEFINED and key != constants.Comment.MENTIONS:
            comment[key] = value

    mentions = request.POST.get(constants.Comment.MENTIONS, '')

    comment[constants.Comment.CREATED] = str(datetime.utcnow())
    if request.user:
        comment[constants.Comment.CREATED_BY] = request.user.id

    new_comment = task_models.TaskComment(**comment)
    task_models.TaskComment.save(new_comment, user=request.user)

    task_id = comment[constants.Comment.TASK_ID]
    task_selected = task_models.Task.query.filter(task_models.Task.id == task_id).first()
    if task_selected:
        create_mentions_notification(json.loads(mentions), task_selected, request.user.customer, new_comment)
    else:
        log_error = task_helpers.SentryLog(constants.TASK_SYSTEM)
        log_error.log_sentry_error(constants.Errors.TASK_NOT_FOUND)
        return JsonResponse(dict(success=False, message=constants.Errors.TASK_NOT_FOUND))

    return JsonResponse(dict(success=True, result=new_comment.to_json(),
                             created_by_info=request.user.first_name + ' ' + request.user.last_name))


def create_task_notifications(users_assigned, task, customer):
    """Send notification to every user selected"""

    assert isinstance(users_assigned, list), ("Expected list in users_assigned. Given '%s'") % type(users_assigned)
    assert isinstance(task, task_models.Task), ("Expected Task object in task. Given '%s'") % type(task)
    assert isinstance(customer, customer_model), ("Expected Customer object in customer. Given '%s'") % type(customer)

    assign_task = task_helpers.TaskAssignment(task_id=int(task.id), users_assigned=users_assigned, customer_id=int(customer.id))
    return assign_task.assign_users()


def create_mentions_notification(mentions, task, customer, comment_information):
    """Send notification to the users whose names was mentioned in the comments"""

    assert isinstance(mentions, list), ("Expected json in mentions. Given '%s'") % type(mentions)
    assert isinstance(task, task_models.Task), ("Expected Task object in task. Given '%s'") % type(task)
    assert isinstance(comment_information, task_models.TaskComment), ("Expected TaskComment object in comment_information. Given '%s'") % type(comment_information)

    send_mentions = task_helpers.CommentMentions(task=task, mentions=mentions, customer_id=int(customer.id), comment_information=comment_information)
    return send_mentions.send_notification()
