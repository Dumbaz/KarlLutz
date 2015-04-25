from lxml import etree
from bs4 import BeautifulSoup

soup = BeautifulSoup(open("../spey_simple.xml"), from_encoding="utf-8")

# date = soup.findAll	("unitdate")

# for hit in soup.findAll(attrs={'class' : 'unitdate'}):
# 	print hit.contents[5].strip()

# print date.contents[5]

# for date 

for bild in soup.findAll("bild"):
	print "".join(bild.contents).encode('utf-8')