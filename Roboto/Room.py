class Room:
    dimension = []

    def __init__(self, dimension):
        # 0 mean blocked
        # 1 mean free
        # 2 cleaned
        for columns in dimension:
            self.dimension.append(columns)

    def show_dimension(self):
        return self.dimension