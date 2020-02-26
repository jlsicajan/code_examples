def encode(n):
	s = ""
	while n > 0:
		n, remainder = divmod(n-1, 26)
		s = chr(65 + remainder) + s
	return s

column_numbers = [1, 2, 28, 23432, 123, 345]

for column_number in column_numbers:
	print('Checking column number: ' + str(column_number) + ' Alphabetical column id: ' + str(encode(column_number)))
