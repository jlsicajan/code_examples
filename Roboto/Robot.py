import Room as room

class Robot:

    number = 0
    blocked_floors_founded = 0
    free_floors_founded = 0

    def __init__(self):
        self.number += 1

    # returns true if next cell is open and robot moves into the cell.
    # returns false if next cell is obstacle and robot stays on the current cell.
    def move(self):
        print("moving")

    # Robot will stay on the same cell after calling turn_*. k indicates how
    # many turns to perform.
    def turn_left(self, k):
        print(k)


    def turn_right(self, k):
        print(k)

    # CLEAN CURRENT CELL
    def clean(self):
        print("cleaning")

    def map_room(self, room):
        for row in room:
            for floor in row:
                if(floor == 1): self.free_floors_founded +=1
                elif(floor == 0): self.blocked_floors_founded += 1

        return "finished"

    def clean_room(self, room):
        # here the robot have to know which route take, for the optimize the travel. the best way to do this is with Artificial Intelligence


