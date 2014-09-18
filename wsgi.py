"""
/*-------------------------------------------------------------------*/
/*                                                                   */
/* Copyright IBM Corp. 2014 All Rights Reserved                      */
/*                                                                   */
/*-------------------------------------------------------------------*/
/*                                                                   */
/*        NOTICE TO USERS OF THE SOURCE CODE EXAMPLES                */
/*                                                                   */
/* The source code examples provided by IBM are only intended to     */
/* assist in the development of a working software program.          */
/*                                                                   */
/* International Business Machines Corporation provides the source   */
/* code examples, both individually and as one or more groups,       */
/* "as is" without warranty of any kind, either expressed or         */
/* implied, including, but not limited to the warranty of            */
/* non-infringement and the implied warranties of merchantability    */
/* and fitness for a particular purpose. The entire risk             */
/* as to the quality and performance of the source code              */
/* examples, both individually and as one or more groups, is with    */
/* you. Should any part of the source code examples prove defective, */
/* you (and not IBM or an authorized dealer) assume the entire cost  */
/* of all necessary servicing, repair or correction.                 */
/*                                                                   */
/* IBM does not warrant that the contents of the source code         */
/* examples, whether individually or as one or more groups, will     */
/* meet your requirements or that the source code examples are       */
/* error-free.                                                       */
/*                                                                   */
/* IBM may make improvements and/or changes in the source code       */
/* examples at any time.                                             */
/*                                                                   */
/* Changes may be made periodically to the information in the        */
/* source code examples; these changes may be reported, for the      */
/* sample code included herein, in new editions of the examples.     */
/*                                                                   */
/* References in the source code examples to IBM products, programs, */
/* or services do not imply that IBM intends to make these           */
/* available in all countries in which IBM operates. Any reference   */
/* to the IBM licensed program in the source code examples is not    */
/* intended to state or imply that IBM's licensed program must be    */
/* used. Any functionally equivalent program may be used.            */
/*-------------------------------------------------------------------*/
"""

import bottle
from bottle import *
import os,sys,logging, traceback, json, string, urllib, urllib2
import pymongo
from pymongo import *
from pymongo import MongoClient

# Twilio import - Remove comment from following line to activate
#from twilio.rest import TwilioRestClient

from BeautifulSoup import BeautifulSoup
import httplib2

# Configs info from BlueMix 
vcap_config = os.environ.get('VCAP_SERVICES')
decoded_config = json.loads(vcap_config)

for key, value in decoded_config.iteritems():
	if key.startswith('mongo'):
		mongo_creds = decoded_config[key][0]['credentials']	
	# Get Twilio credential from Bluemix
	'''# <----- Remove those three quotes to uncomment
	if decoded_config[key][0]['name'].startswith('Twilio'):
		twilio_creds = decoded_config[key][0]['credentials']
	'''# <----- Remove those three quotes to uncomment

#---------------------------------------- Twilio connection
	
'''# <---- Remove the three quootes (multiline comments) to enable connection to Twilio	
twilio_authToken = twilio_creds['authToken']
twilio_accountSID = twilio_creds['accountSID']
twilioClient = TwilioRestClient(twilio_accountSID, twilio_authToken)	
'''# <---- Remove the three quootes (multiline comments) to enable connection to Twilio	

# ---------------------- End of Twilio connection config
	
	
# --------------------------MongoDb config

'''# <---- Remove the three quootes (multiline comments) to enable to the DB

mongo_uri = str(mongo_creds['uri'])
uri_info = mongo_uri[10:] # Remove first 10 characters from the URI: mongodb://
user_info, db_info = uri_info.split('@')
mongo_username, mongo_password = user_info.split(':')
db_host_port, mongo_db = db_info.split('/')
mongo_host, mongo_port = db_host_port.split(':')


client = pymongo.MongoClient(mongo_uri)
mongoDB = client[mongo_db]
infcoll = mongoDB.infcollection
itemCollection = mongoDB["ItemCollection"]

'''# <---- Remove the three quootes (multiline comments) to enable to the DB



