"""
    All constants used for the Follow Up application will be contained in this module
"""

ADVANCED_MD = 2
UNDEFINED = 'undefined'
TASK_SYSTEM = 'Task System'


class Task(object):
    ASSIGNED_TO = 'assignedTo'
    LAST_MODIFIED = 'lastModified'
    LAST_MODIFIED_BY = 'lastModifiedBy'
    CREATED_BY = 'createdBy'
    TASK_ID = 'id'
    DUE_DATE = 'dueDate'
    CUSTOMER_ID = 'customerId'


class Comment(object):
    CREATED = 'created'
    CREATED_BY = 'createdBy'
    MENTIONS = 'mentions'
    TASK_ID = 'taskId'


class Priority(object):
    NO_PRIORITY = 4
    HIGH = 1
    MEDIUM = 2
    LOW = 3


PRIORITY_NAME = {
    Priority.NO_PRIORITY: 'NO PRIORITY',
    Priority.HIGH: 'HIGH',
    Priority.MEDIUM: 'MEDIUM',
    Priority.LOW: 'LOW',
}

PRIORITY_IDS = dict(zip(PRIORITY_NAME.values(), PRIORITY_NAME.keys()))


class Status(object):
    PENDING = 1
    IN_PROGRESS = 2
    DONE = 3
    ARCHIVED = 4


class TaskFilters(object):
    USER_ID = 'user_id'
    TASK_ID = 'task_id'
    TASK_INFO = 'task_info'
    TASK = 'task'


class Errors(object):
    TASK_NOT_FOUND = 'Task Not Found'
    COMMENT_NOT_FOUND = 'Comment Not Found'

