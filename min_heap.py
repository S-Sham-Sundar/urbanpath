class MinHeap:
    def __init__(self):
        self.data = []                          # the heap lives in one plain list

    def is_empty(self):
        return len(self.data) == 0

    def push(self, priority, item):
        self.data.append((priority, item))      # drop the newcomer at the end
        self._sift_up(len(self.data) - 1)       # then bubble it up to its place

    def pop(self):
        smallest = self.data[0]                 # the top is always the minimum
        last = self.data.pop()                  # take the final item off the end
        if self.data:                           # if the heap isn't empty now...
            self.data[0] = last                 # ...put that item on top
            self._sift_down(0)                  # ...and sink it to its place
        return smallest

    def _sift_up(self, i):
        parent = (i - 1) // 2
        while i > 0 and self.data[i][0] < self.data[parent][0]:
            self.data[i], self.data[parent] = self.data[parent], self.data[i]
            i = parent
            parent = (i - 1) // 2

    def _sift_down(self, i):
        n = len(self.data)
        while True:
            left, right = 2 * i + 1, 2 * i + 2
            smallest = i
            if left  < n and self.data[left][0]  < self.data[smallest][0]:
                smallest = left
            if right < n and self.data[right][0] < self.data[smallest][0]:
                smallest = right
            if smallest == i:                   # parent already smallest -> done
                break
            self.data[i], self.data[smallest] = self.data[smallest], self.data[i]
            i = smallest
