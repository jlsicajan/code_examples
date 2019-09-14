import json
import dateutil.parser

from vi_pycommon.helpers import s3_buckets

s3_helper = s3_buckets.PrivateS3BucketHelper()
content = s3_helper.get_appointment_log_content(29305894)
if content:
	appt_logs_data = json.loads(content)
	appt_logs_data.sort(key=lambda log: dateutil.parser.parse(log['timestamp']), reverse=False)
	counter = 0
	for data in appt_logs_data:
		counter = counter + 1
		print json.dumps(data, indent=4, sort_keys=True)
		print('----------------------------------------------------------------------------------------------------------')

	print('TOTAL ROWS: ' + str(counter))
