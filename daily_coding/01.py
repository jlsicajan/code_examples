#This problem was recently asked by Google.
#Given a list of numbers and a number k, return whether any two numbers from the list add up to k.
#For example, given [10, 15, 3, 7] and k of 17, return true since 10 + 7 is 17.
#Bonus: Can you do this in one pass?

numbers_list = [10, 15, 3, 7]
k = 17

for number in numbers_list:
	for number_to_add in numbers_list:
		if (number + number_to_add) == 17: 
			print('Here is one')
			print(str(number) + ' + ' + str(number_to_add) + ' = ' + str(number + number_to_add))
print('-------------------------------------------------------')
def two_sum(lst, k):
	for i in range(len(lst)):
		for j in range(len(lst)):
			if i != j and lst[i] + lst[j] == k:
				print(str(lst[i]) + ' + ' + str(lst[j]))
				print('True')
				return True
	return False
two_sum(numbers_list, 17)
print('--------------------------------------------------------')
def two_sum_second_solution(lst, k):
	seen = set()
	for num in lst:
		if k - num in seen:
			print(k)
			return True
	seen.add(num)
	return False
two_sum_second_solution(numbers_list, 17)
