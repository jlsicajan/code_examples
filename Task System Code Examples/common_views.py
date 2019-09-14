from django.http.response import JsonResponse
from django.views.generic.base import View
from sqlalchemy.sql import functions
from sqlalchemy.sql.expression import func

from vi_pycommon.models.user import User


class UserSearchResults(View):

    def get(self, request, **kwargs):
        """This method will return users results in JSON format
        :param request:
        :return JSON response
        """
        user_to_search = request.GET.get('term', '')
        page = int(request.GET.get('page', 1))
        page_limit = int(request.GET.get('page_limit', 25))
        query = User.query.filter(User.customerId == request.user.customer_id,
                                  User.isActive == 1,
                                  functions.concat(User.firstName, ' ', User.LastName).startswith(user_to_search))

        order_by_clause = functions.concat(User.firstName, ' ', User.LastName)

        total_users = query.with_entities(func.count('*')).scalar()
        offset = (page - 1) * page_limit

        query = query.order_by(order_by_clause).with_entities(
            User.userId, User.firstName, User.LastName).offset(offset).limit(page_limit)

        users = query.all()

        users = [{'id': user_find.userId, 'text': user_find.firstName + ' ' + user_find.LastName}
                 for user_find in users]

        return JsonResponse(dict(users=users, total=total_users))


class UserMentionSearchResults(View):
    def post(self, request, **kwargs):
        """This method will return users results in JSON format
        :param request:
        :return JSON response
        """
        user_to_search = request.POST.get('term', False)
        query = User.query.filter(User.customerId == request.user.customer_id,
                                  User.isActive == 1,
                                  functions.concat(User.firstName, ' ', User.LastName).startswith(user_to_search))

        order_by_clause = functions.concat(User.firstName, ' ', User.LastName)

        query = query.order_by(order_by_clause).with_entities(
            User.userId, User.firstName, User.LastName).limit(10)

        users = query.all()

        result = []
        for user in users:
            result.append({'id': user.userId, 'name': user.firstName + ' ' + user.LastName,
                           'avatar': '', 'type': 'user'})

        return JsonResponse(dict(users=result))
