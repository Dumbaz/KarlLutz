from bs4 import BeautifulSoup

soup = BeautifulSoup(open("speyer-192-20-hackathon.xml"), from_encoding="utf-8")

for unitdate in soup.findAll("unitdate"):
	print "".join(unitdate.contents).encode('utf-8')

# Extracts the text between the unitdate tags