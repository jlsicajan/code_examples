import ast
import pytz
from datetime import datetime, timedelta

from django.http import JsonResponse
from sqlalchemy.sql import functions
from sqlalchemy import asc, or_, desc
from sqlalchemy.orm import aliased

from follow_up import constants
from tasks import constants as task_constants
from follow_up.common import get_last_month_data
from vi_pycommon.models import tasks as task_models
from vi_pycommon.models.user import User

from vital.alchemy_util import require_ajax


@require_ajax
def load_users_for_task(request, task_id):
    task_users = task_models.UserTask.query.join(User, task_models.UserTask.user_id == User.userId).filter(
        task_models.UserTask.task_id == task_id).with_entities(
        User.userId, functions.concat(User.firstName, User.LastName)).all()
    return JsonResponse(dict(task_users))


@require_ajax
def load_comments(request, task_id):
    comments_filtered = task_models.TaskComment.query.filter(task_models.TaskComment.taskId == task_id).all()

    result = []
    for comment in comments_filtered:
        comment_info = comment.to_json()
        comment_info['created_by_info'] = comment.createdByUser.firstName + ' ' + comment.createdByUser.LastName
        result.append(comment_info)

    return JsonResponse(dict(results=result))


@require_ajax
def get_tasks_with_filter(request):
    filters = {}
    for key in request.POST:
        filters[key] = request.POST[key]
    page = filters['current_task_page'] if filters.has_key('current_task_page') else 1
    result_count = 10
    off_set = (int(page) - 1) * result_count

    task_filtered = task_models.Task.query.filter(task_models.Task.customerId == request.user.customer.id)
    if filters.has_key('filter_by_priority'):
        filter_by_priority = ast.literal_eval(filters['filter_by_priority'])
        task_filtered = task_filtered.filter(task_models.Task.priority.in_(filter_by_priority))

    if filters.has_key('filter_by_archived'):
        filter_by_archived = ast.literal_eval(filters['filter_by_archived'])
        task_filtered = task_filtered.filter(task_models.Task.status.in_(filter_by_archived))
    else:
        task_filtered = task_filtered.filter(task_models.Task.status != task_constants.Status.ARCHIVED)

    if filters.has_key('filter_by_status'):
        filter_by_status = ast.literal_eval(filters['filter_by_status'])
        task_filtered = task_filtered.filter(task_models.Task.status.in_(filter_by_status))

    if filters.has_key('filter_by_created_date'):
        my_timezone = request.session.get('timezone')

        request_date_filter_start = ''
        request_date_filter_end = ''

        request_date_filter = filters['filter_by_created_date'].lower()

        if request_date_filter == 'today':
            request_date_filter_start = datetime.today().strftime(constants.FORM_INPUT_DATE_FORMAT)
            request_date_filter_end = datetime.today().strftime(constants.FORM_INPUT_DATE_FORMAT)
        elif request_date_filter == 'yesterday':
            request_date_filter_start = (datetime.today() - timedelta(days=1)).strftime(constants.FORM_INPUT_DATE_FORMAT)
            request_date_filter_end = (datetime.today() - timedelta(days=1)).strftime(constants.FORM_INPUT_DATE_FORMAT)
        elif request_date_filter == 'this week':
            today = datetime.today()
            start = (today - timedelta(days=today.weekday()))
            request_date_filter_start = start.strftime(constants.FORM_INPUT_DATE_FORMAT)
            request_date_filter_end = (start + timedelta(days=6)).strftime(constants.FORM_INPUT_DATE_FORMAT)
        elif request_date_filter == 'last week':
            today = datetime.today()
            request_date_filter_start = (today + timedelta(-today.weekday(), weeks=-1)).strftime(constants.FORM_INPUT_DATE_FORMAT)
            request_date_filter_end = (today + timedelta(-today.weekday() - 1)).strftime(constants.FORM_INPUT_DATE_FORMAT)
        elif request_date_filter == 'this month':
            next_month = datetime.today().replace(day=28) + timedelta(days=4)
            start, end = get_last_month_data(next_month)
            request_date_filter_start = start.strftime(constants.FORM_INPUT_DATE_FORMAT)
            request_date_filter_end = end.strftime(constants.FORM_INPUT_DATE_FORMAT)
        elif request_date_filter == 'last month':
            start, end = get_last_month_data(datetime.today())
            request_date_filter_start = start.strftime(constants.FORM_INPUT_DATE_FORMAT)
            request_date_filter_end = end.strftime(constants.FORM_INPUT_DATE_FORMAT)
        else:
            request_date_filter_start = request_date_filter.split(' - ')[0].strip()
            request_date_filter_end = request_date_filter.split(' - ')[1].strip()

            request_date_filter_start = request_date_filter_start.strptime(request_date_filter_start, constants.FORM_INPUT_DATE_FORMAT)
            request_date_filter_end = request_date_filter_end.strptime(request_date_filter_end, constants.FORM_INPUT_DATE_FORMAT)

            request_date_filter_start = request_date_filter_start.strftime(constants.FORM_INPUT_DATE_FORMAT)
            request_date_filter_end = request_date_filter_end.strftime(constants.FORM_INPUT_DATE_FORMAT)

        if request_date_filter_start not in constants.NULLS:
            naive_date = datetime.strptime(request_date_filter_start, constants.FORM_INPUT_DATE_FORMAT)

            local_timezone = pytz.timezone(my_timezone)
            local_dt = local_timezone.localize(naive_date)
            utc_date = local_dt.astimezone(pytz.utc)
            utc_date = utc_date.strftime('%Y-%m-%d %H:%M:%S')

            task_filtered = task_filtered.filter(task_models.Task.dueDate >= utc_date)

        if request_date_filter_end not in constants.NULLS:
            naive_date = datetime.strptime(request_date_filter_end, constants.FORM_INPUT_DATE_FORMAT).replace(hour=23, minute=59)

            local_timezone = pytz.timezone(my_timezone)
            local_dt = local_timezone.localize(naive_date)
            utc_date = local_dt.astimezone(pytz.utc)
            utc_date = utc_date.strftime('%Y-%m-%d %H:%M:%S')

            task_filtered = task_filtered.filter(task_models.Task.dueDate <= utc_date)

    if filters.has_key('filter_by_created_by'):
        created_by_assignment = ast.literal_eval(filters['filter_by_created_by'])
        task_filtered = task_filtered.filter(task_models.Task.createdBy.in_(created_by_assignment))
    if filters.has_key('filter_by_assigned_to'):
        filter_by_assignment = ast.literal_eval(filters['filter_by_assigned_to'])
        task_filtered = task_filtered.join(task_models.UserTask,
                                           task_models.UserTask.task_id == task_models.Task.id).filter(
            task_models.UserTask.user_id.in_(filter_by_assignment)).group_by(task_models.UserTask.task_id)
    if filters.has_key('filter_by_unassigned'):
        filter_by_no_assignment = ast.literal_eval(filters['filter_by_unassigned'])

        aliased_user_task = aliased(task_models.UserTask)

        task_filtered = task_filtered.join(aliased_user_task, aliased_user_task.task_id == task_models.Task.id).filter(
            ~aliased_user_task.user_id.in_(filter_by_no_assignment)).group_by(aliased_user_task.task_id)
    if filters.has_key('task_id'):
        task_filtered = task_filtered.filter(task_models.Task.id == filters['task_id'])
    if filters.has_key('name'):
        task_filtered = task_filtered.filter(task_models.Task.name == filters['name'])

    more = task_filtered.count()
    task_filtered = task_filtered.order_by(desc(task_models.Task.created)).offset(off_set).limit(result_count).all()

    return JsonResponse(dict(result=[task.to_json() for task in task_filtered], more=more,
                             tz=request.user.facility.timeZone.php))


