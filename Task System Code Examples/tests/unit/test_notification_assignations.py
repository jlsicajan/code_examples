# coding=utf-8
import constants
import datetime
import helpers
import json
import requests
import test_constants
import time
import unittest

from django.test import client
from vi_pycommon.testing_core import factory
from tasks.views.task_notification.task_helpers import TaskAssignment


class NotificationAssignationsTest(unittest.TestCase):

    def setUp(self):
        """
        In this function we setup all the objects that are required for testing
        purpose.
        """
        self.description = 'Save the task and assign it to users'
        self.task_name = 'Task test name'
        self.task_description = 'This task is created only for testing purposes.'
        self.task_priority = 1

        self.client = client.Client()
        self.customer = factory.create_customer()
        self.customer_id = self.customer.customerId
        self.email = 'test-%s@gmail.com' % time.time()

        self.facility = factory.create_facility(customer_id=self.customer.customerId)

        self.user, self.auth_user, self.auth_user_perm = factory.create_voztera_user_and_auth_user_with_hash(
            email=self.email, username='%s' % time.time(), user_password=test_constants.USER5_PASSWORD,
            customer_id=self.customer.customerId, facility_id=self.facility.facilityId)

        self.client.login(email=self.email, password=test_constants.USER5_PASSWORD)

        client_session = self.client.session
        client_session[constants.JWT_TOKEN] = helpers.login(self.email, test_constants.USER5_PASSWORD)

        client_session.save()

    def test_assignation_user_task(self):
        now = datetime.datetime.now()
        diff = datetime.timedelta(days=30)
        future = now + diff

        post_data = dict(assignedTo='["' + str(self.user.userId) + '"]', description=self.task_description,
                         dueDate=future.strftime("%m/%d/%Y"), name=self.task_name, priority=self.task_priority)

        response = self.client.post(test_constants.SAVE_TASK, data=post_data, **{'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'})

        task_info = json.loads(response.content)

        self.users_assigned = int(task_info['users_assigned'][0])
        self.task_id = int(task_info['task_info']['id'])

        self.assertEqual(response.status_code, requests.codes.OK)
        self.assertEqual(task_info['task_info']['name'], self.task_name)
        self.assertEqual(task_info['task_info']['description'], self.task_description)
        self.assertEqual(self.users_assigned, self.user.userId)


    def tearDown(self):
        """
        In this method delete all the objects that are created for testing
        purpose.
        """

        factory.delete_user_task(self.task_id)
        factory.delete_task(self.task_id)
        factory.delete_facility(self.facility.facilityId)
        factory.delete_auth_user_auth_permission(self.auth_user_perm.id)
        factory.delete_auth_user(self.auth_user.id)
        factory.delete_user(self.user.userId, delete_customer_of_user=False)

        user_tasks = TaskAssignment(user_id=self.user.userId)
        user_tasks.delete_assigned()
