import json
from inputSystem import *
from random import random, choice

names = {
	"first" : ["New house", "Best", "Quick", "Safe", "Rundown", "Park and go", "Car protect", "Top", "James'", "React", "Node.js", "LeicesterCS", "Freemans", "Cheap"],
	"last" : ["parking", "multi-story car park", "park", "cheap parking", "quick parking", "parking lot", "car storage"]
}

newLine = "<br>"

def times_week(week_o, week_c, sat_o, sat_c, sun_o, sun_c):
	return f"Monday : {week_o} - {week_c}{newLine}Tuesday : {week_o} - {week_c}{newLine}Wednesday : {week_o} - {week_c}{newLine}Thursday : {week_o} - {week_c}{newLine}Friday : {week_o} - {week_c}{newLine}Saturday : {sat_o} - {sat_c}{newLine}Sunday : {sun_o} - {sun_c}"

def times(mon_o, mon_c, teu_o, teu_c, wed_o, wed_c, thu_o, thu_c, fri_o, fri_c, sat_o, sat_c, sun_o, sun_c):
	return f"Monday : {mon_o} - {mon_c}{newLine}Tuesday : {teu_o} - {teu_c}{newLine}Wednesday : {wed_o} - {wed_c}{newLine}Thursday : {thu_o} - {thu_c}{newLine}Friday : {fri_o} - {fri_c}{newLine}Saturday : {sat_o} - {sat_c}{newLine}Sunday : {sun_o} - {sun_c}"

# 52.693644 , -1.226669
# 52.572279 , -1.039133


def getLat():
	return 52.572279 + (random() * (52.693644 - 52.572279))
def getLong():
	return -1.226669 + (random() * (-1.039133 - -1.226669))

data = []

addWrite = inputManager.getInput(
	str,
	"Add or write too , w/a",
	IArgFunction(lambda x : x=="w" or x=="a")
)

n = inputManager.getInput(
	int,
	"Input (max) number of datapoints you want to make",
	IArgFunction(lambda x : 0<x)
)

for i in range(0, n):
	data.append({
		"name" : choice(names["first"])+" "+choice(names["last"]),
		"description" : "A cool place to park",
		"latitude" : getLat(),
		"longitude" : getLong(),
		"openCloseTimes" : times_week("6:30am", "1:00am", "6:30am", "1:00am", "10:00am", "6:00pm"),
		"prices" : "£1 / hour"
	})



with open("parkingLocations.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)