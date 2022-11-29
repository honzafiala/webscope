import csv
import sys



with open(sys.argv[2]) as File:  
    Line_reader = csv.reader(File)
