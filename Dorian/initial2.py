from lxml import etree

sourcePage = open("speyer-192-20-hackathon.xml", "r")

parsedPage = etree.XML(sourcePage)

yourListOfText = parsedPage.xpath("//unitdate//text()")

print yourListOfText