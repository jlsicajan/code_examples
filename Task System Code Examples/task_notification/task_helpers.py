import tasks.constants as task_constants
import hmac
import hashlib
import json
import logging
import requests
import random
import string
import time

from django.conf import settings
from django.http import JsonResponse
from vi_pycommon.models import tasks as task_models


class TaskHelperBase(object):
    """
    This will be the base class for all the functions below
    """
    def __init__(self, **kwargs):
        self.task_id = kwargs.get('task_id', '')
        self.user_id = kwargs.get('user_id', '')
        self.customer_id = kwargs.get('customer_id', '')
        self.users_assigned = kwargs.get('users_assigned', False)

    def generate_pay_load(self, data, key):
        """
        :param data: Data to be included in payload
        :param key: Customer Api Key
        :return: payload
        """
        possible_random_characters = string.digits + string.letters
        possible_random_characters += '''!#$%&*+-<=>?@[]_`{|}~'''
        token = ''.join(random.choice(possible_random_characters) for _ in range(50))
        timestamp = int(time.time())
        hex_digest = hmac.new(key=str(key), msg='%s%s' % (timestamp, token), digestmod=hashlib.sha256).hexdigest()
        payload = dict(timestamp=timestamp, signature=str(hex_digest), token=token)
        payload.update(data)
        return json.dumps(payload)

    def log_sentry_error(self, error_message):
        sentry_logger = logging.getLogger('sentry_logger')
        sentry_logger.error(error_message, extra={
            'data': self.system_error
        })

        return JsonResponse(dict(result='success'))


class TaskAssignment(TaskHelperBase):
    """
    This will save task users assignments in Firebase
    """

    def assign_users(self):
        assert isinstance(self.task_id, int), ("Expected int in task_id. Given '%s'") % type(self.task_id)
        assert isinstance(self.customer_id, int), ("Expected int in customer_id. Given '%s'") % type(self.customer_id)
        assert isinstance(self.users_assigned, list), ("Expected list in users_assigned. Given '%s'") % type(self.users_assigned)
        assert isinstance(self.users_assigned, list), ("Expected list in users_assigned. Given '%s'") % type(
            self.users_assigned)

        data = self.generate_pay_load(dict(task_id=self.task_id, users_assigned=self.users_assigned, customer_id=self.customer_id),
                                      settings.FIREBASE_SERVICE_KEY,)

        headers = {'content-type': 'application/json'}
        response = requests.request('POST', settings.TASK_ASSIGN_TASK_USERS_URL, data=data, headers=headers)

        if response.status_code == requests.codes.ok:
            return JsonResponse(dict(result=response.content))
        else:
            self.log_sentry_error(response.content)
            return JsonResponse(dict(result=''))

    def delete_assigned(self):
        assert self.user_id > 0 or len(self.user_id) > 0, ("Expected no empty in user_id")

        data = self.generate_pay_load(dict(user_id=self.user_id), settings.FIREBASE_SERVICE_KEY)

        headers = {'content-type': 'application/json'}
        response = requests.request('POST', settings.USERS_DELETE_TASK_ASSIGNED_URL, data=data, headers=headers)

        if response.status_code == requests.codes.ok:
            return JsonResponse(dict(result=response.content))
        else:
            self.log_sentry_error(response.content)
            return JsonResponse(dict(result=''))


class CommentMentions(TaskHelperBase):
    """
       This will save task users assignments in Firebase
       """

    def __init__(self, **kwargs):
        self.task = kwargs.get('task', '')
        self.mentions = kwargs.get('mentions', '')
        self.customer_id = kwargs.get('customer_id', '')
        self.comment_information = kwargs.get('comment_information', '')

    def send_notification(self):
        assert isinstance(self.task, task_models.Task), ("Expected Task object in task. Given '%s'") % type(self.task)
        assert isinstance(self.mentions, list), ("Expected list in mentions. Give '%s'") % type(self.mentions)
        assert isinstance(self.customer_id, int), ("Expected int customer_id. Given '%s'") % type(self.customer_id)
        assert isinstance(self.comment_information, task_models.TaskComment), ("Expected TaskComment object int comment_information. Given '%s'") % type(self.comment_information)

        data = self.generate_pay_load(dict(task_id=self.task.id, mentions=self.mentions,
                                           customer_id=self.customer_id, comment_id=self.comment_information.id,
                                           created_at=self.comment_information.created), settings.FIREBASE_SERVICE_KEY)

        headers = {'content-type': 'application/json'}
        response = requests.request('POST', settings.MENTIONS_USERS_URL, data=data, headers=headers)

        if response.status_code == requests.codes.ok:
            return JsonResponse(dict(result=response.content))
        else:
            self.log_sentry_error(response.content)
            return JsonResponse(dict(result=''))


class SentryLog(object):
    """
    This will log any error in Sentry
    """

    def __init__(self, **kwargs):
        self.system_error = kwargs.get('system_error', task_constants.TASK_SYSTEM)

    def log_sentry_error(self, error_message):
        sentry_logger = logging.getLogger('sentry_logger')
        sentry_logger.error(error_message, extra={
            'data': self.system_error
        })

        return JsonResponse(dict(result='success'))

