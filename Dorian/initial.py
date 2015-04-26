from lxml import etree
from bs4 import BeautifulSoup

soup = BeautifulSoup(open("../speyer-192-20-hackathon.xml"), from_encoding="utf-8")

# date = soup.findAll	("unitdate")

# for hit in soup.findAll(attrs={'class' : 'unitdate'}):
# 	print hit.contents[5].strip()

# print date.contents[5]

# for date 
print len(soup.findAll("daoloc"))

# for bild in soup.findAll("bild"):
# 	print bild.contents[0].strip().encode('utf-8')