@require_ajax
def get_comment_with_filter(request):
    comment_id = request.POST.get('comment_id', 0)

    try:
        comment_information = task_models.TaskComment.get(comment_id)
        return JsonResponse(dict(success=True, message_not_found=False, result=comment_information.to_json(), tz=request.user.facility.timeZone.php))
    except Exception as e:
        return JsonResponse(dict(success=False, message_not_found=True, message=task_constants.Errors.COMMENT_NOT_FOUND))


@require_ajax
def get_panel_information(request):
    task_filtered = task_models.Task.query.filter(task_models.Task.customerId == request.user.customer.id).filter(
        task_models.Task.status != task_constants.Status.ARCHIVED)
    result = {}
    result['high_priority_tasks'] = task_filtered.filter(task_models.Task.priority == task_constants.Priority.HIGH).count()
    result['medium_priority_task'] = task_filtered.filter(task_models.Task.priority == task_constants.Priority.MEDIUM).count()
    result['low_priority_task'] = task_filtered.filter(task_models.Task.priority == task_constants.Priority.LOW).count()

    result['logged_in_user'] = task_filtered.filter(task_models.Task.createdBy == request.user.id).count()
    result['assigned'] = task_filtered.join(task_models.UserTask,
                                            task_models.UserTask.task_id == task_models.Task.id).filter(
        task_models.UserTask.user_id == request.user.id).group_by(task_models.UserTask.task_id).count()
    result['unassigned'] = task_filtered.join(task_models.UserTask,
                                              task_models.UserTask.task_id == task_models.Task.id).filter(
        task_models.UserTask.user_id != request.user.id).group_by(task_models.UserTask.task_id).count()

    result['pending'] = task_filtered.filter(task_models.Task.status == task_constants.Status.PENDING).count()
    result['in_progress'] = task_filtered.filter(task_models.Task.status == task_constants.Status.IN_PROGRESS).count()
    result['done'] = task_filtered.filter(task_models.Task.status == task_constants.Status.DONE).count()
    result['archived'] = task_filtered.filter(task_models.Task.status == task_constants.Status.ARCHIVED).count()
    return JsonResponse(dict(result))


@require_ajax
def uncompleted_task_filter(request):
    task_ids = ast.literal_eval(request.POST.get('task_ids', []))

    task_status = task_models.Task.query.filter(task_models.Task.id.in_(task_ids)).filter(task_models.Task.status != task_constants.Status.DONE)

    count = task_status.count()
    mentions_list = task_status.all()

    return JsonResponse(dict(mentions_list=[task.to_json() for task in mentions_list], count=count))

