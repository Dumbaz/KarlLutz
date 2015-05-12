import urllib2
import json
import os
from pprint import pprint


# Importing the whole JSON file from folder
with open('192-20.json') as data_file:
	data = json.load(data_file)

# Creating all the folders
def folderCreation(dirName):
	if not os.path.isdir(dirName):
		os.makedirs(dirName)
		print "Successfully created folder " + dirName
	else:
		print dirName + " already exists"


# Method for downloading images by URL
def imageDownloader(imgURL):
	img = urllib2.urlopen(imgURL)
	imgName = imgURL.rsplit('/', 1)[1]
	if not os.path.isfile(imgName) or os.stat(imgName).st_size == 0:
		localFile = open(imgName, 'wb')
		localFile.write(img.read())
		localFile.close()
		statinfo = os.stat(imgName)
		if statinfo.st_size == 0:
			print "There is an error with the downloaded file " + imgName + ", redownloading..."
			os.remove(imgName)
			imageDownloader(imgURL)
		print "Successfully created image " + imgName
	else:
		print imgName + " already exists"

# This is my test URL, it is a picture of a standing soldier
# https://farm8.staticflickr.com/7652/16456905684_0626580b05_o.jpg
# imageDownloader("https://farm8.staticflickr.com/7652/16456905684_0626580b05_o.jpg")

# 165 Objects all in all

# Main loop
for x in xrange(1,166):
	links = data["192-20_" + str(x)]["links"]
	if links[0]:
		folderCreation("192-20_" + str(x) )
		os.chdir("192-20_"+str(x))
		for link in links:
			imageDownloader(link)
		os.chdir("..")
	else:
		print "No links"