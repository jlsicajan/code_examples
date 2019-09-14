# coding=utf-8
import constants
import helpers
import requests
import test_constants
import time
import unittest

from django.test import client
from vi_pycommon.testing_core import factory


class TaskFiltersTest(unittest.TestCase):

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
        self.customer_id = 2
        self.email = 'test-%s@gmail.com' % time.time()
        self.facility = factory.create_facility(customer_id=self.customer_id)

        self.user, self.auth_user, self.auth_user_perm = factory.create_voztera_user_and_auth_user_with_hash(
            email=self.email,
            username='%s' % time.time(),
            user_password=test_constants.USER5_PASSWORD,
            customer_id=self.customer_id,
            facility_id=self.facility.facilityId)

        self.client.login(email=self.email,
                          password=test_constants.USER5_PASSWORD)

        client_session = self.client.session
        client_session[constants.JWT_TOKEN] = helpers.login(
            self.email, test_constants.USER5_PASSWORD)
        client_session.save()

    def test_assignation_user_task(self):
        post_data = dict(current_task_page=1)

        response = self.client.post(test_constants.TASK_FILTERS, data=post_data, **{'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'})

        self.assertEqual(response.status_code, requests.codes.OK)

    def tearDown(self):
        """
        In this method delete all the objects that are created for testing
        purpose.
        """
        factory.delete_facility(self.facility.facilityId)
        factory.delete_auth_user_auth_permission(self.auth_user_perm.id)
        factory.delete_auth_user(self.auth_user.id)
        factory.delete_user(self.user.userId, delete_customer_of_user=False)
