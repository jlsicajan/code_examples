from Room import Room
from Robot import Robot
import numpy as np

print("###### WELCOME TO THE ROBOT API ######")
print("CREATING A ROOM FOR YOU WITH RANDOOM DIMENSION")
myRoom = Room(np.random.randint(2, size=(5, 5)))

print("1 => THE FLOOR IS FREE")
print("0 => THE FLOOR IS BLOCKED")
print("2 => THE FLOOR WAS CLEANED")

print(myRoom.dimension)

print("SELECTING A ROBOT FOR YOU")
myRobot = Robot()

print("ROBOT NUMBER " + str(myRobot.number) + " SELECTED")

print("SEND THE ROBOT TO EXPLORE THE ROOM")
robotInfoRecopiled = myRobot.map_room(myRoom.dimension)

print("Floors that are blocked: " + str(myRobot.blocked_floors_founded))
print("Floors that are free: " + str(myRobot.free_floors_founded))


print("ROBOT CLEAN MODE: ON")
myRobot.clean_room(myRoom.dimension)


