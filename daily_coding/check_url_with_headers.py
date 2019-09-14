import pymysql.cursors
import urllib.request
import os

# Connect to the database
connection = pymysql.connect(host='vinu-db.cabeohk3h5li.us-west-2.rds.amazonaws.com',
                             user='sponsiv',
                             password='L9D7&d#eoM',
                             db='cork_vinu_dev',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

try:
    with connection.cursor() as cursor:
        # Read a single record
        sql = "SELECT `linkS3`, `id`, `fileName` FROM `imagedetail` WHERE imageURL LIKE 'images/wines/%'"
        cursor.execute(sql)
        results = cursor.fetchall()
        for result in results:
         print(result)
         try:
          response = urllib.request.urlopen(result['linkS3'])
         except Exception as e:
          print("ERROR FOUND => with => " + str(result['linkS3']))
          with open('found.txt', 'a') as out:
           out.write(str(result['id']) + " with response => " + str(e) + '\n')
          print("scp vinu_back:/var/vinu-repository/vinu-backend/vinu-back-end/images/wines/" + str(result['fileName']) + " .")          
          os.system("scp vinu_back:/var/vinu-repository/vinu-backend/vinu-back-end/images/wines/" + str(result['fileName'])  + " /Users/lionmane/sicajan/python/VINU/found_in_server/")

finally:
    connection.close()
