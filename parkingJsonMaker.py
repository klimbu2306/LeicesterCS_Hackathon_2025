import json
from inputSystem import *
from random import random, randint, choice

names = {
	"first" : ["New house", "Best", "Quick", "Safe", "Rundown", "Park and go", "Car protect", "Top", "James'", "React", "Node.js", "LeicesterCS", "Freemans", "Cheap", "Easy", "Central", "Downtown", "Uptown", "Westside", "Eastside", "Northside", "Southside", "Budget", "Premium", "Luxury", "Economy", "Express", "24/7", "Secure", "Covered", "Open air", "Valet", "Self-park", "Underground", "Elevated", "Rooftop", "Drive-in", "Family", "Business", "Student", "Commuter", "Event", "Airport", "City center", "Mall", "Stadium", "Hospital", "University", "Office"],
	"last" : ["parking", "multi-story car park", "park", "cheap parking", "quick parking", "parking lot", "car storage", "vehicle depot", "auto park", "car hub", "parking garage", "parking area", "parking space", "car bay", "parking zone", "car lot", "parking facility", "carport", "motor park", "auto storage"]
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
	# Weekday times
	o = f"{int(5+random()*6):02d}:{int(random()*60):02d} am"
	c = f"{int(4+random()*8):02d}:{int(random()*60):02d} pm"

	# Saturday and Sunday times
	o_s = f"{int(5+random()*6):02d}:{int(random()*60):02d} am"
	c_s = f"{int(5+random()*5):02d}:{int(random()*60):02d} pm"

	bt = []

	for i in range(0, randint(0,4)):
		bt.append(f"{int(6+random()*5):02d}:00 {'am' if randint(0,1)==0 else 'pm'}")

	data.append({
		"name" : choice(names["first"])+" "+choice(names["last"]),
		"description" : "A cool place to park",
		"latitude" : getLat(),
		"longitude" : getLong(),
		"openCloseTimes" : times_week(o, c, o, c, o_s, c_s),
		"busyHours" : bt,
		"prices" : "£1 / hour"
	})



with open("parkingLocations.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)