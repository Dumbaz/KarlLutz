from bs4 import BeautifulSoup

file = open("../speyer-192-20-hackathon.xml")

soup = BeautifulSoup(file, 'xml', from_encoding="utf-8")
# soup = BeautifulSoup(open("../speyer-192-20-hackathon.xml"), from_encoding="utf-8")

print soup.c['level="file"']