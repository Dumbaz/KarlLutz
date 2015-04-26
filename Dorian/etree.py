from lxml import etree


tree = etree.parse('../speyer-192-20-hackathon.xml')

cpackages = tree.xpath('/archdesc/dsc/c/')

print cpackages

# for cpackage in root.findall("c level="file"")
# 	print cpackage