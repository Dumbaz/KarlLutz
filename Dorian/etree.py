from lxml import etree


tree = etree.parse('../192-20.xml')

root = tree.getroot()

for child in root:
	print child.tag

r = root.xpath('//archdesc/dsc/c/c')
t = r[0].xpath('did/unittitle/text()')

# for x in xrange(0,165):
	# print r[x].xpath('did/unittitle/text()')

# print r

id = r[0].xpath('@id')
unitdate = r[0].xpath('did/unitdate/text()')
unittitle = r[0].xpath('did/unittitle/text()')
daoloc = r[0].xpath('daogrp[1]/daoloc[@xlink:role="image_full"]/href')

print id
print unitdate
print unittitle
print daoloc


# print root.find('{urn:isbn:1-931666-22-9}archdesc')




# for cpackage in root.findall("c level="file"")
# 	print cpackage