# ---------------------- End of MongoDB config





#Provide all the static css and js files under the static dir to browser
@route('/static/:filename#.*#')
def server_static(filename):
	""" This is for JS files """
	return static_file(filename, root='static')

# Displays the home page
@bottle.get("/")
def testFunc():
	return bottle.template('home')
	
# Get the prices for all of the items stored in the database
@bottle.get('/getCurrentPrices')		
def getCurrentPrices():
	items = itemCollection.find()

	for item in items:
		getCurrentPrice(item)
		
	return bottle.template('currentPrice')


#--------------------------- Test messaging function
'''# <---- Remove the three quootes (multiline comments) 	
def sendTextWithMessage(message):
	destination_number="replace-fake-TO-number"
	print "Sending text message to mobile phone: " + destination_number
	message = twilioClient.messages.create(to=destination_number, from_="replace-fake-FROM-number", body=message)
	print "Text message sent using Twilio to mobile phone: " + destination_number
'''# <---- Remove the three quootes (multiline comments) 	
	
# Get the current price of a particular item
def getCurrentPrice(item):
	
	try: 			
		http = httplib2.Http()
		status, page = http.request(item["url"])
		soup = BeautifulSoup(page)
		price = soup.find(id=item["idToCheck"]).string	
		
		if price is not None:
			
			itemCollection.update({'url': item["url"]},{"$set" : {'price':price}})
			#---------------------------------------- Twilio SMS on GetPrice
			# Uncomment the following line of code to send SMS with Twilio)
			#sendTextWithMessage("The current price of %s is %s" % (item["name"], price))
			return bottle.template('currentPrice', price=price)
		
		else:
			return bottle.template('currentPriceError')
	except:
		return bottle.template('currentPriceError')

# Saves the item info in the database
@bottle.post('/recordItemInfo')
def recordItemInfo():

	name = request.forms.get('name')
	url = request.forms.get('url')
	# idToCheck = request.forms.get('idToCheck')
	idToCheck = 'price'
	
	existTest = itemCollection.find({'url': url}).count()
	if existTest == 0:
		data = {'url': url, 'name': name,'idToCheck': idToCheck}
		insert_id = itemCollection.insert(data)
		print "Data inserted"
	else:
		itemCollection.update({'url': url},{"$set" : {'name':name}})
		itemCollection.update({'url': url},{"$set" : {'idToCheck':idToCheck}})
		print "Data updated"
	cursor = list(itemCollection.find())
	totinf = int(itemCollection.count())

	return bottle.template ('dbdump',totinf=totinf,cursor=cursor)


#  Displays all the records in the database
@bottle.get('/displayall')
def displayData():
	cursor = list(itemCollection.find())
	totinf = int(itemCollection.count())
	
	return bottle.template ('dbdump',totinf=totinf,cursor=cursor)

# Removes all the records from the database
@bottle.post('/clearall')
def clearAll():
	itemCollection.remove()
	cursor = list(itemCollection.find())
	totinf = int(itemCollection.count())
	print "CLEAR: this is the value: %d" % totinf
	return bottle.template ('dbdump',totinf=totinf,cursor=cursor)


# Removes only the selected stuff from the database
@bottle.post('/delselected')
def removeSelected():
	s = str(request.forms.get('url'))
	itemCollection.remove({'url' : s})
	cursor = list(itemCollection.find())
	totinf = int(itemCollection.count())
	print "DELETE: this is the value: %d" % totinf
	return bottle.template ('dbdump',totinf=totinf,cursor=cursor)

debug(True)

# Error Methods
@bottle.error(404)
def error404(error):
    return 'Nothing here--sorry!'


application = bottle.default_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', '8000'))
    bottle.run(host='0.0.0.0', port=port)
