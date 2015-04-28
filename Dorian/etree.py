from lxml import etree

tree = etree.parse('192-20.xml')
root = tree.getroot()

r = root.xpath('//archdesc/dsc/c/c')

# All the interesting bits

id = r[0].xpath('@id')
unitdate = r[0].xpath('did/unitdate/text()')
unittitle = r[0].xpath('did/unittitle/text()')
daoloc = r[0].xpath('daogrp[1]/daoloc[@role="image_full"]/@href')
otherfindaid = r[0].xpath('otherfindaid/extref/@href')

# countid = root.xpath('count(//@id)')
# countunitdate = root.xpath('count(//unitdate)')

# print countid
# print countunitdate

# print id
# print unitdate
# print unittitle
# print daoloc
# print otherfindaid

def give_id(n):
	return r[n].xpath('@id')

def give_unitdate(n):
	return r[n].xpath('did/unitdate/text()')

def give_unittitle(n):
	return r[n].xpath('did/unittitle/text()')

def give_otherfindaid(n):
	return r[n].xpath('otherfindaid/extref/@href')

def give_piclink_count(n):
	return r[n].xpath('daogrp[1]/daoloc[@role="image_full"]/@href')

for x in xrange(0,165):
	print give_id(x), "> ", give_unitdate(x), "> ", give_unittitle(x), "> ", give_otherfindaid(x), "> ", give_piclink_count(x)
